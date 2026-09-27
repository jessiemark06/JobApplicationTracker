<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
        protected $fillable = [
            'user_id',
            'name',
            'email',
            'notes',
            'website',
            'location',
        ];

    public function applications(){
        return $this->hasMany(Application::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
