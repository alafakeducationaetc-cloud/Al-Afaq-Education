import React, { useState } from 'react';
import { Activity } from '../../types';
import { useI18n } from '../../lib/i18n';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Code,
  Play,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ActivityPlayerProps {
  activity: Activity;
  onClose?: () => void;
}

export const ActivityPlayer: React.FC<ActivityPlayerProps> = ({ activity, onClose }) => {
  const { t, isRTL } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // for reload
  const [activeTab, setActiveTab] = useState<'PLAY' | 'CODE'>('PLAY');
  const [editableCode, setEditableCode] = useState(activity.customCodeHtml || '');

  const handleRestart = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-[#29235D]/15 shadow-xl overflow-hidden flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen'
          : 'h-[750px] max-h-[85vh]'
      }`}
    >
      {/* Player Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] transition-all"
              title="Back to Library"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#E8D5A3] font-serif">
                {isRTL ? activity.nameArabic || activity.name : activity.name}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D3B673] text-[#29235D]">
                {activity.code}
              </span>
            </div>
            <p className="text-[11px] text-white/70 line-clamp-1">
              {isRTL ? activity.descriptionArabic || activity.description : activity.description}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          {/* Sandbox Security Badge */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Sandbox</span>
          </div>

          {/* Mode Switch (Play / Code Inspector) */}
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('PLAY')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                activeTab === 'PLAY'
                  ? 'bg-[#D3B673] text-[#29235D]'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Play</span>
            </button>
            <button
              onClick={() => setActiveTab('CODE')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                activeTab === 'CODE'
                  ? 'bg-[#D3B673] text-[#29235D]'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Reload Game */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            title="Restart Activity"
          >
            <RotateCcw className="w-4 h-4 text-[#D3B673]" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#1D1845] overflow-hidden">
        {activeTab === 'PLAY' ? (
          /* Secure Isolated Sandboxed Iframe (preventing access to parent or credentials) */
          <iframe
            key={key}
            title={activity.name}
            srcDoc={editableCode}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-0 bg-transparent"
          />
        ) : (
          /* Live Custom Code Inspector & Editor */
          <div className="w-full h-full flex flex-col bg-[#0F0D24] text-white p-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-3 mb-2 border-b border-white/10">
              <span className="text-[#D3B673] font-bold">
                HTML / CSS / JavaScript Sandboxed Source Code
              </span>
              <button
                onClick={() => {
                  setActiveTab('PLAY');
                  setKey(prev => prev + 1);
                }}
                className="px-3 py-1 bg-[#D3B673] text-[#29235D] font-bold rounded-lg hover:bg-[#E8D5A3] transition-all"
              >
                Run Updated Code
              </button>
            </div>
            <textarea
              value={editableCode}
              onChange={e => setEditableCode(e.target.value)}
              className="flex-1 w-full bg-black/40 text-emerald-400 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#D3B673] font-mono text-xs leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="p-3 bg-[#F8F6F0] border-t border-[#29235D]/10 flex items-center justify-between text-xs text-[#786F9A] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#29235D]">Category: {activity.category}</span>
          <span>•</span>
          <span>Level: {activity.level}</span>
          <span>•</span>
          <span>Creator: {activity.creatorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-[#D3B673]" />
          <span className="font-bold text-[#29235D]">{activity.playCount} Plays</span>
        </div>
      </div>
    </div>
  );
};
