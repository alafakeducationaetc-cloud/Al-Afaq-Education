import React from 'react';
import { useApp } from '../../context/AppContext';

interface AitecLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'emblem-only' | 'horizontal' | 'badge';
  theme?: 'dark' | 'light' | 'gold';
  className?: string;
  showArabicSub?: boolean;
  customLogoUrl?: string;
}

export const AitecLogo: React.FC<AitecLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  className = '',
  showArabicSub = true,
  customLogoUrl,
}) => {
  // Try to read settings from context safely
  let platformSettings: any = null;
  try {
    const app = useApp();
    platformSettings = app.settings;
  } catch {
    platformSettings = null;
  }

  const activeLogoUrl = customLogoUrl || platformSettings?.logoUrl;
  const displayMode = platformSettings?.logoDisplayMode || (activeLogoUrl ? 'custom' : 'emblem');
  const customEnTitle = platformSettings?.logoTextEn || platformSettings?.platformName || 'AITEC';
  const customArTitle = platformSettings?.logoTextAr || platformSettings?.platformNameArabic || 'الآفاق الدولية للتدريب والاستشارات التربوية';
  // Dimensions
  const emblemSizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    '2xl': 'w-36 h-36 sm:w-44 sm:h-44',
  };

  const textSizes = {
    xs: { main: 'text-xs', sub: 'text-[9px]' },
    sm: { main: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { main: 'text-base sm:text-lg font-black', sub: 'text-[11px] sm:text-xs' },
    lg: { main: 'text-xl sm:text-2xl font-black', sub: 'text-xs sm:text-sm' },
    xl: { main: 'text-2xl sm:text-3xl font-black', sub: 'text-sm sm:text-base' },
    '2xl': { main: 'text-3xl sm:text-4xl font-black', sub: 'text-base sm:text-lg' },
  };

  // High precision SVG Emblem based on the official AITEC seal
  const EmblemSVG = (
    <div className={`relative flex-shrink-0 ${emblemSizes[size]} drop-shadow-md`}>
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="aitecNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#29235D" />
            <stop offset="50%" stopColor="#1E1A48" />
            <stop offset="100%" stopColor="#141033" />
          </linearGradient>

          <linearGradient id="aitecGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E6BE" />
            <stop offset="35%" stopColor="#D3B673" />
            <stop offset="70%" stopColor="#B38F43" />
            <stop offset="100%" stopColor="#8C6826" />
          </linearGradient>

          <linearGradient id="aitecGoldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2D1" />
            <stop offset="100%" stopColor="#C8A355" />
          </linearGradient>

          {/* Curved Text Paths */}
          {/* Top Arc for English: AL-Afak International For Training And Educational Consultants */}
          <path
            id="topTextPath"
            d="M 46,150 A 104,104 0 1,1 254,150"
            fill="none"
          />
          {/* Bottom Arc for Arabic: الآفاق الدولية للتدريب والاستشارات التربوية */}
          <path
            id="bottomTextPath"
            d="M 250,154 A 102,102 0 0,1 50,154"
            fill="none"
          />
          {/* Inner Arabic Arc */}
          <path
            id="innerArabicPath"
            d="M 218,172 A 74,74 0 0,1 82,172"
            fill="none"
          />
        </defs>

        {/* Outer Deep Navy Circle */}
        <circle cx="150" cy="150" r="144" fill="url(#aitecNavyGrad)" stroke="url(#aitecGoldGrad)" strokeWidth="5" />
        
        {/* Decorative Outer Beaded / Dashed Ring */}
        <circle cx="150" cy="150" r="141" fill="none" stroke="#D3B673" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />

        {/* Outer Circular Ring Text */}
        {/* Top English */}
        <text fill="#FFFFFF" fontSize="10.8" fontWeight="700" letterSpacing="0.8" fontFamily="'Arial', sans-serif">
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            AL-Afak International For Training And Educational Consultants
          </textPath>
        </text>

        {/* Bottom Arabic */}
        <text fill="url(#aitecGoldGrad)" fontSize="12.5" fontWeight="800" fontFamily="'Cairo', 'Amiri', sans-serif">
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            الآفاق الدولية للتدريب والاستشارات التربوية
          </textPath>
        </text>

        {/* Inner White / Ivory Disc */}
        <circle cx="150" cy="150" r="96" fill="#FFFFFF" stroke="url(#aitecGoldGrad)" strokeWidth="4" />
        <circle cx="150" cy="150" r="92" fill="none" stroke="#29235D" strokeWidth="1" opacity="0.3" />

        {/* Top Acronym Header: A I T E C */}
        <g transform="translate(150, 88)">
          {/* Ornamental horizontal flourishes */}
          <path d="M -58,-3 Q -30,-6 -12,-3 Q 0,-1 12,-3 Q 30,-6 58,-3" fill="none" stroke="url(#aitecGoldGrad)" strokeWidth="1.5" />
          <circle cx="-62" cy="-3" r="2" fill="#D3B673" />
          <circle cx="62" cy="-3" r="2" fill="#D3B673" />
          
          <text
            y="12"
            textAnchor="middle"
            fill="#B38F43"
            fontSize="18"
            fontWeight="900"
            fontFamily="'Times New Roman', 'Cinzel', serif"
            letterSpacing="5"
          >
            A I T E C
          </text>
          
          <path d="M -50,18 Q -25,20 -10,18 Q 0,17 10,18 Q 25,20 50,18" fill="none" stroke="url(#aitecGoldGrad)" strokeWidth="1.2" />
        </g>

        {/* Center Graphic: Swirling Galaxy Orbit + Graduating Scholars + Star */}
        <g transform="translate(150, 158)">
          {/* Gold Orbit Ellipse */}
          <ellipse
            cx="0"
            cy="0"
            rx="56"
            ry="24"
            fill="none"
            stroke="url(#aitecGoldGrad)"
            strokeWidth="3.5"
            transform="rotate(-28)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="50"
            ry="18"
            fill="none"
            stroke="#29235D"
            strokeWidth="1"
            opacity="0.3"
            transform="rotate(-28)"
          />

          {/* Golden Orbit Node Pearls */}
          <circle cx="-38" cy="14" r="3.5" fill="#D3B673" />
          <circle cx="42" cy="-14" r="3" fill="#D3B673" />

          {/* Central Scholars / Figures (Navy Blue stylized silhouettes) */}
          {/* Figure 1 - Left Teacher/Scholar */}
          <path
            d="M -16,14 C -20,2 -16,-10 -6,-16 C -3,-18 -1,-14 -4,-10 C -10,-4 -11,8 -6,14 Z"
            fill="#29235D"
          />
          {/* Head & Cap 1 */}
          <circle cx="-14" cy="-20" r="4.5" fill="#29235D" />
          {/* Graduation Cap */}
          <polygon points="-22,-24 -14,-27 -6,-24 -14,-21" fill="#D3B673" />
          <line x1="-20" y1="-23" x2="-22" y2="-19" stroke="#B38F43" strokeWidth="1" />

          {/* Figure 2 - Right Student/Graduate reaching upwards */}
          <path
            d="M 12,14 C 18,0 14,-12 4,-18 C 1,-20 0,-16 3,-12 C 9,-6 10,6 4,14 Z"
            fill="#29235D"
          />
          {/* Head & Cap 2 */}
          <circle cx="12" cy="-22" r="4.5" fill="#29235D" />
          {/* Graduation Cap */}
          <polygon points="4,-26 12,-29 20,-26 12,-23" fill="#D3B673" />
          <line x1="6" y1="-25" x2="4" y2="-21" stroke="#B38F43" strokeWidth="1" />

          {/* Center Achievement Star (Top of Aspirations) */}
          <g transform="translate(0, -32)">
            <polygon
              points="0,-8 2.4,-2.4 8,-2.4 3.5,1.2 5.2,7 0,3.5 -5.2,7 -3.5,1.2 -8,-2.4 -2.4,-2.4"
              fill="url(#aitecGoldGlow)"
              stroke="#B38F43"
              strokeWidth="0.8"
            />
          </g>

          {/* Base Swirl Ribbons */}
          <path
            d="M -32,18 C -14,24 14,24 32,18 C 20,26 -20,26 -32,18 Z"
            fill="url(#aitecGoldGrad)"
          />
        </g>

        {/* Inner Curved Arabic Label: الآفاق الدولية للتدريب والاستشارات */}
        <text fill="#B38F43" fontSize="8" fontWeight="bold" fontFamily="'Cairo', sans-serif">
          <textPath href="#innerArabicPath" startOffset="50%" textAnchor="middle">
            الآفاق الدولية للتدريب والاستشارات التربوية
          </textPath>
        </text>
      </svg>
    </div>
  );

  // Visual Logo Emblem component (either custom image or official SVG seal)
  const LogoVisual = activeLogoUrl && (displayMode === 'custom' || displayMode === 'combined') ? (
    <div className={`relative flex-shrink-0 ${emblemSizes[size]} drop-shadow-md rounded-full overflow-hidden border-2 border-[#D3B673] bg-[#29235D] flex items-center justify-center`}>
      <img
        src={activeLogoUrl}
        alt="Platform Logo"
        className="w-full h-full object-cover"
        onError={(e) => {
          // If custom URL fails to load, fallback
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  ) : (
    EmblemSVG
  );

  if (variant === 'emblem-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoVisual}</div>;
  }

  const isLight = theme === 'light';
  const primaryTextColor = isLight ? 'text-[#29235D]' : 'text-white';
  const subTextColor = isLight ? 'text-[#786F9A]' : 'text-[#E8D5A3]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {LogoVisual}

      <div className="flex flex-col text-left rtl:text-right">
        {/* Brand Main Title Lockup */}
        <div className="flex items-center gap-2">
          <span className={`${textSizes[size].main} ${primaryTextColor} font-serif tracking-wider leading-tight`}>
            {customEnTitle}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#D3B673]/15 text-[#B89955] border border-[#D3B673]/40 text-xs font-extrabold tracking-wide">
            الآفـاق الدوليـة
          </span>
        </div>

        {/* Subtitles & Descriptions */}
        <span className={`${textSizes[size].sub} font-semibold ${subTextColor} tracking-normal line-clamp-1`}>
          Al-Afak International For Training And Educational Consultants
        </span>

        {showArabicSub && (
          <span className="text-[10px] sm:text-[11px] font-bold text-[#8C6826] leading-tight mt-0.5 line-clamp-1">
            {customArTitle}
          </span>
        )}
      </div>
    </div>
  );
};
