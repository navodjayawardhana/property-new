<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BankLoanRatesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('bank_loan_rates')->truncate();

        $banks = [
            // NSB – lowest variable (state mandate)
            [
                'bank_name'     => 'National Savings Bank (NSB)',
                'loan_type'     => 'variable',
                'interest_rate' => 11.00,
                'min_loan'      => 500000,
                'max_loan'      => 50000000,
                'max_term'      => 30,
                'features'      => ['No prepayment penalty', 'Free annual review', 'Life insurance cover'],
                'sort_order'    => 1,
            ],
            [
                'bank_name'     => 'National Savings Bank (NSB)',
                'loan_type'     => 'fixed',
                'interest_rate' => 12.00,
                'min_loan'      => 500000,
                'max_loan'      => 30000000,
                'max_term'      => 20,
                'features'      => ['Locked rate 3 years', 'Repayment certainty', 'Life insurance cover'],
                'sort_order'    => 2,
            ],

            // BOC
            [
                'bank_name'     => 'Bank of Ceylon (BOC)',
                'loan_type'     => 'variable',
                'interest_rate' => 11.50,
                'min_loan'      => 500000,
                'max_loan'      => 50000000,
                'max_term'      => 30,
                'features'      => ['Offset account', 'Redraw facility', 'Online banking'],
                'sort_order'    => 3,
            ],
            [
                'bank_name'     => 'Bank of Ceylon (BOC)',
                'loan_type'     => 'fixed',
                'interest_rate' => 12.50,
                'min_loan'      => 500000,
                'max_loan'      => 40000000,
                'max_term'      => 25,
                'features'      => ['Locked rate 5 years', 'Easy budgeting', 'Online banking'],
                'sort_order'    => 4,
            ],

            // People's Bank
            [
                'bank_name'     => "People's Bank",
                'loan_type'     => 'variable',
                'interest_rate' => 11.75,
                'min_loan'      => 500000,
                'max_loan'      => 50000000,
                'max_term'      => 30,
                'features'      => ['Flexible repayments', 'Free valuation', 'Mobile app'],
                'sort_order'    => 5,
            ],
            [
                'bank_name'     => "People's Bank",
                'loan_type'     => 'split',
                'interest_rate' => 12.00,
                'min_loan'      => 1000000,
                'max_loan'      => 40000000,
                'max_term'      => 25,
                'features'      => ['50/50 split', 'Partial offset', 'Mobile app'],
                'sort_order'    => 6,
            ],

            // HNB
            [
                'bank_name'     => 'Hatton National Bank (HNB)',
                'loan_type'     => 'variable',
                'interest_rate' => 12.00,
                'min_loan'      => 1000000,
                'max_loan'      => 50000000,
                'max_term'      => 30,
                'features'      => ['Offset account', 'HNB Mobile banking', 'Free legal advice'],
                'sort_order'    => 7,
            ],
            [
                'bank_name'     => 'Hatton National Bank (HNB)',
                'loan_type'     => 'fixed',
                'interest_rate' => 13.00,
                'min_loan'      => 1000000,
                'max_loan'      => 50000000,
                'max_term'      => 25,
                'features'      => ['Locked rate 3–5 years', 'Rate protection', 'HNB Mobile banking'],
                'sort_order'    => 8,
            ],

            // Commercial Bank
            [
                'bank_name'     => 'Commercial Bank of Ceylon',
                'loan_type'     => 'variable',
                'interest_rate' => 12.25,
                'min_loan'      => 1000000,
                'max_loan'      => 50000000,
                'max_term'      => 30,
                'features'      => ['Redraw facility', 'ComBank Digital', 'Mortgage holiday option'],
                'sort_order'    => 9,
            ],
            [
                'bank_name'     => 'Commercial Bank of Ceylon',
                'loan_type'     => 'split',
                'interest_rate' => 12.50,
                'min_loan'      => 2000000,
                'max_loan'      => 50000000,
                'max_term'      => 25,
                'features'      => ['Customise split ratio', 'ComBank Digital', 'Partial offset'],
                'sort_order'    => 10,
            ],

            // Sampath Bank
            [
                'bank_name'     => 'Sampath Bank',
                'loan_type'     => 'variable',
                'interest_rate' => 12.75,
                'min_loan'      => 1000000,
                'max_loan'      => 50000000,
                'max_term'      => 25,
                'features'      => ['Offset account', 'Sampath Vishwa app', 'Free property valuation'],
                'sort_order'    => 11,
            ],
            [
                'bank_name'     => 'Sampath Bank',
                'loan_type'     => 'interest_only',
                'interest_rate' => 13.50,
                'min_loan'      => 2000000,
                'max_loan'      => 50000000,
                'max_term'      => 20,
                'features'      => ['5-year IO period', 'Popular for investors', 'Sampath Vishwa app'],
                'sort_order'    => 12,
            ],

            // DFCC Bank
            [
                'bank_name'     => 'DFCC Bank',
                'loan_type'     => 'fixed',
                'interest_rate' => 13.00,
                'min_loan'      => 1000000,
                'max_loan'      => 30000000,
                'max_term'      => 20,
                'features'      => ['Locked rate 3 years', 'No hidden fees', 'DFCC iConnect app'],
                'sort_order'    => 13,
            ],
            [
                'bank_name'     => 'DFCC Bank',
                'loan_type'     => 'variable',
                'interest_rate' => 12.50,
                'min_loan'      => 1000000,
                'max_loan'      => 30000000,
                'max_term'      => 25,
                'features'      => ['Flexible repayments', 'DFCC iConnect app', 'Insurance package'],
                'sort_order'    => 14,
            ],

            // Seylan Bank
            [
                'bank_name'     => 'Seylan Bank',
                'loan_type'     => 'variable',
                'interest_rate' => 13.25,
                'min_loan'      => 1000000,
                'max_loan'      => 30000000,
                'max_term'      => 25,
                'features'      => ['Redraw facility', 'Seylan Mobile app', 'Free insurance year 1'],
                'sort_order'    => 15,
            ],
            [
                'bank_name'     => 'Seylan Bank',
                'loan_type'     => 'interest_only',
                'interest_rate' => 14.00,
                'min_loan'      => 2000000,
                'max_loan'      => 25000000,
                'max_term'      => 15,
                'features'      => ['3-year IO period', 'Investor-friendly', 'Seylan Mobile app'],
                'sort_order'    => 16,
            ],

            // Nations Trust Bank
            [
                'bank_name'     => 'Nations Trust Bank (NTB)',
                'loan_type'     => 'variable',
                'interest_rate' => 13.50,
                'min_loan'      => 1000000,
                'max_loan'      => 25000000,
                'max_term'      => 20,
                'features'      => ['FriMi digital wallet', 'Offset account', 'Flexible repayments'],
                'sort_order'    => 17,
            ],
            [
                'bank_name'     => 'Nations Trust Bank (NTB)',
                'loan_type'     => 'split',
                'interest_rate' => 13.75,
                'min_loan'      => 2000000,
                'max_loan'      => 25000000,
                'max_term'      => 20,
                'features'      => ['Manage rate risk', 'FriMi digital wallet', 'Partial offset'],
                'sort_order'    => 18,
            ],

            // Pan Asia Bank
            [
                'bank_name'     => 'Pan Asia Banking Corporation',
                'loan_type'     => 'fixed',
                'interest_rate' => 13.75,
                'min_loan'      => 500000,
                'max_loan'      => 20000000,
                'max_term'      => 20,
                'features'      => ['Locked rate 2 years', 'Easy approval', 'Pan Asia Mobile'],
                'sort_order'    => 19,
            ],
            [
                'bank_name'     => 'Pan Asia Banking Corporation',
                'loan_type'     => 'variable',
                'interest_rate' => 13.00,
                'min_loan'      => 500000,
                'max_loan'      => 20000000,
                'max_term'      => 20,
                'features'      => ['Quick processing', 'Pan Asia Mobile', 'Free valuation'],
                'sort_order'    => 20,
            ],
        ];

        foreach ($banks as $bank) {
            DB::table('bank_loan_rates')->insert([
                'bank_name'     => $bank['bank_name'],
                'loan_type'     => $bank['loan_type'],
                'interest_rate' => $bank['interest_rate'],
                'min_loan'      => $bank['min_loan'],
                'max_loan'      => $bank['max_loan'],
                'max_term'      => $bank['max_term'],
                'features'      => json_encode($bank['features']),
                'is_active'     => true,
                'sort_order'    => $bank['sort_order'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
