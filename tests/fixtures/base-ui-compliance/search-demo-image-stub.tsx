import React from "react";

/** Only static demo imagery: this fixture verifies real search/keyboard/dialog behavior. */
export default function SearchDemoImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
