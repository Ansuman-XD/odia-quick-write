import { Circle, Check } from 'lucide-react';

interface StatusBarProps {
  typingMode: 'odia' | 'english';
  isUnicodeActive: boolean;
  wordCount: number;
  language: string;
}

export function StatusBar({
  typingMode,
  isUnicodeActive,
  wordCount,
  language,
}: StatusBarProps) {
  return (
    <footer className="status-bar flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <Circle className="h-2 w-2 fill-current text-[hsl(var(--mode-active))]" />
        <span>
          {typingMode === 'odia' ? 'ଓଡ଼ିଆ' : 'English'} Mode
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {isUnicodeActive ? (
          <Check className="h-3 w-3 text-[hsl(var(--mode-active))]" />
        ) : (
          <Circle className="h-2 w-2" />
        )}
        <span>Unicode {isUnicodeActive ? 'Active' : 'Inactive'}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-odia">{wordCount}</span>
        <span>ଶବ୍ଦ (words)</span>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <span>Language:</span>
        <span className="font-odia font-medium">{language}</span>
      </div>

      <div className="text-muted-foreground/60">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-xs">Ctrl+Space</kbd> for suggestions
      </div>
    </footer>
  );
}
