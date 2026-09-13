import { useNavigate } from "react-router-dom";
import userAuthService from '@/AppWrite/auth';
import { showToast } from '../Component/Editor/utils/showToast.js';
import { Sparkle, ArrowRight, TreeStructure, MagnifyingGlass, FileText } from "@phosphor-icons/react";


function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = async () => {
        try {
            const user = await userAuthService.getCurrentUser();
            if (user) {
                navigate("/dashboard");
            } else {
                navigate("/login");
            }
        } catch (error) {
            if (error?.code !== 401 && error?.response?.status !== 401) {
                showToast("error", "Something went wrong. Please try again.");
            }
            navigate("/login");
        }
    };

    return (
        <div id='Home' className="min-h-screen bg-background text-foreground selection:bg-[#a855f7]/30 selection:text-white font-sans relative overflow-x-hidden">
            {/* Background gradient effects */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-125 bg-[#7e22ce]/20 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Navbar */}
            <nav className="flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto relative z-10">
                <div className="font-bold text-xl md:text-2xl tracking-tight flex items-center gap-2 cursor-pointer">
                    Mind Sync
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
                    <button type="button" onClick={handleGetStarted} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                        Start Writing
                    </button>
                </div>
                <div className="md:hidden">
                    <button type="button" onClick={handleGetStarted} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                        Start
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-24 relative z-10 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="flex items-center gap-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full px-4 py-1.5 mb-8">
                    <Sparkle size={14} className="text-[#a855f7]" weight="fill" />
                    <span className="text-sm font-medium text-[#c304d1] bg-gradient-to-r
  from-violet-400
  via-purple-400
  via-fuchsia-400
  via-purple-500
  to-indigo-500
  bg-clip-text
  text-transparent mix-blend-difference">
                        Deep Focus AI v2.0 Live
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight mb-6 max-w-4xl leading-tight text-foreground">
                    AI organizes your notes instantly
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
                    1-click structuring for peak cognitive performance.<br className="hidden md:block" />
                    Clear the clutter, find your flow state.
                </p>

                {/* CTA */}
                <button type="button" onClick={handleGetStarted} className="group bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]">
                    Start Writing
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* App Mockup */}
                <div className="mt-20 w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative">
                    {/* subtle glow behind mockup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#8b5cf6]/5 blur-[100px] pointer-events-none"></div>

                    <div className="flex items-center gap-2 px-4 py-3 bg-background border-b border-border relative z-10">
                        <div className="w-3 h-3 rounded-full bg-border"></div>
                        <div className="w-3 h-3 rounded-full bg-border"></div>
                        <div className="w-3 h-3 rounded-full bg-border"></div>
                    </div>
                    <div className="p-4 md:p-8 flex flex-col md:flex-row gap-6 h-[300px] md:h-[400px] relative z-10">
                        {/* Mockup Editor Content */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="w-3/4 h-8 bg-muted/40 rounded-md"></div>
                            <div className="w-full h-4 bg-muted/40 rounded-md mt-4"></div>
                            <div className="w-5/6 h-4 bg-muted/40 rounded-md"></div>
                            <div className="w-4/6 h-4 bg-muted/40 rounded-md"></div>
                            <div className="mt-auto w-full h-12 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg flex items-center px-4 gap-3">
                                <Sparkle className="text-[#a855f7]" weight="fill" />
                                <div className="w-1/2 h-4 bg-[#8b5cf6]/20 rounded-md"></div>
                            </div>
                        </div>
                        {/* Mockup Sidebar */}
                        <div className="hidden md:flex w-64 flex-col gap-4">
                            <div className="w-24 h-6 bg-muted/40 rounded-md"></div>
                            <div className="w-full h-24 bg-muted/40 rounded-lg"></div>
                            <div className="w-full h-24 bg-muted/40 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left">
                    {/* Feature 1 */}
                    <div className="bg-card border border-border p-8 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                        <div className="w-12 h-12 bg-[#302844] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <TreeStructure size={24} className="text-[#d8b4fe]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground">Structure messy notes instantly</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">Transform chaotic brain dumps into organized outlines with a single click.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-card border border-border p-8 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                        <div className="w-12 h-12 bg-[#302844] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MagnifyingGlass size={24} className="text-[#d8b4fe]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground">Smart AI search across notes</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">Find concepts, not just keywords. Semantic search understands your intent.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-card border border-border p-8 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                        <div className="w-12 h-12 bg-[#302844] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText size={24} className="text-[#d8b4fe]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-foreground">Summarize key points</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">Generate executive summaries and action items from long-form content automatically.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            {/* <footer className="max-w-7xl mx-auto px-6 md:px-12 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 font-medium">
                <p className="uppercase tracking-widest text-center md:text-left">© 2024 DEEP FOCUS AI. DESIGNED FOR PEAK COGNITIVE PERFORMANCE.</p>
                <div className="flex flex-wrap justify-center gap-6 uppercase tracking-widest">
                    <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Github</a>
                </div>
            </footer> */}
        </div>
    );
}

export default LandingPage;