import { FileText, Github, Heart, MessageSquare, Terminal, Wand2, Search, Sparkles, Code2, Globe, Cpu, Zap, ScrollText, ListChecks, FileCode2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { analyzeRepo } from "../lib/gemini";

interface ProjectData {
  name: string;
  description: string;
  features: string;
  techStack: string;
  installation: string;
  usage: string;
  license: string;
  badges: string[];
  githubUrl?: string;
  files?: string[];
  template: string;
  language: string;
  roadmap: string[];
  supplemental: string[];
}

export default function Form({ 
  onGenerate, 
  isGenerating 
}: { 
  onGenerate: (data: ProjectData) => void;
  isGenerating: boolean;
}) {
  const [data, setData] = useState<ProjectData>({
    name: "",
    description: "",
    features: "",
    techStack: "",
    installation: "",
    usage: "",
    license: "MIT",
    badges: ["version", "license", "stars"],
    githubUrl: "",
    template: "Standard",
    language: "English",
    roadmap: [],
    supplemental: [],
  });

  const [roadmapItem, setRoadmapItem] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImport = async () => {
    if (!data.githubUrl) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeRepo(data.githubUrl);
      setData(prev => ({
        ...prev,
        name: analysis.name || prev.name,
        description: analysis.description || prev.description,
        techStack: analysis.techStack || prev.techStack,
        files: analysis.files,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const toggleBadge = (badge: string) => {
    setData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge) 
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
  };

  const addRoadmap = () => {
    if (!roadmapItem.trim()) return;
    setData(prev => ({ ...prev, roadmap: [...prev.roadmap, roadmapItem.trim()] }));
    setRoadmapItem("");
  };

  const removeRoadmap = (index: number) => {
    setData(prev => ({ ...prev, roadmap: prev.roadmap.filter((_, i) => i !== index) }));
  };

  const toggleSupplemental = (doc: string) => {
    setData(prev => ({
      ...prev,
      supplemental: prev.supplemental.includes(doc)
        ? prev.supplemental.filter(d => d !== doc)
        : [...prev.supplemental, doc]
    }));
  };

  const InputWrapper = ({ label, children, icon: Icon }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-3 h-3 text-sky-500/60" />}
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</label>
      </div>
      {children}
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <Cpu className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Architect</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-sm animate-pulse" />
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Logic Core Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Import Zone */}
      <div className="mb-10 p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
           <Github className="w-20 h-20 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
             <Github className="w-4 h-4 text-slate-500" />
             <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Repository Sync</span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              name="githubUrl"
              placeholder="https://github.com/..."
              value={data.githubUrl}
              onChange={handleChange}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all font-mono"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleImport}
              disabled={isAnalyzing || !data.githubUrl}
              className="px-6 py-3.5 bg-white text-black disabled:opacity-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-10 pb-24 overflow-y-auto pr-3 custom-scrollbar">
        
        {/* Core Identity */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Section 01 / Identity</span>
             <div className="h-px w-8 bg-white/5" />
          </div>

          <InputWrapper label="Project Designation" icon={Zap}>
            <input
              name="name"
              type="text"
              required
              placeholder="PROJECT_ID"
              value={data.name}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-lg font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/40 transition-all font-display"
            />
          </InputWrapper>

          <div className="grid grid-cols-2 gap-4">
            <InputWrapper label="Aesthetic Protocol" icon={Code2}>
              <select
                name="template"
                value={data.template}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none"
              >
                <option value="Standard">Standard</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Enterprise">Enterprise</option>
                <option value="CLI Pro">CLI Pro</option>
                <option value="Hero">Hero Visual</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Language Stack" icon={Globe}>
              <select
                name="language"
                value={data.language}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Chinese">Chinese</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
              </select>
            </InputWrapper>
          </div>

          <InputWrapper label="Executive Summary" icon={ScrollText}>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe the operational parameters..."
              value={data.description}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-none leading-relaxed text-sm"
            />
          </InputWrapper>
        </section>

        {/* Technical Specification */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Section 02 / Technical</span>
             <div className="h-px w-8 bg-white/5" />
          </div>

          <InputWrapper label="Technology Architecture" icon={Code2}>
            <input
              name="techStack"
              type="text"
              placeholder="React // Node // TS // Gemini"
              value={data.techStack}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-sky-400 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all tracking-wide"
            />
          </InputWrapper>

          <div className="grid grid-cols-2 gap-4">
            <InputWrapper label="Legal Protocol" icon={Shield}>
              <select
                name="license"
                value={data.license}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none"
              >
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL v3</option>
                <option value="Unlicense">Unlicense</option>
              </select>
            </InputWrapper>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Badges / Assets</label>
              <div className="flex flex-wrap gap-2">
                {['version', 'license', 'stars', 'forks', 'issues'].map(badge => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1.5 text-[9px] uppercase font-black rounded-lg border transition-all ${
                      data.badges.includes(badge)
                        ? "bg-sky-500 text-black border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                        : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {badge}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Roadmap */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Section 03 / Roadmap</span>
             <div className="h-px w-8 bg-white/5" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Declare new milestone..."
                value={roadmapItem}
                onChange={(e) => setRoadmapItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRoadmap())}
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-display"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="button"
                onClick={addRoadmap}
                className="px-6 py-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-sky-500/20 transition-all"
              >
                Inject
              </motion.button>
            </div>
            
            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {data.roadmap.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={i} 
                    className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full text-[11px] font-bold text-slate-400 group"
                  >
                    <ListChecks className="w-3 h-3 text-sky-500/50" />
                    {item}
                    <button 
                      type="button" 
                      onClick={() => removeRoadmap(i)} 
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </section>

        {/* Supplemental Expansion */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5" />
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Section 04 / Expansion</span>
             <div className="h-px w-8 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             {['CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'ARCHITECTURE.md'].map(doc => (
               <motion.button
                 whileHover={{ y: -2 }}
                 key={doc}
                 type="button"
                 onClick={() => toggleSupplemental(doc)}
                 className={`p-5 rounded-[1.5rem] border text-[10px] font-black uppercase text-left transition-all tracking-[0.1em] flex flex-col justify-between h-28 relative overflow-hidden group ${
                   data.supplemental.includes(doc)
                     ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.1)]"
                     : "bg-white/[0.02] text-slate-600 border-white/5 hover:border-white/10"
                 }`}
               >
                 <FileCode2 className={`w-6 h-6 mb-2 transition-colors ${data.supplemental.includes(doc) ? 'text-sky-400' : 'text-slate-700'}`} />
                 {doc}
                 <div className={`absolute top-0 right-0 w-12 h-12 bg-sky-500/10 blur-2xl transition-opacity ${data.supplemental.includes(doc) ? 'opacity-100' : 'opacity-0'}`} />
               </motion.button>
             ))}
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-10 sticky bottom-0 bg-transparent py-6 pb-2 pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isGenerating}
            className="w-full relative pointer-events-auto group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 text-black font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 border border-white/20">
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
                  <span className="uppercase tracking-[0.2em] text-sm">Synthesizing Protocol...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-black/80 group-hover:rotate-12 transition-transform" />
                  <span className="uppercase tracking-[0.2em] text-sm">Execute Synthesis</span>
                  <Wand2 className="w-6 h-6 text-black/80" />
                </>
              )}
            </div>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
