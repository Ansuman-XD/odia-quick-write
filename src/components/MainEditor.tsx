import { useState, useRef, useCallback, useEffect } from 'react';
import { EditorMode, IMESuggestion, ExamSection, QuestionType } from '@/types/editor';
import { IMESuggestionBar } from './IMESuggestionBar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MainEditorProps {
  mode: EditorMode;
  content: string;
  onContentChange: (content: string) => void;
  sections: ExamSection[];
  activeSectionId: string | null;
  newsHeadline: string;
  onHeadlineChange: (headline: string) => void;
  newsBody: string;
  onNewsBodyChange: (body: string) => void;
}

// Mock Odia transliteration suggestions
const getOdiaSuggestions = (input: string): IMESuggestion[] => {
  if (!input || input.length < 1) return [];
  
  // Simple mock transliteration map
  const mockSuggestions: Record<string, string[]> = {
    'nam': ['ନାମ', 'ନାମସ୍କାର', 'ନମସ୍ତେ'],
    'ka': ['କ', 'କଥା', 'କାହାଣୀ', 'କାମ', 'କାଲି'],
    'ki': ['କି', 'କିଛି', 'କିଏ'],
    'pra': ['ପ୍ର', 'ପ୍ରଶ୍ନ', 'ପ୍ରଥମ', 'ପ୍ରକାର'],
    'sam': ['ସମ୍ବାଦ', 'ସମୟ', 'ସମସ୍ତ'],
    'odia': ['ଓଡ଼ିଆ', 'ଓଡ଼ିଶା'],
    'od': ['ଓଡ଼ିଆ', 'ଓଡ଼ିଶା'],
    'bhu': ['ଭୁବନେଶ୍ୱର', 'ଭୁବନ'],
    'a': ['ଅ', 'ଆ', 'ଅନେକ'],
    'i': ['ଇ', 'ଈ'],
    'u': ['ଉ', 'ଊ'],
    'e': ['ଏ', 'ଏକ', 'ଏବେ'],
    'o': ['ଓ', 'ଓଡ଼ିଆ'],
    'ra': ['ରା', 'ରାଜ୍ୟ', 'ରାଜନୀତି'],
    'de': ['ଦେଶ', 'ଦେଖ', 'ଦେବୀ'],
    'khe': ['ଖେଳ', 'ଖେଳାଳି'],
    'ba': ['ବା', 'ବାଲୁ', 'ବାତ୍ୟା'],
  };

  const lowerInput = input.toLowerCase();
  const suggestions = mockSuggestions[lowerInput] || [];
  
  // If no exact match, try partial
  if (suggestions.length === 0) {
    for (const [key, vals] of Object.entries(mockSuggestions)) {
      if (key.startsWith(lowerInput)) {
        return vals.slice(0, 5).map((text, idx) => ({ text, key: idx }));
      }
    }
  }

  return suggestions.slice(0, 5).map((text, idx) => ({ text, key: idx }));
};

// Odia numerals helper
const odiaNumber = (n: number): string => {
  const numerals = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
  return n.toString().split('').map(d => numerals[parseInt(d)]).join('');
};

