import { Plus, FileText, List, ChevronRight } from 'lucide-react';
import { EditorMode, ExamSection, QuestionType } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeftPanelProps {
  mode: EditorMode;
  isOpen: boolean;
  sections: ExamSection[];
  activeSectionId: string | null;
  onSectionSelect: (id: string) => void;
  onAddSection: () => void;
  onAddQuestion: (type: QuestionType) => void;
  newsCategory: string;
  onCategoryChange: (category: string) => void;
}

const questionTypes: { type: QuestionType; label: string; odiaLabel: string }[] = [
  { type: 'mcq', label: 'MCQ', odiaLabel: 'ବହୁ ବିକଳ୍ପ' },
  { type: 'short', label: 'Short', odiaLabel: 'ସଂକ୍ଷିପ୍ତ' },
  { type: 'long', label: 'Long', odiaLabel: 'ବିସ୍ତୃତ' },
];

const newsCategories = [
  { id: 'politics', label: 'Politics', odiaLabel: 'ରାଜନୀତି' },
  { id: 'sports', label: 'Sports', odiaLabel: 'କ୍ରୀଡ଼ା' },
  { id: 'local', label: 'Local', odiaLabel: 'ସ୍ଥାନୀୟ' },
  { id: 'national', label: 'National', odiaLabel: 'ଜାତୀୟ' },
  { id: 'entertainment', label: 'Entertainment', odiaLabel: 'ମନୋରଞ୍ଜନ' },
];

// Odia numerals
const odiaNumber = (n: number): string => {
  const numerals = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
  return n.toString().split('').map(d => numerals[parseInt(d)]).join('');
};

export function LeftPanel({
  mode,
  isOpen,
  sections,
  activeSectionId,
  onSectionSelect,
  onAddSection,
  onAddQuestion,
  newsCategory,
  onCategoryChange,
}: LeftPanelProps) {
  if (!isOpen) return null;

  return (
    <aside className="side-panel w-64 flex-shrink-0 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'exam' && (
          <>
            {/* Sections */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  ବିଭାଗ (Sections)
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onAddSection}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-1">
                {sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => onSectionSelect(section.id)}
                    className={cn(
                      'section-item w-full text-left flex items-center gap-2',
                      activeSectionId === section.id && 'section-item-active'
                    )}
                  >
                    <span className="font-odia text-sm">{section.odiaName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({section.questions.length})
                    </span>
                  </button>
                ))}
                {sections.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-3 py-2">
                    No sections yet
                  </p>
                )}
              </div>
            </div>

            {/* Question Types */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                ପ୍ରଶ୍ନ ପ୍ରକାର (Question Type)
              </h3>
              <div className="space-y-1">
                {questionTypes.map((qt) => (
                  <button
                    key={qt.type}
                    onClick={() => onAddQuestion(qt.type)}
                    className="section-item w-full text-left flex items-center gap-2"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-odia text-sm">{qt.odiaLabel}</span>
                    <span className="text-xs text-muted-foreground">({qt.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions in active section */}
            {activeSectionId && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  ପ୍ରଶ୍ନାବଳୀ (Questions)
                </h3>
                <div className="space-y-1">
                  {sections
                    .find((s) => s.id === activeSectionId)
                    ?.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="section-item flex items-start gap-2 cursor-pointer"
                      >
                        <span className="font-odia text-sm font-medium text-primary">
                          {odiaNumber(idx + 1)}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-odia text-sm truncate">
                            {q.text || 'Empty question'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {q.marks} ଅଙ୍କ
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {mode === 'news' && (
          <>
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                ବିଭାଗ (Category)
              </h3>
              <div className="space-y-1">
                {newsCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={cn(
                      'section-item w-full text-left flex items-center gap-2',
                      newsCategory === cat.id && 'section-item-active'
                    )}
                  >
                    <span className="font-odia text-sm">{cat.odiaLabel}</span>
                    <span className="text-xs text-muted-foreground">({cat.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Article outline */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                ଲେଖା ରୂପରେଖା (Outline)
              </h3>
              <div className="space-y-1">
                <div className="section-item flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-odia text-sm">ଶିରୋନାମା (Headline)</span>
                </div>
                <div className="section-item flex items-center gap-2">
                  <List className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-odia text-sm">ମୂଳ ବିଷୟ (Body)</span>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'free' && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-odia text-sm text-muted-foreground">ମୁକ୍ତ ଲେଖନ</p>
            <p className="text-xs text-muted-foreground mt-1">Free writing mode</p>
          </div>
        )}
      </div>
    </aside>
  );
}
