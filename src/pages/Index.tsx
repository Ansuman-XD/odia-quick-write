import { useState, useCallback, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { LeftPanel } from '@/components/LeftPanel';
import { MainEditor } from '@/components/MainEditor';
import { StatusBar } from '@/components/StatusBar';
import { EditorMode, ExamSection, QuestionType } from '@/types/editor';
import { toast } from 'sonner';

// Odia section names
const sectionNames = [
  { name: 'Section A', odiaName: 'ବିଭାଗ - କ' },
  { name: 'Section B', odiaName: 'ବିଭାଗ - ଖ' },
  { name: 'Section C', odiaName: 'ବିଭାଗ - ଗ' },
  { name: 'Section D', odiaName: 'ବିଭାଗ - ଘ' },
  { name: 'Section E', odiaName: 'ବିଭାଗ - ଙ' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const Index = () => {
  // Mode state
  const [mode, setMode] = useState<EditorMode>('exam');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Exam mode state
  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: '1',
      name: 'Section A',
      odiaName: 'ବିଭାଗ - କ',
      questions: [
        { id: 'q1', type: 'mcq', text: 'ଓଡ଼ିଶାର ରାଜଧାନୀ କ\'ଣ?', marks: 1 },
        { id: 'q2', type: 'short', text: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ନଦୀଗୁଡ଼ିକ ନାମ ଲେଖ।', marks: 2 },
      ],
    },
    {
      id: '2',
      name: 'Section B',
      odiaName: 'ବିଭାଗ - ଖ',
      questions: [],
    },
  ]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>('1');

  // News mode state
  const [newsCategory, setNewsCategory] = useState('local');
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsBody, setNewsBody] = useState('');

  // Free editor state
  const [freeContent, setFreeContent] = useState('');

  // Calculate word count based on current mode
  const wordCount = useMemo(() => {
    let text = '';
    switch (mode) {
      case 'exam':
        text = sections
          .flatMap((s) => s.questions.map((q) => q.text))
          .join(' ');
        break;
      case 'news':
        text = `${newsHeadline} ${newsBody}`;
        break;
      case 'free':
        text = freeContent;
        break;
    }
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [mode, sections, newsHeadline, newsBody, freeContent]);

  // Handlers
  const handleAddSection = useCallback(() => {
    const sectionIndex = sections.length;
    if (sectionIndex >= sectionNames.length) {
      toast.error('Maximum sections reached');
      return;
    }
    
    const newSection: ExamSection = {
      id: generateId(),
      name: sectionNames[sectionIndex].name,
      odiaName: sectionNames[sectionIndex].odiaName,
      questions: [],
    };
    
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    toast.success(`${newSection.odiaName} ଯୋଡ଼ା ହେଲା`);
  }, [sections.length]);

  const handleAddQuestion = useCallback((type: QuestionType) => {
    if (!activeSectionId) {
      toast.error('Please select a section first');
      return;
    }

    const marksMap: Record<QuestionType, number> = {
      mcq: 1,
      short: 2,
      long: 5,
    };

    const newQuestion = {
      id: generateId(),
      type,
      text: '',
      marks: marksMap[type],
    };

    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSectionId
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      )
    );

    toast.success('ପ୍ରଶ୍ନ ଯୋଡ଼ା ହେଲା (Question added)');
  }, [activeSectionId]);

  const handleExport = useCallback((format: 'pdf' | 'word' | 'html') => {
    const formatNames = {
      pdf: 'PDF',
      word: 'Word',
      html: 'HTML',
    };
    toast.success(`Exporting to ${formatNames[format]}...`);
    // Export logic would go here
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setFreeContent(content);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar
        mode={mode}
        onModeChange={setMode}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        onExport={handleExport}
      />

      <div className="flex-1 flex overflow-hidden">
        <LeftPanel
          mode={mode}
          isOpen={isPanelOpen}
          sections={sections}
          activeSectionId={activeSectionId}
          onSectionSelect={setActiveSectionId}
          onAddSection={handleAddSection}
          onAddQuestion={handleAddQuestion}
          newsCategory={newsCategory}
          onCategoryChange={setNewsCategory}
        />

        <MainEditor
          mode={mode}
          content={freeContent}
          onContentChange={handleContentChange}
          sections={sections}
          activeSectionId={activeSectionId}
          newsHeadline={newsHeadline}
          onHeadlineChange={setNewsHeadline}
          newsBody={newsBody}
          onNewsBodyChange={setNewsBody}
        />
      </div>

      <StatusBar
        typingMode="odia"
        isUnicodeActive={true}
        wordCount={wordCount}
        language="ଓଡ଼ିଆ"
      />
    </div>
  );
};

export default Index;
