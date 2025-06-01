import React from 'react';

interface ToggleSwitchProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  currentValue: T;
  onChange: (value: T) => void;
  className?: string;
}

const ToggleSwitch = <T extends string,>({ label, options, currentValue, onChange, className }: ToggleSwitchProps<T>) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <span className="block text-sm font-medium text-neutral-300 mb-2">{label}</span>
      <div className="flex space-x-1 bg-neutral-700 p-0.5 rounded-md"> {/* Reduced padding for tighter fit */}
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-1.5 px-2 text-xs sm:text-sm rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-neutral-700
              ${currentValue === option.value ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-sm' : 'bg-transparent text-neutral-300 hover:bg-neutral-600'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleSwitch;