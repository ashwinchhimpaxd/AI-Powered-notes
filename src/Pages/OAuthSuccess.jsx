import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import userAuthService from "@/AppWrite/auth.js";
import { login } from "@/redux/Authantication/UserAuthanticationSlice.js";

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [error, setError] = useState("");

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            try {
                const params = new URLSearchParams(window.location.search);

                const userId = params.get("userId");
                const secret = params.get("secret");

                if (!userId || !secret) {
                    throw new Error("Missing OAuth credentials in URL.");
                }

                // Google se mile credentials se Appwrite session create
                await userAuthService.createOAuthSession(userId, secret);

                // Current user fetch
                const currentUser = await userAuthService.getCurrentUser();
                console.log(currentUser)

                if (!currentUser) {
                    throw new Error("Unable to get logged-in user");
                }

                // Redux mein login state update
                dispatch(
                    login({
                        UserData: {
                            userdetaild: currentUser,
                        },
                    })
                );

                // Dashboard
                navigate("/dashboard", { replace: true });

            } catch (error) {
                console.error("Google OAuth Error:", error);
                setError(
                    error.message || "Google login failed"
                );
            }
        };

        handleOAuthSuccess();
    }, [dispatch, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">
                        Google Login Failed
                    </h2>

                    <p className="text-gray-400 mb-5">
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/Login")}
                        className="px-4 py-2 bg-purple-600 rounded-lg"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center ">
           
        </div>
    );
};

export default OAuthSuccess;