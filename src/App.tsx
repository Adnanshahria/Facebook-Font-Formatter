import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline, 
  Copy, 
  Trash2, 
  Download, 
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
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as unicode from './lib/unicodeUtils';

function MainApp() {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [detectedScript, setDetectedScript] = useState<unicode.ScriptType>('Other');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
      }
      
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: visitorId })
        });
      } catch (e) {
        console.error("Error tracking visitor", e);
      }
    };
    trackVisitor();
  }, []);

  // Intelligent Email Popup Logic
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) return; // Never show if user already submitted

    // Initial popup after 45 seconds
    const initialTimer = setTimeout(() => {
      setShowEmailPopup(true);
    }, 45000);

    // Recurring popup every 2 minutes 30 seconds (150,000ms)
    const intervalTimer = setInterval(() => {
      if (!localStorage.getItem('userEmail')) {
        setShowEmailPopup(true);
      }
    }, 150000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      localStorage.setItem('userEmail', email);
      setShowEmailPopup(false);
      if (inputText.trim()) {
         saveContent(inputText, inputText);
      }
    }
  };

  const saveContent = async (original: string, formatted: string) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail || !original.trim()) return;

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          originalText: original,
          formattedText: formatted
        })
      });
    } catch (e) {
      console.error("Error saving content", e);
    }
  };

  useEffect(() => {
    setDetectedScript(unicode.detectScript(inputText));
  }, [inputText]);

  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setTimeout(() => {
      setHasSelection(textarea.selectionStart !== textarea.selectionEnd);
    }, 0);
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
    saveContent(selectedText, transformedText);

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
    element.download = 'social-post.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '😊', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '😏', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', 
    '👋', '👌', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '✨', '🌟', '⭐', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌊'
  ];

  const toolbarOptions = [
    { icon: <Bold className="w-5 h-5" />, label: 'Bold', func: unicode.toFacebookBold },
    { icon: <Italic className="w-5 h-5" />, label: 'Italic', func: unicode.toFacebookItalic },
    { icon: <Underline className="w-5 h-5" />, label: 'Underline', func: unicode.toFacebookUnderline },
    { icon: <Strikethrough className="w-5 h-5" />, label: 'Strikethrough', func: unicode.toFacebookStrikethrough },
    { icon: <MonospaceIcon className="w-5 h-5" />, label: 'Monospace', func: unicode.toFacebookMonospace },
    { icon: <PenTool className="w-5 h-5" />, label: 'Script', func: unicode.toFacebookScript },
    { icon: <Hash className="w-5 h-5" />, label: 'Double Struck', func: unicode.toFacebookDoubleStruck },
    { icon: <span className="font-display font-black text-lg">𝕱</span>, label: 'Fraktur', func: unicode.toFacebookFraktur },
    { icon: <Circle className="w-5 h-5" />, label: 'Bubble', func: unicode.toFacebookBubble },
    { icon: <div className="w-5 h-5 bg-current rounded-full" />, label: 'Bubble Filled', func: (t: string) => unicode.toFacebookBubble(t, true) },
    { icon: <Square className="w-5 h-5" />, label: 'Square', func: unicode.toFacebookSquare },
    { icon: <div className="w-5 h-5 bg-current rounded-sm" />, label: 'Square Filled', func: (t: string) => unicode.toFacebookSquare(t, true) },
    { icon: <span className="text-sm font-black">aA</span>, label: 'Sarcasm', func: unicode.toSarcasmCase },
    { icon: <div className="rotate-180 scale-x-[-1]"><Search className="w-5 h-5" /></div>, label: 'Mirror', func: unicode.toMirrorText },
    { icon: <span className="text-[10px] font-black underline underline-offset-4">abc</span>, label: 'Caps', func: unicode.toSmallCaps },
    { icon: <Zap className="w-5 h-5" />, label: 'Glitch', func: unicode.toZalgoText },
    { icon: <Eraser className="w-5 h-5" />, label: 'Normalize', func: unicode.normalizeText, isSpecial: true },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-midnight/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SocialFont.space</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Premium Formatter</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl border border-white/5 hover:bg-white/5"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-bold">Export</span>
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-indigo-electric hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied' : 'Copy All'}</span>
          </button>
        </motion.div>
      </header>

      <main className="max-w-5xl mx-auto p-6 pt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          {/* Editor Section */}
          <motion.div variants={itemVariants} className="w-full relative">
            <div className="glass-card rounded-[2rem] overflow-hidden relative">
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
                  <Layout className="w-4 h-4" />
                  <span>Editor Workspace</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{detectedScript}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{inputText.length} Characters</span>
                </div>
              </div>

              {/* Formatting Toolbar — always visible, glows when text is selected */}
              <div className={`border-b transition-all duration-300 ${hasSelection ? 'border-indigo-500/30 bg-indigo-500/[0.04] shadow-[inset_0_-1px_12px_rgba(99,102,241,0.15)]' : 'border-white/5 bg-white/[0.02]'}`}>
                <div className="flex flex-wrap items-center gap-1 px-6 py-3">
                  {toolbarOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyStyleToSelection(opt.func)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                        opt.isSpecial
                          ? 'text-orange-400 hover:bg-orange-400/10'
                          : 'text-slate-300 hover:bg-indigo-500 hover:text-white'
                      }`}
                      title={opt.label}
                    >
                      <div className="text-base">{opt.icon}</div>
                    </button>
                  ))}

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <div className="relative">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all text-yellow-500 hover:bg-yellow-500/10"
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5" />
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

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  handleSelection();
                }}
                onMouseUp={() => handleSelection()}
                onKeyUp={handleSelection}
                placeholder="Compose your message here..."
                dir="auto"
                spellCheck={false}
                className="w-full h-96 p-10 resize-none focus:outline-none text-2xl leading-relaxed premium-input passage-field"
              />
            </div>
          </motion.div>

          {/* AdSense Placeholder */}
          <motion.div variants={itemVariants} className="w-full min-h-[100px] border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-600 text-xs uppercase tracking-widest font-bold">
             Advertisement Space
          </motion.div>

          {/* Action Area */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Select text to trigger the premium formatting engine
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
               <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setInputText('');
                  setHasSelection(false);
                }}
                className="btn-outline flex items-center gap-3 px-10 border-red-500/20 text-red-400 hover:bg-red-500/5 hover:border-red-500/50"
              >
                <Trash2 className="w-5 h-5" />
                <span>Reset Space</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Featured Sections (SEO & UX) */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-8 rounded-3xl hover:bg-white/[0.07] transition-all group">
              <div className="bg-indigo-500/10 p-3 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Instant Format</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform any Latin text into 20+ cinematic Unicode styles. Perfect for Facebook, Instagram, and Twitter headlines.
              </p>
            </div>
            <div className="glass-card p-8 rounded-3xl hover:bg-white/[0.07] transition-all group">
              <div className="bg-indigo-500/10 p-3 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Global Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                First-class support for Bengali, Arabic, Cyrillic, and Devanagari. We use fallback decorators when direct styling isn't possible.
              </p>
            </div>
            <div className="glass-card p-8 rounded-3xl hover:bg-white/[0.07] transition-all group">
              <div className="bg-indigo-500/10 p-3 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Copy & Deploy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our formatter ensures high contrast and clarity. Simply format, copy, and paste anywhere — no extra apps required.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-16 border-t border-white/5 text-center">
        <div className="flex justify-center gap-8 mb-6 opacity-40">
           <Share2 className="w-5 h-5" />
           <Sparkles className="w-5 h-5" />
           <Hash className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-slate-500 tracking-wide">SocialFont.space Engine • Engineered for Quality</p>
        <p className="text-[10px] uppercase font-black tracking-[0.3em] mt-3 text-slate-600">Pure Unicode • No External Fonts Required</p>
      </footer>

      {/* Premium Login / Email Popup */}
      <AnimatePresence>
        {showEmailPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card rounded-[2.5rem] p-10 max-w-lg w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              
              <div className="w-16 h-1 bg-indigo-500 mb-8 rounded-full" />
              <h3 className="text-3xl font-black mb-4 pr-12">Cloud Sync Activation</h3>
              <p className="mb-8 text-slate-400 leading-relaxed font-medium">
                Link your email to save your formatted posts and access your timeline across all devices.
              </p>
              
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <div className="relative group">
                   <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600 text-lg font-medium"
                    required
                  />
                </div>
                
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailPopup(false)}
                    className="flex-1 p-5 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all active:scale-95"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    className="flex-3 p-5 rounded-2xl font-black text-white bg-indigo-electric hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Connect Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
              
              <p className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                By connecting, you agree to our terms of service.
              </p>
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
