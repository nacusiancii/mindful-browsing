import * as React from "react";
import { truncateUrl } from "../../lib/utils";

export interface TruncatedUrlProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  url: string;
  maxLength?: number;
}

const TruncatedUrl = React.forwardRef<HTMLSpanElement, TruncatedUrlProps>(
  ({ url, maxLength = 50, className, ...props }, ref) => {
    const truncatedUrl = truncateUrl(url, maxLength);

    return (
      <span
        ref={ref}
        className={` ${className || ""}`}
        title={url}
        tabIndex={0}
        {...props}
      >
        <span className="truncate">{truncatedUrl}</span>
        <span
          className="absolute bottom-full left-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-xs"
          role="tooltip"
          aria-hidden="true"
        >
          {url}
        </span>
        <span className="sr-only">{url}</span>
      </span>
    );
  }
);

TruncatedUrl.displayName = "TruncatedUrl";

export { TruncatedUrl };
