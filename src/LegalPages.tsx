import React, { useEffect } from 'react';
import { ShieldCheck, FileText, Mail, ArrowLeft, Info, HelpCircle, Map, BookOpen, ExternalLink, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageLayout = ({ children, title, icon: Icon, subtitle }: { children: React.ReactNode, title: string, icon: any, subtitle?: string }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-24 max-w-5xl mx-auto">
      <div className="mb-12">
        <Link to="/" className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 font-bold transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Editor
        </Link>
      </div>
      
      <div className="glass-card-premium rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 border-b border-white/5 pb-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{title}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{subtitle || "SocialFont Protocol Documentation"}</p>
            </div>
          </div>
          
          <div className="text-slate-300 space-y-8 leading-relaxed max-w-none">
            {children}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">© 2026 SocialFont • Powered by OrbitSaaS</p>
      </div>
    </div>
  );
};

const ContentRenderer = ({ content }: { content: string }) => {
  if (!content) return <p className="italic text-slate-500">No content provided.</p>;
  
  return (
    <div className="space-y-8">
      {content.split('\n\n').map((block, i) => {
        // Handle Headers
        if (block.startsWith('### ')) {
          return <h2 key={i} className="text-2xl font-black text-white mt-12 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
            {block.replace('### ', '')}
          </h2>;
        }
        
        // Handle Lists
        if (block.includes('\n- ')) {
          const [intro, ...items] = block.split('\n- ');
          return (
            <div key={i} className="space-y-4">
              {intro && <p className="font-bold text-slate-200">{intro}</p>}
              <ul className="space-y-4 ml-2">
                {items.map((item, j) => (
                  <li key={j} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    <span className="text-slate-400 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Standard Paragraphs
        return <p key={i} className="text-lg text-slate-400 font-medium leading-relaxed">{block}</p>;
      })}
    </div>
  );
};

export const PrivacyPolicy = ({ content }: { content?: string }) => {
  const defaultContent = `### Data Sovereignty
At SocialFont, we treat your privacy as our core protocol. We do not store, track, or analyze the text you format. Our engine processes everything locally in your browser environment, ensuring your sensitive communications remain yours alone.

### Information Collection
We collect minimal metadata required for system stability and performance:
- Anonymous usage metrics to improve the engine.
- Browser type and version for compatibility checks.
- Essential cookies for technical functionality and AdSense integration.

### Advertising & Partners
We partner with Google AdSense to keep SocialFont free for the community. These partners may use cookies to serve relevant ads based on your visit history. You can manage these preferences in your browser settings or via the Google Privacy center.

### Security Standards
Your data is never transmitted to our servers for formatting. We utilize industry-standard encryption for our API proxy layers (Groq/OpenRouter) to ensure that even when you use our AI features, your data is handled with maximum security.`;

  return (
    <PageLayout title="Privacy Protocol" icon={ShieldCheck} subtitle="Security & Data Governance">
      <div className="px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 w-fit mb-8 shadow-lg shadow-emerald-500/5">
        Protocol Status: Active & Enforced
      </div>
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};

export const TermsOfService = ({ content }: { content?: string }) => {
  const defaultContent = `### License to Create
By utilizing SocialFont, you are granted a non-exclusive license to generate and distribute Unicode-formatted text across all supported platforms. You retain full ownership of the content you create.

### Acceptable Use
SocialFont is designed for professional and creative communication. You agree not to use our engine for:
- Automated spam or mass-messaging campaigns.
- Generating content that violates platform specific Terms of Service (Facebook, Instagram, etc.).
- Attempting to reverse engineer the SocialFont formatting logic.

### Disclaimers
SocialFont provides formatting tools "as is." While our Unicode characters are designed for maximum compatibility, we cannot guarantee appearance on all legacy devices or specialized software. We are not responsible for any platform-side content moderation resulting from the use of styled text.

### Account Termination
We reserve the right to restrict access to our premium AI features if a user is found to be in violation of our security protocols or system limits.`;

  return (
    <PageLayout title="Terms of Engagement" icon={FileText} subtitle="Legal Framework & Usage">
      <div className="px-6 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 w-fit mb-8">
        Legal Status: v2.4.0 Finalized
      </div>
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};

export const Contact = ({ content }: { content?: string }) => {
  const defaultContent = `### Professional Support
Our team is dedicated to maintaining the SocialFont engine at peak performance. For technical inquiries, bug reports, or enterprise integrations, please utilize our secure channels.

### Direct Channels
Reach out to us via:
- Support Email: support@socialfont.com
- Technical Inquiries: dev@orbitsaas.cloud
- Secure Messenger: Available in Pro Dashboard

### Response Expectations
We aim to respond to all technical queries within 24-48 hours. Enterprise support members receive priority handling within 4 hours.`;

  return (
    <PageLayout title="Secure Support" icon={Mail} subtitle="Global Communication Hub">
      <div className="px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-400 w-fit mb-8">
        Support Latency: 14ms (Operational)
      </div>
      <ContentRenderer content={content || defaultContent} />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="mailto:support@socialfont.com" className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all group">
          <Mail className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-black mb-2">Email Protocol</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Inquiries</p>
        </a>
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer">
          <MessageSquare className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-black mb-2">Live Status</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Check Engine Health</p>
        </div>
      </div>
    </PageLayout>
  );
};

export const AboutPage = ({ content }: { content?: string }) => {
  const defaultContent = `### The Mission
SocialFont was engineered to bridge the gap between plain text and cinematic digital expression. We believe that professional formatting shouldn't be limited to specialized software—it should be available wherever you communicate.

### Technical Excellence
Our engine utilizes advanced Unicode mapping to ensure your text looks identical on Windows, macOS, iOS, and Android. By focusing on pure Unicode characters rather than external fonts, we ensure 100% compatibility with Facebook, Instagram, and X (Twitter).

### The OrbitSaaS Ecosystem
SocialFont is a flagship product of the OrbitSaaS network, a boutique software foundry dedicated to building high-performance web utilities for the modern digital creator.`;

  return (
    <PageLayout title="About Experience" icon={Info} subtitle="Our Philosophy & History">
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};

export const FAQPage = ({ content }: { content?: string }) => {
  const defaultContent = `### How does it work?
SocialFont converts your standard characters into their corresponding Mathematical Alphanumeric Symbols within the Unicode standard. This isn't a "font"—it's a set of unique characters that every modern device understands.

### Is it safe for Facebook?
Yes. Because we use standardized Unicode characters, your text is treated as standard text by social media algorithms. It won't trigger spam filters or violate formatting guidelines.

### Why does some text look like squares?
This only happens on very old legacy devices (pre-2015) or specialized terminal environments that don't support the full Unicode 15.0 specification. 99% of modern smartphones and computers will display it perfectly.

### How do I use the AI features?
Simply highlight your text and select one of the AI tools (Enhance, Compact, Highlight). Our engine will analyze your intent and apply the optimal formatting and stylistic improvements instantly.`;

  return (
    <PageLayout title="Help Center (FAQ)" icon={HelpCircle} subtitle="Knowledge Base & Support">
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};

export const RoadmapPage = ({ content }: { content?: string }) => {
  const defaultContent = `### Q3 2026: The AI Expansion
- Integration of specialized LLMs for "Tone of Voice" adjustments.
- Real-time sentiment analysis for formatted text.
- Expansion of the AI Toolcard with 5 new specialized modes.

### Q4 2026: Platform Ecosystem
- Official Browser Extensions for Chrome and Safari.
- Mobile App (iOS/Android) with native text replacement features.
- Integration with major CRM and CMS platforms.

### Long Term Vision
Our goal is to become the underlying formatting engine for all professional social communication, providing a seamless layer of style across the entire internet.`;

  return (
    <PageLayout title="Development Roadmap" icon={Map} subtitle="Future Protocols & Innovation">
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};

export const GuidePage = ({ content }: { content?: string }) => {
  const defaultContent = `### The Power of Unicode
Unicode is an international standard that assigns a unique number to every character, no matter the platform, program, or language. SocialFont leverages specialized ranges within this standard, such as:
- Mathematical Bold/Italic
- Monospace Alphanumerics
- Fraktur & Script variations

### Why Unicode?
Traditional fonts require the recipient to have the font file installed. Unicode characters are "built-in" to the device's operating system. When you paste a SocialFont style, you are pasting actual characters, not a styling instruction.

### Best Practices
- **Readability**: While script and gothic fonts look beautiful, use them for emphasis rather than entire paragraphs.
- **Accessibility**: Screen readers handle Unicode symbols differently. Always use clear, plain text for critical information and keep formatting for stylistic headers.`;

  return (
    <PageLayout title="Formatting Protocol" icon={BookOpen} subtitle="Technical Guide & Education">
      <ContentRenderer content={content || defaultContent} />
    </PageLayout>
  );
};
