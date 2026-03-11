import { useNavigate, useLocation } from "react-router-dom";

const FloatingHelp = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <button
            onClick={() => navigate("/help", { state: { returnTo: location.pathname } })}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 dark:bg-orange-600 dark:hover:bg-orange-700"
            title="Help & Support"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
};

export default FloatingHelp;
