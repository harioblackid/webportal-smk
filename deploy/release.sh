#!/usr/bin/env bash
#
# FR8-13 release sequence, run on the VPS.
#
# Invoked over SSH by .github/workflows/deploy.yml, which pipes this file in on
# stdin so the server executes the procedure belonging to the commit being
# released. It is also safe to run by hand:
#
#   APP_DIR=/home/smkpgri/laravel RELEASE_REF=origin/main bash deploy/release.sh
#
# Required environment:
#   APP_DIR       absolute path to the Laravel checkout (the FR8-5 project root, kept
#                 outside the document root)
#   RELEASE_REF   commit sha, tag, or ref to deploy (default: origin/main)
#
# Optional:
#   SITE_DIR                the document root nginx serves, when it is not the
#                           Laravel public/ directory. Defaults to the CloudPanel
#                           vhost root for this account.
#   PHP_VERSION=8.3         pin the PHP version instead of detecting it
#   PHP_BIN=/usr/bin/php8.3 pin the interpreter outright
#   PHP_DETECT_ONLY=1       print the resolved PHP and exit without touching anything
#   SKIP_MIGRATIONS=true    skip `migrate --force`
#   SKIP_SEEDERS=true       skip `db:seed --force`
#   COMPOSER_BIN, NPM_BIN   override those binaries on PATH
#   NODE_OPTIONS            e.g. --max-old-space-size=1536 on a small VPS

set -euo pipefail

APP_DIR="${APP_DIR:?APP_DIR is required}"

