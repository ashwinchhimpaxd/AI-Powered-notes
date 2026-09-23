import { useEffect } from 'react';
import UserEmailNamechanges from './allappsettingfeatures/UserEmailNamechanges';
import AiFeatures from './allappsettingfeatures/AllaiFeatures/AiFeatures';
import ThemeToggle from '../ThemeToggle';
import userAuthService from '../../AppWrite/auth';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { logout } from '../../redux/Authantication/UserAuthanticationSlice';
import { clearNotes } from '../../redux/NotesCreation/NotesCreationSlice';
import { SignOut } from "@phosphor-icons/react";
import { showToast } from '../Editor/utils/showToast.js';

function Appsetting() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            let success = await userAuthService.logoutFromCurrentdevice();
            if (success) {
                showToast("success", "Successfully logout from current device");
            }
        } catch (error) {
            showToast("warning", "Logout encountered an issue, but you have been signed out locally.");
        } finally {
            dispatch(clearNotes());
            dispatch(logout());
            navigate("/Login");
        }
    }

    return (
        <div className='flex-1 w-full min-h-screen relative text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8   overflow-y-auto slide-in '>
            <div className='w-full max-w-5xl space-y-6 relative z-10'>
                
                {/* 1. Profile Section */}
                <UserEmailNamechanges />

                {/* 2. Appearance Section */}
                <ThemeToggle />

                {/* 3. AI Features Section */}
                <AiFeatures />

                {/* Logout Button */}
                <div className="flex justify-end pt-4 w-full">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-500 dark:text-red-400 rounded-xl font-medium transition-all duration-300 shadow-sm cursor-pointer text-sm"
                    >
                        <SignOut className="text-lg" weight="bold" />
                        <span>Sign Out</span>
                    </button>
                </div>
                
                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center w-full pt-16 pb-8 text-[13px] text-gray-400 dark:text-gray-500 font-medium">
                    <div>MindSync Desktop v2.4.0-pro (Build 8204)</div>
                    
                </div>
            </div>
        </div>
    )
}

export default Appsetting;