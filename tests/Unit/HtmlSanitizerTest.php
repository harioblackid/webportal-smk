<?php

use App\Support\HtmlSanitizer;

// FR5-9 — "Output tersimpan aman (sanitasi HTML untuk cegah XSS)".

test('the formatting the editor offers survives untouched', function (string $html) {
    expect(HtmlSanitizer::clean($html))->toBe($html);
})->with([
    'paragraph' => '<p>Halo dunia</p>',
    'heading' => '<h2>Judul</h2>',
    'subheading' => '<h3>Sub judul</h3>',
    'bold' => '<p><strong>tebal</strong></p>',
    'italic' => '<p><em>miring</em></p>',
    'bullet list' => '<ul><li>satu</li><li>dua</li></ul>',
    'ordered list' => '<ol><li>satu</li></ol>',
    'blockquote' => '<blockquote><p>kutipan</p></blockquote>',
    'link' => '<p><a href="https://example.test">tautan</a></p>',
    'relative link' => '<p><a href="/jurusan">jurusan</a></p>',
]);

test('an empty body stays empty', function () {
    expect(HtmlSanitizer::clean(null))->toBe('')
        ->and(HtmlSanitizer::clean('   '))->toBe('');
});

test('script and style elements are removed with their contents', function () {
    expect(HtmlSanitizer::clean('<p>a</p><script>alert(1)</script>'))
        ->toBe('<p>a</p>')
        ->and(HtmlSanitizer::clean('<style>body{display:none}</style><p>a</p>'))
        ->toBe('<p>a</p>');
});

test('an iframe cannot be smuggled in', function () {
    expect(HtmlSanitizer::clean('<iframe src="https://evil.test"></iframe><p>a</p>'))
        ->toBe('<p>a</p>');
});

test('event handler attributes are stripped', function () {
    expect(HtmlSanitizer::clean('<p onclick="alert(1)" onmouseover="x()">a</p>'))
        ->toBe('<p>a</p>');
});

test('javascript and data urls are dropped but the text is kept', function () {
    expect(HtmlSanitizer::clean('<a href="javascript:alert(1)">klik</a>'))
        ->toBe('<a>klik</a>')
        ->and(HtmlSanitizer::clean('<img src="data:text/html;base64,PHNjcmlwdD4=">'))
        ->toBe('');
});

test('unknown elements are unwrapped so their text is not lost', function () {
    // A paste from Word arrives full of <span> and <font>; losing the wrapper
    // is fine, losing the sentence is not.
    expect(HtmlSanitizer::clean('<p><span style="color:red">merah</span></p>'))
        ->toBe('<p>merah</p>')
        ->and(HtmlSanitizer::clean('<div><p>isi</p></div>'))
        ->toBe('<p>isi</p>');
});

test('style and class attributes do not survive', function () {
    expect(HtmlSanitizer::clean('<p class="x" style="color:red">a</p>'))
        ->toBe('<p>a</p>');
});

test('images keep their source and gain lazy loading and alt', function () {
    expect(HtmlSanitizer::clean('<img src="/storage/media/a.jpg">'))
        ->toBe('<img src="/storage/media/a.jpg" alt="" loading="lazy">');
});

test('a link opening in a new tab gets rel="noopener noreferrer"', function () {
    expect(HtmlSanitizer::clean('<a href="https://example.test" target="_blank">a</a>'))
        ->toContain('rel="noopener noreferrer"');
});

test('html comments are removed', function () {
    expect(HtmlSanitizer::clean('<p>a</p><!--[if IE]><script>x</script><![endif]-->'))
        ->toBe('<p>a</p>');
});

test('non-ascii text is preserved', function () {
    // Without the UTF-8 prologue in the parser this comes back as mojibake.
    expect(HtmlSanitizer::clean('<p>Selamat datang di sekolah — “kami” siap</p>'))
        ->toContain('—')
        ->toContain('Selamat datang');
});