# Absolute, not relative. The release arrives as `ssh … bash -s`, so a relative
# path would resolve against whatever directory the SSH session happens to land
# in — and site_user() below stats APP_DIR *after* the cd, which silently stops
# finding the site's PHP-FPM pool once the path is relative.
case "${APP_DIR}" in
    /*) ;;
    *) printf '\nrelease failed: APP_DIR must be an absolute path, got "%s".\n' "${APP_DIR}" >&2; exit 1 ;;
esac
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

# ---------------------------------------------------------------------------
# Toolchain
#
# Every binary below is needed AFTER `artisan down`. A missing one would
# otherwise take the site into maintenance mode and then abandon it there while
# the release dies on `npm: command not found`, so they are gated up front.
# ---------------------------------------------------------------------------

# `git sparse-checkout set --no-cone` in the release below needs 2.25.
readonly MIN_GIT='2.25'

git_version() { git --version 2>/dev/null | sed -n 's#^git version \([0-9][0-9.]*\).*#\1#p'; }

git_meets_minimum() {
    local have
    have="$(git_version)"

    [ -n "${have}" ] || return 1

    # sort -V, not a numeric or lexical compare: 2.10 is newer than 2.9, and
    # every other ordering available to the shell gets that backwards.
    [ "$(printf '%s\n%s\n' "${MIN_GIT}" "${have}" | sort -V | head -n 1)" = "${MIN_GIT}" ]
}

# `supervisorctl status <program>` exits non-zero for a program that is merely
# stopped, so the exit code cannot tell "not managed" apart from "managed but
# down". The output can: supervisor names the program either way, and only does
# so when it knows about it.
#
# Three states, though, not two — "cannot tell" is a different answer from "not
# managed". supervisord's socket is root-only out of the box (chmod=0700 in
# supervisord.conf), so on CloudPanel the deploy user is refused even where
# inertia-ssr is supervised perfectly well, and treating that as "unmanaged"
# would skip the restart and serve the previous bundle forever.
#
#   0  managed    — supervisor named the program
#   1  unmanaged  — supervisor answered, and does not know it
#   2  unknown    — supervisor could not be reached at all
ssr_supervision() {
    local out

    out="$(supervisorctl status inertia-ssr 2>&1)" || true

    case "${out}" in
        '') return 2 ;;
        *'no such process'*) return 1 ;;
        *refused*|*denied*|*Permission*|*'not found'*|*ERROR*) return 2 ;;
        *) return 0 ;;
    esac
}

require_tools() {
    local bin missing=''

    for bin in git curl "${COMPOSER_BIN}" "${NPM_BIN}"; do
        command -v "${bin}" >/dev/null 2>&1 || missing="${missing} ${bin}"
    done

    [ -z "${missing}" ] || fail \
        "missing from this server's PATH:${missing}
    The release needs all of them once the site is already in maintenance mode, so it stops here
    rather than halfway through. npm ships with Node (20+ required, docs/deployment.md §2.2);
    COMPOSER_BIN and NPM_BIN can point the script at binaries installed outside PATH."

    git_meets_minimum || fail \
        "git $(git_version) is older than the ${MIN_GIT} that 'git sparse-checkout set --no-cone' needs."
}

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

# CloudPanel gives every site its own PHP-FPM pool, under the version directory
# chosen in the panel. The pool is named after the SITE, though — on a real box
# it is `pool.d/smkpgritelagasari.sch.id.conf`, not `pool.d/<site-user>.conf` —
# so matching on the filename finds nothing. The `user =` directive inside is
# what actually ties a pool to this account, and it works whatever the file is
# called. Pool files are world-readable, so this needs no sudo.
version_from_pool() {
    local user="$1" matches count

    matches="$(grep -lE "^[[:space:]]*user[[:space:]]*=[[:space:]]*${user}[[:space:]]*$" \
        /etc/php/*/fpm/pool.d/*.conf 2>/dev/null || true)"

    [ -n "${matches}" ] || return 0

    count="$(printf '%s\n' "${matches}" | wc -l)"

    # One account can own several sites. Guessing which pool is "the" one would
    # be picking a PHP version at random, so say so and let PHP_VERSION decide.
    if [ "${count}" -gt 1 ]; then
        warn "${count} PHP-FPM pools run as '${user}':"
        printf '%s\n' "${matches}" >&2
        warn 'Set PHP_VERSION to say which one this site uses.'

        return 0
    fi

    printf '%s' "${matches}" | sed -n 's#^/etc/php/\([0-9][0-9.]*\)/fpm/pool.d/.*#\1#p'
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

php_has() { "${PHP_BIN}" -m | grep -qx "$1"; }
php_meets_minimum() { "${PHP_BIN}" -r "exit(PHP_VERSION_ID >= ${MIN_PHP_ID} ? 0 : 1);"; }

# ---------------------------------------------------------------------------
# Document root
#
# APP_DIR (the Laravel checkout) and SITE_DIR (what nginx serves) are separate
# directories: the school can then move the document root from the CloudPanel
# GUI without the release having to be re-pointed at it. public/index.php walks
# up from wherever it is deployed until it finds vendor/autoload.php, which is
# the part that lets the two live apart at all.
#
# CloudPanel keeps /etc/nginx mode 0700 root:root, so the vhost is readable only
# when this runs as root. Everywhere else the fallback is the account's htdocs/,
# which is the directory CloudPanel itself renames when the domain changes —
# so it tracks the GUI for the case that actually comes up. SITE_DIR overrides
# both, and is the answer when the panel points at a subdirectory.
# ---------------------------------------------------------------------------

SITE_SOURCE=''

site_home() {
    local home
    home="$(getent passwd "$(site_user)" 2>/dev/null | cut -d: -f6)"

    if [ -n "${home}" ]; then
        printf '%s' "${home}"

        return
    fi

    printf '%s' "${HOME:-}"
}

site_dir_from_vhost() {
    local home="$1"

    # Anchored on the account's home so a box serving several sites cannot hand
    # back another one's root.
    grep -rhoE "root[[:space:]]+${home}/[^;[:space:]]+" /etc/nginx/sites-enabled/ 2>/dev/null \
        | sed 's#^root[[:space:]]*##' \
        | head -n 1 || true
}

site_dir_from_htdocs() {
    local home="$1" matches count

    [ -d "${home}/htdocs" ] || return 0

    matches="$(find "${home}/htdocs" -mindepth 1 -maxdepth 1 -type d 2>/dev/null || true)"

    [ -n "${matches}" ] || return 0

    count="$(printf '%s\n' "${matches}" | wc -l)"

    # One account can host several sites. Picking one would be choosing a
    # document root at random, so say so and let SITE_DIR decide.
    if [ "${count}" -gt 1 ]; then
        warn "${count} site directories under ${home}/htdocs:"
        printf '%s\n' "${matches}" >&2
        warn 'Set SITE_DIR to say which one this release serves.'

        return 0
    fi

    printf '%s' "${matches}"
}

resolve_site_dir() {
    if [ -n "${SITE_DIR:-}" ]; then
        SITE_SOURCE='SITE_DIR'

        return
    fi

    local home
    home="$(site_home)"

    SITE_DIR="$(site_dir_from_vhost "${home}")"
    SITE_SOURCE='nginx vhost root'

    if [ -z "${SITE_DIR}" ]; then
        SITE_DIR="$(site_dir_from_htdocs "${home}")"
        SITE_SOURCE="${home}/htdocs"
    fi
}

resolve_site_dir

# Preflight. Reports instead of enforcing, and sits before the gates below on
# purpose: it exists to be run while the server is still being set up, when
# "this site is on the wrong PHP" is the answer you are looking for rather than
# an error that stops you reading the rest of the report.
if [ -n "${PHP_DETECT_ONLY:-}" ]; then
    printf '\nsite user : %s\nsource    : %s\nbinary    : %s\nversion   : %s\n' \
        "$(site_user)" "${PHP_SOURCE}" "${PHP_BIN}" "${PHP_REPORTED}"

    if php_meets_minimum; then
        printf 'php >= 8.3: yes\n'
    else
        printf 'php >= 8.3: NO — a release would refuse. Switch this site to 8.3+ in CloudPanel.\n'
    fi

    for ext in pdo_mysql gd; do
        if php_has "${ext}"; then
            printf '%-10s: present\n' "${ext}"
        else
            printf '%-10s: MISSING\n' "${ext}"
        fi
    done

    # The rest of the toolchain, for the same reason the PHP block exists: this
    # probe gets run while the server is still being set up, and "npm is not
    # installed" is exactly the kind of answer it should be able to give.
    printf '\n'

    for bin in git curl node "${COMPOSER_BIN}" "${NPM_BIN}"; do
        if command -v "${bin}" >/dev/null 2>&1; then
            printf '%-10s: %s\n' "${bin}" "$(command -v "${bin}")"
        else
            printf '%-10s: MISSING\n' "${bin}"
        fi
    done

    if git_meets_minimum; then
        printf 'git >= %s: yes\n' "${MIN_GIT}"
    else
        printf 'git >= %s: NO — sparse-checkout would fail.\n' "${MIN_GIT}"
    fi

    SSR_STATE=0
    ssr_supervision || SSR_STATE=$?

    case "${SSR_STATE}" in
        0) printf 'supervisor: inertia-ssr is managed\n' ;;
        1) printf 'supervisor: reachable, but has no inertia-ssr program — install deploy/supervisor/inertia-ssr.conf (§2.9).\n' ;;
        *) printf 'supervisor: not reachable as this user, so supervision cannot be confirmed (socket is root-only, §2.9).\n' ;;
    esac

    if [ -d "${APP_DIR}" ]; then
        printf 'APP_DIR   : %s exists\n' "${APP_DIR}"
    else
        printf 'APP_DIR   : %s MISSING — clone the repository there first (docs/deployment.md §2.3).\n' "${APP_DIR}"
    fi

    if [ -z "${SITE_DIR:-}" ]; then
        printf 'SITE_DIR  : NOT DETECTED — set SITE_DIR to the CloudPanel document root.\n'
    elif [ -d "${SITE_DIR}" ]; then
        printf 'SITE_DIR  : %s exists (from %s)\n' "${SITE_DIR}" "${SITE_SOURCE}"
    else
        printf 'SITE_DIR  : %s MISSING (from %s)\n' "${SITE_DIR}" "${SITE_SOURCE}"
    fi

    printf '\n'

    exit 0
fi

php_meets_minimum || fail \
    "PHP ${PHP_REPORTED} is below the 8.3 that composer.json requires. Switch the site to 8.3+ in CloudPanel, or set PHP_VERSION."

php_has pdo_mysql \
    || fail "the pdo_mysql extension is missing from ${PHP_BIN} — enable it for this site in CloudPanel."

php_has gd \
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

# ---------------------------------------------------------------------------
# Preconditions
#
# Deliberately after the PHP block: PHP_DETECT_ONLY has to be usable BEFORE the
# repository is cloned, because the site's PHP version is the thing you want to
# confirm while there is still nothing to deploy.
# ---------------------------------------------------------------------------

require_tools

[ -d "${APP_DIR}" ] || fail \
    "APP_DIR ${APP_DIR} does not exist. A release deploys into an existing checkout — clone the
    repository there first (docs/deployment.md §2.3); this script does not create one."

[ -n "${SITE_DIR:-}" ] || fail \
    "could not work out the document root. CloudPanel keeps /etc/nginx unreadable to the site user,
    so set SITE_DIR to the path under CloudPanel > Sites > Vhost > Document Root."

case "${SITE_DIR}" in
    /*) ;;
    *) fail "SITE_DIR must be an absolute path, got \"${SITE_DIR}\" (from ${SITE_SOURCE})." ;;
esac

[ -d "${SITE_DIR}" ] || fail "SITE_DIR ${SITE_DIR} does not exist (from ${SITE_SOURCE})."

# Laravel served from inside the document root would put .env, the database
# credentials, and the whole source tree one HTTP request away.
case "${APP_DIR}/" in
    "${SITE_DIR}/"*) fail \
        "APP_DIR ${APP_DIR} sits inside SITE_DIR ${SITE_DIR}, so the entire Laravel source — .env
    included — would be reachable over HTTP. Move the checkout outside the document root." ;;
esac

# And the reverse, because the rsync below runs with --delete.
case "${SITE_DIR}/" in
    "${APP_DIR}/"*) fail \
        "SITE_DIR ${SITE_DIR} sits inside APP_DIR ${APP_DIR}. Publishing would delete parts of the
    checkout it is copying from." ;;
esac

cd "${APP_DIR}"

[ -f artisan ] || fail "${APP_DIR} is not a Laravel root (no artisan)"

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

# Fetched BEFORE maintenance mode on purpose. Fetching only writes to .git, not
# to the working tree, so it needs no downtime — and the repository is private,
# which makes "the server has no credential for origin" the single most likely
# way a release fails. Doing it first means that failure costs no downtime at
# all, instead of taking the site down and handing back a git auth error.
step "Fetching ${RELEASE_REF}"
git fetch --prune --tags origin || fail \
    "could not fetch from origin. This repository is private, so the server needs a read-only
    deploy key (docs/deployment.md §2.5) — check that 'ssh -T git@github.com' authenticates and
    that the remote uses the SSH URL, not HTTPS."

# Verify the target actually arrived before taking the site down, so a bad tag
# or an unpushed sha cannot strand us in maintenance mode either.
git rev-parse --verify --quiet "${RELEASE_REF}^{commit}" >/dev/null || fail \
    "RELEASE_REF '${RELEASE_REF}' does not exist in the repository after fetching — is the commit pushed?"

if [ -f vendor/autoload.php ]; then
    step 'Enabling maintenance mode'
    "${PHP_BIN}" artisan down --retry=15
    MAINTENANCE_ON=true
else
    # First release: artisan cannot boot without vendor/, and there is nothing
    # serving traffic yet to take down.
    step 'Skipping maintenance mode (no vendor/ yet — first release)'
fi

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

# The document root is a separate directory from APP_DIR/public, so the build
# has to be copied into it. --delete so an asset dropped from a release does not
# linger, but never across .well-known (the panel writes ACME challenges there)
# and never across the storage symlink created below.
step "Publishing public/ to ${SITE_DIR}"
rsync -a --delete \
    --exclude '/storage' \
    --exclude '/.well-known/' \
    "${APP_DIR}/public/" "${SITE_DIR}/"

# FR8-9. Idempotent: --force relinks instead of failing when the link is there.
step 'Linking public storage'
"${PHP_BIN}" artisan storage:link --force

# The same link, in the directory nginx actually serves. `artisan storage:link`
# boots through bootstrap/app.php, which carries no usePublicPath override — the
# override lives in public/index.php and applies to web requests only — so the
# CLI links APP_DIR/public/storage and never touches the document root.
step 'Linking public storage into the document root'
ln -sfn "${APP_DIR}/storage/app/public" "${SITE_DIR}/storage"

# FR8-10.
step 'Building production caches'
"${PHP_BIN}" artisan config:cache
"${PHP_BIN}" artisan route:cache
"${PHP_BIN}" artisan view:cache
"${PHP_BIN}" artisan event:cache

# FR8-11. Asking the SSR process to stop is enough — supervisor restarts it
# within seconds (US-026) and this needs no sudo on the deploy user.
#
# Only where supervisor positively does NOT know the program is stopping it the
# wrong move: unmanaged, stop-ssr stops it for good, and every public page then
# degrades to CSR while still looking perfectly healthy.
step 'Restarting the SSR process'

SSR_STATE=0
ssr_supervision || SSR_STATE=$?

case "${SSR_STATE}" in
    0) SSR_SUPERVISION=managed ;;
    1) SSR_SUPERVISION=unmanaged ;;
    *) SSR_SUPERVISION=unknown ;;
esac

if [ "${SSR_SUPERVISION}" = unmanaged ]; then
    warn "supervisor answered but has no 'inertia-ssr' program, so nothing would bring SSR back"
    warn 'after stopping it. Leaving the running renderer alone — it still serves the PREVIOUS'
    warn 'build. Install deploy/supervisor/inertia-ssr.conf (docs/deployment.md §2.9).'
else
    # "unknown" stops SSR too, deliberately. If supervisor does manage it and we
    # skip the stop, the old renderer keeps serving the previous bundle and
    # nothing ever says so; if it does not, the health gate below fails loudly.
    # A loud failure is worth more here than a silent stale one.
    [ "${SSR_SUPERVISION}" = managed ] || warn \
        'could not reach supervisor as this user — its socket is root-only unless supervisord.conf
    sets chown/chmod (docs/deployment.md §2.9). Stopping SSR anyway; the health check below is the
    real gate.'

    "${PHP_BIN}" artisan inertia:stop-ssr || true
fi

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

SSR_UP=false

for _ in $(seq 1 20); do
    if curl --silent --output /dev/null --max-time 2 http://127.0.0.1:13714/health; then
        SSR_UP=true

        break
    fi
    sleep 1
done

# Falling out of that loop used to print "release complete" in green. But an
# Inertia app with nothing listening on 13714 does not error — it quietly serves
# every public page as CSR, which is exactly the regression prd-06 exists to
# prevent. A release that ends that way has failed, so report it as one. The
# site is already out of maintenance mode, so this leaves it serving traffic.
if [ "${SSR_UP}" != true ]; then
    [ "${SSR_SUPERVISION}" = managed ] || fail \
        "SSR is not answering on 127.0.0.1:13714 and nothing was confirmed to supervise it, so every
    public page is being served as CSR. Install deploy/supervisor/inertia-ssr.conf (US-026,
    docs/deployment.md §2.9)."

    fail "SSR never came back on 127.0.0.1:13714. Supervisor should have restarted it — check
    ~/logs/inertia-ssr.log and 'supervisorctl status inertia-ssr'. The site is up, but every public
    page is being served as CSR."
fi

printf '\n\033[1;32mrelease complete\033[0m — %s on PHP %s\n' \
    "$(git rev-parse --short HEAD)" "${PHP_REPORTED}"
