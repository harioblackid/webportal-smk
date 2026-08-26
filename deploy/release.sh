#!/usr/bin/env bash
#
# FR8-13 release sequence, run on the VPS.
#
# Invoked over SSH by .github/workflows/deploy.yml, which pipes this file in on
# stdin so the server executes the procedure belonging to the commit being
# released. It is also safe to run by hand:
#
#   APP_DIR=/home/smkpgri/main-project RELEASE_REF=origin/main bash deploy/release.sh
#
# Required environment:
#   APP_DIR       absolute path to the Laravel root (the "main-project" of FR8-5)
#   RELEASE_REF   commit sha, tag, or ref to deploy (default: origin/main)
#
# Optional:
#   PHP_VERSION=8.3         pin the PHP version instead of detecting it
#   PHP_BIN=/usr/bin/php8.3 pin the interpreter outright
#   PHP_DETECT_ONLY=1       print the resolved PHP and exit without touching anything
#   SKIP_MIGRATIONS=true    skip `migrate --force`
#   SKIP_SEEDERS=true       skip `db:seed --force`
#   COMPOSER_BIN, NPM_BIN   override those binaries on PATH
#   NODE_OPTIONS            e.g. --max-old-space-size=1536 on a small VPS

set -euo pipefail

APP_DIR="${APP_DIR:?APP_DIR is required}"
RELEASE_REF="${RELEASE_REF:-origin/main}"
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-false}"
SKIP_SEEDERS="${SKIP_SEEDERS:-false}"
COMPOSER_BIN="${COMPOSER_BIN:-composer}"
NPM_BIN="${NPM_BIN:-npm}"

# The minimum the application actually runs on: composer.json requires php ^8.3.
readonly MIN_PHP_ID=80300

step() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$1" >&2; }
fail() { printf '\n\033[1;31mrelease failed:\033[0m %s\n' "$1" >&2; exit 1; }

cd "${APP_DIR}" || fail "APP_DIR ${APP_DIR} does not exist"

[ -f artisan ] || fail "${APP_DIR} is not a Laravel root (no artisan)"

# ---------------------------------------------------------------------------
# PHP resolution
#
# `php` on PATH is the wrong answer here. CloudPanel installs several versions
# side by side and picks one PER SITE, while /usr/bin/php stays whatever
# update-alternatives points at system-wide. The release also arrives over
# `ssh … bash -s`, a non-login shell, so even a PATH tweak in the site user's
# profile would not apply. The site's own version has to be looked up.
# ---------------------------------------------------------------------------

PHP_SOURCE=''

site_user() {
    local owner
    owner="$(stat -c '%U' "${APP_DIR}" 2>/dev/null || true)"

    if [ -n "${owner}" ] && [ "${owner}" != 'root' ] && [ "${owner}" != 'UNKNOWN' ]; then
        printf '%s' "${owner}"

        return
    fi

    id -un
}

