import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * DualSlider - A reusable range slider component with two handles (min/max)
 * 
 * @param {Object} props
 * @param {number[]} props.value - Current value [min, max]
 * @param {function} props.onChange - Callback when value changes ([min, max])
 * @param {number} props.min - Minimum value (default: 0)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {number} props.step - Step increment (default: 1)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showValue - Whether to show the current value (default: false)
 * @param {string} props.label - Optional label for the slider
 */
const DualSlider = React.forwardRef(({
    value = [0, 100],
    onChange,
    min = 0,
    max = 100,
    step = 1,
    className,
    showValue = false,
    label,
    ...props
}, ref) => {
    const [minVal, maxVal] = value

    const handleMinChange = React.useCallback((e) => {
        const newVal = Math.min(Number(e.target.value), maxVal - step)
        onChange?.([newVal, maxVal])
    }, [maxVal, step, onChange])

    const handleMaxChange = React.useCallback((e) => {
        const newVal = Math.max(Number(e.target.value), minVal + step)
        onChange?.([minVal, newVal])
    }, [minVal, step, onChange])

    // Calculate percentages for the track highlight
    const minPercent = ((minVal - min) / (max - min)) * 100
    const maxPercent = ((maxVal - min) / (max - min)) * 100

    return (
        <div className={cn("space-y-1.5", className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-xs text-muted-foreground">{label}</span>
                    )}
                    {showValue && (
                        <span className="text-xs font-medium tabular-nums">
                            {minVal} - {maxVal}
                        </span>
                    )}
                </div>
            )}

            <div className="relative w-full h-2">
                {/* Background Track */}
                <div className="absolute w-full h-full bg-muted rounded-full" />

                {/* Active Range Track */}
                <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`
                    }}
                />

                {/* Min Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={handleMinChange}
                    className={cn(
                        "absolute w-full h-full appearance-none bg-transparent pointer-events-none cursor-pointer nodrag",
                        "[&::-webkit-slider-thumb]:pointer-events-auto",
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
                        "[&::-webkit-slider-thumb]:relative",
                        "[&::-webkit-slider-thumb]:z-20",
                        "[&::-moz-range-thumb]:pointer-events-auto",
                        "[&::-moz-range-thumb]:w-4",
                        "[&::-moz-range-thumb]:h-4",
                        "[&::-moz-range-thumb]:rounded-full",
                        "[&::-moz-range-thumb]:bg-primary",
                        "[&::-moz-range-thumb]:border-2",
                        "[&::-moz-range-thumb]:border-background",
                        "[&::-moz-range-thumb]:shadow-md",
                        "[&::-moz-range-thumb]:z-20",
                    )}
                />

                {/* Max Slider */}
                <input
                    ref={ref}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className={cn(
                        "absolute w-full h-full appearance-none bg-transparent pointer-events-none cursor-pointer nodrag",
                        "[&::-webkit-slider-thumb]:pointer-events-auto",
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
                        "[&::-webkit-slider-thumb]:relative",
                        "[&::-webkit-slider-thumb]:z-20",
                        "[&::-moz-range-thumb]:pointer-events-auto",
                        "[&::-moz-range-thumb]:w-4",
                        "[&::-moz-range-thumb]:h-4",
                        "[&::-moz-range-thumb]:rounded-full",
                        "[&::-moz-range-thumb]:bg-primary",
                        "[&::-moz-range-thumb]:border-2",
                        "[&::-moz-range-thumb]:border-background",
                        "[&::-moz-range-thumb]:shadow-md",
                        "[&::-moz-range-thumb]:z-20",
                    )}
                    {...props}
                />
            </div>
        </div>
    )
})

DualSlider.displayName = "DualSlider"

/* 
 * CSS Required for DualSlider overlapping 
 * The inputs must be exactly on top of each other.
 * Z-index management ensures they are clickable.
 * Note: Pure CSS implementation of dual slider has edge cases (e.g. crossing over),
 * handled here by clamping values in onChange.
 */

export { DualSlider }
