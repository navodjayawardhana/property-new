<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $orderId,
        public readonly string $userName,
        public readonly string $userEmail,
        public readonly string $listingTitle,
        public readonly string $listingAddress,
        public readonly float  $listingPrice,
        public readonly float  $paymentAmount,
        public readonly int    $feePercent,
        public readonly string $paidAt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Payment Receipt #{$this->orderId} – Greenbrick.net");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payment_receipt');
    }
}
