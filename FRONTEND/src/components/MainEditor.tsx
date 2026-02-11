import { useState, useRef, useCallback } from 'react';
import { EditorMode, IMESuggestion, ExamSection, Question, QuestionType } from '@/types/editor';
import { IMESuggestionBar } from './IMESuggestionBar';
import { QuestionEditor } from './QuestionEditor';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSuggestions, transliterate, toOdiaNumeral, containsOdia } from '@/lib/odiaIME';

interface MainEditorProps {
  mode: EditorMode;
  content: string;
  onContentChange: (content: string) => void;
  sections: ExamSection[];
  setSections: React.Dispatch<React.SetStateAction<ExamSection[]>>;
  activeSectionId: string | null;
  newsHeadline: string;
  onHeadlineChange: (headline: string) => void;
  newsBody: string;
  onNewsBodyChange: (body: string) => void;
}

export function MainEditor({
  mode,
  content,
  onContentChange,
  sections,
  setSections,
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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);

  // ✅ Improved word detection
  const extractCurrentWord = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(/[a-zA-Z]+$/);
    return match ? match[0] : '';
  }, []);

  // ✅ Live IME Processor
  // const processIME = (
  //   value: string,
  //   cursorPos: number,
  //   updateFn: (val: string) => void,
  //   ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement>
  // ) => {

  //   const word = extractCurrentWord(value, cursorPos);

  //   if (!word) {
  //     updateFn(value);
  //     setSuggestions([]);
  //     setShowSuggestions(false);
  //     return;
  //   }

  //   if (containsOdia(word)) {
  //     updateFn(value);
  //     return;
  //   }

  //   const odiaWord = transliterate(word);

  //   const before = value.slice(0, cursorPos - word.length);
  //   const after = value.slice(cursorPos);

  //   const newValue = before + odiaWord + after;
  //   updateFn(newValue);

  //   setTimeout(() => {
  //     if (ref.current) {
  //       const newPos = before.length + odiaWord.length;
  //       ref.current.selectionStart = newPos;
  //       ref.current.selectionEnd = newPos;
  //     }
  //   }, 0);

  //   setCurrentWord(word);

  //   const newSuggestions = getSuggestions(word, 5).map((text, idx) => ({
  //     text,
  //     key: idx,
  //   }));

  //   setSuggestions(newSuggestions);
  //   setShowSuggestions(newSuggestions.length > 0);
  //   setActiveSuggestion(0);
  // };

 const handleContentChange = useCallback((value: string) => {
  onContentChange(value);

  const cursorPos = editorRef.current?.selectionStart || value.length;
  const word = extractCurrentWord(value, cursorPos);

  if (word) {
    setCurrentWord(word);
    const newSuggestions = getSuggestions(word, 5).map((text, idx) => ({
      text,
      key: idx,
    }));
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestion(0);
  } else {
    setCurrentWord('');
    setSuggestions([]);
    setShowSuggestions(false);
  }
}, [extractCurrentWord, onContentChange]);

 const handleHeadlineChange = useCallback((value: string) => {
  onHeadlineChange(value);

  const cursorPos = headlineRef.current?.selectionStart || value.length;
  const word = extractCurrentWord(value, cursorPos);

  if (word) {
    setCurrentWord(word);
    const newSuggestions = getSuggestions(word, 5).map((text, idx) => ({
      text,
      key: idx,
    }));
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setActiveSuggestion(0);
  } else {
    setCurrentWord('');
    setSuggestions([]);
    setShowSuggestions(false);
  }
}, [extractCurrentWord, onHeadlineChange]);


  const handleSuggestionSelect = useCallback((suggestion: IMESuggestion) => {

    if (mode === 'news' && headlineRef.current === document.activeElement) {
      const newHeadline =
        newsHeadline.slice(0, newsHeadline.length - currentWord.length) +
        suggestion.text;
      onHeadlineChange(newHeadline);
    } else if (mode === 'news') {
      const newBody =
        newsBody.slice(0, newsBody.length - currentWord.length) +
        suggestion.text;
      onNewsBodyChange(newBody);
    } else {
      const newContent =
        content.slice(0, content.length - currentWord.length) +
        suggestion.text;
      onContentChange(newContent);
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentWord('');
  }, [content, currentWord, mode, newsBody, newsHeadline]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
// Convert on space or enter
if ((e.key === ' ' || e.key === 'Enter') && currentWord) {
  e.preventDefault();

  const odiaWord = transliterate(currentWord);

  if (mode === 'news' && headlineRef.current === document.activeElement) {
    const newHeadline =
      newsHeadline.slice(0, newsHeadline.length - currentWord.length) +
      odiaWord + ' ';
    onHeadlineChange(newHeadline);
  } else if (mode === 'news') {
    const newBody =
      newsBody.slice(0, newsBody.length - currentWord.length) +
      odiaWord + ' ';
    onNewsBodyChange(newBody);
  } else {
    const newContent =
      content.slice(0, content.length - currentWord.length) +
      odiaWord + ' ';
    onContentChange(newContent);
  }

  setCurrentWord('');
  setShowSuggestions(false);
  return;
}

    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
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

  const handleQuestionSave = useCallback((sectionId: string, updatedQuestion: Question) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(q =>
                q.id === updatedQuestion.id ? updatedQuestion : q
              ),
            }
          : section
      )
    );
    setEditingQuestionId(null);
  }, [setSections]);

  const handleQuestionDelete = useCallback((sectionId: string, questionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter(q => q.id !== questionId),
            }
          : section
      )
    );
    setEditingQuestionId(null);
  }, [setSections]);

  const handleAddNewQuestion = useCallback((sectionId: string, type: QuestionType = 'short') => {

    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      text: '',
      marks: type === 'mcq' ? 1 : type === 'short' ? 2 : 5,
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
    };

    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );

    setEditingQuestionId(newQuestion.id);
  }, [setSections]);

  const activeSection = sections.find(s => s.id === activeSectionId);

  return (
    // 🔥 YOUR ORIGINAL JSX (UNCHANGED) — KEEPING EXACT STRUCTURE
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">

          {/* EXAM MODE */}
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
                    editingQuestionId === q.id ? (
                      <QuestionEditor
                        key={q.id}
                        question={q}
                        index={idx}
                        onSave={(updated) => handleQuestionSave(activeSection.id, updated)}
                        onCancel={() => setEditingQuestionId(null)}
                        onDelete={() => handleQuestionDelete(activeSection.id, q.id)}
                      />
                    ) : (
                      <div
                        key={q.id}
                        className="editor-container p-4 cursor-pointer hover:border-primary/50 transition-colors group"
                        onClick={() => setEditingQuestionId(q.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-odia text-lg font-semibold text-primary">
                            {toOdiaNumeral(idx + 1)}.
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
                            <p className="font-odia text-odia-body">
                              {q.text || 'ଏଠାରେ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ... (Click to edit)'}
                            </p>

                            {q.type === 'mcq' && q.options && (
                              <div className="mt-2 ml-4 space-y-1">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex gap-2 text-sm text-muted-foreground">
                                    <span className="font-odia">
                                      {String.fromCharCode(2821 + optIdx)})
                                    </span>
                                    <span className="font-odia">{opt || '____________'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))}

                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => handleAddNewQuestion(activeSection.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    ନୂଆ ପ୍ରଶ୍ନ ଯୋଡ଼ନ୍ତୁ (Add New Question)
                  </Button>
                </>
              ) : (
                <div className="editor-container p-8 text-center">
                  <p className="font-odia text-muted-foreground text-lg">
                    ବାମ ପଟରୁ ଏକ ବିଭାଗ ବାଛନ୍ତୁ
                  </p>
                </div>
              )}
            </div>
          )}
{/* NEWS MODE */}
{/* NEWS MODE */}
{mode === 'news' && (
  <div className="space-y-6">
    <div className="editor-container p-4 relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
        ଶିରୋନାମା (Headline)
      </label>

      {showSuggestions &&
        suggestions.length > 0 &&
        headlineRef.current === document.activeElement && (
          <IMESuggestionBar
            suggestions={suggestions}
            activeSuggestion={activeSuggestion}
            onSelect={handleSuggestionSelect}
            visible={true}
          />
        )}

      <Input
        ref={headlineRef}
        value={newsHeadline}
        onChange={(e) => handleHeadlineChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ଏଠାରେ ଶିରୋନାମା ଲେଖନ୍ତୁ..."
        className="text-odia-headline border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
      />
    </div>

    <div className="editor-container p-4 relative min-h-[400px]">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
        ମୂଳ ବିଷୟ (Body)
      </label>

      {showSuggestions &&
        suggestions.length > 0 &&
        editorRef.current === document.activeElement && (
          <IMESuggestionBar
            suggestions={suggestions}
            activeSuggestion={activeSuggestion}
            onSelect={handleSuggestionSelect}
            visible={true}
          />
        )}

      <Textarea
        ref={editorRef}
        value={newsBody}
        onChange={(e) => {
          const value = e.target.value;

          // 🔥 update correct state
          onNewsBodyChange(value);

          const cursorPos =
            editorRef.current?.selectionStart || value.length;

          const word = extractCurrentWord(value, cursorPos);

          if (word) {
            setCurrentWord(word);
            const newSuggestions = getSuggestions(word, 5).map(
              (text, idx) => ({
                text,
                key: idx,
              })
            );
            setSuggestions(newSuggestions);
            setShowSuggestions(newSuggestions.length > 0);
            setActiveSuggestion(0);
          } else {
            setCurrentWord('');
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="ଏଠାରେ ସମ୍ବାଦ ଲେଖନ୍ତୁ..."
        className="text-odia-large border-0 bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[350px] placeholder:text-muted-foreground/50"
      />
    </div>
  </div>
)}

{/* FREE MODE */}
{mode === 'free' && (
  <div className="editor-container p-4 relative min-h-[500px]">
    {showSuggestions && suggestions.length > 0 && (
      <IMESuggestionBar
        suggestions={suggestions}
        activeSuggestion={activeSuggestion}
        onSelect={handleSuggestionSelect}
        visible={true}
      />
    )}
    <Textarea
      ref={editorRef}
      value={content}
      onChange={(e) => handleContentChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="ଏଠାରେ ଟାଇପ୍ କରନ୍ତୁ... (Type in English for Odia suggestions)"
      className="text-odia-large border-0 bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[450px] placeholder:text-muted-foreground/50"
    />
  </div>
)}

          
        </div>
      </div>
    </main>
  );
}
