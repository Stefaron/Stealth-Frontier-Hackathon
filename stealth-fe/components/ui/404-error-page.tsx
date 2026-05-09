"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RetroTvErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errorCode?: string;
  errorMessage?: string;
}

const RetroTvError = React.forwardRef<HTMLDivElement, RetroTvErrorProps>(
  ({ className, errorCode = "404", errorMessage = "NOT FOUND", ...props }, ref) => {
    const digits = errorCode.split("");

    return (
      <div
        ref={ref}
        className={cn("retrotv-wrap relative flex items-center justify-center", className)}
        {...props}
      >
        {/* Background big digits */}
        <div className="retrotv-bigtext" aria-hidden>
          {digits.map((d, i) => (
            <span key={i} className={`retrotv-digit retrotv-digit-${i}`}>
              {d}
            </span>
          ))}
        </div>

        {/* TV unit */}
        <div className="retrotv-unit">
          {/* Antennas */}
          <div className="retrotv-antenna">
            <span className="retrotv-ant retrotv-ant-l" />
            <span className="retrotv-ant retrotv-ant-r" />
            <span className="retrotv-ant-knob retrotv-ant-knob-l" />
            <span className="retrotv-ant-knob retrotv-ant-knob-r" />
          </div>

          {/* TV body */}
          <div className="retrotv-body">
            <div className="retrotv-screen">
              <span className="retrotv-static" />
              <span className="retrotv-scanline" />
              <span className="retrotv-message">{errorMessage}</span>
            </div>
            <div className="retrotv-controls">
              <span className="retrotv-knob" />
              <span className="retrotv-knob" />
              <span className="retrotv-speaker">
                <span /><span /><span /><span /><span /><span />
              </span>
            </div>
          </div>

          {/* Stand */}
          <div className="retrotv-stand">
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }
);

RetroTvError.displayName = "RetroTvError";

export { RetroTvError };
