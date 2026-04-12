/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import AdminPanel from './AdminPanel';
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
  Circle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as unicode from './lib/unicodeUtils';

function MainApp() {
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [detectedScript, setDetectedScript] = useState<unicode.ScriptType>('Other');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [toolbarPos, setToolbarPos] = useState<{ x: number, y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
        try {
          await setDoc(doc(db, 'visitors', visitorId), {
            id: visitorId,
            visitedAt: new Date().toISOString()
          });
        } catch (e) {
          console.error("Error tracking visitor", e);
        }
      }
    };
    trackVisitor();
  }, []);

  // Email Popup Timer (Every 3 minutes)
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) return; // Don't show if email is already saved

    const timer = setInterval(() => {
      const currentEmail = localStorage.getItem('userEmail');
      if (!currentEmail) {
        setShowEmailPopup(true);
      }
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      localStorage.setItem('userEmail', email);
      setShowEmailPopup(false);
      if (inputText.trim()) {
         saveContent(inputText, inputText); // Save current content if any
      }
    }
  };

  const saveContent = async (original: string, formatted: string) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail || !original.trim()) return;

    try {
      // Get current serial number for user
      const q = query(collection(db, 'user_contents'), where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      const serialNumber = querySnapshot.size + 1;

      await addDoc(collection(db, 'user_contents'), {
        email: userEmail,
        originalText: original,
        formattedText: formatted,
        serialNumber: serialNumber,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving content", e);
    }
  };

  useEffect(() => {
    setDetectedScript(unicode.detectScript(inputText));
  }, [inputText]);

  const handleSelection = (e?: React.MouseEvent | React.KeyboardEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Small delay to allow selection to update
    setTimeout(() => {
      if (textarea.selectionStart !== textarea.selectionEnd) {
        if (e && 'clientX' in e) {
          setToolbarPos({ x: e.clientX, y: e.clientY - 60 });
        } else if (!toolbarPos) {
          const rect = textarea.getBoundingClientRect();
          setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top + 40 });
        }
      } else {
        setToolbarPos(null);
      }
    }, 10);
  };

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
    
    // Save content if email is provided
    saveContent(selectedText, transformedText);

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
    { icon: <span className="text-sm font-bold">aA</span>, label: 'Sarcasm', func: unicode.toSarcasmCase },
    { icon: <span className="text-sm font-bold rotate-180 inline-block">A</span>, label: 'Flip', func: unicode.toMirrorText },
    { icon: <span className="text-[10px] font-bold align-top">A</span>, label: 'Tiny', func: unicode.toTinyText },
    { icon: <span className="text-sm font-bold" style={{ fontVariant: 'small-caps' }}>abc</span>, label: 'Small Caps', func: unicode.toSmallCaps },
    { icon: <span className="text-sm font-bold">W</span>, label: 'Wide', func: unicode.toFacebookWide },
    { icon: <Zap className="w-5 h-5" />, label: 'Glitch', func: unicode.toZalgoText },
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
          <div>
            <h1 className="text-xl font-bold tracking-tight">Social Font</h1>
            <p className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Perfect fonts for FB, Insta & Twitter</p>
          </div>
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
              onChange={(e) => {
                setInputText(e.target.value);
                handleSelection();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleSelection(e);
              }}
              onKeyUp={handleSelection}
              placeholder="Type your message here, then select text to format..."
              dir="auto"
              className={`w-full h-80 p-8 resize-none focus:outline-none text-xl leading-relaxed transition-colors passage-field ${isDarkMode ? 'bg-[#24253d] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-300'}`}
            />
          </div>

          <p className="text-center text-sm opacity-50 font-medium">
            Select the text you want to edit to reveal the formatting toolbar.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-4">
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
              onClick={() => {
                setInputText('');
                setToolbarPos(null);
              }}
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
      </main>

      {/* Floating Toolbar */}
      <AnimatePresence>
        {toolbarPos && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: Math.max(10, Math.min(toolbarPos.x - 150, window.innerWidth - 320)), // Keep within screen bounds
              top: Math.max(10, toolbarPos.y),
              zIndex: 100,
            }}
            className={`flex flex-wrap gap-1 p-2 rounded-xl shadow-2xl border max-w-[320px] ${
              isDarkMode ? 'bg-[#2d2e4a] border-[#3a3b5c]' : 'bg-white border-gray-200'
            }`}
          >
            {toolbarOptions.map((opt, idx) => (
              <button
                key={idx}
                onMouseDown={(e) => e.preventDefault()} // Prevent textarea focus loss
                onClick={() => applyStyleToSelection(opt.func)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  opt.isSpecial 
                    ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10' 
                    : isDarkMode 
                      ? 'text-gray-200 hover:bg-[#3a3b5c] hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
                title={opt.label}
              >
                <div className="text-base">{opt.icon}</div>
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-yellow-500 hover:bg-[#3a3b5c]' 
                    : 'text-yellow-500 hover:bg-gray-100'
                }`}
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`absolute bottom-full mb-2 -left-32 w-64 h-64 rounded-xl shadow-2xl border z-50 flex flex-col ${isDarkMode ? 'bg-[#24253d] border-[#2d2e4a]' : 'bg-white border-gray-200'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <Search className="w-4 h-4 opacity-40" />
                      <input 
                        type="text" 
                        placeholder="Search emojis..." 
                        className="w-full text-sm focus:outline-none bg-transparent"
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 grid grid-cols-6 gap-1">
                      {filteredEmojis.filter(e => emojiSearch === '' || e.includes(emojiSearch)).map(emoji => (
                        <button 
                          key={emoji}
                          onMouseDown={(e) => e.preventDefault()}
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
                                handleSelection();
                              }, 0);
                            }
                            setShowEmojiPicker(false);
                          }}
                          className="text-xl p-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO Content Section */}
      <section className={`mt-16 max-w-4xl mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-[#1a1b2e] text-gray-300' : 'bg-white text-gray-600'} shadow-sm`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>The Ultimate Social Media Font Formatter & Text Styler</h2>
        <p className="mb-4">
          Welcome to <strong>Social Font</strong>, the #1 tool to format your text for Facebook, Instagram, Twitter, TikTok, WhatsApp, and other social media platforms. Whether you want to make your text <strong>bold</strong>, <em>italic</em>, or use fancy fonts like ⦗bubble⦘ and ⟬square⟭, we have you covered.
        </p>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why Use Social Font?</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>100% Free & Easy to Use:</strong> Just type, select, and click to format.</li>
          <li><strong>Universal Language Support:</strong> Unlike other tools, we fully support complex scripts like Bengali, Arabic, and Hindi without showing "boxes" or glitches.</li>
          <li><strong>Advanced Tools:</strong> Use our intelligent tools like Sarcasm Case, Mirror Text, Tiny Text, and Glitch effects to make your posts stand out.</li>
          <li><strong>Save Your Work:</strong> Enter your email to automatically save your formatted texts and access them anytime.</li>
        </ul>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How to Bold Text on Social Media?</h3>
        <p className="mb-4">
          Most social platforms don't have a built-in bold button for regular posts. Our tool uses special Unicode characters to simulate bold text. Simply type your message, select the text you want to emphasize, and click the <strong>B</strong> button. Then copy and paste it into any app!
        </p>
        <p className="text-sm opacity-80">
          <em>Keywords: social font, facebook font formatter, instagram font generator, twitter font changer, bold text generator, fancy text, unicode text converter, social media text formatting, text styler, fb text styler, bold text on facebook, italic text facebook.</em>
        </p>
      </section>

      {/* Footer */}
      <footer className={`mt-12 py-12 border-t text-center ${isDarkMode ? 'border-[#2d2e4a] text-gray-500' : 'border-gray-200 text-gray-400'}`}>
        <div className="flex justify-center gap-6 mb-4">
          <Share2 className="w-5 h-5 opacity-30" />
          <Languages className="w-5 h-5 opacity-30" />
          <Layout className="w-5 h-5 opacity-30" />
        </div>
        <p className="text-sm font-medium">Social Font • Perfect fonts for FB, Insta & Twitter</p>
        <p className="text-xs mt-2 opacity-60">Supports all languages including RTL and CJK</p>
      </footer>

      {/* Email Popup */}
      <AnimatePresence>
        {showEmailPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDarkMode ? 'bg-[#1a1b2e] text-white' : 'bg-white text-gray-900'}`}
            >
              <h3 className="text-xl font-bold mb-2">Save Your Formats!</h3>
              <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter your email to automatically save all your formatted texts. You can access them later!
              </p>
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-[#121320] border-[#2d2e4a] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailPopup(false)}
                    className={`flex-1 p-3 rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-[#2d2e4a] text-gray-300 hover:bg-[#3d3e5a]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="flex-1 p-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/adm" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
