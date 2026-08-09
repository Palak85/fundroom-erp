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
        <div className={`p-3 rounded-2xl flex-shrink-0 ${isDanger ? 'bg-[#FDF2F4] text-[#D30F38] border border-[#F9CCD4]' : 'bg-[#EEF2FC] text-[#5E72C6] border border-[#D5DEF7]'}`}>
          {isDanger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#2D3139] leading-relaxed font-medium">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#EEF0F6]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-outlined"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={isDanger ? 'btn-danger' : 'btn-primary'}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
