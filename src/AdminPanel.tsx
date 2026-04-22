import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, Lock, Search, Filter, ArrowLeft, TrendingUp, Calendar, Trash2, Mail, ExternalLink, Clock, Settings, Save, ShieldCheck, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  returningUsers: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, uniqueVisitors: 0, returningUsers: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginError, setLoginError] = useState('');
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
    whatsappUrl: '',
    facebookEnabled: true,
    instagramEnabled: true,
    whatsappEnabled: true
  });
  const [footerCredits, setFooterCredits] = useState({
    copyright: "© 2026 OrbitSaaS. All rights reserved.",
    tagline1: "SocialFont Engine • Engineered for Quality",
    tagline2: "Pure Unicode • No External Fonts Required"
  });
  const [legalContent, setLegalContent] = useState({
    privacy: "",
    terms: "",
    contact: "",
    about: "",
    faq: "",
    roadmap: "",
    guide: ""
  });
  const [aiSettings, setAiSettings] = useState({
    hfTokens: [] as string[],
    groqKey: '',
    primaryProvider: 'hf' as 'hf' | 'groq'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data && data.hero_features) setHeroFeatures(data.hero_features);
          if (data && data.partner_banner) setPartnerBanner(data.partner_banner);
          if (data && data.footer_settings) setFooterSettings(data.footer_settings);
          if (data && data.footer_credits) setFooterCredits(data.footer_credits);
          if (data && data.ai_settings) setAiSettings(data.ai_settings);
          if (data) setLegalContent({
            privacy: data.privacy_content || "",
            terms: data.terms_content || "",
            contact: data.contact_content || "",
            about: data.about_content || "",
            faq: data.faq_content || "",
            roadmap: data.roadmap_content || "",
            guide: data.guide_content || ""
          });
        });
    }
  }, [isAuthenticated]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: accessCode,
          settings: { 
            hero_features: heroFeatures, 
            partner_banner: partnerBanner,
            footer_settings: footerSettings,
            footer_credits: footerCredits,
            privacy_content: legalContent.privacy,
            terms_content: legalContent.terms,
            contact_content: legalContent.contact,
            about_content: legalContent.about,
            faq_content: legalContent.faq,
            roadmap_content: legalContent.roadmap,
            guide_content: legalContent.guide,
            ai_settings: aiSettings
          }
        })
      });
    } catch(err) {
      console.error(err);
    }
    setSavingSettings(false);
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...heroFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setHeroFeatures(newFeatures);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: accessCode })
      });

      if (response.ok) {
        const data = await response.json();
        setVisitors(data.visitors || []);
        setContents(data.contents || []);
        setStats(data.stats || { totalVisits: 0, uniqueVisitors: 0, returningUsers: 0 });
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid access credentials. Unauthorized access is logged.');
      }
    } catch (err) {
      setLoginError('Server communication failure.');
    }
    setLoading(false);
  };

  const filteredContents = useMemo(() => {
    return contents.filter(c => 
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.original_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.formatted_text?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contents, searchQuery]);

  const statsCards = [
    { label: 'Total Visits', value: stats.totalVisits, icon: <TrendingUp />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: <Users />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Returning Users', value: stats.returningUsers, icon: <Clock />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Saved Passages', value: contents.length, icon: <FileText />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="flex justify-center mb-8">
            <Logo className="w-24 h-24 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2">Internal Access</h2>
          <p className="text-slate-500 text-center mb-8 font-medium">Enter your security key to continue</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Secret Access Token"
              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 font-bold tracking-widest text-lg"
            />
            
            {loginError && (
              <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-3 py-5 text-lg font-black"
            >
              {loading ? "Decrypting..." : "Decrypt Dashboard"}
            </button>
          </form>

          <button onClick={() => navigate('/')} className="w-full mt-6 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors">
            Back to Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12 flex-shrink-0" />
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">System Console</h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Advanced Lifecycle Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none w-full md:w-80 font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-3xl group hover:border-white/20 transition-all"
            >
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-6 h-6' })}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Site Settings */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col mb-12">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Settings className="w-5 h-5 text-indigo-400" />
              Site Features Configuration
            </h2>
            <button 
              onClick={handleSaveSettings} 
              disabled={savingSettings}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              {savingSettings ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-6">
            {heroFeatures.map((f, i) => (
              <div key={i} className="flex flex-col gap-4 p-4 rounded-xl border border-white/10 bg-black/20">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Icon (Lucide Node)</label>
                  <input type="text" value={f.icon} onChange={e => handleFeatureChange(i, 'icon', e.target.value)} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Title</label>
                  <input type="text" value={f.title} onChange={e => handleFeatureChange(i, 'title', e.target.value)} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Description</label>
                  <input type="text" value={f.desc} onChange={e => handleFeatureChange(i, 'desc', e.target.value)} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Integrations Configuration */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col mb-12">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Intelligence Matrix
            </h2>
            <button 
              onClick={handleSaveSettings} 
              disabled={savingSettings}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              {savingSettings ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">HuggingFace Fallback Tokens</label>
                  <button 
                    onClick={() => setAiSettings({ ...aiSettings, hfTokens: [...aiSettings.hfTokens, ''] })}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                  >
                    + Add Token
                  </button>
                </div>
                <div className="space-y-3">
                  {aiSettings.hfTokens.map((token, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="password" 
                        value={token} 
                        onChange={e => {
                          const newTokens = [...aiSettings.hfTokens];
                          newTokens[idx] = e.target.value;
                          setAiSettings({ ...aiSettings, hfTokens: newTokens });
                        }}
                        placeholder="hf_..."
                        className="bg-white/5 p-3 rounded-xl text-sm outline-none flex-1 border border-white/5 focus:border-indigo-500/50 font-mono" 
                      />
                      <button 
                        onClick={() => {
                          const newTokens = aiSettings.hfTokens.filter((_, i) => i !== idx);
                          setAiSettings({ ...aiSettings, hfTokens: newTokens });
                        }}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {aiSettings.hfTokens.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No fallback tokens configured. Using system environment variables.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Groq API Key (Secondary Fallback)</label>
                  <input 
                    type="password" 
                    value={aiSettings.groqKey} 
                    onChange={e => setAiSettings({ ...aiSettings, groqKey: e.target.value })} 
                    placeholder="gsk_..."
                    className="bg-white/5 p-3 rounded-xl text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono" 
                  />
                </div>

                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <label className="text-[10px] text-indigo-300 uppercase font-black tracking-widest">Primary Engine Flow</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setAiSettings({ ...aiSettings, primaryProvider: 'hf' })}
                      className={`flex-1 p-3 rounded-xl text-xs font-black transition-all ${aiSettings.primaryProvider === 'hf' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {"HF -> GROQ"}
                    </button>
                    <button 
                      onClick={() => setAiSettings({ ...aiSettings, primaryProvider: 'groq' })}
                      className={`flex-1 p-3 rounded-xl text-xs font-black transition-all ${aiSettings.primaryProvider === 'groq' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {"GROQ -> HF"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">System will rotate through all available HF tokens if one hits rate limits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Banner Config */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col mb-12">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-indigo-400" />
              Partner Banner Configuration
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Enable</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={partnerBanner.enabled}
                    onChange={(e) => setPartnerBanner({ ...partnerBanner, enabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              <button 
                onClick={handleSaveSettings} 
                disabled={savingSettings}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                {savingSettings ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>
          <div className={`transition-all duration-300 ${partnerBanner.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="p-8 grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Banner Title</label>
                <input type="text" value={partnerBanner.title} onChange={e => setPartnerBanner({ ...partnerBanner, title: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Target URL</label>
                <input type="text" value={partnerBanner.url} onChange={e => setPartnerBanner({ ...partnerBanner, url: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Description</label>
                <textarea rows={2} value={partnerBanner.desc} onChange={e => setPartnerBanner({ ...partnerBanner, desc: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50 resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Badge Text</label>
                <input type="text" value={partnerBanner.badge} onChange={e => setPartnerBanner({ ...partnerBanner, badge: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">CTA Text</label>
                <input type="text" value={partnerBanner.cta} onChange={e => setPartnerBanner({ ...partnerBanner, cta: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Social Config */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col mb-12">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-400" />
              Footer & Social Connectivity
            </h2>
            <button 
              onClick={handleSaveSettings} 
              disabled={savingSettings}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              {savingSettings ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
          <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Orbit SaaS URL</label>
              <input type="text" value={footerSettings.orbitUrl} onChange={e => setFooterSettings({ ...footerSettings, orbitUrl: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Facebook Profile</label>
                <input type="checkbox" checked={footerSettings.facebookEnabled ?? true} onChange={e => setFooterSettings({...footerSettings, facebookEnabled: e.target.checked})} />
              </div>
              <input type="text" value={footerSettings.facebookUrl} onChange={e => setFooterSettings({ ...footerSettings, facebookUrl: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Instagram Handle</label>
                <input type="checkbox" checked={footerSettings.instagramEnabled ?? true} onChange={e => setFooterSettings({...footerSettings, instagramEnabled: e.target.checked})} />
              </div>
              <input type="text" value={footerSettings.instagramUrl} onChange={e => setFooterSettings({ ...footerSettings, instagramUrl: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">WhatsApp Contact</label>
                <input type="checkbox" checked={footerSettings.whatsappEnabled ?? true} onChange={e => setFooterSettings({...footerSettings, whatsappEnabled: e.target.checked})} />
              </div>
              <input type="text" value={footerSettings.whatsappUrl} onChange={e => setFooterSettings({ ...footerSettings, whatsappUrl: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
          </div>
          
          <div className="p-8 border-t border-white/5 grid md:grid-cols-3 gap-6 bg-white/[0.01]">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Copyright Text</label>
              <input type="text" value={footerCredits.copyright} onChange={e => setFooterCredits({ ...footerCredits, copyright: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Engine Tagline</label>
              <input type="text" value={footerCredits.tagline1} onChange={e => setFooterCredits({ ...footerCredits, tagline1: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tech Tagline</label>
              <input type="text" value={footerCredits.tagline2} onChange={e => setFooterCredits({ ...footerCredits, tagline2: e.target.value })} className="bg-white/5 p-2 rounded-lg text-sm outline-none w-full border border-white/5 focus:border-indigo-500/50" />
            </div>
          </div>
        </div>

        {/* Legal Content Config */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col mb-12">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Legal Document Configuration
            </h2>
            <button 
              onClick={handleSaveSettings} 
              disabled={savingSettings}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              {savingSettings ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Privacy Policy Content</label>
               <textarea 
                 rows={15} 
                 value={legalContent.privacy} 
                 onChange={e => setLegalContent({ ...legalContent, privacy: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="Markdown-friendly content..."
               />
            </div>
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Terms of Service Content</label>
               <textarea 
                 rows={15} 
                 value={legalContent.terms} 
                 onChange={e => setLegalContent({ ...legalContent, terms: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="Markdown-friendly content..."
               />
            </div>
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Contact Support Content</label>
               <textarea 
                 rows={15} 
                 value={legalContent.contact} 
                 onChange={e => setLegalContent({ ...legalContent, contact: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="Markdown-friendly content..."
               />
            </div>
          </div>

          <div className="p-8 pt-0 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">About Experience</label>
               <textarea 
                 rows={10} 
                 value={legalContent.about} 
                 onChange={e => setLegalContent({ ...legalContent, about: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="About content..."
               />
            </div>
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Help Center (FAQ)</label>
               <textarea 
                 rows={10} 
                 value={legalContent.faq} 
                 onChange={e => setLegalContent({ ...legalContent, faq: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="FAQ content..."
               />
            </div>
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Development Roadmap</label>
               <textarea 
                 rows={10} 
                 value={legalContent.roadmap} 
                 onChange={e => setLegalContent({ ...legalContent, roadmap: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="Roadmap content..."
               />
            </div>
            <div className="flex flex-col gap-3">
               <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Formatting Protocol</label>
               <textarea 
                 rows={10} 
                 value={legalContent.guide} 
                 onChange={e => setLegalContent({ ...legalContent, guide: e.target.value })} 
                 className="bg-white/5 p-4 rounded-2xl text-xs outline-none w-full border border-white/5 focus:border-indigo-500/50 font-mono leading-relaxed" 
                 placeholder="Unicode guide..."
               />
            </div>
          </div>
        </div>

        {/* Capture Logs (Table Format) */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              Capture Timeline
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5 uppercase tracking-[0.15em] text-[10px] font-black text-slate-500">
                  <th className="px-8 py-5">SN</th>
                  <th className="px-8 py-5">Email Identifier</th>
                  <th className="px-8 py-5">Original Passage</th>
                  <th className="px-8 py-5">Styled Result</th>
                  <th className="px-8 py-5">Timeline</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold italic">No data records found in specified index.</td>
                  </tr>
                ) : (
                  filteredContents.map((c, i) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-500">#{c.serial_number}</td>
                      <td className="px-8 py-6 text-sm font-bold text-indigo-100">{c.email}</td>
                      <td className="px-8 py-6 text-xs text-slate-400 max-w-xs truncate">{c.original_text}</td>
                      <td className="px-8 py-6 text-sm font-medium text-white max-w-xs truncate">{c.formatted_text}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{new Date(c.created_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-600 font-bold">{new Date(c.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitors List (Mini) */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
            <div className="glass-card rounded-[2.5rem] p-8">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    Recent Activity Logs
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                    {visitors.slice(0, 20).map(v => (
                        <div key={v.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${Number(v.visit_count) > 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                <span className="text-[10px] font-mono text-slate-500">{v.id}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black block text-slate-400 uppercase tracking-tighter">Visits: {v.visit_count}</span>
                                <span className="text-[10px] text-slate-600 font-bold">{new Date(v.last_visited_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    AdSense & Growth
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Your platform is primed for monetization. Ensure your Privacy Policy and Terms of Service are in place before applying for Google AdSense.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-xs font-bold">AdSense Integration</span>
                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">READY</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-xs font-bold">Meta Tag Compliance</span>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">OPTIMIZED</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
