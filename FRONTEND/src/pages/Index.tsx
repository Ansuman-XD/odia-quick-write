import { useState, useCallback, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { LeftPanel } from '@/components/LeftPanel';
import { MainEditor } from '@/components/MainEditor';
import { StatusBar } from '@/components/StatusBar';
import { PrintPreviewModal } from '@/components/PrintPreviewModal';
import { EditorMode, ExamSection, QuestionType } from '@/types/editor';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toOdiaNumeral } from '@/lib/odiaIME';

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
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Exam mode state
  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: '1',
      name: 'Section A',
      odiaName: 'ବିଭାଗ - କ',
      questions: [
        { id: 'q1', type: 'mcq', text: 'ଓଡ଼ିଶାର ରାଜଧାନୀ କ\'ଣ?', marks: 1, options: ['ଭୁବନେଶ୍ୱର', 'କଟକ', 'ପୁରୀ', 'ସମ୍ବଲପୁର'] },
        { id: 'q2', type: 'short', text: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ନଦୀଗୁଡ଼ିକ ନାମ ଲେଖ।', marks: 2 },
        { id: 'q3', type: 'long', text: 'ଓଡ଼ିଶାର ସଂସ୍କୃତି ଓ ପରମ୍ପରା ବିଷୟରେ ଲେଖ।', marks: 5 },
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
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
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

  const generatePDF = useCallback(async () => {
    const loadingToast = toast.loading('PDF ତିଆରି ହେଉଛି...');
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set up fonts - using built-in fonts for now
      pdf.setFont('helvetica');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      if (mode === 'exam') {
        // Title
        pdf.setFontSize(18);
        pdf.text('Question Paper', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Total marks
        const totalMarks = sections.reduce(
          (sum, section) => sum + section.questions.reduce((qSum, q) => qSum + q.marks, 0),
          0
        );
        pdf.setFontSize(12);
        pdf.text(`Total Marks: ${totalMarks}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Sections
        for (const section of sections) {
          if (yPos > 270) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${section.name} (${section.odiaName})`, margin, yPos);
          yPos += 10;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);

          for (let i = 0; i < section.questions.length; i++) {
            const q = section.questions[i];
            if (yPos > 270) {
              pdf.addPage();
              yPos = margin;
            }

            const questionText = `${i + 1}. ${q.text || 'Question not entered'} [${q.marks} marks]`;
            const lines = pdf.splitTextToSize(questionText, pageWidth - 2 * margin);
            pdf.text(lines, margin, yPos);
            yPos += lines.length * 6 + 5;

            // MCQ options
            if (q.type === 'mcq' && q.options) {
              for (let j = 0; j < q.options.length; j++) {
                const optionLabel = String.fromCharCode(97 + j);
                pdf.text(`   ${optionLabel}) ${q.options[j] || '________'}`, margin, yPos);
                yPos += 6;
              }
              yPos += 3;
            }
          }
          yPos += 10;
        }
      } else if (mode === 'news') {
        // Headline
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        const headlineLines = pdf.splitTextToSize(newsHeadline || 'Headline not entered', pageWidth - 2 * margin);
        pdf.text(headlineLines, margin, yPos);
        yPos += headlineLines.length * 10 + 10;

        // Category
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Category: ${newsCategory}`, margin, yPos);
        yPos += 10;

        // Body
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const bodyLines = pdf.splitTextToSize(newsBody || 'Article body not entered', pageWidth - 2 * margin);
        
        for (const line of bodyLines) {
          if (yPos > 280) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += 7;
        }
      } else {
        // Free mode
        pdf.setFontSize(12);
        const contentLines = pdf.splitTextToSize(freeContent || 'No content', pageWidth - 2 * margin);
        
        for (const line of contentLines) {
          if (yPos > 280) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += 7;
        }
      }

      const fileName = mode === 'exam' 
        ? 'odia-question-paper.pdf'
        : mode === 'news'
        ? 'odia-news-article.pdf'
        : 'odia-document.pdf';

      pdf.save(fileName);
      toast.dismiss(loadingToast);
      toast.success('PDF ସଫଳତାର ସହ ଡାଉନଲୋଡ଼ ହେଲା!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('PDF ତିଆରିରେ ତ୍ରୁଟି');
      console.error('PDF generation error:', error);
    }
  }, [mode, sections, newsHeadline, newsBody, newsCategory, freeContent]);

  const handleExport = useCallback((format: 'pdf' | 'word' | 'html') => {
    if (format === 'pdf') {
      setShowPrintPreview(true);
    } else if (format === 'word') {
      // Generate Word-compatible HTML
      let content = '';
      
      if (mode === 'exam') {
        content = `
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Noto Sans Odia', Arial, sans-serif; margin: 40px; }
                h1 { text-align: center; }
                .section { margin-top: 20px; }
                .question { margin: 10px 0; }
                .options { margin-left: 30px; }
              </style>
            </head>
            <body>
              <h1>ପ୍ରଶ୍ନପତ୍ର (Question Paper)</h1>
              ${sections.map(section => `
                <div class="section">
                  <h2>${section.odiaName} (${section.name})</h2>
                  ${section.questions.map((q, i) => `
                    <div class="question">
                      <p><strong>${toOdiaNumeral(i + 1)}.</strong> ${q.text} [${q.marks} ଅଙ୍କ]</p>
                      ${q.type === 'mcq' && q.options ? `
                        <div class="options">
                          ${q.options.map((opt, j) => `
                            <p>${String.fromCharCode(2821 + j)}) ${opt}</p>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </body>
          </html>
        `;
      } else if (mode === 'news') {
        content = `
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Noto Sans Odia', Arial, sans-serif; margin: 40px; }
                h1 { font-size: 28px; }
                .category { color: #666; font-style: italic; }
                .body { line-height: 1.8; margin-top: 20px; }
              </style>
            </head>
            <body>
              <p class="category">${newsCategory}</p>
              <h1>${newsHeadline}</h1>
              <div class="body">${newsBody.replace(/\n/g, '<br>')}</div>
            </body>
          </html>
        `;
      } else {
        content = `
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Noto Sans Odia', Arial, sans-serif; margin: 40px; line-height: 1.8; }
              </style>
            </head>
            <body>
              ${freeContent.replace(/\n/g, '<br>')}
            </body>
          </html>
        `;
      }

      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'exam' ? 'question-paper.doc' : mode === 'news' ? 'article.doc' : 'document.doc';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Word ଡକୁମେଣ୍ଟ ଡାଉନଲୋଡ଼ ହେଲା!');
    } else if (format === 'html') {
      let content = '';
      
      if (mode === 'exam') {
        content = `<!DOCTYPE html>
<html lang="or">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ପ୍ରଶ୍ନପତ୍ର</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Odia:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Noto Sans Odia', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .question { margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
    .marks { color: #666; font-size: 0.9em; }
    .options { margin-left: 25px; margin-top: 10px; }
    .options p { margin: 5px 0; }
    @media print { body { padding: 20px; } .question { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>ପ୍ରଶ୍ନପତ୍ର (Question Paper)</h1>
  <div class="meta">
    <span>ସମୟ: ___________</span>
    <span>ପୂର୍ଣ୍ଣାଙ୍କ: ${sections.reduce((sum, s) => sum + s.questions.reduce((qs, q) => qs + q.marks, 0), 0)}</span>
  </div>
  ${sections.map(section => `
    <section>
      <h2>${section.odiaName} (${section.name})</h2>
      ${section.questions.map((q, i) => `
        <div class="question">
          <p><strong>${toOdiaNumeral(i + 1)}.</strong> ${q.text} <span class="marks">[${q.marks} ଅଙ୍କ]</span></p>
          ${q.type === 'mcq' && q.options ? `
            <div class="options">
              ${q.options.map((opt, j) => `<p>${String.fromCharCode(2821 + j)}) ${opt}</p>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </section>
  `).join('')}
</body>
</html>`;
      } else if (mode === 'news') {
        content = `<!DOCTYPE html>
<html lang="or">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsHeadline || 'ସମ୍ବାଦ'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Odia:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans Odia', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
    .category { display: inline-block; background: #eee; padding: 5px 15px; border-radius: 20px; font-size: 0.85em; margin-bottom: 15px; }
    h1 { font-size: 2em; line-height: 1.4; margin-bottom: 20px; }
    .date { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .body { line-height: 2; font-size: 1.1em; }
    .body p { margin-bottom: 1em; }
  </style>
</head>
<body>
  <span class="category">${newsCategory}</span>
  <h1>${newsHeadline}</h1>
  <p class="date">${new Date().toLocaleDateString('or-IN')}</p>
  <div class="body">${newsBody.split('\n').map(p => `<p>${p}</p>`).join('')}</div>
</body>
</html>`;
      } else {
        content = `<!DOCTYPE html>
<html lang="or">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ଓଡ଼ିଆ ଡକୁମେଣ୍ଟ</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Odia:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans Odia', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; line-height: 2; font-size: 1.1em; }
  </style>
</head>
<body>
  ${freeContent.split('\n').map(p => `<p>${p}</p>`).join('')}
</body>
</html>`;
      }

      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'exam' ? 'question-paper.html' : mode === 'news' ? 'article.html' : 'document.html';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('HTML ଫାଇଲ ଡାଉନଲୋଡ଼ ହେଲା!');
    }
  }, [mode, sections, newsHeadline, newsBody, newsCategory, freeContent]);

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
          setSections={setSections}
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

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        mode={mode}
        sections={sections}
        newsHeadline={newsHeadline}
        newsBody={newsBody}
        newsCategory={newsCategory}
        freeContent={freeContent}
        onExportPDF={generatePDF}
      />
    </div>
  );
};

export default Index;
