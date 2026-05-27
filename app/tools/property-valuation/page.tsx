"use client";
import { useState } from "react";
import { MapPin, Home, Maximize2, Calendar, ArrowRight } from "lucide-react";

export default function PropertyValuationPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Free Property Valuation
          </h1>
          <p className="text-white/60">
            Get an instant estimate of your property's market value
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        {!submitted ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Property Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-[#4CD137]" />
                  Property Address
                </label>
                <input
                  type="text"
                  placeholder="Enter your property address"
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Home className="w-4 h-4 text-[#4CD137]" />
                  Property Type
                </label>
                <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]">
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Land</option>
                  <option>Commercial</option>
                </select>
              </div>

              {/* Beds & Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Bedrooms</label>
                  <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Bathrooms</label>
                  <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </div>
              </div>

              {/* Size & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Maximize2 className="w-4 h-4 text-[#4CD137]" />
                    Floor Area (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-[#4CD137]" />
                    Year Built
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2010"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4CD137] text-white font-bold py-4 rounded-xl hover:bg-[#3da82d] transition-colors flex items-center justify-center gap-2"
              >
                Get Free Valuation
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#4CD137]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Request Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Thank you for your valuation request. One of our property experts will contact you within 24 hours with a detailed market analysis.
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#4CD137] font-semibold">
                Estimated Value Range: LKR 45,000,000 - LKR 55,000,000
              </p>
              <p className="text-xs text-gray-500 mt-1">
                *This is a preliminary estimate based on similar properties
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#4CD137] font-semibold hover:underline"
            >
              Submit Another Request
            </button>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Free Service", desc: "No cost, no obligation property valuation" },
            { title: "Expert Analysis", desc: "Valuations by certified property professionals" },
            { title: "Quick Results", desc: "Receive your valuation within 24 hours" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
