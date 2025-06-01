import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, className }) => {
  const getPrecision = (stepValue: number): number => {
    const stepString = stepValue.toString();
    if (stepString.includes('.')) {
      return stepString.split('.')[1].length;
    }
    return 0;
  };
  const precision = getPrecision(step);
  const uniqueId = React.useId();

  return (
    <div className={`mb-4 ${className || ''}`}>
      <label htmlFor={uniqueId} className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label}: <span className="font-semibold text-white">{value.toFixed(precision)}</span>
      </label>
      <input
        id={uniqueId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
      />
    </div>
  );
};

export default Slider;