# CloudPanel gives every site its own PHP-FPM pool, named after the site user
# and living under the version directory chosen in the panel. The file is
# world-readable, so this needs no sudo.
version_from_pool() {
    local user="$1" pool

    for pool in /etc/php/*/fpm/pool.d/"${user}".conf; do
        [ -f "${pool}" ] || continue

        printf '%s' "${pool}" | sed -n 's#^/etc/php/\([0-9][0-9.]*\)/fpm/pool.d/.*#\1#p'

        return 0
    done

    return 0
}

# Fallback for layouts where the pool is not named after the site user: the
# vhost still has to name the socket it talks to.
version_from_vhost() {
    local user="$1"

    # The `|| true` is load-bearing: under `set -o pipefail`, grep exiting 2
    # because the directory does not exist would abort the whole release.
    grep -rhoE "php[0-9]+\.[0-9]+-fpm[^;\"']*${user}" /etc/nginx/sites-enabled/ 2>/dev/null \
        | sed -n 's#^php\([0-9][0-9.]*\)-fpm.*#\1#p' \
        | head -n 1 || true
}

resolve_php() {
    if [ -n "${PHP_BIN:-}" ]; then
        PHP_SOURCE='PHP_BIN'

        return
    fi

    if [ -n "${PHP_VERSION:-}" ]; then
        PHP_BIN="/usr/bin/php${PHP_VERSION}"
        PHP_SOURCE='PHP_VERSION'

        return
    fi

    local user version
    user="$(site_user)"

    version="$(version_from_pool "${user}")"
    PHP_SOURCE="CloudPanel FPM pool (${user})"

    if [ -z "${version}" ]; then
        version="$(version_from_vhost "${user}")"
        PHP_SOURCE="nginx vhost (${user})"
    fi

    if [ -z "${version}" ]; then
        # Deliberately not fatal: a host that is not CloudPanel is a legitimate
        # setup. The version gate below is what actually protects the release.
        warn "could not determine this site's PHP version — falling back to 'php' on PATH."
        warn 'Set PHP_VERSION (e.g. 8.3) to the version shown in CloudPanel > Sites > PHP Version.'
        PHP_BIN='php'
        PHP_SOURCE='PATH (not detected)'

        return
    fi

    PHP_BIN="/usr/bin/php${version}"
}

resolve_php

# Normalised to an absolute path, not just checked: the PATH fallback leaves
# PHP_BIN as the bare word `php`, and the shim below would then symlink `php`
# to itself.
PHP_BIN="$(command -v "${PHP_BIN}" 2>/dev/null || true)"

[ -n "${PHP_BIN}" ] && [ -x "${PHP_BIN}" ] \
    || fail "PHP interpreter not found (from ${PHP_SOURCE}). Set PHP_VERSION or PHP_BIN."

PHP_REPORTED="$("${PHP_BIN}" -r 'echo PHP_VERSION;')"

step "PHP ${PHP_REPORTED} — ${PHP_BIN} (${PHP_SOURCE})"

"${PHP_BIN}" -r "exit(PHP_VERSION_ID >= ${MIN_PHP_ID} ? 0 : 1);" || fail \
    "PHP ${PHP_REPORTED} is below the 8.3 that composer.json requires. Switch the site to 8.3+ in CloudPanel, or set PHP_VERSION."

"${PHP_BIN}" -m | grep -qx 'pdo_mysql' \
    || fail "the pdo_mysql extension is missing from ${PHP_BIN} — enable it for this site in CloudPanel."

"${PHP_BIN}" -m | grep -qx 'gd' \
    || warn 'the gd extension is missing — ImageProcessor cannot resize uploads, so media upload will fail.'

# Everything below shells out to binaries whose shebang is `#!/usr/bin/env php`
# — the Composer phar itself, and the `@php artisan package:discover` script it
# runs after dumping the autoloader. Fixing PHP_BIN alone would leave all of
# those on the system interpreter, so put the resolved one first on PATH.
PHP_SHIM_DIR="$(mktemp -d)"
ln -sf "${PHP_BIN}" "${PHP_SHIM_DIR}/php"
export PATH="${PHP_SHIM_DIR}:${PATH}"

MAINTENANCE_ON=false

cleanup() {
    if [ "${MAINTENANCE_ON}" = true ]; then
        "${PHP_BIN}" artisan up >/dev/null 2>&1 || true
    fi

    rm -rf "${PHP_SHIM_DIR}"
}
trap cleanup EXIT

if [ -n "${PHP_DETECT_ONLY:-}" ]; then
    printf '\nsite user : %s\nsource    : %s\nbinary    : %s\nversion   : %s\nextensions: %s\n\n' \
        "$(site_user)" "${PHP_SOURCE}" "${PHP_BIN}" "${PHP_REPORTED}" \
        "$("${PHP_BIN}" -m | grep -xE 'pdo_mysql|gd' | tr '\n' ' ' || true)"

    exit 0
fi

# ---------------------------------------------------------------------------
# Preconditions
# ---------------------------------------------------------------------------

[ -f .env ] || fail "${APP_DIR}/.env is missing — see docs/deployment.md §2.4"

# FR8-8 / NFR-15. Releasing onto an .env that still says local or debug=true is
# the mistake that leaks stack traces to the public, so refuse rather than warn.
grep -qE '^\s*APP_ENV\s*=\s*"?production"?\s*$' .env || fail ".env does not set APP_ENV=production"
grep -qE '^\s*APP_DEBUG\s*=\s*"?false"?\s*$' .env || fail ".env does not set APP_DEBUG=false"

# The working tree is a deployment target, not a workspace: `git reset --hard`
# below would silently discard anything edited on the server.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    git status --short
    fail "the working tree on the server has uncommitted changes — resolve them before releasing"
fi

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------

if [ -f vendor/autoload.php ]; then
    step 'Enabling maintenance mode'
    "${PHP_BIN}" artisan down --retry=15
    MAINTENANCE_ON=true
else
    # First release: artisan cannot boot without vendor/, and there is nothing
    # serving traffic yet to take down.
    step 'Skipping maintenance mode (no vendor/ yet — first release)'
fi

step "Fetching ${RELEASE_REF}"
git fetch --prune --tags origin

# Editor config, CI definitions, and the deploy kit itself have no business on
# the server; `prd/` is gitignored and never reaches the remote at all.
#
# Sparse-checkout rather than `rm -rf` on purpose: it marks these paths
# skip-worktree, so `git status` stays clean and the guard above keeps working.
# Deleting them by hand would make every release trip over a dirty tree. The
# objects stay in the repository either way, so `git show HEAD:deploy/…` can
# still read an excluded file during server setup.
step 'Pruning paths that must not exist on the server'
git sparse-checkout set --no-cone \
    '/*' '!/.claude/' '!/.codegraph/' '!/.github/' '!/deploy/' '!/CLAUDE.md' \
    || fail 'git sparse-checkout failed — it needs git 2.25 or newer on the server.'

git reset --hard "${RELEASE_REF}"
git log -1 --pretty='deploying %h %s'

# A stale public/hot makes Vite::isRunningHot() true and every public page
# degrades to CSR while looking perfectly healthy. It should never exist in
# production, but it costs nothing to be sure.
rm -f public/hot

step 'Installing PHP dependencies'
"${COMPOSER_BIN}" install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Cleared here, before anything reads config: migrate and the seeders below
# would otherwise run against the config cache built by the previous release,
# which points at the wrong database entirely if .env has changed since.
step 'Clearing caches from the previous release'
"${PHP_BIN}" artisan optimize:clear

step 'Installing JS dependencies'
"${NPM_BIN}" ci

# FR6-1: `npm run build` alone leaves bootstrap/ssr/ssr.js stale, and Inertia
# then falls back to CSR without erroring.
step 'Building client and SSR bundles'
"${NPM_BIN}" run build:ssr

if [ "${SKIP_MIGRATIONS}" != "true" ]; then
    step 'Running migrations'
    "${PHP_BIN}" artisan migrate --force
else
    step 'Skipping migrations (SKIP_MIGRATIONS=true)'
fi

# Accounts, jurusan, ekstrakurikuler, the identity record, and the site
# settings. Every seeder reached from here is insert-if-absent, so running it on
# each release adds whatever is missing and never overwrites a CMS edit.
if [ "${SKIP_SEEDERS}" != "true" ]; then
    step 'Seeding accounts, content, identity and settings'
    "${PHP_BIN}" artisan db:seed --force
else
    step 'Skipping seeders (SKIP_SEEDERS=true)'
fi

# FR8-9. Idempotent: --force relinks instead of failing when the link is there.
step 'Linking public storage'
"${PHP_BIN}" artisan storage:link --force

# FR8-10.
step 'Building production caches'
"${PHP_BIN}" artisan config:cache
"${PHP_BIN}" artisan route:cache
"${PHP_BIN}" artisan view:cache
"${PHP_BIN}" artisan event:cache

# FR8-11. Asking the SSR process to stop is enough — supervisor restarts it
# within seconds (US-026) and this needs no sudo on the deploy user. If SSR is
# not managed by supervisor, this stops it for good; see deploy/supervisor/.
step 'Restarting the SSR process'
"${PHP_BIN}" artisan inertia:stop-ssr || true

# FR8-12. Workers keep the old code in memory until told to finish.
step 'Restarting queue workers'
"${PHP_BIN}" artisan queue:restart

if [ "${MAINTENANCE_ON}" = true ]; then
    step 'Disabling maintenance mode'
    "${PHP_BIN}" artisan up
    MAINTENANCE_ON=false
fi

# Supervisor's startsecs plus the Node boot; below this the smoke check in CI
# can hit the window where SSR is not listening yet and score a false failure.
step 'Waiting for SSR to answer on 127.0.0.1:13714'
for _ in $(seq 1 20); do
    if curl --silent --output /dev/null --max-time 2 http://127.0.0.1:13714/health; then
        break
    fi
    sleep 1
done

printf '\n\033[1;32mrelease complete\033[0m — %s on PHP %s\n' \
    "$(git rev-parse --short HEAD)" "${PHP_REPORTED}"
