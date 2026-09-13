import React, { useRef } from 'react'
import { Sparkle, SlidersHorizontal, Brain, BookOpenText, Clock } from "@phosphor-icons/react"
import { setSavingNoteTimer } from '@/redux/SettingConfig/SettingconfigSlice';
import { useSelector, useDispatch } from 'react-redux';
function AiFeatures() {
    const AutosaveTimeRef = useRef(null);
    const dispatch = useDispatch();
    const currentTimer = useSelector((state) => state.WebSettingConfig.SavingNoteTimer);


    const handleAutosaveTimerChange = (event) => {
        const value = setSavingNoteTimer(event.target.dataset.value);
        dispatch(value);
    }


    return (
        <section className="relative overflow-hidden group bg-card/80 backdrop-blur-2xl border border-border rounded-3xl p-6 sm:p-10 transition-all duration-500 hover:border-primary/50 shadow-sm">
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] opacity-50 pointer-events-none group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700"></div>

            <div className="relative z-10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 border-b border-border pb-6 w-full text-left">
                    <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30 w-fit">
                        <Sparkle size={32} weight="fill" className="text-primary block drop-shadow-md" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                            <SlidersHorizontal size={14} weight="bold" />
                            Preferences
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-wide">AI Capabilities</h2>
                        <p className="text-sm text-muted-foreground mt-1">Manage and configure your smart assistant preferences</p>
                    </div>
                </div>

                {/* Feature 3: Auto-Save Note Timer */}
                <div className="bg-background/50 border mb-5 border-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 group/card relative overflow-hidden ">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity"></div>

                    <div className="flex items-start gap-4 relative z-10 max-w-md ">
                        <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover/card:scale-110 transition-transform w-fit shrink-0">
                            <Clock size={25} weight="fill" className="block" />
                        </div>
                        <div className="text-left ">
                            <h3 className="text-foreground font-bold text-xl">Auto-Save Timer</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Automatically save your notes after a period of inactivity to prevent data loss.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 relative z-10 shrink-0 self-end lg:self-center">
                        {/* Segmented Control */}
                        <div id="autoSaveTimer" ref={AutosaveTimeRef} className="flex items-center bg-black/20 dark:bg-muted/65 border border-border p-1 rounded-xl">
                            <button onClick={handleAutosaveTimerChange} type="button"
                                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${currentTimer === "off"
                                    ? "bg-background dark:bg-card border border-border shadow-sm text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                data-value="off">Off</button>

                            <button onClick={handleAutosaveTimerChange} type="button"
                                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${currentTimer === "10000"
                                    ? "bg-background dark:bg-card border border-border shadow-sm text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                data-value="10000">10s</button>

                            <button onClick={handleAutosaveTimerChange} type="button"
                                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${currentTimer === "30000"
                                    ? "bg-background dark:bg-card border border-border shadow-sm text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                data-value="30000">30s</button>

                            <button onClick={handleAutosaveTimerChange} type="button"
                                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${currentTimer === "60000"
                                    ? "bg-background dark:bg-card border border-border shadow-sm text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                data-value="60000">1m</button>


                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 hidden">
                    {/* Feature 1 */}
                    <div className="bg-background/50 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 group/card cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover/card:scale-110 transition-transform">
                                <Brain size={24} weight="fill" className="block" />
                            </div>
                            {/* Toggle Switch On (Primary) */}
                            <div className="w-14 h-7 bg-primary rounded-full relative shadow-sm transition-colors mt-1">
                                <div className="absolute right-1 top-1 w-5 h-5 bg-primary-foreground rounded-full shadow-md transition-transform transform translate-x-0"></div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-foreground font-semibold text-lg">Smart Suggestions</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Contextual AI-powered writing suggestions as you type your notes to boost productivity.</p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-background/50 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 group/card cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-muted/30 rounded-bl-full pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover/card:scale-110 transition-transform border border-border">
                                <BookOpenText size={24} weight="fill" className="block" />
                            </div>
                            {/* Toggle Switch Off (Muted) */}
                            <div className="w-14 h-7 bg-muted rounded-full relative border border-border transition-colors mt-1 group-hover/card:bg-muted/80">
                                <div className="absolute left-1 top-1 w-5 h-5 bg-muted-foreground/30 rounded-full shadow-md transition-transform transform translate-x-0 group-hover/card:bg-muted-foreground/50"></div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-foreground/80 font-semibold text-lg group-hover/card:text-foreground transition-colors">Auto Summarize</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed transition-colors">Automatically generate concise bulleted summaries for long documents and research notes.</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default AiFeatures