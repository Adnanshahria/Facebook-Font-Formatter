import React from 'react';
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
  Check
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
  { icon: <span className="text-[10px] font-black underline underline-offset-4">abc</span>, label: 'Caps', displayLabel: 'Caps', func: unicode.toSmallCaps },
  { icon: <Eraser className="w-5 h-5" />, label: 'Normalize', displayLabel: 'Clear', func: unicode.normalizeText, isSpecial: true },
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
}

export default function EditorToolbar({
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
  onEmojiInsert
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
          <div className="flex flex-wrap items-center gap-1.5 px-6 py-1.5">
            {toolbarOptions.map((opt, idx) => (
              <button
                key={idx}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyStyleToSelection(opt.func)}
                className={`group flex flex-col items-center gap-1 min-w-[3rem] py-1 rounded-xl transition-all duration-200 ${
                  opt.isSpecial
                    ? 'text-orange-400 hover:bg-orange-400/10'
                    : 'text-slate-300 hover:bg-indigo-500/10 hover:text-white'
                }`}
                title={opt.label}
              >
                <div className="text-lg transition-transform group-hover:scale-110 duration-200">{opt.icon}</div>
                <span className={`text-[8px] uppercase font-black tracking-widest transition-colors duration-200 ${opt.isSpecial ? 'text-orange-400/60 group-hover:text-orange-400' : 'text-slate-500 group-hover:text-white'}`}>
                  {opt.displayLabel}
                </span>
              </button>
            ))}

            <div className="w-px h-8 bg-white/10 mx-2" />

            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="group flex flex-col items-center gap-1 min-w-[3rem] py-1 rounded-xl transition-all text-yellow-500 hover:bg-yellow-500/10"
                title="Emoji"
              >
                <div className="transition-transform group-hover:scale-110 duration-200">
                  <Smile className="w-5 h-5" />
                </div>
                <span className="text-[8px] uppercase font-black tracking-widest text-yellow-500/60 group-hover:text-yellow-500">
                  Emoji
                </span>
              </button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute top-full mt-3 right-0 w-72 h-80 rounded-3xl glass-card z-50 flex flex-col overflow-hidden"
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
