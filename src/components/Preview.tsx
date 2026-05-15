import { Check, Clipboard, Download, Eye, FileCode, Globe, RefreshCw, Share2, Sparkles, Terminal, Rocket, Layout, Github, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Preview({ 
  markdown, 
  projectName,
  isGenerating,
  onHost
}: { 
  markdown: string;
  projectName: string;
  isGenerating: boolean;
  onHost: () => Promise<string | null>;
}) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [isHosting, setIsHosting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const filesParts = markdown.split("---FILE_SEPARATOR---").filter(Boolean);
  const mainMarkdown = filesParts[0] || "";
  const extraDocs = filesParts.slice(1).map(doc => {
    const lines = doc.trim().split("\n");
    const namePart = lines[0].replace(/[\[\]]/g, "").replace("---", "").trim() || "EXTRA.md";
    const content = lines.slice(1).join("\n");
    return { name: namePart, content };
  });

  const commitSuggestion = `docs: initial documentation suite for ${projectName || 'project'}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'README'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHost = async () => {
    setIsHosting(true);
    try {
      const url = await onHost();
      if (url) setShareUrl(url);
    } finally {
      setIsHosting(false);
    }
  };

  if (!markdown && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-sm">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="p-8 bg-sky-500/5 rounded-[3rem] border border-sky-500/10 mb-8 relative"
        >
          <Layout className="w-16 h-16 text-sky-500/30" />
          <Sparkles className="w-6 h-6 text-sky-400 absolute top-6 right-6 animate-pulse" />
        </motion.div>
        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight font-display">Awaiting Blueprint</h3>
        <p className="text-slate-500 max-w-sm leading-relaxed text-sm font-medium">
          Initialize the project architecture in the architect panel to witness the synthesis of elite documentation.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl self-start">
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'preview' ? "bg-white text-black shadow-xl" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => setView('code')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'code' ? "bg-white text-black shadow-xl" : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3 h-3" />
            Logic
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => copyToClipboard(markdown)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" /> : <Clipboard className="w-4 h-4" />}
            {copied ? 'Captured' : 'Capture'}
          </motion.button>
          
          <motion.button
            whileHover={{ y: -2 }}
            onClick={downloadMarkdown}
            className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>

          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHost}
            disabled={isHosting || !!shareUrl}
            className={`px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl ${
                shareUrl 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-white text-black border border-white"
            }`}
          >
            {isHosting ? <RefreshCw className="w-4 h-4 animate-spin" /> : shareUrl ? <Globe className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            {isHosting ? 'Relaying...' : shareUrl ? 'Carrier Online' : 'Deploy Suite'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {shareUrl && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="mb-8 overflow-hidden"
          >
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] flex items-center justify-between backdrop-blur-xl relative group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Global Documentation Node</p>
                  <p className="text-sm text-slate-200 font-mono underline decoration-emerald-500/20 underline-offset-4">{shareUrl}</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-5 py-2.5 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10"
              >
                Copy Link
              </motion.button>
              <div className="absolute inset-0 bg-emerald-400/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden relative border border-white/5 rounded-[3rem] bg-black/40 shadow-[inner_0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm group">
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-10"
            >
              <div className="flex flex-col items-center gap-12 text-center max-w-md">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-[2px] border-sky-500/10 border-t-sky-500 rounded-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Cpu className="w-10 h-10 text-sky-400" />
                    </motion.div>
                  </div>
                  {/* Scan Line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-px bg-white/20 blur-[2px] z-10"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter font-display">Synthesizing Protocol</h4>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-sky-400 font-black uppercase tracking-[0.4em] animate-pulse">Neural Mapping in Progress</p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1/2 h-full bg-sky-500"
                       />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto h-full p-12 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {view === 'preview' ? (
              <motion.div 
                key="rendered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-none markdown-body"
              >
                <ReactMarkdown>{mainMarkdown}</ReactMarkdown>
                
                {extraDocs.length > 0 && (
                  <div className="mt-24 space-y-20 pb-20">
                     <div className="flex items-center gap-6">
                       <div className="h-px flex-1 bg-white/5" />
                       <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.5em] whitespace-nowrap">Integrated Expansion Suite</span>
                       <div className="h-px flex-1 bg-white/5" />
                     </div>
                     {extraDocs.map((doc, i) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={i} 
                        className="space-y-8"
                       >
                          <div className="flex items-center gap-4 text-sky-400 ml-4 group/doc">
                            <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 group-hover/doc:bg-sky-500/20 transition-colors">
                              <FileCode className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black font-display uppercase tracking-[0.2em]">{doc.name}</span>
                          </div>
                          <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-sm shadow-2xl relative overflow-hidden">
                            <ReactMarkdown>{doc.content}</ReactMarkdown>
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Terminal className="w-20 h-20" />
                            </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                <div className="absolute -top-6 -right-6 p-10 opacity-5 pointer-events-none">
                    <Terminal className="w-40 h-40 text-white" />
                </div>
                <pre className="font-mono text-sm text-slate-400 whitespace-pre-wrap leading-relaxed select-all selection:bg-sky-500/30 selection:text-white">
                  {markdown}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info / Commit Suggestion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between backdrop-blur-xl group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl group-hover:scale-110 transition-transform">
            <Github className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] leading-none mb-2">Protocol Commit Hash</p>
            <p className="text-sm text-slate-300 font-mono italic font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">"{commitSuggestion}"</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => copyToClipboard(commitSuggestion)}
          className="p-3 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
        >
          <Clipboard className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
