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

const filteredEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '😊', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '😏', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', 
  '👋', '👌', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '✨', '🌟', '⭐', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌊'
];

const toolbarOptions = [
  { icon: <Bold className="w-5 h-5" />, label: 'Bold', displayLabel: 'Bold', func: unicode.toFacebookBold },
  { icon: <Italic className="w-5 h-5" />, label: 'Italic', displayLabel: 'Italic', func: unicode.toFacebookItalic },
  { icon: <Underline className="w-5 h-5" />, label: 'Underline', displayLabel: 'Line', func: unicode.toFacebookUnderline },
  { icon: <Strikethrough className="w-5 h-5" />, label: 'Strikethrough', displayLabel: 'Strike', func: unicode.toFacebookStrikethrough },
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
  { icon: <Zap className="w-5 h-5" />, label: 'Glitch', displayLabel: 'Glitch', func: unicode.toZalgoText },
  { icon: <Eraser className="w-5 h-5" />, label: 'Normalize', displayLabel: 'Clear', func: unicode.normalizeText, isSpecial: true },
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


  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-midnight/50 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-2xl">
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

      <main className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-10 pt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr_300px] gap-8 lg:items-start"
        >
          {/* Left Sidebar: Description Workspace */}
          <motion.aside variants={itemVariants} className="hidden lg:block sticky top-32 h-fit">
            <div className="glass-card rounded-[1.5rem] p-5 border-0">
              <div className="bg-indigo-500/10 p-3 rounded-xl w-fit mb-5 text-indigo-400">
                <Layout className="w-6 h-6" />
               </div>
              <h2 className="text-xl font-black text-white mb-3 leading-tight">
                Enhance Your <span className="text-indigo-400">Social Presence.</span>
              </h2>
              <div className="space-y-4">
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Elevate your profiles with cinematic formatting for:
                </p>
                <ul className="space-y-2.5">
                  {[
                    { name: 'Facebook', icon: 'FB' },
                    { name: 'Instagram', icon: 'INSTA' },
                    { name: 'Twitter / X', icon: 'X' },
                    { name: 'Threads', icon: 'TH' }
                  ].map(platform => (
                    <li key={platform.name} className="flex items-center gap-2.5 group translate-x-0 hover:translate-x-1.5 transition-transform">
                      <span className="text-[8px] font-black w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors uppercase">
                        {platform.icon}
                      </span>
                      <span className="text-xs font-bold text-slate-300">{platform.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-white/5 opacity-40">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Engineered for Social Engines
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-Sidebar Ad */}
            <div className="glass-card rounded-[1.5rem] p-5 mt-6 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[250px] relative group">
               <div className="absolute top-4 px-3 py-1 rounded-full bg-slate-900/50 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-[6px] uppercase font-black tracking-widest text-slate-500">Sponsored</span>
               </div>
               <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layout className="w-8 h-8 text-slate-500" />
               </div>
               <p className="mt-4 text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] text-center">
                  Sidebar Ad Slot
               </p>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <div className="flex flex-col gap-10 lg:mt-0">
             {/* Trust & Onboarding Hero (Relocated to top) */}
             <div className="space-y-6">
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Zap className="w-4 h-4" />, title: "Instant Format", desc: "20+ Cinematic Unicode styles." },
                    { icon: <Languages className="w-4 h-4" />, title: "Global Support", desc: "Bengali, Arabic & Cyrillic fallback." },
                    { icon: <Check className="w-4 h-4" />, title: "Copy & Deploy", desc: "Works on FB, IG, X & Threads." }
                  ].map((feature, i) => (
                    <div key={i} className="glass-card p-4 rounded-2xl flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                      <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-white">{feature.title}</h3>
                        <p className="text-slate-500 text-[10px] font-medium leading-tight mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.section variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:px-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-[0_0_20px_rgba(99,102,241,0.3)]">01</div>
                      <h2 className="text-sm font-black text-white uppercase tracking-widest">Master SocialFont</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                      {[
                        { step: "01", title: "Type", desc: "Write message" },
                        { step: "02", title: "Select", desc: "Highlight text" },
                        { step: "03", title: "Format", desc: "Pick a style" },
                        { step: "04", title: "Paste", desc: "Copy and go" }
                      ].map((s, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.title}</h4>
                          <p className="text-slate-500 text-[9px] font-bold leading-tight uppercase opacity-60">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
             </div>

            {/* Editor Section */}
            <motion.div variants={itemVariants} className="w-full relative">
              <div className="glass-card rounded-[2rem] overflow-hidden relative">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
                    <PenTool className="w-4 h-4" />
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
                  <div className="flex flex-wrap items-center gap-1.5 px-6 py-4">
                    {toolbarOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyStyleToSelection(opt.func)}
                        className={`group flex flex-col items-center gap-1.5 min-w-[3rem] py-2 rounded-xl transition-all duration-200 ${
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
                        className="group flex flex-col items-center gap-1.5 min-w-[3rem] py-2 rounded-xl transition-all text-yellow-500 hover:bg-yellow-500/10"
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
                  className="w-full h-80 md:h-[400px] p-10 resize-none focus:outline-none text-2xl leading-relaxed premium-input passage-field"
                />
              </div>
            </motion.div>

            {/* Bottom Ad Space */}
            <motion.div variants={itemVariants} className="w-full h-[120px] glass-card rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-4 relative group">
               <div className="absolute top-4 left-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                 <span className="text-[8px] uppercase font-black tracking-widest text-slate-700">Advertisement Space</span>
               </div>
               <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em] group-hover:text-indigo-500/40 transition-colors">
                 Your Ad Placement Here
               </p>
            </motion.div>

            {/* FAQ Section (AEO) Section (Relocated below editor) */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-12">
                 <h2 className="text-2xl font-black text-white mb-4">Questions & Answers</h2>
                 <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest italic">SocialFont.space Engine</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { q: "FB bold text?", a: "SocialFont uses Unicode characters compatible with Facebook posts/bios." },
                  { q: "Insta fonts?", a: "Fully compatible with Instagram bios, captions, and comments." },
                ].map((faq, i) => (
                  <div key={i} className="glass-card p-6 rounded-3xl border-white/5">
                    <h4 className="text-sm font-black mb-3 text-white flex gap-2">
                       <span className="text-indigo-500">Q.</span> {faq.q}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed pl-5 border-l border-white/5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Sidebar: Ad Space Skycraper */}
          <motion.aside variants={itemVariants} className="hidden xl:block h-full">
             <div className="glass-card rounded-[2rem] p-6 h-fit min-h-[500px] sticky top-32 flex flex-col items-center justify-center border-dashed border-white/10 relative group">
                <div className="absolute top-4 px-4 py-1.5 rounded-full bg-slate-900 border border-white/5 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[7px] uppercase font-black tracking-[0.2em] text-slate-500">Sponsored Section</span>
                </div>
                
                <div className="flex flex-col items-center gap-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Layout className="w-12 h-12 text-slate-500" />
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Premium Ad Slot</p>
                    <p className="text-[10px] font-bold text-slate-600">300 x 600 px</p>
                  </div>
                </div>

                <div className="absolute bottom-8 px-6 text-center">
                   <p className="text-[8px] font-bold text-slate-700 leading-relaxed uppercase tracking-widest">
                     Place your brand here to reach creators and designers.
                   </p>
                </div>
             </div>
          </motion.aside>
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
            className="fixed inset-0 bg-midnight/60 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 overflow-hidden"
          >
            {/* Animated Background Aura */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] animate-orb" />
               <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] animate-orb" style={{ animationDelay: '-5s' }} />
               <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px]" />
            </div>

            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="glass-card-premium rounded-[3rem] p-12 max-w-lg w-full relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="flex justify-center mb-8">
                <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-300">Cloud Sync Ready</span>
                </div>
              </div>

              <div className="text-center relative z-10">
                <h3 className="text-4xl font-black mb-4 text-white leading-tight">Don't lose your sparkle.</h3>
                <p className="mb-10 text-slate-400 leading-relaxed font-medium px-4">
                  Connect your email to save designs and access your timeline from any device.
                </p>
                
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-5 bg-white/[0.03] border border-white/5 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder-slate-600 text-lg font-medium text-center"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-2">
                    <button
                      type="submit"
                      className="shimmer-bg w-full py-5 rounded-[1.5rem] font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Sync My Work</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowEmailPopup(false)}
                      className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:text-slate-300 transition-all text-sm"
                    >
                      Maybe later
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/5">
                <p className="text-center text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                  Instant Sync • Priority Access • Privacy First
                </p>
              </div>
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
