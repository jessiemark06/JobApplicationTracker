<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAgreement extends Model
{
    protected $fillable = [
        'user_id',
        'agreement_id',
        'accepted_at',
        'revoked_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $hidden = ['ip_address', 'user_agent'];

    public function agreement()
    {
        return $this->belongsTo(Agreement::class);
    }
}
