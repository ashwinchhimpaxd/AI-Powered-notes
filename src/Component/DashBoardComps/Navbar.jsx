// SideNavBar.jsx
import { Note, GearSix, Plus, X } from "@phosphor-icons/react";
import { useState } from "react";
import NotesCreationForm from "./NotesCreationForm";
import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
function SideNavBar({ isOpen, setIsOpen }) {
    const [NewNotesClick, setNewNotesClick] = useState(false);
    const location = useLocation();

    let activeIndex = 0;
    if (location.pathname.includes('/setting')) {
        activeIndex = 1;
    } else {
        activeIndex = 0;
    }

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <button
                    type="button"
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu backdrop"
                />
            )}

            <aside className={`fixed md:relative top-0 left-0 w-60 shrink-0 bg-background border-r border-border flex flex-col justify-between h-full z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Top Section */}
                <div>
                    {/* Logo Area & Mobile Close Button */}
                    <div className="p-6 pb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2 px-2">
                            {/* Glowing Orb Container */}
                            <div className="relative size-8 flex items-center justify-center shrink-0">
                               
                                <div className="relative size-7 rounded-full flex items-center justify-center ">
                                    <span className="text-[24px]">✨</span>
                                </div>
                            </div>

                            {/* MindSync Text */}
                            <h1 className="font-black text-[1.4rem] tracking-tighter bg-linear-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                                MindSync
                            </h1>
                        </div>
                        {/* Mobile Close Button */}
                        <button
                            type="button"
                            className="md:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex flex-col gap-1 px-3 relative">
                        {/* Animated Background */}
                        <div
                            className="absolute left-3 right-3 h-10.5 bg-card border border-border rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
                            style={{ transform: `translateY(calc(${activeIndex} * 2.625rem + ${activeIndex} * 0.25rem))` }}
                        />

                        <Link to={'/dashboard/recent-notes'} className="z-10">
                            <div className={`flex items-center gap-3 px-3 h-10.5 rounded-lg cursor-pointer group transition-colors ${activeIndex === 0 ? 'text-foreground' : 'text-muted-foreground  hover:text-foreground'}`}>
                                <Note className={`size-5 transition-colors ${activeIndex === 0 ? 'text-[#8b5cf6]' : 'group-hover:text-foreground'}`} weight={activeIndex === 0 ? "fill" : "regular"} />
                                <span className="font-medium text-sm">Notes</span>
                            </div>
                        </Link>


                        <Link to={'/dashboard/setting'} className="z-10">
                            <div className={`flex items-center gap-3 px-3 h-10.5 rounded-lg cursor-pointer group transition-colors ${activeIndex === 1 ? 'text-foreground' : 'text-muted-foreground  hover:text-foreground'}`}>
                                <GearSix className={`size-5 transition-colors ${activeIndex === 1 ? 'text-[#8b5cf6]' : 'group-hover:text-foreground'}`} weight={activeIndex === 1 ? "fill" : "regular"} />
                                <span className="font-medium text-sm">Settings</span>
                            </div>
                        </Link>
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="p-4">
                    <button
                        type="button"
                        onClick={() => {
                            setNewNotesClick(true);
                            if (setIsOpen) setIsOpen(false);
                        }}
                        className="w-full h-11 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="size-4" weight="bold" /> New Note
                    </button>
                </div>
            </aside>

            {NewNotesClick && <NotesCreationForm setNewNotesClick={setNewNotesClick} />}
        </>
    );
}

export default memo(SideNavBar);
