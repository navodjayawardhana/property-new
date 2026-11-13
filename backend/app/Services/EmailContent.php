<?php

namespace App\Services;

class EmailContent
{
    // Small allowlist, no CSS, images, forms, embedded content or event handlers.
    public function sanitize(string $html): string
    {
        $doc = new \DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="UTF-8"><div>'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $clean = function ($node) use (&$clean): string {
            if ($node instanceof \DOMText) {
                return htmlspecialchars($node->textContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
            if (! $node instanceof \DOMElement) {
                return '';
            }
            $tag = strtolower($node->tagName);
            if ($tag === 'div' && $node->parentNode instanceof \DOMElement) {
                $tag = 'p';
            }
            if (in_array($tag, ['script', 'style', 'iframe', 'object', 'svg', 'math', 'form', 'template'])) {
                return '';
            }
            $body = '';
            foreach ($node->childNodes as $child) {
                $body .= $clean($child);
            }
            if (! in_array($tag, ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'a'])) {
                return $body;
            }
            $attributes = '';
            if ($tag === 'a') {
                $url = trim($node->getAttribute('href'));
                if (preg_match('#^https?://#i', $url) && filter_var($url, FILTER_VALIDATE_URL)) {
                    $attributes = ' href="'.htmlspecialchars($url, ENT_QUOTES, 'UTF-8').'" rel="noopener noreferrer"';
                }
            }

            return '<'.$tag.$attributes.'>'.$body.($tag === 'br' ? '' : '</'.$tag.'>');
        };
        $result = '';
        foreach ($doc->childNodes as $node) {
            $result .= $clean($node);
        }

        return $result;
    }

    public function render(string $html, string $name): string
    {
        return str_replace('{{recipient_name}}', htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), $this->sanitize($html));
    }
}
