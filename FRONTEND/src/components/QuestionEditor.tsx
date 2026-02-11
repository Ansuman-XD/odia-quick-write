import { useState, useRef, useEffect, useCallback } from 'react';
import { Question, QuestionType } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { toOdiaNumeral, getSuggestions, transliterate } from '@/lib/odiaIME';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const questionTypeLabels: Record<QuestionType, { en: string; or: string }> = {
  mcq: { en: 'MCQ', or: 'ବହୁ ବିକଳ୍ପ' },
  short: { en: 'Short', or: 'ସଂକ୍ଷିପ୍ତ' },
  long: { en: 'Long', or: 'ବିସ୍ତୃତ' },
};

export function QuestionEditor({ question, index, onSave, onCancel, onDelete }: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question });
  const [currentWord, setCurrentWord] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [activeField, setActiveField] = useState<'text' | 'option' | null>(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Initialize options for MCQ if not present
  useEffect(() => {
    if (editedQuestion.type === 'mcq' && (!editedQuestion.options || editedQuestion.options.length === 0)) {
      setEditedQuestion(prev => ({
        ...prev,
        options: ['', '', '', ''],
      }));
    }
  }, [editedQuestion.type]);

  const extractCurrentWord = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const words = beforeCursor.split(/\s/);
    const lastWord = words[words.length - 1] || '';
    if (/^[a-zA-Z]+$/.test(lastWord) && lastWord.length >= 1) {
      return lastWord;
    }
    return '';
  }, []);

  const handleTextChange = useCallback((value: string, field: 'text' | 'option', optionIdx?: number) => {
    if (field === 'text') {
      setEditedQuestion(prev => ({ ...prev, text: value }));
      setActiveField('text');
    } else if (field === 'option' && optionIdx !== undefined) {
      setEditedQuestion(prev => ({
        ...prev,
        options: prev.options?.map((opt, i) => i === optionIdx ? value : opt),
      }));
      setActiveField('option');
      setActiveOptionIndex(optionIdx);
    }

    const cursorPos = textRef.current?.selectionStart || value.length;
    const word = extractCurrentWord(value, cursorPos);

    if (word) {
      setCurrentWord(word);
      const newSuggestions = getSuggestions(word, 5);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setActiveSuggestion(0);
    } else {
      setCurrentWord('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [extractCurrentWord]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (activeField === 'text') {
      const text = editedQuestion.text;
      const newText = text.slice(0, text.length - currentWord.length) + suggestion;
      setEditedQuestion(prev => ({ ...prev, text: newText }));
    } else if (activeField === 'option' && activeOptionIndex !== null) {
      const optionText = editedQuestion.options?.[activeOptionIndex] || '';
      const newText = optionText.slice(0, optionText.length - currentWord.length) + suggestion;
      setEditedQuestion(prev => ({
        ...prev,
        options: prev.options?.map((opt, i) => i === activeOptionIndex ? newText : opt),
      }));
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentWord('');
  }, [activeField, activeOptionIndex, currentWord, editedQuestion]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {

  // 🔥 Convert on SPACE
  if (e.key === ' ' && currentWord) {
    e.preventDefault();

    const odiaWord = transliterate(currentWord);

    if (activeField === 'text') {
      const text = editedQuestion.text;
      const newText =
        text.slice(0, text.length - currentWord.length) +
        odiaWord +
        ' ';
      setEditedQuestion(prev => ({ ...prev, text: newText }));
    }

    else if (activeField === 'option' && activeOptionIndex !== null) {
      const optionText = editedQuestion.options?.[activeOptionIndex] || '';
      const newText =
        optionText.slice(0, optionText.length - currentWord.length) +
        odiaWord +
        ' ';
      setEditedQuestion(prev => ({
        ...prev,
        options: prev.options?.map((opt, i) =>
          i === activeOptionIndex ? newText : opt
        ),
      }));
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
}, [
  showSuggestions,
  suggestions,
  activeSuggestion,
  handleSuggestionSelect,
  currentWord,
  activeField,
  activeOptionIndex,
  editedQuestion
]);


  const addOption = () => {
    setEditedQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }));
  };

  const removeOption = (idx: number) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    // Auto-transliterate if there's remaining Latin text
    const finalQuestion = {
      ...editedQuestion,
      text: editedQuestion.text ? (
        /^[a-zA-Z\s]+$/.test(editedQuestion.text) 
          ? transliterate(editedQuestion.text) 
          : editedQuestion.text
      ) : '',
      options: editedQuestion.options?.map(opt => 
        /^[a-zA-Z\s]+$/.test(opt) ? transliterate(opt) : opt
      ),
    };
    onSave(finalQuestion);
  };

  return (
    <div className="editor-container p-4 border-2 border-primary/30 relative">
      {/* IME Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="ime-suggestion-bar absolute left-4 top-2 z-20">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={cn(
                'ime-suggestion-item',
                idx === activeSuggestion && 'ime-suggestion-item-active'
              )}
            >
              <span className="text-xs opacity-60 mr-1">{idx + 1}</span>
              <span className="font-odia">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="font-odia text-lg font-semibold text-primary mt-2">
          {toOdiaNumeral(index + 1)}.
        </span>

        <div className="flex-1 space-y-4">
          {/* Question Type and Marks */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                ପ୍ରଶ୍ନ ପ୍ରକାର (Type)
              </label>
              <Select
                value={editedQuestion.type}
                onValueChange={(value: QuestionType) => 
                  setEditedQuestion(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeLabels).map(([type, labels]) => (
                    <SelectItem key={type} value={type}>
                      <span className="font-odia">{labels.or}</span>
                      <span className="text-muted-foreground ml-2">({labels.en})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                ଅଙ୍କ (Marks)
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={editedQuestion.marks}
                onChange={(e) => 
                  setEditedQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))
                }
                className="w-20"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              ପ୍ରଶ୍ନ (Question)
            </label>
            <Textarea
              ref={textRef}
              value={editedQuestion.text}
              onChange={(e) => handleTextChange(e.target.value, 'text')}
              onKeyDown={handleKeyDown}
              placeholder="ଏଠାରେ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ... (Type in English for Odia suggestions)"
              className="font-odia text-odia-body min-h-[100px]"
            />
          </div>

          {/* MCQ Options */}
          {editedQuestion.type === 'mcq' && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                ବିକଳ୍ପ (Options)
              </label>
              <div className="space-y-2">
                {editedQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-odia text-sm w-6">
                      {String.fromCharCode(2821 + idx)})
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => handleTextChange(e.target.value, 'option', idx)}
                      onKeyDown={handleKeyDown}
                      placeholder={`ବିକଳ୍ପ ${String.fromCharCode(2821 + idx)}`}
                      className="font-odia flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeOption(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Answer field for short/long */}
          {editedQuestion.type !== 'mcq' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                ଉତ୍ତର (Answer/Guidelines)
              </label>
              <Textarea
                value={editedQuestion.answer || ''}
                onChange={(e) => 
                  setEditedQuestion(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="ଉତ୍ତର ବା ମାର୍କିଂ ଗାଇଡଲାଇନ..."
                className="font-odia min-h-[60px]"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button onClick={handleSave} size="sm" className="gap-1">
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm" className="gap-1">
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button onClick={onDelete} variant="destructive" size="sm" className="gap-1 ml-auto">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
