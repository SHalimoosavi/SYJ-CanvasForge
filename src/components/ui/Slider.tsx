import { cn } from "@/lib/cn";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue,
  className,
}: SliderProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--text-primary)]">
          {displayValue ?? value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-3)] accent-brand-600"
      />
    </label>
  );
}