export function MainEditor({
  mode,
  content,
  onContentChange,
  sections,
  activeSectionId,
  newsHeadline,
  onHeadlineChange,
  newsBody,
  onNewsBodyChange,
}: MainEditorProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [suggestions, setSuggestions] = useState<IMESuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Extract current word being typed
  const extractCurrentWord = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const words = beforeCursor.split(/\s/);
    const lastWord = words[words.length - 1] || '';
    
    // Only show suggestions for Latin characters (transliteration)
    if (/^[a-zA-Z]+$/.test(lastWord) && lastWord.length >= 1) {
      return lastWord;
    }
    return '';
  }, []);

  const handleContentChange = useCallback((value: string) => {
    onContentChange(value);
    
    const cursorPos = editorRef.current?.selectionStart || value.length;
    const word = extractCurrentWord(value, cursorPos);
    
    if (word) {
      setCurrentWord(word);
      const newSuggestions = getOdiaSuggestions(word);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setActiveSuggestion(0);
    } else {
      setCurrentWord('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [extractCurrentWord, onContentChange]);

  const handleSuggestionSelect = useCallback((suggestion: IMESuggestion) => {
    if (!editorRef.current) return;
    
    const cursorPos = editorRef.current.selectionStart;
    const beforeCursor = content.slice(0, cursorPos);
    const afterCursor = content.slice(cursorPos);
    
    // Replace the current word with the suggestion
    const newBefore = beforeCursor.slice(0, beforeCursor.length - currentWord.length) + suggestion.text;
    const newContent = newBefore + afterCursor;
    
    onContentChange(newContent);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentWord('');
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = newBefore.length;
        editorRef.current.selectionEnd = newBefore.length;
        editorRef.current.focus();
      }
    }, 0);
  }, [content, currentWord, onContentChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'Enter':
        if (suggestions[activeSuggestion]) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        const idx = parseInt(e.key) - 1;
        if (suggestions[idx]) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[idx]);
        }
        break;
    }
  }, [showSuggestions, suggestions, activeSuggestion, handleSuggestionSelect]);

  const activeSection = sections.find((s) => s.id === activeSectionId);

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Exam Mode */}
          {mode === 'exam' && (
            <div className="space-y-6">
              {activeSection ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-odia-headline text-foreground mb-1">
                      {activeSection.odiaName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {activeSection.name} · {activeSection.questions.length} questions
                    </p>
                  </div>

                  {activeSection.questions.map((q, idx) => (
                    <div key={q.id} className="editor-container p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-odia text-lg font-semibold text-primary">
                          {odiaNumber(idx + 1)}.
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              {q.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {q.marks} ଅଙ୍କ (marks)
                            </span>
                          </div>
                          <p className="font-odia text-odia-body">{q.text || 'ଏଠାରେ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...'}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeSection.questions.length === 0 && (
                    <div className="editor-container p-8 text-center">
                      <p className="font-odia text-muted-foreground">
                        ଏଠାରେ ପ୍ରଶ୍ନ ଯୋଡ଼ନ୍ତୁ
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add questions using the left panel
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="editor-container p-8 text-center">
                  <p className="font-odia text-muted-foreground text-lg">
                    ବାମ ପଟରୁ ଏକ ବିଭାଗ ବାଛନ୍ତୁ
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a section from the left panel or create a new one
                  </p>
                </div>
              )}
            </div>
          )}

          {/* News Mode */}
          {mode === 'news' && (
            <div className="space-y-6">
              <div className="editor-container p-4">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  ଶିରୋନାମା (Headline)
                </label>
                <Input
                  value={newsHeadline}
                  onChange={(e) => onHeadlineChange(e.target.value)}
                  placeholder="ଏଠାରେ ଶିରୋନାମା ଲେଖନ୍ତୁ..."
                  className="text-odia-headline border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="editor-container p-4 relative min-h-[400px]">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  ମୂଳ ବିଷୟ (Body)
                </label>
                <IMESuggestionBar
                  suggestions={suggestions}
                  activeSuggestion={activeSuggestion}
                  onSelect={handleSuggestionSelect}
                  visible={showSuggestions}
                />
                <Textarea
                  ref={editorRef}
                  value={newsBody}
                  onChange={(e) => {
                    onNewsBodyChange(e.target.value);
                    handleContentChange(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="ଏଠାରେ ସମ୍ବାଦ ଲେଖନ୍ତୁ..."
                  className="text-odia-large border-0 bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[350px] placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {/* Free Editor Mode */}
          {mode === 'free' && (
            <div className="editor-container p-4 relative min-h-[500px]">
              <IMESuggestionBar
                suggestions={suggestions}
                activeSuggestion={activeSuggestion}
                onSelect={handleSuggestionSelect}
                visible={showSuggestions}
              />
              <Textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ଏଠାରେ ଟାଇପ୍ କରନ୍ତୁ... (Type here...)"
                className="text-odia-large border-0 bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[450px] placeholder:text-muted-foreground/50"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
