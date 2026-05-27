import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({ children, className = "", hover = true, padding = "md" }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 ${paddings[padding]} ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
