<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function update(User $user, Property $property): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        // Listings published by an advertisement manager on the seller's behalf
        // (created_by_id set) are locked — the seller cannot edit them.
        if ($property->created_by_id !== null) {
            return false;
        }

        return $user->id === $property->user_id;
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->id === $property->user_id || $user->role === 'admin';
    }

    public function view(User $user, Property $property): bool
    {
        return $user->id === $property->user_id || $user->role === 'admin';
    }
}
