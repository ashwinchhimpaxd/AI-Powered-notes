import React, { useState, useEffect, useCallback } from "react";
import userAuthService from "@/AppWrite/auth";
import { useDispatch } from "react-redux";
import { login } from "@/redux/Authantication/UserAuthanticationSlice.js";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { EnvelopeSimple, Key, GoogleLogo, ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { showToast } from "../Editor/utils/showToast.js";
import { handleError } from "@/utils/errorHandler.js";
const LoginUsingOTP = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const formMethods = useForm({
        defaultValues: {
            Email: '',
            OTP: ''
        }
    });
    const { register, handleSubmit, getValues, trigger, setError, formState: { errors, isSubmitting } } = formMethods;

    const [cooldown, setCooldown] = useState(0);
    const [otpUserId, setOtpUserId] = useState(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);


    const OnSendOtp = useCallback(async () => {

        const isValid = await trigger("Email");
        if (!isValid) return false;
        const Email = getValues("Email");

        try {

            const otpData = await userAuthService.sendOtp(Email);

            if (otpData) {
                setOtpUserId(otpData.userId);
                showToast("success", "OTP sent successfully");
                return true;
            }

            throw Error("an error occur while sending OTP")

        } catch (error) {
            handleError(error)
            return false;
        }

    }, [trigger, getValues]); // Dependencies

    const handleSendOTPClick = useCallback(
        async () => {
            if (cooldown > 0) return;
            const success = await OnSendOtp();
            if (success) {
                setCooldown(60);
            }
        },
        [cooldown, OnSendOtp] // cooldown: guard check ke liye, OnSendOtp: function reference
    )
    const onSubmit = async (data) => {
        try {
           
            const Userlogin = await userAuthService.verifyOtp(otpUserId, String(data.OTP), "");
            if (Userlogin) {
                // Fetch actual User object to have correct user details and user $id
                const currentUser = await userAuthService.getCurrentUser();
                dispatch(login({ UserData: { userdetaild: currentUser || Userlogin } }));
                navigate("/Dashboard");
            }
        } catch (error) {
            setError("OTP", {
                type: "manual",
                message: "Invalid OTP. Please check and try again."
            });
        }
    };

    // google login 
    const handleGoogleLogin = async () => {
        try {
            await userAuthService.loginWithGoogle();
        } catch (error) {
            console.log(error)
            handleError(error, { action: "Fail to login by google" })
        }
    };


    return (
        <div className="bg-[#0a0a0a] min-h-screen w-full flex flex-col justify-between font-sans text-foreground selection:bg-purple-500/30">
            {/* Header / Logo */}
            <div className="pt-12 md:pt-20 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">MindSync</h1>
                <p className="text-[#a1a1aa] text-sm md:text-base">Cognitive Workspace for Deep Thought</p>
            </div>

            {/* Main Form Container */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-3">
                <div className="bg-[#121212] border border-[#262626] rounded-xl w-full max-w-105 p-8  shadow-2xl">

                    <h2 className="text-2xl font-semibold mb-1 text-white">Welcome back</h2>
                    <p className="text-[#a1a1aa] text-sm mb-8">Enter your details to continue.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="login-email" className="text-sm font-medium text-[#e5e5e5] block">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeSimple className="h-5 w-5 text-[#a1a1aa]" />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("Email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full h-11 bg-background border border-[#262626] text-foreground rounded-lg pl-10 pr-4 text-sm focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors outline-none placeholder:text-[#52525b]"
                                />
                            </div>
                            {errors.Email && <p className="text-xs text-red-500 mt-1">{errors.Email.message}</p>}
                        </div>

                        {/* OTP Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="login-otp" className="text-sm font-medium text-[#e5e5e5] block">
                                    OTP
                                </label>
                                <button
                                    type="button"
                                    onClick={handleSendOTPClick}
                                    disabled={cooldown > 0}
                                    className={`text-sm font-medium transition-colors ${cooldown > 0 ? "text-[#52525b] cursor-not-allowed" : "text-[#c4b5fd] hover:text-[#ddd6fe]"}`}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-[#a1a1aa]" />
                                </div>
                                <input
                                    id="login-otp"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    {...register("OTP", {
                                        required: "OTP is required",
                                        minLength: { value: 6, message: "OTP must be 6 digits" }
                                    })}
                                    className="w-full h-11 bg-background border border-[#262626] text-foreground rounded-lg pl-10 pr-4 text-sm tracking-widest focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-colors outline-none placeholder:text-[#52525b] placeholder:tracking-normal"
                                />
                            </div>
                            {errors.OTP && <p className="text-xs text-red-500 mt-1">{errors.OTP.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 mt-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <CircleNotch className="animate-spin h-5 w-5" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="h-4 w-4 font-bold" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#262626]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#121212] px-2 text-[#a1a1aa] font-medium">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* <button type="button" className="flex items-center justify-center gap-2 h-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm font-medium text-[#e5e5e5] hover:bg-[#262626] transition-colors">
                            <GithubLogo className="h-5 w-5" /> GitHub
                        </button> */}
                        <button
                            onClick={handleGoogleLogin}
                            type="button" className="flex items-center justify-center gap-2 h-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-sm font-medium text-[#e5e5e5] hover:bg-[#262626] transition-colors">
                            <GoogleLogo className="h-5 w-5" /> Google
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {/* <div className="border-t border-[#262626] bg-[#0a0a0a] py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-[#52525b] uppercase tracking-wider">
                <p>© 2024 DEEP FOCUS AI. DESIGNED FOR PEAK COGNITIVE PERFORMANCE.</p>
                <div className="flex gap-4 md:gap-6">
                    <a href="/privacy" className="hover:text-[#a1a1aa] transition-colors">PRIVACY</a>
                    <a href="/terms" className="hover:text-[#a1a1aa] transition-colors">TERMS</a>
                    <a href="/support" className="hover:text-[#a1a1aa] transition-colors">SUPPORT</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#a1a1aa] transition-colors">GITHUB</a>
                </div>
            </div> */}
        </div>
    );
};

export default LoginUsingOTP;
