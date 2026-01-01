
import React from 'react';

interface CustomProgressProps {
  value?: number;
  max?: number;
  className?: string;
  barColor?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
}

const CustomProgress: React.FC<CustomProgressProps> = ({
  value = 0,
  max = 100,
  className = '',
  barColor = 'bg-blue-500',
  size = 'md',
  label,
  showValue = false,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          {showValue && (
            <span className="text-sm font-medium">{value}/{max}</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${barColor} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export { CustomProgress };