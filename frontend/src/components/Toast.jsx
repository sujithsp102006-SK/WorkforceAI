import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border bg-white text-slate-800 animate-slide-up transition-all max-w-md">
      <div className={`w-2.5 h-2.5 rounded-full ${isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-blue-500'}`} />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 text-xs px-1 font-bold"
      >
        ✕
      </button>
    </div>
  );
}
