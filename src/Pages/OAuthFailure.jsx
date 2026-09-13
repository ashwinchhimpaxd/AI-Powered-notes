import { useNavigate } from "react-router-dom";

const OAuthFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                    Google Login Failed
                </h2>

                <p className="text-gray-400 mb-5">
                    We couldn't sign you in with Google.
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
};

export default OAuthFailure;