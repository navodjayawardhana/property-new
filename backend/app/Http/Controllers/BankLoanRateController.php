<?php

namespace App\Http\Controllers;

use App\Models\BankLoanRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BankLoanRateController extends Controller
{
    private function format(BankLoanRate $rate): array
    {
        return array_merge($rate->toArray(), ['logo_url' => $rate->logo_url]);
    }

    // Public: active rates only
    public function index(): JsonResponse
    {
        $rates = BankLoanRate::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('interest_rate')
            ->get()
            ->map(fn($r) => $this->format($r));

        return response()->json($rates);
    }

    // Admin: all rates
    public function adminIndex(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') abort(403);

        $rates = BankLoanRate::orderBy('sort_order')
            ->orderBy('interest_rate')
            ->get()
            ->map(fn($r) => $this->format($r));

        return response()->json($rates);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') abort(403);

        $data = $request->validate([
            'bank_name'     => 'required|string|max:255',
            'loan_type'     => 'required|in:variable,fixed,split,interest_only',
            'interest_rate' => 'required|numeric|min:0|max:100',
            'min_loan'      => 'required|integer|min:0',
            'max_loan'      => 'required|integer|min:0',
            'max_term'      => 'required|integer|min:1|max:30',
            'features'      => 'nullable|array',
            'features.*'    => 'string|max:200',
            'is_active'     => 'boolean',
            'sort_order'    => 'integer|min:0',
            'logo'          => 'nullable|file|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('bank-logos', 'public');
        }
        unset($data['logo']);

        $rate = BankLoanRate::create($data);

        return response()->json($this->format($rate), 201);
    }

    public function update(Request $request, BankLoanRate $bankLoanRate): JsonResponse
    {
        if ($request->user()->role !== 'admin') abort(403);

        $data = $request->validate([
            'bank_name'     => 'sometimes|string|max:255',
            'loan_type'     => 'sometimes|in:variable,fixed,split,interest_only',
            'interest_rate' => 'sometimes|numeric|min:0|max:100',
            'min_loan'      => 'sometimes|integer|min:0',
            'max_loan'      => 'sometimes|integer|min:0',
            'max_term'      => 'sometimes|integer|min:1|max:30',
            'features'      => 'nullable|array',
            'features.*'    => 'string|max:200',
            'is_active'     => 'boolean',
            'sort_order'    => 'integer|min:0',
            'logo'          => 'nullable|file|image|max:2048',
            'remove_logo'   => 'boolean',
        ]);

        if ($request->boolean('remove_logo') && $bankLoanRate->logo_path) {
            Storage::disk('public')->delete($bankLoanRate->logo_path);
            $data['logo_path'] = null;
        } elseif ($request->hasFile('logo')) {
            if ($bankLoanRate->logo_path) {
                Storage::disk('public')->delete($bankLoanRate->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('bank-logos', 'public');
        }
        unset($data['logo'], $data['remove_logo']);

        $bankLoanRate->update($data);

        return response()->json($this->format($bankLoanRate->fresh()));
    }

    public function destroy(Request $request, BankLoanRate $bankLoanRate): JsonResponse
    {
        if ($request->user()->role !== 'admin') abort(403);

        if ($bankLoanRate->logo_path) {
            Storage::disk('public')->delete($bankLoanRate->logo_path);
        }

        $bankLoanRate->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
