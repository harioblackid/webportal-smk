<?php

namespace App\Support;

use App\Models\Post;

/**
 * schema.org payloads for FR6-11 … FR6-13.
 *
 * Emitted as JSON-LD in the page body rather than the head: Inertia's <Head>
 * serialises a fixed set of meta/link tags, and Google reads ld+json wherever
 * it appears in the document.
 */
class StructuredData
{
    /**
     * FR6-11 — the site-wide organisation node. FR6-13 is covered by the
     * PostalAddress it carries, which comes from the same Setting the Kontak
     * page prints.
     *
     * @param  array<string, mixed>  $site
     * @param  array{street: string, locality: ?string, postalCode: ?string, line: string}|null  $address
     * @return array<string, mixed>
     */
    public static function organization(array $site, ?array $address = null): array
    {
        /** @var array{address: ?string, phone: ?string, email: ?string} $contact */
        $contact = $site['contact'];

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'EducationalOrganization',
            '@id' => $site['url'].'/#organization',
            'name' => $site['name'],
            'url' => $site['url'].'/',
            'logo' => $site['logo'],
            'image' => $site['ogImage'],
            'description' => $site['tagline'],
            'telephone' => $contact['phone'],
            'email' => $contact['email'],
            // Split across the schema.org fields rather than crammed into
            // streetAddress: without addressLocality and postalCode Google has
            // nothing to place the school by.
            'address' => $address === null ? null : array_filter([
                '@type' => 'PostalAddress',
                'streetAddress' => $address['street'],
                'addressLocality' => $address['locality'],
                'postalCode' => $address['postalCode'],
                'addressCountry' => 'ID',
            ], fn ($value) => $value !== null),
        ], fn ($value) => $value !== null);
    }

    /**
     * FR6-12 — the article node for a single berita.
     *
     * @param  array<string, mixed>  $site
     * @return array<string, mixed>
     */
    public static function article(Post $post, array $site, string $url): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $url],
            'headline' => $post->title,
            'description' => Seo::describe($post->excerpt, $post->body),
            'image' => $post->featuredMedia?->url() ?? $site['ogImage'],
            'datePublished' => $post->published_at?->toIso8601String(),
            'dateModified' => $post->updated_at?->toIso8601String(),
            'inLanguage' => 'id-ID',
            'author' => $post->author === null ? null : [
                '@type' => 'Person',
                'name' => $post->author->name,
            ],
            'publisher' => [
                '@type' => 'EducationalOrganization',
                'name' => $site['name'],
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $site['logo'],
                ],
            ],
        ], fn ($value) => $value !== null);
    }
}
