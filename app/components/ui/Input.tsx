import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export default function Input({ label, icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4CD137]">
            {icon}
          </span>
        )}
        <input
          className={`w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-[#4CD137] focus:bg-white bg-gray-50 ${icon ? "pl-10" : ""} ${error ? "border-red-400" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
