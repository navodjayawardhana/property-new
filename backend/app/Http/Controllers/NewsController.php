<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    // ── Public ────────────────────────────────────────────────────────────────

    /** GET /news — published articles, newest first */
    public function index(Request $request): JsonResponse
    {
        $query = NewsArticle::where('is_published', true)->latest('published_at');

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('excerpt', 'like', "%{$s}%");
            });
        }

        $perPage = (int) ($request->per_page ?? 20);
        return response()->json($query->paginate($perPage));
    }

    /** GET /news/{article} — single published article */
    public function show(NewsArticle $newsArticle): JsonResponse
    {
        if (! $newsArticle->is_published) {
            abort(404);
        }
        return response()->json($newsArticle);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    private function gate(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Admin access required.');
        }
    }

    /** GET /admin/news — all articles (admin) */
    public function adminIndex(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = NewsArticle::latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->paginate(20));
    }

    /** POST /admin/news — create article */
    public function store(Request $request): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'excerpt'      => 'required|string|max:1000',
            'category'     => 'required|string|max:100',
            'tag'          => 'nullable|string|max:50',
            'image'        => 'sometimes|file|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_url'    => 'nullable|string|max:500',
            'read_time'    => 'nullable|string|max:20',
            'is_published' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
            $validated['image_url'] = Storage::disk('public')->url($path);
        }

        if (empty($validated['image_url'])) {
            $validated['image_url'] = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80';
        }

        $published = filter_var($validated['is_published'] ?? true, FILTER_VALIDATE_BOOLEAN);

        $article = NewsArticle::create([
            ...$validated,
            'read_time'    => $validated['read_time'] ?? '3 min read',
            'is_published' => $published,
            'published_at' => $published ? now() : null,
        ]);

        return response()->json($article, 201);
    }

    /** PATCH /admin/news/{article} — update article */
    public function update(Request $request, NewsArticle $newsArticle): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'excerpt'      => 'sometimes|string|max:1000',
            'category'     => 'sometimes|string|max:100',
            'tag'          => 'nullable|string|max:50',
            'image'        => 'sometimes|file|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_url'    => 'sometimes|nullable|string|max:500',
            'read_time'    => 'nullable|string|max:20',
            'is_published' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $newsArticle->image_url);
            if (Storage::disk('public')->exists(ltrim($oldPath, '/'))) {
                Storage::disk('public')->delete(ltrim($oldPath, '/'));
            }
            $path = $request->file('image')->store('news', 'public');
            $validated['image_url'] = Storage::disk('public')->url($path);
        }

        if (isset($validated['is_published'])) {
            $published = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);
            $validated['is_published'] = $published;
            if ($published && ! $newsArticle->published_at) {
                $validated['published_at'] = now();
            }
        }

        $newsArticle->update($validated);

        return response()->json($newsArticle->fresh());
    }

    /** DELETE /admin/news/{article} — delete article */
    public function destroy(Request $request, NewsArticle $newsArticle): JsonResponse
    {
        $this->gate($request);
        $newsArticle->delete();
        return response()->json(['message' => 'Article deleted.']);
    }
}
