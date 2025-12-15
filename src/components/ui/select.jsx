import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

/**
 * Select - A styled select dropdown component
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of { value, label } objects
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Optional label for the select
 */
const Select = React.forwardRef(({
    value,
    onChange,
    options = [],
    className,
    label,
    ...props
}, ref) => {
    const handleChange = React.useCallback((e) => {
        onChange?.(e.target.value)
    }, [onChange])

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <span className="text-xs text-muted-foreground">{label}</span>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    className={cn(
                        "w-full h-8 px-2 pr-8 rounded-md text-sm nodrag",
                        "bg-background border border-input",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        "appearance-none cursor-pointer",
                        "transition-colors hover:border-primary/50"
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    )
})

Select.displayName = "Select"

export { Select }
