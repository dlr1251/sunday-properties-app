import * as React from "react"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className = '', value = [0], onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
    // If it's a range slider (value.length === 2)
    if (value.length === 2) {
      const leftPercent = ((value[0] - min) / (max - min)) * 100
      const rightPercent = ((value[1] - min) / (max - min)) * 100

      return (
        <div className={`relative flex w-full items-center ${className}`} style={{ height: '20px' }}>
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value)
              if (onValueChange && newValue <= value[1]) {
                onValueChange([newValue, value[1]])
              }
            }}
            className="absolute h-2 w-full appearance-none rounded-full bg-transparent outline-none cursor-pointer z-10"
            style={{
              background: 'transparent',
            }}
            {...props}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value)
              if (onValueChange && newValue >= value[0]) {
                onValueChange([value[0], newValue])
              }
            }}
            className="absolute h-2 w-full appearance-none rounded-full bg-transparent outline-none cursor-pointer z-10"
            style={{
              background: 'transparent',
            }}
            {...props}
          />
          <div 
            className="absolute h-2 rounded-full bg-blue-600 pointer-events-none z-0"
            style={{
              left: `${leftPercent}%`,
              width: `${rightPercent - leftPercent}%`,
            }}
          />
          <div 
            className="absolute h-2 rounded-full bg-gray-200 pointer-events-none z-0"
            style={{
              width: '100%',
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>
      )
    }

    // Single value slider
    const percent = ((value[0] - min) / (max - min)) * 100
    return (
      <div className={`relative flex w-full items-center ${className}`} style={{ height: '20px' }}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value)
            if (onValueChange) {
              onValueChange([newValue])
            }
          }}
          className="absolute h-2 w-full appearance-none rounded-full bg-transparent outline-none cursor-pointer z-10"
          {...props}
        />
        <div 
          className="absolute h-2 rounded-full bg-gray-200 pointer-events-none z-0"
          style={{
            width: '100%',
          }}
        />
        <div 
          className="absolute h-2 rounded-full bg-blue-600 pointer-events-none z-0"
          style={{
            width: `${percent}%`,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
