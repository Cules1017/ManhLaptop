<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = ['guest_id', 'status'];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
