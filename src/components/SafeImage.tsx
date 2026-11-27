import React, { useEffect, useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50/50 text-[#132347]/75 p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle || 'Первая Детская Стоматология'}
      >
        <svg
          className="w-8 h-8 mb-2 text-[#0284C7]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M12 3L4 21h3.5l1.8-4.5h5.4L16.5 21H20L12 3z" />
          <path d="M10.2 13.5L12 8.8l1.8 4.7h-3.6z" />
        </svg>
        <span className="text-xs font-bold tracking-wide text-[#132347]/80">
          {fallbackTitle || alt || 'Первая Детская Стоматология'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
};
