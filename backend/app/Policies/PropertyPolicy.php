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
        // (created_by_id set) are locked to the seller — only the manager who
        // published the listing (or an admin) may edit it.
        if ($property->created_by_id !== null) {
            return $user->id === $property->created_by_id;
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
