interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export default function Logo({ size = "md", variant = "full" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, textMain: 16, textSub: 9 },
    md: { icon: 44, textMain: 22, textSub: 11 },
    lg: { icon: 64, textMain: 32, textSub: 14 },
  };

  const s = sizes[size];

  if (variant === "icon") {
    return (
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* House shape */}
        <rect width="100" height="100" rx="20" fill="#C8102E"/>
        <path d="M50 18L82 42V82H62V60H38V82H18V42L50 18Z" fill="white"/>
        <rect x="43" y="60" width="14" height="22" fill="#C8102E"/>
        {/* S letter hint inside door */}
        <path d="M45 66C45 64.9 45.9 64 47 64H53C54.1 64 55 64.9 55 66C55 67.1 54.1 68 53 68H47C45.9 68 45 68.9 45 70C45 71.1 45.9 72 47 72H53C54.1 72 55 72.9 55 74" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <svg
      width={variant === "full" ? s.icon * 5.5 : s.icon}
      height={s.icon}
      viewBox={`0 0 ${s.icon * 5.5} ${s.icon}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon Box */}
      <rect width={s.icon} height={s.icon} rx={s.icon * 0.18} fill="#C8102E"/>

      {/* House */}
      <path
        d={`M${s.icon*0.5} ${s.icon*0.18}L${s.icon*0.82} ${s.icon*0.42}V${s.icon*0.82}H${s.icon*0.62}V${s.icon*0.6}H${s.icon*0.38}V${s.icon*0.82}H${s.icon*0.18}V${s.icon*0.42}L${s.icon*0.5} ${s.icon*0.18}Z`}
        fill="white"
      />
      <rect
        x={s.icon * 0.43}
        y={s.icon * 0.6}
        width={s.icon * 0.14}
        height={s.icon * 0.22}
        fill="#C8102E"
      />

      {/* SERENDIB text */}
      <text
        x={s.icon * 1.15}
        y={s.icon * 0.52}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={s.textMain}
        fontWeight="700"
        fill="#C8102E"
        letterSpacing="1.5"
      >
        SERENDIB
      </text>

      {/* REAL ESTATE text */}
      <text
        x={s.icon * 1.15}
        y={s.icon * 0.78}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={s.textSub}
        fontWeight="400"
        fill="#555555"
        letterSpacing="3"
      >
        REAL  ESTATE
      </text>

      {/* Underline accent */}
      <rect
        x={s.icon * 1.15}
        y={s.icon * 0.83}
        width={s.icon * 2.8}
        height={s.icon * 0.04}
        rx={1}
        fill="#C8102E"
        opacity="0.5"
      />
    </svg>
  );
}
