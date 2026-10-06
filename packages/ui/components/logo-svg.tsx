import type { SVGAttributes } from "react";

const LogoSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 328 329"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        y="0.5"
        width="328"
        height="328"
        rx="164"
        fill="black"
        className="dark:fill-white"
      />
      <path
        d="M165.02 72.3V132.77C165.02 152.65 148.9 168.77 129.02 168.77H70.23"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
      <path
        d="M166.63 265.24L166.63 204.77C166.63 184.89 182.74 168.77 202.63 168.77L261.42 168.77"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
      <line
        x1="238.136"
        y1="98.8184"
        x2="196.76"
        y2="139.707"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
      <line
        x1="135.688"
        y1="200.957"
        x2="94.3128"
        y2="241.845"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
      <line
        x1="133.689"
        y1="137.524"
        x2="92.5566"
        y2="96.3914"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
      <line
        x1="237.679"
        y1="241.803"
        x2="196.547"
        y2="200.671"
        stroke="white"
        strokeWidth="20"
        className="dark:stroke-black"
      />
    </svg>
  );
};

export default LogoSvg;
