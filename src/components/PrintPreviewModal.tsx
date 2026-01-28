import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditorMode, ExamSection, Question } from '@/types/editor';
import { toOdiaNumeral } from '@/lib/odiaIME';
import { Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: EditorMode;
  sections: ExamSection[];
  newsHeadline: string;
  newsBody: string;
  newsCategory: string;
  freeContent: string;
  onExportPDF: () => void;
}

const categoryLabels: Record<string, string> = {
  politics: 'ରାଜନୀତି',
  sports: 'କ୍ରୀଡ଼ା',
  local: 'ସ୍ଥାନୀୟ',
  national: 'ଜାତୀୟ',
  entertainment: 'ମନୋରଞ୍ଜନ',
};

export function PrintPreviewModal({
  isOpen,
  onClose,
  mode,
  sections,
  newsHeadline,
  newsBody,
  newsCategory,
  freeContent,
  onExportPDF,
}: PrintPreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      const fileName = mode === 'exam' 
        ? 'odia-question-paper.pdf'
        : mode === 'news'
        ? 'odia-news-article.pdf'
        : 'odia-document.pdf';

      pdf.save(fileName);
      onExportPDF();
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const totalMarks = sections.reduce(
    (sum, section) => sum + section.questions.reduce((qSum, q) => qSum + q.marks, 0),
    0
  );

  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            ପ୍ରିଣ୍ଟ ପୂର୍ବାବଲୋକନ (Print Preview)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 rounded-lg">
          <div
            ref={previewRef}
            className="bg-white p-8 mx-auto shadow-lg"
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              fontFamily: "'Noto Sans Odia', 'Nirmala UI', sans-serif",
            }}
          >
            {/* Exam Paper Preview */}
            {mode === 'exam' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                  <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}>
                    ପ୍ରଶ୍ନପତ୍ର
                  </h1>
                  <p className="text-lg font-semibold">Question Paper</p>
                  <div className="flex justify-between mt-4 text-sm">
                    <span>ସମୟ: ____________</span>
                    <span>ପୂର୍ଣ୍ଣାଙ୍କ: {toOdiaNumeral(totalMarks)} ({totalMarks})</span>
                  </div>
                  <p className="text-sm mt-2">
                    ମୋଟ ପ୍ରଶ୍ନ: {toOdiaNumeral(totalQuestions)} | Total Questions: {totalQuestions}
                  </p>
                </div>

                {/* Sections */}
                {sections.map((section, sectionIdx) => (
                  <div key={section.id} className="mb-8">
                    <h2 className="text-lg font-bold border-b pb-2 mb-4" style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}>
                      {section.odiaName} ({section.name})
                    </h2>

                    <div className="space-y-4">
                      {section.questions.map((question, qIdx) => (
                        <div key={question.id} className="pl-4">
                          <div className="flex gap-2">
                            <span className="font-semibold" style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}>
                              {toOdiaNumeral(qIdx + 1)}.
                            </span>
                            <div className="flex-1">
                              <p style={{ fontFamily: "'Noto Sans Odia', sans-serif", lineHeight: '1.8' }}>
                                {question.text || 'ପ୍ରଶ୍ନ ଲେଖାଯାଇନାହିଁ'}
                              </p>
                              <span className="text-sm text-gray-600 ml-2">
                                [{question.marks} ଅଙ୍କ]
                              </span>

                              {/* MCQ Options */}
                              {question.type === 'mcq' && question.options && (
                                <div className="mt-2 ml-4 space-y-1">
                                  {question.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex gap-2">
                                      <span style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}>
                                        {String.fromCharCode(2821 + optIdx)})
                                      </span>
                                      <span style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}>
                                        {option || '____________'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Answer space for short/long */}
                              {question.type !== 'mcq' && (
                                <div className="mt-2 border-t border-dashed pt-2">
                                  <p className="text-xs text-gray-500">
                                    {question.type === 'short' ? 'ସଂକ୍ଷିପ୍ତ ଉତ୍ତର ଲେଖନ୍ତୁ' : 'ବିସ୍ତୃତ ଉତ୍ତର ଲେଖନ୍ତୁ'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {section.questions.length === 0 && (
                        <p className="text-gray-500 italic pl-4">ଏହି ବିଭାଗରେ କୌଣସି ପ୍ରଶ୍ନ ନାହିଁ</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Footer */}
                <div className="text-center pt-8 border-t mt-8">
                  <p className="text-sm text-gray-600">✦ ✦ ✦</p>
                </div>
              </div>
            )}

            {/* News Article Preview */}
            {mode === 'news' && (
              <div className="space-y-6">
                {/* Category badge */}
                <div className="flex justify-between items-center">
                  <span 
                    className="px-3 py-1 bg-gray-100 text-sm font-medium rounded"
                    style={{ fontFamily: "'Noto Sans Odia', sans-serif" }}
                  >
                    {categoryLabels[newsCategory] || newsCategory}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('or-IN')}
                  </span>
                </div>

                {/* Headline */}
                <h1 
                  className="text-3xl font-bold leading-tight"
                  style={{ fontFamily: "'Noto Sans Odia', sans-serif", lineHeight: '1.4' }}
                >
                  {newsHeadline || 'ଶିରୋନାମା ଲେଖାଯାଇନାହିଁ'}
                </h1>

                {/* Divider */}
                <div className="border-b-2 border-gray-300" />

                {/* Body */}
                <div 
                  className="text-lg leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "'Noto Sans Odia', sans-serif", lineHeight: '2' }}
                >
                  {newsBody || 'ସମ୍ବାଦ ବିଷୟ ଲେଖାଯାଇନାହିଁ'}
                </div>
              </div>
            )}

            {/* Free Editor Preview */}
            {mode === 'free' && (
              <div 
                className="text-lg leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "'Noto Sans Odia', sans-serif", lineHeight: '2' }}
              >
                {freeContent || 'କିଛି ଲେଖାଯାଇନାହିଁ...'}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            ବନ୍ଦ କରନ୍ତୁ (Close)
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            ପ୍ରିଣ୍ଟ (Print)
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF ଡାଉନଲୋଡ଼
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
