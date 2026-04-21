<?php

namespace App\Mail;

use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Inquiry  $inquiry,
        public readonly Property $property,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New inquiry for {$this->property->address}",
            replyTo: [new Address($this->inquiry->email, $this->inquiry->name)],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inquiry_notification',
        );
    }
}
