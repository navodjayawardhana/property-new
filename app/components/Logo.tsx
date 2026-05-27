interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export default function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  return (
    <img
      src="/logo.png"
      alt="GreenBrick.net"
      className={`${sizes[size]} w-auto`}
    />
  );
}
