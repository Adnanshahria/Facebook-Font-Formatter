import React, { memo } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Type as MonospaceIcon, 
  PenTool, 
  Hash, 
  Circle, 
  Square, 
  Search, 
  Eraser,
  Undo2,
  Copy,
  Languages,
  Smile,
  Check,
  Wand2,
  Minimize2,
  Highlighter,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as unicode from '../lib/unicodeUtils';

export const toolbarOptions = [
  { icon: <Bold className="w-5 h-5" />, label: 'Bold', displayLabel: 'Bold', func: unicode.toFacebookBold },
  { icon: <Italic className="w-5 h-5" />, label: 'Italic', displayLabel: 'Italic', func: unicode.toFacebookItalic },
  { icon: <Underline className="w-5 h-5" />, label: 'Underline', displayLabel: 'Line', func: unicode.toFacebookUnderline },
  { icon: <Strikethrough className="w-5 h-5" />, label: 'Strikethrough', displayLabel: 'Strike', func: unicode.toFacebookStrikethrough },
  { icon: <div className="text-xl rotate-12 -skew-x-12 opacity-80">/</div>, label: 'Slash Strike', displayLabel: 'Slash', func: unicode.toSlashStrike },
  { icon: <div className="text-xl text-center w-5 h-5 flex items-center justify-center font-serif leading-none mt-1">~</div>, label: 'Wave Strike', displayLabel: 'Wave', func: unicode.toWaveStrike },
  { icon: <MonospaceIcon className="w-5 h-5" />, label: 'Monospace', displayLabel: 'Mono', func: unicode.toFacebookMonospace },
  { icon: <PenTool className="w-5 h-5" />, label: 'Script', displayLabel: 'Script', func: unicode.toFacebookScript },
  { icon: <Hash className="w-5 h-5" />, label: 'Double Struck', displayLabel: 'Double', func: unicode.toFacebookDoubleStruck },
  { icon: <span className="font-display font-black text-lg">𝕱</span>, label: 'Fraktur', displayLabel: 'Black', func: unicode.toFacebookFraktur },
  { icon: <Circle className="w-5 h-5" />, label: 'Bubble', displayLabel: 'Bubble', func: unicode.toFacebookBubble },
  { icon: <div className="w-5 h-5 bg-current rounded-full" />, label: 'Bubble Filled', displayLabel: 'Bub Fill', func: (t: string) => unicode.toFacebookBubble(t, true) },
  { icon: <Square className="w-5 h-5" />, label: 'Square', displayLabel: 'Square', func: unicode.toFacebookSquare },
  { icon: <div className="w-5 h-5 bg-current rounded-sm" />, label: 'Square Filled', displayLabel: 'Sq Fill', func: (t: string) => unicode.toFacebookSquare(t, true) },
  { icon: <span className="text-sm font-black">aA</span>, label: 'Sarcasm', displayLabel: 'Sarcasm', func: unicode.toSarcasmCase },
  { icon: <div className="rotate-180 scale-x-[-1]"><Search className="w-5 h-5" /></div>, label: 'Mirror', displayLabel: 'Mirror', func: unicode.toMirrorText },
  { icon: <span className="text-[10px] font-black underline underline-offset-4">abc</span>, label: 'Caps', displayLabel: 'Caps', func: unicode.toSmallCaps }
];

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

interface EditorToolbarProps {
  selectionMode: 'single' | 'multi';
  setSelectionMode: (mode: 'single' | 'multi') => void;
  applyStyleToSelection: (func: (t: string) => string) => void;
  historyCount: number;
  handleUndo: () => void;
  handleCopy: () => void;
  inputTextLength: number;
  detectedScript: string;
  isCopied: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiSearch: string;
  setEmojiSearch: (search: string) => void;
  filteredEmojis: string[];
  onEmojiInsert: (emoji: string) => void;
  handleAiAction: (mode: 'enhance' | 'compact' | 'highlight') => void;
  isAiLoading: boolean;
}

