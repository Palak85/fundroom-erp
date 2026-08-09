import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  const isDanger = type === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${isDanger ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          {isDanger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
