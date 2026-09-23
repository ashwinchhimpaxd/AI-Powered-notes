import { User, EnvelopeSimple, Pen, Star } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';

function UserEmailNamechanges() {
    const navigate = useNavigate();
    const { name, email, emailVerification } = useSelector((state) => state.UserAuthantication.UserData?.userdetaild || {});

    return (
        <section className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-3xl p-4 sm:p-6 hover:border-gray-300 dark:hover:border-white/10 shadow-sm w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-10">

                {/* Left Profile Header Section */}
                <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 sm:gap-5 shrink-0 w-full lg:w-64 xl:w-72 mt-2">
                    {/* Avatar Block */}
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 shadow-sm">
                            <User size={32} className="sm:w-9 sm:h-9" weight="regular" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-1 sm:p-1.5 rounded-lg shadow-md border border-white dark:border-[#121212]">
                            <Star size={12} className="sm:w-3.5 sm:h-3.5" weight="fill" />
                        </div>
                    </div>

                    <div className="text-left w-full lg:mt-1">
                        <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-gray-200 tracking-tight">Your Profile</h2>
                        <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-2 leading-relaxed max-w-[200px] sm:max-w-none">
                            This is how you appear to others. Keep your details up to date.
                        </p>
                    </div>

                </div>

                {/* Right Info Display Section (Nested List Card) */}
                <div className='w-full flex-1 min-w-0'>
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-2 flex flex-col gap-1">

                        {/* Name Row */}
                        <div className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 shrink-0">
                                    <User size={18} className="sm:w-5 sm:h-5" weight="regular" />
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-500 font-bold tracking-wider uppercase mb-0.5">Name</span>
                                    <span className={`text-[14px] sm:text-[15px] font-semibold tracking-wide truncate ${!name ? "text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-gray-200"}`}>
                                        {name || "UserName"}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => navigate('/profile/edit')} className="text-indigo-600 dark:text-indigo-400 text-[12px] sm:text-[13px] font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors sm:mr-2">
                                Edit
                            </button>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-white/5 px-4 h-px"></div>

                        {/* Email Row */}
                        <div className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 shrink-0">
                                    <EnvelopeSimple size={18} className="sm:w-5 sm:h-5" weight="regular" />
                                </div>
                                <div className="flex flex-col text-left min-w-0 flex-1">
                                    <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-500 font-bold tracking-wider uppercase mb-0.5">Email</span>
                                    <div className="flex flex-row items-center gap-2 sm:gap-3">
                                        <span className={`text-[14px] sm:text-[15px] font-semibold tracking-wide truncate ${!email ? "text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-gray-200"}`}>
                                            {email || "User1234@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider shrink-0 ${emailVerification ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20" : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20"} rounded-md`}>
                                {emailVerification ? "verified" : "unverified"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UserEmailNamechanges;