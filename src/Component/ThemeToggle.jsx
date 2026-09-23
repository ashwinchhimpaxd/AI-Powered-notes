import React from "react";
import { Sun, Moon, Pen, Desktop, CheckCircle } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-3xl p-5 sm:p-6  hover:border-gray-300 dark:hover:border-white/10 shadow-sm w-full">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-10">

                {/* Left Header Section */}
                <div className="flex flex-col items-start gap-2 shrink-0 w-full md:w-64 lg:w-72 mt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-300 text-[11px] font-bold uppercase tracking-wider">
                        <Pen size={14} weight="bold" />
                        Appearance
                    </div>

                    <div className="text-left w-full mt-1">
                        <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-200 tracking-tight">Theme Preferences</h2>
                    </div>
                </div>

                {/* Right Interactive Section */}
                <div className='w-full flex-1'>
                    <div className="flex flex-col items-end gap-6">

                        {/* Top Toggle Row */}
                        <div className="bg-gray-50 dark:bg-[#0a0a0a] border w-full border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 shrink-0 shadow-sm">
                                    {theme === "dark" ? (
                                        <Moon size={20} weight="fill" className="text-indigo-400" />
                                    ) : (
                                        <Sun size={20} weight="fill" className="text-amber-500" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-200">Theme Mode</h3>
                                    <p className="text-[12px] text-gray-500 capitalize">{theme} Mode Active</p>
                                </div>
                            </div>

                            {/* Visual Toggle Switch */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${theme === "dark" ? "bg-indigo-500" : "bg-gray-300 dark:bg-[#2a2a2a]"} shadow-inner`}
                                aria-label="Toggle Theme"
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}

export default ThemeToggle;
