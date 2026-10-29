<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventReminderDelivery extends Model
{
    protected $fillable = [
        'recruitment_event_id',
        'event_starts_at',
        'minutes_before',
        'notification_id',
        'email_status',
        'email_attempted_at',
        'email_error',
    ];

    protected function casts(): array
    {
        return [
            'event_starts_at' => 'datetime',
            'email_attempted_at' => 'datetime',
        ];
    }
}
