const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", danger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1C1C1E] dark:border dark:border-white/10 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all animate-[fadeInScale_0.2s_ease-out]">
                <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5" style={{ backgroundColor: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
                    <svg className="w-7 h-7" style={{ color: danger ? '#EF4444' : '#F59E0B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-[#252528] transition duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl font-semibold transition duration-200 text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
