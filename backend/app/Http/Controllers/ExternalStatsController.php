<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\LoanEnquiry;
use App\Models\NewsArticle;
use App\Models\PendingListing;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Read-only statistics feed consumed by external dashboards (Syncy Analytics).
 *
 * Everything here is aggregate — counts and sums only, never a customer record —
 * so a leaked key exposes no personal data beyond the transaction list, which is
 * limited to a name and an order reference.
 *
 * Money comes from `pending_listings`: a listing is paid for before it goes live,
 * so a completed row there is a booked sale. Rows that never completed are the
 * abandoned-checkout tail and are reported separately.
 */
class ExternalStatsController extends Controller
{
    /** GET /api/external/stats — the whole dashboard payload in one call. */
    public function index(Request $request): JsonResponse
    {
        $months = max(1, min(24, (int) $request->integer('months', 12)));

        $now   = Carbon::now();
        $from  = $now->copy()->startOfMonth()->subMonths($months - 1);
        $week  = $now->copy()->subWeek();

        return response()->json([
            'project'             => [
                'name'         => config('app.name'),
                'currency'     => config('partners.currency'),
                'generated_at' => $now->toISOString(),
            ],
            'range'               => [
                'months' => $months,
                'from'   => $from->toDateString(),
                'to'     => $now->toDateString(),
            ],
            'summary'             => $this->summary($now),
            'revenue_series'      => $this->revenueSeries($from, $months),
            'orders_breakdown'    => $this->ordersBreakdown(),
            'properties'          => $this->properties($week),
            'users'               => $this->users($week),
            'inquiries'           => $this->inquiries($week),
            'news'                => $this->news($week),
            'recent_transactions' => $this->recentTransactions(),
        ]);
    }

    // ── Sales & accounting ────────────────────────────────────────────────────

