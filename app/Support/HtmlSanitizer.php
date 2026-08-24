<?php

namespace App\Support;

use DOMAttr;
use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * FR5-9 — rich text from the CMS is stored sanitised, never raw.
 *
 * The public pages render post/major bodies with dangerouslySetInnerHTML, so
 * the allowlist below is the only thing standing between an editor account and
 * stored XSS. Sanitising on write (rather than on render) means the database
 * never holds markup we would not be willing to print.
 *
 * Deliberately dependency-free: DOMDocument parses the fragment the same way a
 * browser would, so an attacker cannot smuggle a tag past a regex.
 */
class HtmlSanitizer
{
    /**
     * Tag => attributes it may keep. Anything not listed is unwrapped: the
     * element goes, its text survives.
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED = [
        'p' => [],
        'br' => [],
        'strong' => [],
        'b' => [],
        'em' => [],
        'i' => [],
        'u' => [],
        's' => [],
        'h2' => [],
        'h3' => [],
        'h4' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
        'blockquote' => [],
        'hr' => [],
        'code' => [],
        'pre' => [],
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height', 'loading'],
    ];

    /**
     * Dropped whole, children included. Unwrapping <script> would leave its
     * source as visible text, which is worse than losing it.
     *
     * @var list<string>
     */
    private const DROPPED = [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
        'button', 'select', 'textarea', 'link', 'meta', 'base', 'svg', 'math',
    ];

    /** @var list<string> */
    private const URL_SCHEMES = ['http', 'https', 'mailto', 'tel'];

    public static function clean(?string $html): string
    {
        $html = trim((string) $html);

        if ($html === '') {
            return '';
        }

        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);

        // The XML prologue is what makes DOMDocument read the fragment as
        // UTF-8; without it multi-byte Indonesian text comes back mojibake.
        $document->loadHTML(
            '<?xml encoding="utf-8" ?><body>'.$html.'</body>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $body = $document->getElementsByTagName('body')->item(0);

        if (! $body instanceof DOMElement) {
            return '';
        }

        self::sanitizeChildren($body);

        $output = '';

        foreach (iterator_to_array($body->childNodes) as $child) {
            $output .= (string) $document->saveHTML($child);
        }

        return trim($output);
    }

    private static function sanitizeChildren(DOMNode $parent): void
    {
        // Snapshot first: the loop rewrites the very list it walks.
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                self::sanitizeElement($child);

                continue;
            }

            // Comments can carry conditional-comment payloads; text is fine.
            if ($child->nodeType === XML_COMMENT_NODE) {
                $parent->removeChild($child);
            }
        }
    }

    private static function sanitizeElement(DOMElement $element): void
    {
        $tag = strtolower($element->nodeName);

        if (in_array($tag, self::DROPPED, true)) {
            $element->parentNode?->removeChild($element);

            return;
        }

        if (! array_key_exists($tag, self::ALLOWED)) {
            self::unwrap($element);

            return;
        }

        // Snapshotted for the same reason as the child list: removing an
        // attribute mutates the live map being iterated.
        foreach (iterator_to_array($element->attributes) as $attribute) {
            self::sanitizeAttribute($element, $attribute, self::ALLOWED[$tag]);
        }

        // A link that opens a new tab without rel= hands window.opener to the
        // target page; set it rather than dropping the target.
        if ($tag === 'a' && $element->getAttribute('target') !== '') {
            $element->setAttribute('target', '_blank');
            $element->setAttribute('rel', 'noopener noreferrer');
        }

        if ($tag === 'img') {
            if ($element->getAttribute('src') === '') {
                $element->parentNode?->removeChild($element);

                return;
            }

            // AD-3 wants alt on every image; an empty one is still valid.
            if (! $element->hasAttribute('alt')) {
                $element->setAttribute('alt', '');
            }

            $element->setAttribute('loading', 'lazy');
        }

        self::sanitizeChildren($element);
    }

    /**
     * @param  list<string>  $allowed
     */
    private static function sanitizeAttribute(DOMElement $element, DOMAttr $attribute, array $allowed): void
    {
        $name = strtolower($attribute->name);

        if (! in_array($name, $allowed, true)) {
            $element->removeAttribute($attribute->name);

            return;
        }

        if (in_array($name, ['href', 'src'], true) && ! self::isSafeUrl($attribute->value)) {
            $element->removeAttribute($attribute->name);
        }
    }

    /**
     * Site-relative URLs and anchors pass; everything else must carry a scheme
     * from the allowlist, which is what keeps `javascript:` and `data:` out.
     */
    private static function isSafeUrl(string $url): bool
    {
        $url = trim($url);

        if ($url === '') {
            return false;
        }

        if (str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);

        return is_string($scheme) && in_array(strtolower($scheme), self::URL_SCHEMES, true);
    }

    /** Replaces an unknown element with its own children. */
    private static function unwrap(DOMElement $element): void
    {
        $parent = $element->parentNode;

        if ($parent === null) {
            return;
        }

        self::sanitizeChildren($element);

        foreach (iterator_to_array($element->childNodes) as $child) {
            $parent->insertBefore($child, $element);
        }

        $parent->removeChild($element);
    }
}
