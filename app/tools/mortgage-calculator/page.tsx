"use client";
import { useState } from "react";
import { Calculator, DollarSign, Percent, Calendar } from "lucide-react";

export default function MortgageCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(50000000);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(20);

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Mortgage Calculator
          </h1>
          <p className="text-white/60">
            Calculate your monthly home loan repayments
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Loan Details</h2>

            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-[#4CD137]" />
                  Loan Amount
                </label>
                <input
                  type="range"
                  min="1000000"
                  max="500000000"
                  step="1000000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4CD137]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">LKR 1M</span>
                  <span className="text-lg font-bold text-[#4CD137]">{formatCurrency(loanAmount)}</span>
                  <span className="text-xs text-gray-400">LKR 500M</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Percent className="w-4 h-4 text-[#4CD137]" />
                  Interest Rate (Annual)
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4CD137]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">5%</span>
                  <span className="text-lg font-bold text-[#4CD137]">{interestRate}%</span>
                  <span className="text-xs text-gray-400">25%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#4CD137]" />
                  Loan Term (Years)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4CD137]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">1 year</span>
                  <span className="text-lg font-bold text-[#4CD137]">{loanTerm} years</span>
                  <span className="text-xs text-gray-400">30 years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Monthly Payment */}
            <div className="bg-[#4CD137] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5" />
                <span className="text-sm font-semibold text-white/80">Monthly Payment</span>
              </div>
              <div className="text-4xl font-black">
                {formatCurrency(monthlyPayment)}
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Payment Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Principal Amount</span>
                  <span className="font-bold text-gray-900">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-bold text-orange-500">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Total Repayment</span>
                  <span className="font-black text-gray-900 text-xl">{formatCurrency(totalPayment)}</span>
                </div>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Principal vs Interest
              </h3>
              <div className="h-4 rounded-full overflow-hidden bg-gray-200 flex">
                <div
                  className="bg-[#4CD137] h-full"
                  style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                />
                <div
                  className="bg-orange-400 h-full"
                  style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[#4CD137]" />
                  <span className="text-gray-600">Principal ({((loanAmount / totalPayment) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-400" />
                  <span className="text-gray-600">Interest ({((totalInterest / totalPayment) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> This calculator provides estimates only. Actual loan terms, rates, and repayments may vary.
            Please consult with a financial advisor or bank for accurate loan information.
          </p>
        </div>
      </section>
    </main>
  );
}
