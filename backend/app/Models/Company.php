<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'location',
        'website',
        'notes',
    ];

    public function applications(){
        return $this->hasMany(Application::class);
    }
}
