/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline, 
  Type, 
  Copy, 
  Trash2, 
  Download, 
  Moon, 
  Sun, 
  Smile, 
  Search,
  Check,
  Layout,
  Eraser,
  Share2,
  Languages,
  Type as MonospaceIcon,
  PenTool,
  Hash,
  Square,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as unicode from './lib/unicodeUtils';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [detectedScript, setDetectedScript] = useState<unicode.ScriptType>('Other');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDetectedScript(unicode.detectScript(inputText));
  }, [inputText]);

  const applyStyleToSelection = (styleFunc: (text: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const selectedText = inputText.substring(start, end);
    const transformedText = styleFunc(selectedText);
    
    const newText = 
      inputText.substring(0, start) + 
      transformedText + 
      inputText.substring(end);

    setInputText(newText);

    // Update selection after render without triggering keyboard
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, start + transformedText.length);
      }
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = () => {
    const element = document.createElement('a');
    const file = new Blob([inputText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'fb-post.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
    '✨', '🌟', '⭐', '💫', '🔥', '💥', '💢', '💦', '💨', '⚡', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌊', '💧', '☔', '⛱️', '⚡', '❄️', '☃️', '⛄', '☄️', '🔥', '💧', '🌊'
  ];

  const toolbarOptions = [
    { icon: <Bold className="w-5 h-5" />, label: 'B', func: unicode.toFacebookBold },
    { icon: <Italic className="w-5 h-5" />, label: 'I', func: unicode.toFacebookItalic },
    { icon: <Underline className="w-5 h-5" />, label: 'U', func: unicode.toFacebookUnderline },
    { icon: <Strikethrough className="w-5 h-5" />, label: 'S', func: unicode.toFacebookStrikethrough },
    { icon: <MonospaceIcon className="w-5 h-5" />, label: 'T', func: unicode.toFacebookMonospace },
    { icon: <PenTool className="w-5 h-5" />, label: '𝒮', func: unicode.toFacebookScript },
    { icon: <Hash className="w-5 h-5" />, label: '𝕀', func: unicode.toFacebookDoubleStruck },
    { icon: <span className="font-serif font-bold">𝔉</span>, label: 'F', func: unicode.toFacebookFraktur },
    { icon: <Circle className="w-5 h-5" />, label: 'Ⓣ', func: unicode.toFacebookBubble },
    { icon: <div className="w-5 h-5 bg-current rounded-full" />, label: '●', func: (t: string) => unicode.toFacebookBubble(t, true) },
    { icon: <Square className="w-5 h-5" />, label: '🅃', func: unicode.toFacebookSquare },
    { icon: <div className="w-5 h-5 bg-current rounded-sm" />, label: '■', func: (t: string) => unicode.toFacebookSquare(t, true) },
    { icon: <Eraser className="w-5 h-5" />, label: 'Clear', func: unicode.normalizeText, isSpecial: true },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1b2e] text-[#e4e6eb]' : 'bg-[#f0f2f5] text-[#1c1e21]'} font-sans`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${isDarkMode ? 'bg-[#1a1b2e] border-[#2d2e4a]' : 'bg-white border-gray-200'} px-4 py-3 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Share2 className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FB Format Pro</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#2d2e4a]' : 'hover:bg-gray-100'}`}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export .txt</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center gap-8">
        {/* Passage Field */}
        <div className="w-full flex flex-col gap-4">
          <div className={`relative w-full rounded-2xl shadow-xl border overflow-hidden transition-all ${isDarkMode ? 'bg-[#24253d] border-[#2d2e4a]' : 'bg-white border-gray-100'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-[#2d2e4a]' : 'border-gray-50'}`}>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest opacity-50 uppercase">
                <Layout className="w-4 h-4" />
                <span>Passage Field</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-bold opacity-60 uppercase">{detectedScript}</span>
                </div>
                <div className="h-4 w-px bg-gray-300 opacity-30" />
                <span className="text-[10px] font-bold opacity-60 uppercase">{inputText.length} Chars</span>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here, then select text to format..."
              dir="auto"
              className={`w-full h-80 p-8 resize-none focus:outline-none text-xl leading-relaxed transition-colors passage-field ${isDarkMode ? 'bg-[#24253d] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-300'}`}
            />
          </div>

          <p className="text-center text-sm opacity-50 font-medium">
            Please select the text that you want to edit and press on the corresponding font style button.
          </p>

          {/* Toolbar */}
          <div className="w-full flex flex-col items-center gap-8">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {toolbarOptions.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent textarea focus loss
                  onClick={() => applyStyleToSelection(opt.func)}
                  className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all shadow-sm ${
                    opt.isSpecial 
                      ? 'border-orange-400 text-orange-500 hover:bg-orange-50' 
                      : isDarkMode 
                        ? 'bg-[#2d2e4a] border-[#3a3b5c] text-white hover:border-indigo-500 hover:bg-[#3a3b5c]' 
                        : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                  title={opt.label}
                >
                  <div className="text-xl">{opt.icon}</div>
                </motion.button>
              ))}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all shadow-sm relative ${
                  isDarkMode 
                    ? 'bg-[#2d2e4a] border-[#3a3b5c] text-yellow-500 hover:border-indigo-500' 
                    : 'bg-white border-gray-100 text-yellow-500 hover:border-indigo-300'
                }`}
              >
                <Smile className="w-6 h-6" />
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className={`absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 h-80 rounded-2xl shadow-2xl border z-50 flex flex-col ${isDarkMode ? 'bg-[#24253d] border-[#2d2e4a]' : 'bg-white border-gray-200'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                        <Search className="w-4 h-4 opacity-40" />
                        <input 
                          type="text" 
                          placeholder="Search emojis..." 
                          className="w-full text-sm focus:outline-none bg-transparent"
                          value={emojiSearch}
                          onChange={(e) => setEmojiSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-6 gap-2">
                        {filteredEmojis.filter(e => emojiSearch === '' || e.includes(emojiSearch)).map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => {
                              const textarea = textareaRef.current;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const newText = inputText.substring(0, start) + emoji + inputText.substring(end);
                                setInputText(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                                }, 0);
                              } else {
                                setInputText(inputText + emoji);
                              }
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl p-1 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all active:shadow-inner"
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputText('')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold border-2 transition-all ${
                  isDarkMode 
                    ? 'border-[#2d2e4a] text-red-400 hover:bg-red-500/10 hover:border-red-500/50' 
                    : 'border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear All</span>
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-12 border-t text-center ${isDarkMode ? 'border-[#2d2e4a] text-gray-500' : 'border-gray-200 text-gray-400'}`}>
        <div className="flex justify-center gap-6 mb-4">
          <Share2 className="w-5 h-5 opacity-30" />
          <Languages className="w-5 h-5 opacity-30" />
          <Layout className="w-5 h-5 opacity-30" />
        </div>
        <p className="text-sm font-medium">FB Format Pro • Professional Unicode Text Styler</p>
        <p className="text-xs mt-2 opacity-60">Supports all languages including RTL and CJK</p>
      </footer>
    </div>
  );
}
