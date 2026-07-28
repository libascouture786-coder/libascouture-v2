import { X } from 'lucide-react';

type ChipProps = {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
};

export function Chip({ label, selected = false, onToggle, onRemove }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={selected ? 'chip-selected' : 'chip-default'}
    >
      {label}
      {onRemove && (
        <X
          size={12}
          className="opacity-60 transition-opacity hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </button>
  );
}
