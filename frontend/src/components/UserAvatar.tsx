"use client";

import { useState } from "react";

interface UserAvatarProps {
  src: string | null;
  name: string;
  avatarBg: string;
  textSize?: string;
}

export function UserAvatar({ src, name, avatarBg, textSize = "" }: UserAvatarProps) {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={`w-full h-full ${avatarBg} flex items-center justify-center text-white font-black ${textSize}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
