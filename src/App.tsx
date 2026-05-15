import { Github, Star, Sparkles, BookOpen, User, LogOut, LayoutDashboard, Share2, ArrowLeft, Terminal, Wand2, Shield, Zap, Globe, Cpu, History as HistoryIcon, X, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Form from "./components/Form";
import Preview from "./components/Preview";
import { generateReadme } from "./lib/gemini";
import { auth, db } from "./lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, orderBy, getDocs, onSnapshot, deleteDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";

type Stage = "landing" | "generator";

interface HistoryItem {
  id: string;
  projectName: string;
  content: string;
  timestamp: any;
}

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");
  const [markdown, setMarkdown] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/view/")) {
      const id = path.split("/view/")[1];
      if (id) {
        setViewId(id);
        fetchHostedDoc(id);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, "generations"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setHistory(items);
    });

    return () => unsubscribeHistory();
  }, [user]);

  const fetchHostedDoc = async (id: string) => {
    try {
      const d = await getDoc(doc(db, "documents", id));
      if (d.exists()) setViewContent(d.data());
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setProjectName(data.name);
    try {
      const result = await generateReadme(data);
      setMarkdown(result);
      
      if (user) {
        await addDoc(collection(db, "generations"), {
          userId: user.uid,
          projectName: data.name,
          content: result,
          timestamp: serverTimestamp()
        });
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#38bdf8', '#7dd3fc']
      });
    } catch (error) {
      console.error("Failed to generate README:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHost = async () => {
    if (!user) {
      handleLogin();
      return null;
    }

    try {
      const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const docRef = await addDoc(collection(db, "documents"), {
        userId: user.uid,
        projectName,
        content: markdown,
        slug,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return `${window.location.origin}/view/${docRef.id}`;
    } catch (err) {
      console.error("Hosting error:", err);
      return null;
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setMarkdown(item.content);
    setProjectName(item.projectName);
    setShowHistory(false);
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "generations", id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (viewId && viewContent) {
    const filesParts = viewContent.content.split("---FILE_SEPARATOR---").filter(Boolean);
    const mainMarkdown = filesParts[0] || "";
    const extraDocs = filesParts.slice(1).map((doc: string) => {
      const lines = doc.trim().split("\n");
      const namePart = lines[0].replace(/[\[\]]/g, "").replace("---", "").trim() || "EXTRA.md";
      const content = lines.slice(1).join("\n");
      return { name: namePart, content };
    });

    return (
      <div className="min-h-screen bg-surface-bg text-white selection:bg-sky-500/30 font-sans">
        <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => window.history.pushState({}, "", "/")}
            className="flex items-center gap-3 text-slate-500 hover:text-white transition-all mb-16 group bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Return to Protocol</span>
          </motion.button>
          
          <div className="space-y-20">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-black/40 border border-white/10 rounded-[3rem] p-16 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/5 markdown-body"
            >
              <ReactMarkdown>{mainMarkdown}</ReactMarkdown>
            </motion.div>

            {extraDocs.length > 0 && (
              <div className="space-y-12 pb-32">
                <div className="flex items-center gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-[10px] uppercase font-bold text-sky-500/50 tracking-[0.6em] whitespace-nowrap">Integrated Documentation Suite</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                {extraDocs.map((doc: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={i} 
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 text-sky-400 ml-8">
                      <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black font-display uppercase tracking-[0.2em]">{doc.name}</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-[2.5rem] p-12 backdrop-blur-2xl markdown-body shadow-2xl ring-1 ring-white/5">
                      <ReactMarkdown>{doc.content}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg selection:bg-sky-500/30 animated-gradient">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      
      {/* Background Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-sky-600/10 blur-[200px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[1000px] h-[1000px] bg-indigo-600/10 blur-[200px] rounded-full" 
        />
      </div>

      <AnimatePresence mode="wait">
        {stage === "landing" ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Nav */}
            <nav className="absolute top-0 w-full max-w-screen-2xl mx-auto px-6 h-32 flex items-center justify-between">
               <div className="flex items-center gap-4 group">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Sparkles className="w-6 h-6 text-sky-400" />
                 </div>
                 <span className="text-2xl font-black text-white tracking-tight">Readme.AI</span>
               </div>
               <div className="flex items-center gap-6">
                 {user && (
                   <button 
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 backdrop-blur-xl transition-all"
                   >
                     <HistoryIcon className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Records</span>
                   </button>
                 )}
                 {user ? (
                   <div className="flex items-center gap-4 bg-white/5 px-2 py-2 pr-6 rounded-full border border-white/10 backdrop-blur-xl">
                      <img src={user.photoURL || ""} alt="user" className="w-8 h-8 rounded-full border border-white/20" />
                      <div className="text-left leading-none">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider mb-1">Access Granted</p>
                        <p className="text-xs text-slate-400 font-medium truncate max-w-[80px]">{user.displayName}</p>
                      </div>
                   </div>
                 ) : (
                   <button 
                    onClick={handleLogin}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-all border border-white/10 backdrop-blur-xl flex items-center gap-2"
                   >
                     <Github className="w-4 h-4" />
                     Sign Protocol
                   </button>
                 )}
               </div>
            </nav>

            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="max-w-4xl"
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 rounded-full border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shine">
                 <Zap className="w-3 h-3" />
                 Intelligence Protocol v2.5
               </div>
               <h1 className="text-[12vw] sm:text-9xl font-black text-white leading-[0.85] tracking-tight mb-10 font-display">
                 BEYOND<br /><span className="text-sky-500 text-glow">DOCS.</span>
               </h1>
               <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16 font-light">
                 Transform raw code into <span className="text-white font-medium">elite documentation suites</span>. 
                 Powered by Gemini 3 Flash for speed and precision.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setStage("generator")}
                   className="px-10 py-5 bg-sky-400 hover:bg-sky-300 text-black rounded-[2rem] text-lg font-black transition-all shadow-[0_20px_50px_rgba(14,165,233,0.3)] flex items-center gap-3"
                 >
                   Launch Interface
                   <Wand2 className="w-6 h-6" />
                 </motion.button>
                 <button className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 backdrop-blur-xl text-lg font-bold transition-all flex items-center gap-3">
                   Explore Source
                   <Github className="w-6 h-6" />
                 </button>
               </div>
            </motion.div>

            <div className="absolute bottom-12 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12 text-slate-500">
               {[
                 { icon: <Terminal />, text: "CLI READY" },
                 { icon: <Shield />, text: "ENTERPRISE" },
                 { icon: <Globe />, text: "MULTILINGUAL" },
                 { icon: <Cpu />, text: "GEMINI 3 FLASH" }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="generator"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 flex flex-col min-h-screen"
          >
             <nav className="w-full max-w-screen-2xl mx-auto px-6 h-28 flex items-center justify-between">
               <div 
                className="flex items-center gap-4 group cursor-pointer"
                onClick={() => setStage("landing")}
               >
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                 </div>
                 <span className="text-xl font-black text-white tracking-tight">Readme.AI</span>
               </div>
               
               <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interface Active</span>
               </div>
             </nav>
             
             {/* History Drawer Overlay */}
             <AnimatePresence>
               {showHistory && (
                 <div className="fixed inset-0 z-[100] flex justify-end">
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowHistory(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                   />
                   <motion.div 
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="relative w-full max-w-md bg-surface-bg border-l border-white/10 h-full flex flex-col shadow-2xl"
                   >
                     <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                       <div className="flex items-center gap-4">
                         <div className="p-2 bg-sky-500/10 rounded-lg">
                           <HistoryIcon className="w-5 h-5 text-sky-400" />
                         </div>
                         <div>
                           <h3 className="text-lg font-black text-white uppercase tracking-tight">Record Archive</h3>
                           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Personnel Operations</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setShowHistory(false)}
                         className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                       >
                         <X className="w-6 h-6" />
                       </button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                       {history.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                           <Clock className="w-12 h-12 mb-4" />
                           <p className="text-sm font-bold uppercase tracking-widest">No Records Detected</p>
                         </div>
                       ) : (
                         history.map((item) => (
                           <motion.div 
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleHistorySelect(item)}
                            className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                           >
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-xs font-black text-sky-400 uppercase tracking-widest truncate max-w-[200px]">{item.projectName}</span>
                               <button 
                                onClick={(e) => handleDeleteHistory(e, item.id)}
                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                             <p className="text-[10px] text-slate-500 font-mono">
                               {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Just now'}
                             </p>
                             <div className="mt-4 flex items-center gap-2">
                               <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full w-1/3 bg-sky-500/30" />
                               </div>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Restore</span>
                             </div>
                           </motion.div>
                         ))
                       )}
                     </div>
                   </motion.div>
                 </div>
               )}
             </AnimatePresence>

             <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 pb-12 grid lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4 flex flex-col">
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="flex-1 bg-black/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5 flex flex-col"
                 >
                   <Form onGenerate={handleGenerate} isGenerating={isGenerating} />
                 </motion.div>
               </div>

               <div className="lg:col-span-8 flex flex-col min-h-[600px]">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.6 }}
                   className="flex-1 bg-black/40 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5 flex flex-col overflow-hidden"
                 >
                   <Preview 
                    markdown={markdown} 
                    projectName={projectName}
                    isGenerating={isGenerating} 
                    onHost={handleHost}
                   />
                 </motion.div>
               </div>
             </main>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-20 py-8 border-t border-white/5 bg-black/40 backdrop-blur-xl mt-auto">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
               <div className="w-1.5 h-1.5 bg-sky-500 rounded-sm" />
               Logic: Optimized
             </div>
             <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
               <div className="w-1.5 h-1.5 bg-sky-500 rounded-sm" />
               Carrier: Secured
             </div>
          </div>
          <p className="text-[10px] text-slate-600 font-bold tracking-[0.2em] uppercase">
             Design Systems Protocol 08.2026 • © Readme.AI 
          </p>
          <div className="flex items-center gap-5">
             <Github className="w-4 h-4 text-slate-600 hover:text-white transition-all cursor-pointer" />
             <Share2 className="w-4 h-4 text-slate-600 hover:text-white transition-all cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

