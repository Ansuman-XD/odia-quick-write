import { FileText, FileDown, Globe, PanelLeftClose, PanelLeft } from 'lucide-react';
import { EditorMode } from '@/types/editor';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onExport: (format: 'pdf' | 'word' | 'html') => void;
}

const modes: { id: EditorMode; label: string; odiaLabel: string }[] = [
  { id: 'exam', label: 'Exam', odiaLabel: 'ପରୀକ୍ଷା' },
  { id: 'news', label: 'News', odiaLabel: 'ସମ୍ବାଦ' },
  { id: 'free', label: 'Free', odiaLabel: 'ମୁକ୍ତ' },
];

export function TopBar({ mode, onModeChange, isPanelOpen, onTogglePanel, onExport }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          className="h-8 w-8"
        >
          {isPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-odia text-sm font-bold">ଓ</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">ଓଡ଼ିଆ ଲେଖନୀ</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Odia Writer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`mode-button ${mode === m.id ? 'mode-button-active' : 'mode-button-inactive'}`}
          >
            <span className="font-odia">{m.odiaLabel}</span>
            <span className="ml-1.5 text-xs opacity-70">({m.label})</span>
          </button>
        ))}
      </div>

      {/* Export buttons */}
      <div className="flex items-center gap-2">
        <button onClick={() => onExport('pdf')} className="export-button flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          PDF
        </button>
        <button onClick={() => onExport('word')} className="export-button flex items-center gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          Word
        </button>
        <button onClick={() => onExport('html')} className="export-button flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          HTML
        </button>
      </div>
    </header>
  );
}
