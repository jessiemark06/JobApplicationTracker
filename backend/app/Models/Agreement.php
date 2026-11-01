<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agreement extends Model
{
    protected $fillable = ['slug', 'version', 'title', 'content', 'is_required', 'published_at'];

    protected $casts = [
        'is_required' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function userAgreements()
    {
        return $this->hasMany(UserAgreement::class);
    }
}
