import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Slider - A reusable range slider component
 * 
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {function} props.onChange - Callback when value changes
 * @param {number} props.min - Minimum value (default: 0)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {number} props.step - Step increment (default: 1)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showValue - Whether to show the current value (default: false)
 * @param {string} props.label - Optional label for the slider
 */
const Slider = React.forwardRef(({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    className,
    showValue = false,
    label,
    ...props
}, ref) => {
    const handleChange = React.useCallback((e) => {
        onChange?.(Number(e.target.value))
    }, [onChange])

    // Calculate the percentage for the gradient fill
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className={cn("space-y-1.5", className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-xs text-muted-foreground">{label}</span>
                    )}
                    {showValue && (
                        <span className="text-xs font-medium tabular-nums">{value}</span>
                    )}
                </div>
            )}
            <input
                ref={ref}
                type="range"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                className={cn(
                    "w-full h-2 rounded-full appearance-none cursor-pointer nodrag",
                    "bg-muted",
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:w-4",
                    "[&::-webkit-slider-thumb]:h-4",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:bg-primary",
                    "[&::-webkit-slider-thumb]:border-2",
                    "[&::-webkit-slider-thumb]:border-background",
                    "[&::-webkit-slider-thumb]:shadow-md",
                    "[&::-webkit-slider-thumb]:transition-transform",
                    "[&::-webkit-slider-thumb]:hover:scale-110",
                    "[&::-moz-range-thumb]:w-4",
                    "[&::-moz-range-thumb]:h-4",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:bg-primary",
                    "[&::-moz-range-thumb]:border-2",
                    "[&::-moz-range-thumb]:border-background",
                    "[&::-moz-range-thumb]:shadow-md",
                )}
                style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%)`
                }}
                {...props}
            />
        </div>
    )
})

Slider.displayName = "Slider"

export { Slider }
