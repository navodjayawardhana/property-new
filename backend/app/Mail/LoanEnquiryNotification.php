<?php

namespace App\Mail;

use App\Models\LoanEnquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoanEnquiryNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly LoanEnquiry $enquiry,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Home Loan Enquiry – ' . $this->enquiry->name,
            replyTo: [new Address($this->enquiry->email, $this->enquiry->name)],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.loan_enquiry_notification',
        );
    }
}
