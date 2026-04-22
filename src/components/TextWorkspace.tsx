import React, { useMemo, memo } from 'react';
import { motion } from 'motion/react';

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Moved outside component to avoid recreation on every render
function renderWithVisualFixes(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let temp = "";
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\u0336' || char === '\u0332') {
      if (temp.length > 0) {
        const baseChar = temp[temp.length - 1];
        const preceding = temp.substring(0, temp.length - 1);
        result.push(preceding);
        result.push(
          <span key={`${i}-fix`} className={char === '\u0336' ? 'visual-strike' : 'visual-underline'}>
            {baseChar}
          </span>
        );
        temp = "";
      }
    } else {
      temp += char;
    }
  }
  result.push(temp);
  return result;
}

interface TextWorkspaceProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  handleSelection: () => void;
  setIsDragging: (isDragging: boolean) => void;
  isDragging: boolean;
  selectionMode: 'single' | 'multi';
  savedSelections: { start: number, end: number }[];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  backdropRef: React.RefObject<HTMLDivElement>;
  setSavedSelections: (selections: { start: number, end: number }[]) => void;
}

export default memo(function TextWorkspace({
  inputText,
  setInputText,
  handleScroll,
  handleSelection,
  setIsDragging,
  isDragging,
  selectionMode,
  savedSelections,
  textareaRef,
  backdropRef,
  setSavedSelections
}: TextWorkspaceProps) {
  // Memoize the backdrop content — uses inputText directly (no deferral) so it stays in sync with the transparent textarea
  const backdropContent = useMemo(() => {
    if (selectionMode !== 'multi' || savedSelections.length === 0) {
      return renderWithVisualFixes(inputText);
    }
    
    let lastIdx = 0;
    const children: React.ReactNode[] = [];
    const sortedSels = [...savedSelections].sort((a, b) => a.start - b.start);
    
    sortedSels.forEach((sel, i) => {
      if (sel.start > lastIdx) {
        children.push(<span key={`text-${i}`}>{renderWithVisualFixes(inputText.substring(lastIdx, sel.start))}</span>);
      }
      children.push(
        <mark key={`mark-${i}`} className="text-white rounded-full px-1.5 -mx-1.5 bg-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.4)] outline outline-1 outline-indigo-400/40">
           {renderWithVisualFixes(inputText.substring(sel.start, sel.end))}
        </mark>
      );
      lastIdx = sel.end;
    });
    if (lastIdx < inputText.length) {
      children.push(<span key="text-end">{renderWithVisualFixes(inputText.substring(lastIdx))}</span>);
    }
    return children;
  }, [inputText, selectionMode, savedSelections]);

  return (
    <motion.div variants={itemVariants}>
      <div className="glass-card rounded-[2rem] bg-midnight/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-visible group/passage">
        <div className="relative isolate">
          <div 
            ref={backdropRef}
            className="absolute inset-0 pointer-events-none p-6 md:p-10 text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words font-sans bg-transparent overflow-hidden premium-input passage-field text-white will-change-[color,transform]"
            aria-hidden="true"
          >
            {backdropContent}
          </div>
          <textarea
            ref={textareaRef}
            value={inputText}
            onScroll={handleScroll}
            onChange={(e) => {
              setInputText(e.target.value);
              setSavedSelections([]);
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => {
              setIsDragging(false);
              handleSelection();
            }}
            onKeyUp={handleSelection}
            onCopy={(e) => {
              if (selectionMode === 'multi' && savedSelections.length > 0) {
                e.preventDefault();
                const textToCopy = savedSelections
                  .slice()
                  .sort((a, b) => a.start - b.start)
                  .map(sel => inputText.substring(sel.start, sel.end))
                  .join(' ');
                e.clipboardData.setData('text/plain', textToCopy);
                // Parent should handle copying toast
              }
            }}
            placeholder="Compose your message here..."
            dir="auto"
            spellCheck={false}
            className={`relative z-[50] w-full min-h-[50vh] md:min-h-[500px] max-h-[calc(100vh-280px)] p-6 md:p-10 resize-y focus:outline-none text-xl md:text-2xl leading-relaxed premium-input passage-field rounded-b-[2rem] bg-transparent font-sans text-transparent caret-white overflow-y-auto cursor-text ${!isDragging && selectionMode === 'multi' && savedSelections.length > 0 ? 'hide-selection' : ''}`}
          />
        </div>
      </div>
    </motion.div>
  );
});
