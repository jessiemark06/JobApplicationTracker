<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowUpReminderDelivery extends Model
{
    protected $fillable = [
        'follow_up_id',
        'scheduled_at',
        'notification_id',
        'email_status',
        'email_attempted_at',
        'email_error',
    ];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime', 'email_attempted_at' => 'datetime'];
    }
}
