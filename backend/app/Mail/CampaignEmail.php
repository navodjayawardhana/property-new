<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $subjectLine, public string $safeBody, public ?string $unsubscribeUrl, public bool $test = false) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: ($this->test ? '[TEST] ' : '').$this->subjectLine);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.campaign');
    }
}
