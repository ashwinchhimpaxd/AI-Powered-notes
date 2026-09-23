import React, { useRef } from 'react'
import { Sparkle, Clock, CaretUpDown } from "@phosphor-icons/react"
import { setSavingNoteTimer } from '@/redux/SettingConfig/SettingconfigSlice';
import { useSelector, useDispatch } from 'react-redux';

function AiFeatures() {
    const AutosaveTimeRef = useRef(null);
    const dispatch = useDispatch();
    const currentTimer = useSelector((state) => state.WebSettingConfig.SavingNoteTimer);

    const handleAutosaveTimerChange = (event) => {
        const value = setSavingNoteTimer(event.target.dataset.value);
        console.log(value)
        dispatch(value);
    }

    return (
        <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-3xl p-4 sm:p-6 hover:border-gray-300 dark:hover:border-white/10 shadow-sm w-full">
            <div className="flex flex-col gap-5 sm:gap-6">

                {/* Top: AI Synthesis Engine */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-indigo-500 dark:text-indigo-400 shrink-0 shadow-sm">
                            <Sparkle size={20} weight="fill" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-gray-200">AI Model Engine</h3>
                            <p className="text-[11px] sm:text-[12px] text-gray-500">Used model in notes</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/5 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                            <span className="text-[12px] sm:text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">Gemini-3.5-flash-lite</span>
                        </div>
                        <CaretUpDown size={14} className="text-gray-500" />
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-white/5 my-1 sm:my-2 h-px"></div>

                {/* Bottom: Auto-Save Timer (Preserved Feature) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 shrink-0 shadow-sm mt-0.5">
                            <Clock size={20} weight="regular" />
                        </div>
                        <div className="text-left">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-0.5">
                                <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-gray-200">Auto-Save Timer</h3>
                                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide bg-gray-200 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 rounded-md border border-gray-300 dark:border-white/5">Cloud Synced</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] text-gray-500 leading-relaxed">Automatically save your notes after a period of inactivity.</p>
                        </div>
                    </div>

                    <div className="w-full">
                        {/* Segmented Control */}
                        <div id="autoSaveTimer" ref={AutosaveTimeRef} className="flex items-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-1.5 rounded-xl w-full justify-between gap-1">
                            {['off', '10000', '30000', '60000', '300000'].map((val) => {
                                const labels = { off: 'Off', '10000': '10s', '30000': '30s', '60000': '1m', '300000': '5m' };
                                return (
                                    <button
                                        key={val}
                                        onClick={handleAutosaveTimerChange}
                                        type="button"
                                        className={`px-2 py-2 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all flex-1 text-center ${currentTimer === val
                                            ? "bg-white text-gray-900 shadow-sm border border-gray-200 dark:border-transparent dark:bg-[#2a2a2a] dark:text-white"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 dark:hover:text-gray-300 dark:hover:bg-white/5"
                                            }`}
                                        data-value={val}
                                    >
                                        {labels[val]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default AiFeatures;