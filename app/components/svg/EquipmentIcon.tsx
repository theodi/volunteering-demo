type EquipmentIconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

export function EquipmentIcon({ className, "aria-hidden": ariaHidden = true }: EquipmentIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path
        d="M5.00001 18.3334C4.55798 18.3334 4.13406 18.1578 3.8215 17.8453C3.50894 17.5327 3.33334 17.1088 3.33334 16.6668V3.33342C3.33334 2.89139 3.50894 2.46747 3.8215 2.15491C4.13406 1.84235 4.55798 1.66675 5.00001 1.66675H11.6667C11.9305 1.66632 12.1917 1.71809 12.4355 1.81906C12.6792 1.92003 12.9005 2.06822 13.0867 2.25508L16.0767 5.24508C16.264 5.43134 16.4127 5.65287 16.5139 5.89689C16.6152 6.1409 16.6671 6.40256 16.6667 6.66675V16.6668C16.6667 17.1088 16.4911 17.5327 16.1785 17.8453C15.866 18.1578 15.442 18.3334 15 18.3334H5.00001Z"
        stroke="currentColor"
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6667 1.66675V5.83341C11.6667 6.05443 11.7545 6.26639 11.9107 6.42267C12.067 6.57895 12.279 6.66675 12.5 6.66675H16.6667"
        stroke="currentColor"
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3333 18.3333C13.3333 17.4493 12.9821 16.6014 12.357 15.9763C11.7319 15.3512 10.884 15 9.99999 15C9.11593 15 8.26809 15.3512 7.64297 15.9763C7.01785 16.6014 6.66666 17.4493 6.66666 18.3333"
        stroke="currentColor"
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15C11.3807 15 12.5 13.8807 12.5 12.5C12.5 11.1193 11.3807 10 10 10C8.61929 10 7.5 11.1193 7.5 12.5C7.5 13.8807 8.61929 15 10 15Z"
        stroke="currentColor"
        strokeWidth="1.45833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
