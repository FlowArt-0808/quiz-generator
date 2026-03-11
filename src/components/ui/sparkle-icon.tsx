import * as React from "react";

const SparkleIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    {...props}
  >
    <path
      stroke="#09090B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.667 4v5.333m18.666 13.334V28M4 6.667h5.333m13.334 18.666H28M16 4l-2.55 7.75a2.667 2.667 0 0 1-1.7 1.7L4 16l7.75 2.55a2.667 2.667 0 0 1 1.7 1.7L16 28l2.55-7.75a2.667 2.667 0 0 1 1.7-1.7L28 16l-7.75-2.55a2.667 2.667 0 0 1-1.7-1.7L16 4Z"
    />
  </svg>
);

export default SparkleIcon;