    /**
     * Headline figures. "Revenue" is always completed payments only; pending and
     * failed money is quoted separately so it can never inflate the total.
     */
    private function summary(Carbon $now): array
    {
        $paid = fn () => PendingListing::where('payment_status', 'completed');

        $thisMonth = (float) $paid()
            ->where('created_at', '>=', $now->copy()->startOfMonth())
            ->sum('payment_amount');

        $lastMonth = (float) $paid()
            ->whereBetween('created_at', [
                $now->copy()->subMonthNoOverflow()->startOfMonth(),
                $now->copy()->subMonthNoOverflow()->endOfMonth(),
            ])
            ->sum('payment_amount');

        $totalRevenue   = (float) $paid()->sum('payment_amount');
        $completedCount = $paid()->count();
        $totalOrders    = PendingListing::count();

        return [
            'revenue' => [
                'total'      => round($totalRevenue, 2),
                'today'      => round((float) $paid()->where('created_at', '>=', $now->copy()->startOfDay())->sum('payment_amount'), 2),
                'this_month' => round($thisMonth, 2),
                'last_month' => round($lastMonth, 2),
                // No previous month to compare against reads as flat, not as +100%.
                'change_pct' => $lastMonth > 0
                    ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1)
                    : ($thisMonth > 0 ? 100.0 : 0.0),
            ],
            'orders'  => [
                'total'            => $totalOrders,
                'completed'        => $completedCount,
                'pending'          => PendingListing::where('payment_status', 'pending')->count(),
                'failed'           => PendingListing::where('payment_status', 'failed')->count(),
                'pending_amount'   => round((float) PendingListing::where('payment_status', 'pending')->sum('payment_amount'), 2),
                'avg_order_value'  => $completedCount > 0 ? round($totalRevenue / $completedCount, 2) : 0.0,
                'conversion_pct'   => $totalOrders > 0 ? round(($completedCount / $totalOrders) * 100, 1) : 0.0,
            ],
            'portfolio' => [
                // Gross value of what is on the books, not money earned.
                'listed_value'        => (float) Property::where('status', 'active')->sum('price'),
                'sold_value'          => (float) Property::where('status', 'sold')->sum('price'),
                'listing_fees_billed' => round((float) Property::sum('listing_fee'), 2),
            ],
        ];
    }

    /** Month-by-month revenue, zero-filled so the chart never skips a month. */
    private function revenueSeries(Carbon $from, int $months): array
    {
        $rows = PendingListing::selectRaw("DATE_FORMAT(created_at, '%Y-%m') AS period")
            ->selectRaw("SUM(CASE WHEN payment_status = 'completed' THEN payment_amount ELSE 0 END) AS revenue")
            ->selectRaw("SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) AS orders")
            ->selectRaw('COUNT(*) AS attempts')
            ->where('created_at', '>=', $from)
            ->groupBy('period')
            ->get()
            ->keyBy('period');

        $series = [];

        for ($i = 0; $i < $months; $i++) {
            $month = $from->copy()->addMonths($i);
            $key   = $month->format('Y-m');
            $row   = $rows[$key] ?? null;

            $series[] = [
                'period'   => $key,
                'label'    => $month->format('M'),
                'revenue'  => round((float) ($row->revenue ?? 0), 2),
                'orders'   => (int) ($row->orders ?? 0),
                'attempts' => (int) ($row->attempts ?? 0),
            ];
        }

        return $series;
    }

    private function ordersBreakdown(): array
    {
        $rows = PendingListing::selectRaw('payment_status, COUNT(*) AS count, SUM(payment_amount) AS amount')
            ->groupBy('payment_status')
            ->get()
            ->keyBy('payment_status');

        // Fixed order and full set of statuses keeps the donut stable between polls.
        return collect(['completed', 'pending', 'failed'])
            ->map(fn (string $status) => [
                'status' => $status,
                'count'  => (int) ($rows[$status]->count ?? 0),
                'amount' => round((float) ($rows[$status]->amount ?? 0), 2),
            ])
            ->all();
    }

    private function recentTransactions(): array
    {
        return PendingListing::with('user:id,name,email')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (PendingListing $p) => [
                'order_id'   => $p->order_id,
                'customer'   => $p->user?->name ?? 'Unknown',
                'amount'     => round((float) $p->payment_amount, 2),
                'status'     => $p->payment_status,
                'created_at' => $p->created_at?->toISOString(),
            ])
            ->all();
    }

    // ── Operational counts ────────────────────────────────────────────────────

    private function properties(Carbon $week): array
    {
        return [
            'total'         => Property::count(),
            'active'        => Property::where('status', 'active')->count(),
            'inactive'      => Property::where('status', 'inactive')->count(),
            'sold'          => Property::where('status', 'sold')->count(),
            'featured'      => Property::where('is_featured', true)->count(),
            'buy'           => Property::where('listing_type', 'buy')->count(),
            'rent'          => Property::where('listing_type', 'rent')->count(),
            'new_this_week' => Property::where('created_at', '>=', $week)->count(),
            'by_type'       => Property::selectRaw('property_type AS type, COUNT(*) AS count')
                ->groupBy('property_type')
                ->orderByDesc('count')
                ->limit(8)
                ->get()
                ->map(fn ($r) => ['type' => (string) $r->type, 'count' => (int) $r->count])
                ->all(),
        ];
    }

    private function users(Carbon $week): array
    {
        return [
            'total'         => User::count(),
            'buyers'        => User::where('role', 'buyer')->count(),
            'sellers'       => User::where('role', 'seller')->count(),
            'agents'        => User::where('role', 'agent')->count(),
            'admins'        => User::where('role', 'admin')->count(),
            'new_this_week' => User::where('created_at', '>=', $week)->count(),
        ];
    }

    private function inquiries(Carbon $week): array
    {
        return [
            'total'          => Inquiry::count(),
            'pending'        => Inquiry::where('status', 'pending')->count(),
            'contacted'      => Inquiry::where('status', 'contacted')->count(),
            'resolved'       => Inquiry::where('status', 'resolved')->count(),
            'new_this_week'  => Inquiry::where('created_at', '>=', $week)->count(),
            'loan_enquiries' => LoanEnquiry::count(),
        ];
    }

    // ── News desk ─────────────────────────────────────────────────────────────

    private function news(Carbon $week): array
    {
        return [
            'total'         => NewsArticle::count(),
            'published'     => NewsArticle::where('is_published', true)->count(),
            'drafts'        => NewsArticle::where('is_published', false)->count(),
            'new_this_week' => NewsArticle::where('created_at', '>=', $week)->count(),
            'by_category'   => NewsArticle::selectRaw('category, COUNT(*) AS count')
                ->groupBy('category')
                ->orderByDesc('count')
                ->limit(8)
                ->get()
                ->map(fn ($r) => ['category' => (string) $r->category, 'count' => (int) $r->count])
                ->all(),
            'latest'        => NewsArticle::orderByDesc('published_at')
                ->orderByDesc('created_at')
                ->limit(6)
                ->get()
                ->map(fn (NewsArticle $n) => [
                    'id'           => $n->id,
                    'title'        => $n->title,
                    'category'     => $n->category,
                    'tag'          => $n->tag,
                    'image_url'    => $n->image_url,
                    'read_time'    => $n->read_time,
                    'is_published' => (bool) $n->is_published,
                    'published_at' => ($n->published_at ?? $n->created_at)?->toISOString(),
                ])
                ->all(),
        ];
    }
}
