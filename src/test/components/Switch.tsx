import React from 'react';
import './Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="switch-label">
      {label && <span className="switch-text">{label}</span>}
      <div className="switch-wrapper">
        <input
          type="checkbox"
          className="switch-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className={`switch-track ${checked ? 'checked' : ''}`}>
          <span className={`switch-thumb ${checked ? 'checked' : ''}`} />
        </span>
      </div>
    </label>
  );
};
