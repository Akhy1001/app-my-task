"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressContextValue {
    value: number;
    max: number;
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

function useProgressContext() {
    const context = React.useContext(ProgressContext);
    if (!context) {
        throw new Error("Progress components must be used within a Progress provider");
    }
    return context;
}

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, children, ...props }, ref) => {
        return (
            <ProgressContext.Provider value={{ value, max }}>
                <div
                    ref={ref}
                    className={cn("w-full flex flex-col gap-2", className)}
                    {...props}
                >
                    {children}
                </div>
            </ProgressContext.Provider>
        );
    }
);
Progress.displayName = "Progress";

type ProgressLabelProps = React.HTMLAttributes<HTMLDivElement>;

const ProgressLabel = React.forwardRef<HTMLDivElement, ProgressLabelProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-sm font-medium text-neutral-900 dark:text-neutral-100 flex justify-between", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ProgressLabel.displayName = "ProgressLabel";

type ProgressTrackProps = React.HTMLAttributes<HTMLDivElement>;

const ProgressTrack = React.forwardRef<HTMLDivElement, ProgressTrackProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800",
                    className
                )}
                {...props}
            >
                {children}
                <ProgressValue />
            </div>
        );
    }
);
ProgressTrack.displayName = "ProgressTrack";

type ProgressValueProps = React.HTMLAttributes<HTMLDivElement>;

const ProgressValue = React.forwardRef<HTMLDivElement, ProgressValueProps>(
    ({ className, ...props }, ref) => {
        const { value, max } = useProgressContext();
        const percentage = max > 0 ? Math.min(Math.max(0, (value / max) * 100), 100) : 0;

        return (
            <motion.div
                ref={ref}
                className={cn("h-full w-full flex-1 bg-green-500 transition-all", className)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                {...props as any}
            />
        );
    }
);
ProgressValue.displayName = "ProgressValue";

export { Progress, ProgressLabel, ProgressTrack, ProgressValue };
