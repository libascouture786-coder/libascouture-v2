type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`toggle-luxury ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span className="toggle-thumb" />
    </button>
  );
}
