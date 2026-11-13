<?php

namespace App\Http\Controllers;

use App\Models\AgentSlide;
use App\Models\User;
use App\Services\AgentIdentity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AgentSlideController extends Controller
{
    // GET /agents/{slug}/slides — public, returns active slides for an agent
    public function publicIndex(string $slug): JsonResponse
    {
        $agents = User::where('role', 'agent')->where('is_blocked', false)->orderBy('id')->get();
        $agent = $agents->first(fn ($agent) => $agent->slug === $slug || (string) $agent->id === $slug);
        abort_unless($agent, 404);
        $group = AgentIdentity::groups($agents)->first(fn ($group) => $group->contains('id', $agent->id));

        $slides = AgentSlide::whereIn('user_id', $group->pluck('id'))
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json($slides);
    }

    // GET /agent-slides — own slides (authenticated)
    public function index(Request $request): JsonResponse
    {
        $slides = AgentSlide::where('user_id', $request->user()->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($slides);
    }

    // POST /agent-slides — upload new slide
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $path = $request->file('image')->store('agent-slides/'.$request->user()->id, 'public');

        $slide = AgentSlide::create([
            'user_id' => $request->user()->id,
            'image_path' => $path,
            'sort_order' => $request->input('sort_order', 0),
            'is_active' => true,
        ]);

        return response()->json($slide, 201);
    }

    // PATCH /agent-slides/{slide}
    public function update(Request $request, AgentSlide $agentSlide): JsonResponse
    {
        if ($agentSlide->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $agentSlide->update($validated);

        return response()->json($agentSlide);
    }

    // DELETE /agent-slides/{slide}
    public function destroy(Request $request, AgentSlide $agentSlide): JsonResponse
    {
        if ($agentSlide->user_id !== $request->user()->id) {
            abort(403);
        }

        Storage::disk('public')->delete($agentSlide->image_path);
        $agentSlide->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
