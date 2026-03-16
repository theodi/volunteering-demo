type CheckIconCustomProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

export function CheckIconCustom({
  className,
  "aria-hidden": ariaHidden = true,
}: CheckIconCustomProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path
        d="M16.3508 7.49999C16.6933 9.18097 16.4492 10.9286 15.6592 12.4513C14.8691 13.9741 13.5809 15.18 12.0094 15.868C10.4379 16.5559 8.67798 16.6843 7.02324 16.2318C5.36849 15.7792 3.91891 14.773 2.91622 13.3811C1.91353 11.9891 1.41836 10.2954 1.51326 8.58253C1.60817 6.86964 2.28742 5.24106 3.43775 3.96837C4.58808 2.69568 6.13995 1.85582 7.83456 1.58883C9.52918 1.32185 11.2641 1.64389 12.75 2.50124"
        stroke="currentColor"
        strokeWidth="1.3125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 8.25L9 10.5L16.5 3"
        stroke="currentColor"
        strokeWidth="1.3125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
