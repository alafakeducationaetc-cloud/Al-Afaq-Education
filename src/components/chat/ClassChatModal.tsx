import React from 'react';
import { MessagingView } from './MessagingView';
import { X } from 'lucide-react';

interface ClassChatModalProps {
  initialThreadId?: string;
  initialIsGroup?: boolean;
  onClose: () => void;
}

export const ClassChatModal: React.FC<ClassChatModalProps> = ({
  initialThreadId,
  initialIsGroup,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-5xl h-[85vh] max-h-[850px] relative">
        <MessagingView
          initialThreadId={initialThreadId}
          initialIsGroup={initialIsGroup}
        />
        <button
          onClick={onClose}
          className="absolute top-3 left-3 rtl:left-auto rtl:right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
