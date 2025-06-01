import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, className }) => {
  const uniqueId = React.useId();
  return (
    <div className={`flex items-center mb-4 ${className || ''}`}>
      <input
        id={uniqueId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-neutral-100 bg-neutral-700 border-neutral-600 rounded focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 accent-neutral-100 cursor-pointer"
      />
      <label htmlFor={uniqueId} className="ml-2 text-sm font-medium text-neutral-300 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;