<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSuppression extends Model
{
    protected $guarded = ['id'];

    public function setEmailAttribute(string $email): void
    {
        $this->attributes['email'] = mb_strtolower(trim($email));
    }
}
