<?php

namespace App\Http\Controllers;

use App\Models\Slide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SlideController extends Controller
{
    private const MAX_SLIDES = 6;

    // ── Public ────────────────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $slides = Slide::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn($s) => $this->format($s));

        return response()->json($slides);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    private function gate(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Admin access required.');
        }
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->gate($request);

        $slides = Slide::orderBy('sort_order')->orderBy('id')->get()
            ->map(fn($s) => $this->format($s));

        return response()->json($slides);
    }

    public function store(Request $request): JsonResponse
    {
        $this->gate($request);

        if (Slide::count() >= self::MAX_SLIDES) {
            return response()->json(['message' => 'Maximum of ' . self::MAX_SLIDES . ' slides allowed.'], 422);
        }

        $request->validate([
            'title'    => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:200',
            'media'    => 'required|file|mimes:jpeg,png,jpg,webp,mp4,mov,webm|max:51200',
        ]);

        $file      = $request->file('media');
        $mime      = $file->getMimeType() ?? '';
        $mediaType = str_starts_with($mime, 'video') ? 'video' : 'image';
        $path      = $file->store('slides', 'public');

        $slide = Slide::create([
            'title'      => $request->title,
            'subtitle'   => $request->subtitle,
            'media_type' => $mediaType,
            'media_path' => $path,
            'sort_order' => Slide::max('sort_order') + 1,
            'is_active'  => true,
        ]);

        return response()->json($this->format($slide), 201);
    }

    public function update(Request $request, Slide $slide): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'title'      => 'nullable|string|max:100',
            'subtitle'   => 'nullable|string|max:200',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active'  => 'sometimes|boolean',
        ]);

        $slide->update($validated);

        return response()->json($this->format($slide->fresh()));
    }

    public function destroy(Request $request, Slide $slide): JsonResponse
    {
        $this->gate($request);

        if (!str_starts_with($slide->media_path, 'http')) {
            Storage::disk('public')->delete($slide->media_path);
        }

        $slide->delete();

        return response()->json(['message' => 'Slide deleted.']);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function format(Slide $slide): array
    {
        return [
            'id'         => $slide->id,
            'title'      => $slide->title,
            'subtitle'   => $slide->subtitle,
            'media_type' => $slide->media_type,
            'media_url'  => $slide->media_url,
            'sort_order' => $slide->sort_order,
            'is_active'  => $slide->is_active,
        ];
    }
}
