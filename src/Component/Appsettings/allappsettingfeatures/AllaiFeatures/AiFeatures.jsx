import React, { useRef } from 'react'
import { Sparkle, Clock, CaretRight } from "@phosphor-icons/react"
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
        <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-3xl p-5 sm:p-6  hover:border-gray-300 dark:hover:border-white/10 shadow-sm w-full">
            <div className="flex flex-col gap-6">

                {/* Top: AI Synthesis Engine */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-indigo-500 dark:text-indigo-400 shrink-0 shadow-sm">
                            <Sparkle size={20} weight="fill" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-200">AI Model Engine</h3>
                            <p className="text-[12px] text-gray-500">Used model in notes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-transparent">Gemini-3.5-flash-lite</span>
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-white/5 my-2 "></div>

                {/* Bottom: Auto-Save Timer (Preserved Feature) */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 max-w-2xl">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 shrink-0 shadow-sm">
                            <Clock size={20} weight="regular" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-0.5">
                                <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-200">Auto-Save Timer</h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-gray-200 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 rounded-md border border-gray-300 dark:border-white/5">Cloud Synced</span>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">Automatically save your notes after a period of inactivity.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end w-full lg:w-auto mt-2 lg:mt-0">
                        {/* Segmented Control */}
                        <div id="autoSaveTimer" ref={AutosaveTimeRef} className="flex items-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
                            {['off', '10000', '30000', '60000', '300000'].map((val) => {
                                const labels = { off: 'Off', '10000': '10s', '30000': '30s', '60000': '1m', '300000': '5m' };
                                return (
                                    <button
                                        key={val}
                                        onClick={handleAutosaveTimerChange}
                                        type="button"
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${currentTimer === val
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