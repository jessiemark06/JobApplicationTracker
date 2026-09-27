<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyJobTrackEmail extends VerifyEmail
{
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your JobTrack email address')
            ->view('emails.jobtrack-verify', [
                'name' => $notifiable->name,
                'verificationUrl' => $this->verificationUrl($notifiable),
            ]);
    }
}