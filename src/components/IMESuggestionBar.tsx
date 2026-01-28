import { IMESuggestion } from '@/types/editor';
import { cn } from '@/lib/utils';

interface IMESuggestionBarProps {
  suggestions: IMESuggestion[];
  activeSuggestion: number;
  onSelect: (suggestion: IMESuggestion) => void;
  visible: boolean;
}

export function IMESuggestionBar({
  suggestions,
  activeSuggestion,
  onSelect,
  visible,
}: IMESuggestionBarProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="ime-suggestion-bar absolute left-4 bottom-full mb-2 z-10">
      {suggestions.map((suggestion, idx) => (
        <button
          key={suggestion.key}
          onClick={() => onSelect(suggestion)}
          className={cn(
            'ime-suggestion-item',
            idx === activeSuggestion && 'ime-suggestion-item-active'
          )}
        >
          <span className="text-xs opacity-60 mr-1">{idx + 1}</span>
          <span className="font-odia">{suggestion.text}</span>
        </button>
      ))}
      <span className="text-xs opacity-50 ml-2 self-center">
        ↑↓ navigate · Enter select · Esc cancel
      </span>
    </div>
  );
}
