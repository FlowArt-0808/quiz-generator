import * as React from "react";
const SidebarIcon = ({ ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={21}
    fill="none"
    {...props}
  >
    <path
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.5.5v20m7-12.56-2.56 2.56 2.56 2.56m7 .44v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7h6c5 0 7-2 7-7Z"
    />
  </svg>
);
export default SidebarIcon;