export default memo(function EditorToolbar({
  selectionMode,
  setSelectionMode,
  applyStyleToSelection,
  historyCount,
  handleUndo,
  handleCopy,
  inputTextLength,
  detectedScript,
  isCopied,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiSearch,
  setEmojiSearch,
  filteredEmojis,
  onEmojiInsert,
  handleAiAction,
  isAiLoading
}: EditorToolbarProps) {
  return (
    <motion.div variants={itemVariants}>
      <div className="glass-card rounded-[1.5rem] bg-midnight/95 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Toast Notification */}
        <AnimatePresence>
          {isCopied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-md border-b border-emerald-500/30"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Message Copied!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              <PenTool className="w-3 h-3 text-indigo-400" />
              <span className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">Tools</span>
            </div>
            
            <div className="h-4 w-px bg-white/5 mx-1" />

            {/* Compact Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 scale-90 origin-left">
              <button 
                onClick={() => setSelectionMode('single')}
                className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${selectionMode === 'single' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Single
              </button>
              <button 
                onClick={() => setSelectionMode('multi')}
                className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${selectionMode === 'multi' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Multi
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUndo}
              disabled={historyCount === 0}
              className={`group p-1.5 rounded-lg transition-all duration-300 ${historyCount === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 hover:text-indigo-400 cursor-pointer'}`}
              title="Undo"
            >
              <Undo2 className={`w-3.5 h-3.5 transition-transform ${historyCount > 0 ? 'group-hover:-rotate-45' : ''}`} />
            </button>

            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg border border-indigo-500/20 transition-all duration-300 group"
              title="Copy All"
            >
              <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Copy</span>
            </button>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              <Languages className="w-3 h-3 text-indigo-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{detectedScript}</span>
            </div>

            <div className="px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <span className="text-[8px] font-black text-indigo-400/80 uppercase tracking-widest leading-none">
                {inputTextLength} <span className="text-slate-500/60 ml-0.5">Chars</span>
              </span>
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="bg-white/[0.01]">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-0.5 gap-y-2 md:gap-1.5 px-1 sm:px-2 py-3 md:px-6 md:py-1.5 w-full">
            {toolbarOptions.map((opt, idx) => (
              <button
                key={idx}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyStyleToSelection(opt.func)}
                className="group flex flex-col items-center gap-0.5 md:gap-1 w-[16%] sm:w-[14%] md:w-auto md:min-w-[3rem] py-1.5 md:py-1 rounded-lg md:rounded-xl transition-all duration-200 text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                title={opt.label}
              >
                <div className="text-[1.1rem] md:text-lg transition-transform group-hover:scale-110 duration-200 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">{opt.icon}</div>
                <span className="text-[6px] md:text-[8px] uppercase font-black tracking-widest md:tracking-widest transition-colors duration-200 text-slate-500 group-hover:text-white">
                  {opt.displayLabel}
                </span>
              </button>
            ))}

            <div className="hidden md:block shrink-0 w-px h-8 bg-white/10 mx-2" />

            <div className="flex items-center justify-between md:justify-start gap-1 w-full md:w-auto md:ml-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-0">
              
              {/* Standard Tools Group */}
              <div className="flex items-center gap-1 md:gap-1.5 bg-white/5 border border-white/5 rounded-[14px] p-1 md:p-1.5 flex-[1.2] md:flex-none justify-center relative">
                <div className="relative flex-1 md:flex-none">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="group flex w-full md:w-auto flex-col items-center gap-0.5 md:gap-1 md:min-w-[3.5rem] py-1.5 md:py-1 rounded-lg md:rounded-xl transition-all text-yellow-500 hover:bg-yellow-500/10"
                    title="Emoji"
                  >
                    <div className="transition-transform group-hover:scale-110 duration-200 flex items-center justify-center">
                      <Smile className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-yellow-500/60 group-hover:text-yellow-500">
                      Emoji
                    </span>
                  </button>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute bottom-full mb-3 right-0 md:left-1/2 md:-translate-x-1/2 md:right-auto w-72 h-80 rounded-3xl glass-card z-50 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 border-b border-white/5 flex items-center gap-3 bg-white/5">
                          <Search className="w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search symbols..."
                            className="w-full text-sm focus:outline-none bg-transparent premium-input"
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-6 gap-1">
                          {filteredEmojis.map(emoji => (
                            <button
                              key={emoji}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => onEmojiInsert(emoji)}
                              className="text-xl p-2 hover:bg-indigo-500/20 rounded-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyStyleToSelection(unicode.normalizeText)}
                  className="group flex flex-col items-center gap-0.5 md:gap-1 flex-1 md:flex-none md:min-w-[3.5rem] py-1.5 md:py-1 rounded-lg md:rounded-xl transition-all text-orange-400 hover:bg-orange-400/10"
                  title="Normalize"
                >
                  <div className="transition-transform group-hover:scale-110 duration-200">
                    <Eraser className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-orange-400/60 group-hover:text-orange-400">
                    Clear
                  </span>
                </button>
              </div>

              <div className="hidden md:block shrink-0 w-px h-6 bg-white/10 mx-1" />

              {/* AI Tools Group */}
              <div className="flex items-center gap-1 md:gap-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-[14px] p-1 md:p-1.5 flex-[1.8] md:flex-none justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent opacity-50" />
                
                {/* AI Label */}
                <div className="flex flex-col items-center justify-center px-1 md:px-2 relative z-10">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" />
                  <span className="text-[6px] md:text-[7px] font-black tracking-[0.2em] text-indigo-400 uppercase mt-0.5">AI</span>
                </div>
                
                <div className="shrink-0 w-px h-6 bg-indigo-500/20 mx-0 md:mx-1 relative z-10" />

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAiAction('enhance')}
                  disabled={isAiLoading}
                  className="group flex flex-col items-center gap-0.5 md:gap-1 flex-1 md:flex-none md:min-w-[3.5rem] py-1 md:py-1 rounded-lg md:rounded-xl transition-all text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 relative z-10"
                  title="Enhance with AI"
                >
                  <div className="transition-transform group-hover:scale-110 duration-200">
                    {isAiLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Wand2 className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-purple-400/60 group-hover:text-purple-400">
                    Enhance
                  </span>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAiAction('compact')}
                  disabled={isAiLoading}
                  className="group flex flex-col items-center gap-0.5 md:gap-1 flex-1 md:flex-none md:min-w-[3.5rem] py-1 md:py-1 rounded-lg md:rounded-xl transition-all text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 relative z-10"
                  title="Compact with AI"
                >
                  <div className="transition-transform group-hover:scale-110 duration-200">
                    {isAiLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-cyan-400/60 group-hover:text-cyan-400">
                    Compact
                  </span>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAiAction('highlight')}
                  disabled={isAiLoading}
                  className="group flex flex-col items-center gap-0.5 md:gap-1 flex-1 md:flex-none md:min-w-[3.5rem] py-1 md:py-1 rounded-lg md:rounded-xl transition-all text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 relative z-10"
                  title="Highlight with AI"
                >
                  <div className="transition-transform group-hover:scale-110 duration-200">
                    {isAiLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Highlighter className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className="text-[7px] md:text-[8px] uppercase font-black tracking-widest text-amber-400/60 group-hover:text-amber-400">
                    Highlight
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
