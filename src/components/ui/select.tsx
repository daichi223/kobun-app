import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
};

export function Select({
  className = "",
  label,
  error,
  size = "md",
  children,
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2.5 text-sm",
    lg: "px-4 py-3 text-base"
  };

  const baseStyles = `
    w-full
    bg-white
    border
    rounded-xl
    shadow-sm
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-primary-500
    focus:border-primary-500
    focus:ring-offset-2
    appearance-none
    bg-no-repeat
    bg-right
    pr-10
    ${error ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300 hover:border-secondary-400'}
  `;

  const selectIcon = (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-secondary-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`${baseStyles} ${sizeStyles[size]} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          {...props}
        >
          {children}
        </select>
        {selectIcon}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-danger-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// shadcn 風のAPI名をダミーで用意（互換用）
export const SelectTrigger = (p: React.HTMLAttributes<HTMLDivElement>) => <div {...p} />;
export const SelectValue = (p: React.HTMLAttributes<HTMLSpanElement>) => <span {...p} />;
export const SelectContent = (p: React.HTMLAttributes<HTMLDivElement>) => <div {...p} />;
export const SelectItem = (p: React.OptionHTMLAttributes<HTMLOptionElement>) => <option {...p} />;
