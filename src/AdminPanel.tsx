import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, Lock, Search, Filter, ArrowLeft, TrendingUp, Calendar, Trash2, Mail, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center shadow-inner">
              <Lock className="w-10 h-10" />
            </div>
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
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">System Console</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Advanced Lifecycle Intelligence</p>
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
