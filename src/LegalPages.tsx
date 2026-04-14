import React from 'react';
import { ShieldCheck, FileText, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageLayout = ({ children, title, icon: Icon }: { children: React.ReactNode, title: string, icon: any }) => (
  <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
    <div className="mb-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Editor
      </Link>
    </div>
    
    <div className="glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden bg-midnight">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-white">{title}</h1>
      </div>
      
      <div className="text-slate-300 space-y-6 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const ContentRenderer = ({ content }: { content: string }) => {
  if (!content) return <p className="italic text-slate-500">No content provided.</p>;
  
  return (
    <div className="space-y-6">
      {content.split('\n\n').map((block, i) => {
        if (block.startsWith('### ')) {
          return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">{block.replace('### ', '')}</h2>;
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
};

export const PrivacyPolicy = ({ content }: { content?: string }) => (
  <PageLayout title="Privacy Policy" icon={ShieldCheck}>
    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400/60 mb-8">Status: Active & Verified</p>
    <ContentRenderer content={content || ""} />
  </PageLayout>
);

export const TermsOfService = ({ content }: { content?: string }) => (
  <PageLayout title="Terms of Service" icon={FileText}>
    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400/60 mb-8">Status: Active & Verified</p>
    <ContentRenderer content={content || ""} />
  </PageLayout>
);

export const Contact = ({ content }: { content?: string }) => (
  <PageLayout title="Contact Us" icon={Mail}>
    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400/60 mb-8">Status: Live Support Channels</p>
    <ContentRenderer content={content || ""} />
  </PageLayout>
);
