<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationDocument extends Model
{
    protected $fillable = ['application_id', 'type', 'original_name', 'mime_type', 'size', 'disk', 'path'];

    protected $hidden = ['disk', 'path'];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
