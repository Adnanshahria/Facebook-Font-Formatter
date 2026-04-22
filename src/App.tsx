import React, { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import EditorToolbar from './components/EditorToolbar';
import TextWorkspace from './components/TextWorkspace';
import { 
  Copy, 
  Trash2, 
  Smile, 
  Search,
  Check,
  Languages,
  ArrowRight,
  ExternalLink,
  Rocket,
  AtSign,
  Undo2,
  PenTool,
  Wand2,
  Keyboard,
  MousePointer2,
  ClipboardType,
  Facebook,
  Instagram,
  Twitter,
  Sparkles,
  X,
  Loader2,
  Zap,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as unicode from './lib/unicodeUtils';
import Logo from './Logo';

const filteredEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '😊', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '😏', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', 
  '👋', '👌', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '✨', '🌟', '⭐', '💫', '🔥', '💥', '⚡', '🌈', '☀️', '🌊'
];

// Variants and options moved to EditorToolbar.tsx

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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.3474.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const GoogleAd = ({ className, slot, format = 'auto', responsive = 'true' }: { className?: string, slot: string, format?: string, responsive?: string }) => {
  const adRef = useRef<boolean>(false);
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  useEffect(() => {
    if (isLocalhost) return;

    if (!adRef.current && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
        adRef.current = true;
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [isLocalhost]);

  if (isLocalhost) {
    return (
      <div className={`bg-white/5 border border-white/10 flex flex-col items-center justify-center rounded-lg ${className}`}>
        <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Ad Placeholder</span>
        <span className="text-white/20 text-[8px] mt-0.5">Hidden on Localhost</span>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-5011249228990148"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};

function MainApp({ 
  siteSettings, 
  heroFeatures, 
  partnerBanner, 
  footerSettings 
}: { 
  siteSettings: any, 
  heroFeatures: any[], 
  partnerBanner: any, 
  footerSettings: any 
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [detectedScript, setDetectedScript] = useState<unicode.ScriptType>('Other');
  const [selectionMode, setSelectionMode] = useState<'single' | 'multi'>('multi');
  const [savedSelections, setSavedSelections] = useState<{start: number, end: number}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [email, setEmail] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showMobileAd, setShowMobileAd] = useState(false);
  const [adDismissCount, setAdDismissCount] = useState(0);
  const adReshowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAiInterstitial, setShowAiInterstitial] = useState(false);
  const [interstitialCountdown, setInterstitialCountdown] = useState(5);
  const [pendingAiMode, setPendingAiMode] = useState<'enhance' | 'compact' | 'highlight' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);


  const getIcon = (name: string, props: any) => {
    const icons: Record<string, any> = { Zap: Sparkles, Languages, Check, Sparkles, Star: Sparkles, ArrowRight, Wand2, Globe: Languages, ShieldCheck: Check, Heart: Smile };
    const Icon = icons[name] || Sparkles;
    return <Icon {...props} />;
  };

  const saveToHistory = (text: string) => {
    setHistory(prev => [...prev, text]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [inputText, ...prev]);
    setInputText(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleAiAction = (mode: 'enhance' | 'compact' | 'highlight') => {
    if (!inputText.trim()) return;
    setPendingAiMode(mode);
    setInterstitialCountdown(5);
    setShowAiInterstitial(true);
    
    const timer = setInterval(() => {
      setInterstitialCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeAiAction = async (mode: 'enhance' | 'compact' | 'highlight') => {
    if (!inputText.trim()) return;
    setIsAiLoading(true);
    saveToHistory(inputText);
    try {
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, text: inputText })
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.error || 'AI request failed');
        // revert history since it failed
        handleUndo();
      } else if (data.result) {
        let finalOutput = data.result;
        if (mode === 'highlight') {
          finalOutput = unicode.parseAndApplyMarkdownStyling(finalOutput);
        }
        setInputText(finalOutput);
      }
    } catch (err) {
      alert('Error connecting to AI service.');
      handleUndo();
    }
    setIsAiLoading(false);
  };

  const confirmAiAction = () => {
    if (pendingAiMode) {
      executeAiAction(pendingAiMode);
      setShowAiInterstitial(false);
      setPendingAiMode(null);
    }
  };

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

  // Mobile Ad Timing Logic — 20s initial delay, max 7 dismissals, 2.5 min re-show
  const AD_MAX_DISMISSALS = 7;
  const AD_RESHOW_DELAY = 150000; // 2.5 minutes

  useEffect(() => {
    const adTimer = setTimeout(() => {
      setShowMobileAd(true);
    }, 20000); // 20 seconds

    return () => clearTimeout(adTimer);
  }, []);

  const handleDismissAd = () => {
    setShowMobileAd(false);
    const newCount = adDismissCount + 1;
    setAdDismissCount(newCount);

    // If under the limit, schedule a re-show after 2.5 minutes
    if (newCount < AD_MAX_DISMISSALS) {
      if (adReshowTimerRef.current) clearTimeout(adReshowTimerRef.current);
      adReshowTimerRef.current = setTimeout(() => {
        setShowMobileAd(true);
      }, AD_RESHOW_DELAY);
    }
  };

  // Cleanup re-show timer on unmount
  useEffect(() => {
    return () => {
      if (adReshowTimerRef.current) clearTimeout(adReshowTimerRef.current);
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
    // Debounce only script detection — history is saved on explicit actions only
    const timer = setTimeout(() => {
      setDetectedScript(unicode.detectScript(inputText));
    }, 400);
    return () => clearTimeout(timer);
  }, [inputText]);

  // Deferred values for non-critical UI so they don't block typing
  const deferredInputLength = useDeferredValue(inputText.length);
  const deferredHistoryCount = useDeferredValue(history.length);

  const handleSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setTimeout(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const hasSel = start !== end;
      
      if (selectionMode === 'multi') {
        if (!hasSel) {
          setSavedSelections([]);
          setHasSelection(false);
          return;
        }

        setSavedSelections(prev => {
          const existIdx = prev.findIndex(s => s.start === start && s.end === end);
          if (existIdx >= 0) {
            return prev.filter((_, i) => i !== existIdx);
          }
          return [...prev, { start: start, end: end }];
        });
        setHasSelection(true);
      } else {
        setHasSelection(hasSel);
      }
    }, 0);
  }, [selectionMode]);

  const applyStyleToSelection = (styleFunc: (text: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    saveToHistory(inputText);

    if (selectionMode === 'multi' && savedSelections.length > 0) {
      let newText = inputText;
      
      const sortedSels = [...savedSelections].sort((a, b) => a.start - b.start);
      let offset = 0;
      const newSelections = [];

      for (const sel of sortedSels) {
        const adjustedStart = sel.start + offset;
        const adjustedEnd = sel.end + offset;
        
        const sub = newText.substring(adjustedStart, adjustedEnd);
        const transformed = styleFunc(sub);
        
        newText = newText.substring(0, adjustedStart) + transformed + newText.substring(adjustedEnd);
        
        const newLength = transformed.length;
        const oldLength = adjustedEnd - adjustedStart;
        const diff = newLength - oldLength;
        
        newSelections.push({ start: adjustedStart, end: adjustedStart + newLength });
        offset += diff;
      }

      setInputText(newText);
      setSavedSelections(newSelections);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    let selectedText = inputText.substring(start, end);
    let prefix = '';
    let suffix = '';

    if (selectionMode === 'single') {
      // Find the first word within the selection
      const match = selectedText.match(/^(\s*)([^\s]+)(\s*.*)$/s);
      if (match) {
        prefix = match[1];
        selectedText = match[2];
        suffix = match[3];
      }
    }

    const transformedText = styleFunc(selectedText);
    
    const newText = 
      inputText.substring(0, start) + 
      prefix + transformedText + suffix + 
      inputText.substring(end);

    setInputText(newText);
    saveContent(selectedText, transformedText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, start + prefix.length + transformedText.length + suffix.length);
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
      <header className="sticky top-0 z-50 mx-auto w-full max-w-[1920px] md:w-[98%] lg:w-[96%] border-x-0 md:border-x border-b border-white/10 bg-midnight/80 md:bg-midnight/60 backdrop-blur-3xl md:backdrop-blur-2xl px-4 py-3 md:px-10 lg:pl-12 lg:pr-8 md:py-4 rounded-b-[1.5rem] md:rounded-b-[2rem] flex items-center justify-between shadow-2xl shadow-indigo-500/5 transition-all duration-500">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Logo className="w-12 h-12 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SocialFont</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Premium Formatter</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex items-center gap-2 lg:gap-4"
        >
          {heroFeatures.map((feature, i) => (
            <div key={i} className="glass-card p-2 md:px-3 md:py-2.5 rounded-xl flex items-center gap-3 bg-white/[0.01] hover:bg-white/[0.05] transition-all border-white/10">
              <div className="bg-indigo-500/10 p-1.5 md:p-2 rounded-lg text-indigo-400">
                 {getIcon(feature.icon, { className: "w-3 h-3 md:w-3.5 md:h-3.5" })}
              </div>
              <div className="flex flex-col">
                <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-white leading-tight">{feature.title}</h3>
                <p className="text-slate-500 text-[8px] md:text-[9px] font-medium leading-tight hidden lg:block max-w-[140px] truncate">{feature.desc}</p>
              </div>
            </div>
          ))}

          {/* Paid Promotion Header Card */}
          <a 
            href={siteSettings?.footer_settings?.whatsappUrl ? `https://wa.me/${siteSettings.footer_settings.whatsappUrl.replace(/\D/g, '')}` : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card-premium p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center gap-3 overflow-hidden group/promo relative max-w-[200px]"
          >
            <div className="bg-midnight/90 backdrop-blur-xl p-2 md:px-3 md:py-2.5 rounded-[11px] flex items-center gap-3 w-full h-full relative">
              <div className="bg-[#25D366]/10 p-1.5 md:p-2 rounded-lg text-[#25D366] group-hover/promo:bg-[#25D366] group-hover/promo:text-white transition-all">
                <WhatsAppIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#25D366] leading-tight">Paid Promotion</h3>
                
                {/* Compact Marquee */}
                <div className="relative flex overflow-x-hidden pt-0.5">
                  <div className="animate-marquee whitespace-nowrap flex group-hover/promo:pause-animation">
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mr-4">
                      Whatsapp for Ads • 
                    </span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mr-4">
                      Whatsapp for Ads • 
                    </span>
                  </div>
                  <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex group-hover/promo:pause-animation">
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mr-4">
                      Whatsapp for Ads • 
                    </span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mr-4">
                      Whatsapp for Ads • 
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </motion.div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-2 md:p-6 lg:p-10 pt-6 md:pt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_300px] gap-8 lg:items-start"
        >
          {/* Left Sidebar: Description Workspace */}
          <motion.aside variants={itemVariants} className="hidden lg:block sticky top-32 h-fit space-y-6 z-30 overflow-visible">
            <div className="glass-card rounded-[1.5rem] p-5 border-0">
              <h2 className="text-lg font-black text-white leading-tight mb-4">
                Enhance Your <span className="text-indigo-400">Social Presence.</span>
              </h2>
              
              <div className="space-y-3">
                <p className="text-slate-400 text-[10px] font-medium leading-[1.6]">
                  Elevate your profiles with cinematic formatting for:
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 py-1">
                  {[
                    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: '#1877F2' },
                    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, color: '#E4405F' },
                    { name: 'X / Twitter', icon: <Twitter className="w-5 h-5" />, color: '#1DA1F2' },
                    { name: 'Threads', icon: <AtSign className="w-5 h-5" />, color: '#FFFFFF' }
                  ].map(platform => (
                    <div 
                      key={platform.name} 
                      className="group relative cursor-pointer"
                      title={platform.name}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${platform.color}15` }} />
                      <div className="relative w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1 shadow-lg" style={{ color: platform.color }}>
                        {platform.icon}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="w-full text-center p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/10">
                  <div className="bg-midnight/90 backdrop-blur-xl rounded-[11px] py-1.5 px-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                      and every other platform
                    </span>
                  </div>
                </div>
                
                <div className="pt-1.5 border-t border-white/5 opacity-30 text-center">
                  <p className="text-[6.5px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Engineered for Social Engines
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-Sidebar Ad */}
            <div className="glass-card rounded-[1.5rem] mt-6 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
               <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-900/80 border border-white/5 opacity-50">
                  <span className="text-[5px] uppercase font-black tracking-widest text-slate-500">Sponsored</span>
               </div>
               <GoogleAd slot="1479951864" className="w-full h-full min-h-[250px]" format="auto" />
            </div>

            {/* OrbitSaaS Special Banner */}
            {partnerBanner.enabled && (
              <a 
                href={partnerBanner.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 group relative block rounded-[1.5rem] overflow-hidden p-[1px] shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-blue-500/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl" />
                <div className="relative h-full bg-midnight/80 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5 flex flex-col gap-3 group-hover:bg-midnight/60 transition-colors duration-500">
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-shadow duration-500">
                        <Rocket className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                      <h3 className="text-white text-sm font-black flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                        {partnerBanner.title}
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                      </h3>
                    </div>
                    {partnerBanner.badge && (
                      <span className="text-[8px] uppercase font-black tracking-[0.2em] text-indigo-400/80 bg-indigo-500/10 px-2 py-1 rounded-md">{partnerBanner.badge}</span>
                    )}
                  </div>
                  
                  <div className="mt-1 pointer-events-none">
                    <p className="text-slate-400 text-[10px] leading-relaxed font-medium">
                      {partnerBanner.desc}
                    </p>
                  </div>
                  
                  <div className="mt-1 pt-3 border-t border-white/5 flex items-center justify-between text-indigo-300/60 group-hover:text-indigo-400 transition-colors pointer-events-none">
                    <span className="text-[10px] font-bold tracking-wider">{partnerBanner.cta}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            )}
          </motion.aside>

          {/* Main Content Area */}
          <div className="flex flex-col gap-10 lg:mt-0 overflow-visible">
            {/* Mobile Only Intro & Instructions */}
            <motion.div variants={itemVariants} className="flex lg:hidden flex-col gap-6">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="glass-card rounded-[2rem] p-6 border-0 text-left relative overflow-hidden flex items-center gap-6 group"
              >
                {/* Background Accents */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex-1 relative z-10">
                  <motion.h2 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-xl font-black text-white leading-tight mb-2 tracking-tight"
                  >
                    Enhance Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Social Presence</span>
                  </motion.h2>
                  <motion.p 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-[10px] font-medium leading-relaxed"
                  >
                    Elevate your profiles with cinematic formatting for every platform <span className="text-indigo-400 font-bold">& many more.</span>
                  </motion.p>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                  className="flex-shrink-0 grid grid-cols-2 gap-2.5 relative z-10"
                >
                  {[
                    { icon: <Facebook className="w-4 h-4" />, color: '#1877F2', glow: 'shadow-blue-500/20' },
                    { icon: <Instagram className="w-4 h-4" />, color: '#E4405F', glow: 'shadow-pink-500/20' },
                    { icon: <Twitter className="w-4 h-4" />, color: '#1DA1F2', glow: 'shadow-sky-500/20' },
                    { icon: <AtSign className="w-4 h-4" />, color: '#FFFFFF', glow: 'shadow-white/10' }
                  ].map((platform, i) => (
                    <motion.div 
                      key={i}
                      variants={{
                        hidden: { scale: 0, opacity: 0 },
                        visible: { scale: 1, opacity: 1 }
                      }}
                      whileHover={{ y: -3, scale: 1.1 }}
                      className={`w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-xl ${platform.glow} transition-all duration-300 backdrop-blur-sm`}
                      style={{ color: platform.color }}
                    >
                      {platform.icon}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>


              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 overflow-hidden relative">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-center">
                    <h2 className="text-[11px] font-black text-white uppercase tracking-widest">How It Works</h2>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Four steps to premium formatting</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { step: "01", title: "Write", desc: "Type message", icon: <Keyboard className="w-4 h-4" /> },
                      { step: "02", title: "Select", desc: "Highlight text", icon: <MousePointer2 className="w-4 h-4" /> },
                      { step: "03", title: "Style", desc: "Click preset", icon: <Wand2 className="w-4 h-4" /> },
                      { step: "04", title: "Paste", desc: "Use anywhere", icon: <ClipboardType className="w-4 h-4" /> }
                    ].map((s, i) => (
                      <div key={i} className="glass-card bg-midnight/40 p-3 rounded-xl flex flex-col gap-1.5 relative overflow-hidden">
                        <div className="flex items-center gap-2">
                          <div className="text-slate-500">
                            {React.cloneElement(s.icon as React.ReactElement, { className: 'w-2.5 h-2.5' })}
                          </div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{s.title}</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-slate-500 text-[8px] font-medium leading-tight">{s.desc}</p>
                          <span className="text-[8px] font-black text-indigo-400/20 uppercase leading-none">{s.step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Editor Section */}
            <div className="w-full flex flex-col gap-6 sticky top-24 md:top-32 z-40 h-fit">
              <EditorToolbar 
                selectionMode={selectionMode}
                setSelectionMode={setSelectionMode}
                applyStyleToSelection={applyStyleToSelection}
                historyCount={deferredHistoryCount}
                handleUndo={handleUndo}
                handleCopy={handleCopy}
                inputTextLength={deferredInputLength}
                detectedScript={detectedScript}
                isCopied={isCopied}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                emojiSearch={emojiSearch}
                setEmojiSearch={setEmojiSearch}
                filteredEmojis={filteredEmojis}
                onEmojiInsert={(emoji) => {
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
                handleAiAction={handleAiAction}
                isAiLoading={isAiLoading}
              />

              <TextWorkspace 
                inputText={inputText}
                setInputText={setInputText}
                handleScroll={handleScroll}
                handleSelection={handleSelection}
                setIsDragging={setIsDragging}
                isDragging={isDragging}
                selectionMode={selectionMode}
                savedSelections={savedSelections}
                textareaRef={textareaRef}
                backdropRef={backdropRef}
                setSavedSelections={setSavedSelections}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <motion.aside variants={itemVariants} className="hidden xl:block sticky top-32 h-fit z-30 overflow-visible">
            <div className="flex flex-col gap-6">
              {/* How it works Mini */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 overflow-hidden relative group">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex flex-col gap-5 relative z-10">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[11px] font-black text-white uppercase tracking-widest">How It Works</h2>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Four steps to premium formatting</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { step: "01", title: "Write", desc: "Type message", icon: <Keyboard className="w-4 h-4" /> },
                      { step: "02", title: "Select", desc: "Highlight text", icon: <MousePointer2 className="w-4 h-4" /> },
                      { step: "03", title: "Style", desc: "Click preset", icon: <Wand2 className="w-4 h-4" /> },
                      { step: "04", title: "Paste", desc: "Use anywhere", icon: <ClipboardType className="w-4 h-4" /> }
                    ].map((s, i) => (
                      <div key={i} className="glass-card bg-midnight/40 hover:bg-white/[0.04] border-white/5 hover:border-indigo-500/30 transition-all duration-500 p-3 rounded-xl flex flex-col gap-1.5 group/card cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-6 h-6 shrink-0 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/card:scale-110 group-hover/card:border-indigo-500/50 group-hover/card:bg-indigo-500/10 text-slate-500 group-hover/card:text-indigo-400 transition-all duration-500">
                             {React.cloneElement(s.icon as React.ReactElement, { className: 'w-2.5 h-2.5' })}
                          </div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest group-hover/card:text-indigo-300 transition-colors leading-none">{s.title}</h4>
                          <span className="ml-auto text-[8px] font-black text-indigo-400/20 uppercase leading-none">{s.step}</span>
                        </div>
                        
                        <div className="relative z-10 w-full">
                          <p className="text-slate-500 text-[8px] font-medium leading-tight group-hover/card:text-slate-400 transition-colors">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad Space Skycraper */}
              <div className="glass-card rounded-[2rem] h-fit min-h-[600px] border border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-900/80 border border-white/5 opacity-50">
                    <span className="text-[5px] uppercase font-black tracking-widest text-slate-500">Sponsored</span>
                 </div>
                 <GoogleAd slot="3288999191" className="w-full h-full min-h-[600px]" format="auto" />
              </div>
            </div>
          </motion.aside>
        </motion.div>

        {/* Post-Passage Content Area (Relocated from grid to allow clean scroll) */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-20 space-y-12 md:space-y-20">
          {/* Bottom Ad Space */}
          <motion.div variants={itemVariants} className="w-full h-[100px] glass-card rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-2 left-4 z-10 px-2 py-0.5 rounded bg-slate-900/80 border border-white/5 opacity-50">
                <span className="text-[5px] uppercase font-black tracking-widest text-slate-500">Sponsored</span>
             </div>
             <GoogleAd slot="2082587093" className="w-full h-full min-h-[100px]" format="auto" />
          </motion.div>

          {/* FAQ Section (AEO) */}
          <motion.section variants={itemVariants} className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="text-center mb-16 relative z-10">
               <h2 className="text-3xl font-black text-white mb-4">Frequently Asked <span className="text-indigo-400">Questions</span></h2>
               <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-10 bg-white/10" />
                 <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em] font-display">SocialFont Engine Expertise</p>
                 <div className="h-px w-10 bg-white/10" />
               </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { q: "FB bold text?", a: "SocialFont uses Unicode characters compatible with Facebook posts/bios." },
                { q: "Insta fonts?", a: "Fully compatible with Instagram bios, captions, and comments." },
                { q: "Is it safe?", a: "Yes, we use standard Unicode characters that don't violate social media policies." },
                { q: "Work on TikTok?", a: "Absolutely! Our styles work on TikTok, LinkedIn, WhatsApp, and more." },
                { q: "Need any app?", a: "No app or extension needed. Everything works 100% in your browser." },
                { q: "How to copy?", a: "Just select your text and use the standard copy command to paste it anywhere." },
                { q: "Work in Bios?", a: "Yes, these are optimized to make your Instagram/FB bios look premium." },
                { q: "Hidden costs?", a: "SocialFont is 100% free to use for both personal and professional profiles." },
                { q: "Unicode support?", a: "We support wide, bubble, script, fraktur, and 20+ other Unicode styles." },
              ].map((faq, i) => (
                <div key={i} className="glass-card p-6 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-colors group">
                  <h4 className="text-sm font-black mb-3 text-white flex gap-2 group-hover:text-indigo-300 transition-colors">
                     <span className="text-indigo-500">Q.</span> {faq.q}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed pl-5 border-l border-white/5 group-hover:border-indigo-500/50 transition-colors">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="mt-20 md:mt-40 border-t border-white/5 bg-midnight/60 mesh-gradient-footer footer-backlit relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 lg:gap-16">
            
            {/* Pillar 1: Identity */}
            <div className="flex flex-col space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 group cursor-pointer w-fit">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Logo className="w-10 h-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-[10deg] relative z-10" />
                  </div>
                  <div>
                    <span className="text-2xl font-black tracking-tight text-white block">SocialFont</span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-[0.2em] text-emerald-500/80">Engine Operational</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 tracking-wide leading-relaxed max-w-[260px]">
                  {siteSettings?.footer_credits?.tagline1 || "The professional choice for creators seeking cinematic text formatting across all social engines."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/10 transition-colors cursor-default">Stable v2.4</div>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-default">Enterprise Edition</div>
              </div>
            </div>

            {/* Pillar 2: Community & Newsletter */}
            <div className="flex flex-col space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Join the Circle</h4>
                </div>
                <div className="relative group w-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Your professional email" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder-slate-600 backdrop-blur-sm"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">No spam. Only major engine updates.</p>
              </div>

              <div className="space-y-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Global Network</h4>
                <div className="flex flex-wrap items-center gap-4">
                  {[
                    { id: 'facebook', icon: <Facebook />, color: '#1877F2', url: siteSettings?.footer_settings?.facebookUrl, enabled: siteSettings?.footer_settings?.facebookEnabled ?? true },
                    { id: 'instagram', icon: <Instagram />, color: '#E4405F', url: siteSettings?.footer_settings?.instagramUrl, enabled: siteSettings?.footer_settings?.instagramEnabled ?? true },
                    { id: 'whatsapp', icon: <WhatsAppIcon />, color: '#25D366', url: siteSettings?.footer_settings?.whatsappUrl ? `https://wa.me/${siteSettings.footer_settings.whatsappUrl.replace(/\D/g, '')}` : null, enabled: siteSettings?.footer_settings?.whatsappEnabled ?? true }
                  ].filter(social => social.enabled !== false).map(social => (
                    <a 
                      key={social.id}
                      href={social.url || '#'}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 group/social ${social.url ? 'text-slate-400' : 'text-slate-700 pointer-events-none'}`}
                      title={social.id}
                    >
                      {React.cloneElement(social.icon as React.ReactElement, { 
                        className: 'w-5 h-5 transition-colors duration-500',
                        style: { color: social.url ? undefined : social.color }
                      })}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 3: Platform */}
            <div className="flex flex-col space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Platform</h4>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'About Experience', path: '/about' },
                  { label: 'Help Center (FAQ)', path: '/faq' },
                  { label: 'Development Roadmap', path: '/roadmap' },
                  { label: 'Formatting Protocol', path: '/guide' }
                ].map(link => (
                  <Link 
                    key={link.label} 
                    to={link.path} 
                    className="text-xs font-bold tracking-wide text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-3 group/link"
                  >
                    <div className="w-1.5 h-1.5 rounded-full border border-indigo-500/50 group-hover:bg-indigo-500 transition-all" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pillar 4: Support */}
            <div className="flex flex-col space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Support</h4>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all group"
                  title="Back to Top"
                >
                  <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Privacy Protocol', path: '/privacy' },
                  { label: 'Terms of Engagement', path: '/terms' },
                  { label: 'Secure Support', path: '/contact' }
                ].map(link => (
                  <Link 
                    key={link.label} 
                    to={link.path} 
                    className="text-xs font-bold tracking-wide text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-3 group/link"
                  >
                    <div className="w-1.5 h-1.5 rounded-full border border-purple-500/50 group-hover:bg-purple-500 transition-all" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <a 
                href={siteSettings?.footer_settings?.orbitUrl || 'https://orbitsaas.cloud'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group flex items-center gap-3 hover:text-white transition-all duration-500"
              >
                <span>© 2026</span>
                <span className="glow-text-premium transition-all duration-500 group-hover:scale-105">ORBITSAAS</span>
                <span className="opacity-40">•</span>
                <span className="opacity-60">All Rights Reserved</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
              </a>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Encryption Active</span>
               </div>
               <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Latency: 14ms</span>
               </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Ad */}
      <AnimatePresence>
        {showMobileAd && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] block lg:hidden p-3 pb-4"
          >
            <div className="mx-auto max-w-[340px] glass-card rounded-2xl border border-white/10 bg-midnight/95 backdrop-blur-3xl shadow-2xl p-2 relative flex flex-col items-center justify-center">
              <button 
                onClick={handleDismissAd}
                className="absolute -top-2.5 -right-2.5 bg-slate-800 hover:bg-slate-700 transition-colors rounded-full p-1.5 border border-white/10 text-slate-400 hover:text-white shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute top-1 left-2">
                <span className="text-[6px] uppercase font-black tracking-widest text-slate-500">Sponsored</span>
              </div>
              <div className="w-full h-[50px] mt-3 flex items-center justify-center border border-dashed border-white/5 rounded-lg bg-black/20">
                {/* When you have the Ad Unit, replace this with: <GoogleAd slot="YOUR_NEW_SLOT_ID" className="w-[320px] h-[50px]" format="horizontal" /> */}
                <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">320x50 AD UNIT</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium AI Interstitial Ad Gate */}
      <AnimatePresence>
        {showAiInterstitial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-midnight/80 backdrop-blur-2xl" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden bg-midnight/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-50" />
              
              <div className="relative p-6 sm:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-2 tracking-tight">
                  Unlocking <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Power</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8 font-medium">
                  Please wait a few seconds while we prepare your AI-enhanced text. Sponsored content helps keep our AI tools free for everyone.
                </p>

                <div className="w-full max-w-[336px] min-h-[280px] bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 mb-8 relative group">
                  <div className="absolute top-2 left-3">
                    <span className="text-[7px] uppercase font-black tracking-widest text-slate-600">Advertisement</span>
                  </div>
                  
                  {/* When you have the Slot ID, replace this with: <GoogleAd slot="YOUR_AI_SLOT_ID" className="w-[300px] h-[250px]" format="rectangle" /> */}
                  <div className="w-[300px] h-[250px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <p className="text-slate-700 text-[10px] uppercase font-black tracking-[0.3em]">300x250 AD UNIT</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                  {interstitialCountdown > 0 ? (
                    <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-300">
                        Continue in <span className="text-indigo-400 text-lg ml-1">{interstitialCountdown}s</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={confirmAiAction}
                      className="group flex items-center gap-3 px-10 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Continue to AI</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      setShowAiInterstitial(false);
                      setPendingAiMode(null);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Cancel and Return
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

import { PrivacyPolicy, TermsOfService, Contact, AboutPage, FAQPage, RoadmapPage, GuidePage } from './LegalPages';

export default function App() {
  const [heroFeatures, setHeroFeatures] = useState([
    { icon: 'Zap', title: 'Instant Format', desc: '20+ Cinematic Unicode styles.' },
    { icon: 'Languages', title: 'Global Support', desc: 'Bengali, Arabic & Cyrillic fallback.' },
    { icon: 'Check', title: 'Copy & Deploy', desc: 'Works on FB, IG, X & Threads.' }
  ]);
  const [partnerBanner, setPartnerBanner] = useState({
    enabled: true,
    url: 'https://orbitsaas.cloud',
    title: 'OrbitSaaS.cloud',
    desc: 'Scaling next-gen software solutions. Turn your ideas into powerful cloud applications.',
    badge: 'Partner',
    cta: 'Explore Services'
  });
  const [footerSettings, setFooterSettings] = useState({
    orbitUrl: 'https://orbitsaas.cloud',
    facebookUrl: '',
    instagramUrl: '',
    whatsappUrl: ''
  });
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSiteSettings(data);
          if (data.hero_features) setHeroFeatures(data.hero_features);
          if (data.partner_banner) setPartnerBanner(data.partner_banner);
          if (data.footer_settings) setFooterSettings(data.footer_settings);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MainApp 
            siteSettings={siteSettings} 
            heroFeatures={heroFeatures} 
            partnerBanner={partnerBanner}
            footerSettings={footerSettings}
          />
        } />
        <Route path="/adm" element={<AdminPanel />} />
        <Route path="/privacy" element={<PrivacyPolicy content={siteSettings?.privacy_content} />} />
        <Route path="/terms" element={<TermsOfService content={siteSettings?.terms_content} />} />
        <Route path="/contact" element={<Contact content={siteSettings?.contact_content} />} />
        <Route path="/about" element={<AboutPage content={siteSettings?.about_content} />} />
        <Route path="/faq" element={<FAQPage content={siteSettings?.faq_content} />} />
        <Route path="/roadmap" element={<RoadmapPage content={siteSettings?.roadmap_content} />} />
        <Route path="/guide" element={<GuidePage content={siteSettings?.guide_content} />} />
      </Routes>
    </BrowserRouter>
  );
}
