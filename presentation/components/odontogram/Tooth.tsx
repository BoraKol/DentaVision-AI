import React, { useMemo } from 'react';

interface ToothProps {
    id: string; // ISO format (e.g., "11", "48")
    isDeciduous?: boolean; // Süt dişi mi?
    treatments?: {
        surface: string; // 'M', 'O', 'D', 'B', 'L', 'Root', 'General'
        status: 'planned' | 'completed' | 'existing';
        color?: string;
        isAi?: boolean; // AI Recommended finding
        procedureName?: string;
    }[];
    onSurfaceClick?: (surface: string) => void;
    selectedSurfaces?: string[];
}

const Tooth: React.FC<ToothProps> = ({
    id,
    isDeciduous = false,
    treatments = [],
    onSurfaceClick,
    selectedSurfaces = []
}) => {
    const quadrant = parseInt(id.charAt(0));
    const position = parseInt(id.charAt(1));

    // Determine Tooth Type
    const type = useMemo(() => {
        if (position <= 2) return 'incisor';
        if (position === 3) return 'canine';
        if (position <= 5) return 'premolar';
        return 'molar';
    }, [position]);

    const isUpper = quadrant === 1 || quadrant === 2;
    // For standard FDI view:
    // Q1 (Right Upper): Root Up
    // Q2 (Left Upper): Root Up
    // Q3 (Left Lower): Root Down
    // Q4 (Right Lower): Root Down

    const colors = {
        default: '#f8fafc', // slate-50
        hover: '#e2e8f0',   // slate-200
        selected: '#0d9488', // teal-600
        restoration: '#3b82f6', // blue-500
        decay: '#ef4444',     // red-500
        missing: '#94a3b8',   // slate-400
        root: '#fbbf24',      // amber-400 (for root canal)
        crown: '#f59e0b',     // amber-500
    };

    const getSurfaceColor = (surface: string) => {
        // 1. Special case for Extraction (General) - entire tooth extraction visual
        // controlled outside but if 'Extraction' is passed as treatment...

        if (selectedSurfaces.includes(surface)) return colors.selected;

        const treatment = treatments.find(t => t.surface === surface);
        if (treatment) {
            return treatment.color || (treatment.status === 'completed' ? colors.restoration : colors.decay);
        }
        return colors.default;
    };

    // Check for special whole-tooth conditions
    const hasExtraction = treatments.some(t => t.procedureName?.includes('Extraction') || t.surface === 'General' && t.procedureName?.includes('Extraction'));
    const hasCrown = treatments.some(t => t.procedureName?.includes('Crown'));
    const hasRootCanal = treatments.some(t => t.surface === 'Root');

    // Surface Mapping (Standard 5-zone box logic)
    // Adjust mapping based on quadrant for standardized L/B/M/D
    const surfaces = useMemo(() => {
        let map = { top: 'B', bottom: 'L', left: 'D', right: 'M', center: 'O' };
        // Q1 (11-18) UR: Top=B, Bot=P/L, Left=D, Right=M (Towards midline 1 is M) ==> Wait
        // Center is midline.
        // 18 17 ... 11 | 21 ... 28
        // For 11: Mesial is Right (towards midline), Distal is Left.
        // For 21: Mesial is Left (towards midline), Distal is Right.

        // Correct visual mapping for user facing screen:
        // Left side of screen is Patient's Right (Q1/Q4).
        // Right side of screen is Patient's Left (Q2/Q3).

        if (quadrant === 1 || quadrant === 4) { // Right side of patient (Left on screen)
            map = { top: isUpper ? 'B' : 'L', bottom: isUpper ? 'L' : 'B', left: 'D', right: 'M', center: 'O' };
            // Actually for Q1/Q4 (Right side): Mesial is towards center line (Right of the tooth visual).
            // Distal is Left of the tooth visual. (Away from center).
        } else { // Left side of patient (Right on screen - Q2/Q3)
            map = { top: isUpper ? 'B' : 'L', bottom: isUpper ? 'L' : 'B', left: 'M', right: 'D', center: 'O' };
            // For Q2/Q3: Mesial is towards center line (Left of the tooth visual).
            // Distal is Right.
        }
        return map;
    }, [quadrant, isUpper]);

    // Root Path Generation
    const rootPath = isUpper
        ? "M 30,35 Q 35,0 50,5 Q 65,0 70,35" // Roots going UP
        : "M 30,65 Q 35,100 50,95 Q 65,100 70,65"; // Roots going DOWN

    // Crown Container Transform
    // We'll keep crown in center 0-100 x 0-100 logic, but scale/translate
    // Let's use a 100x140 viewBox.
    // Crown area: 15,40 to 85,100 (approx)

    // Simplification: Keeping the box map for the "Crown" part because it allows clicking specific surfaces clearly.
    // But we will stylize the outline.

    const aiFinding = treatments.find(t => t.isAi);

    return (
        <div className="flex flex-col items-center group relative">
            <div className="text-xs font-bold text-slate-500 mb-1 absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 bg-white px-2 py-1 shadow-sm rounded border border-slate-200 pointer-events-none flex flex-col items-center">
                <span>#{id} {type}</span>
                {aiFinding && (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded mt-0.5">
                        ✨ AI: {aiFinding.procedureName}
                    </span>
                )}
            </div>

            {/* Main Tooth ID Label (Always visible) */}
            <div className="flex flex-col items-center">
                {aiFinding && <span className="text-[10px] text-amber-500 font-bold -mb-1">✨</span>}
                <span className={`text-xs font-semibold mb-0.5 ${hasExtraction ? 'text-red-400 line-through' : 'text-slate-600'}`}>{id}</span>
            </div>

            <svg width="46" height="60" viewBox="0 0 100 130" className="cursor-pointer">
                {/* ROOT SECTION */}
                <path
                    d={isUpper ? "M 20,40 C 20,0 50,-10 80,40 Z" : "M 20,90 C 20,130 50,140 80,90 Z"}
                    fill={selectedSurfaces.includes('Root') ? colors.selected : (hasRootCanal ? colors.root : '#e2e8f0')}
                    stroke="none"
                    onClick={() => onSurfaceClick && onSurfaceClick('Root')}
                    className="hover:opacity-80 transition-colors"
                />

                {/* CROWN SECTION */}
                <g transform={isUpper ? "translate(0, 35)" : "translate(0, -5)"}>
                    {/* Border/Crown Effect */}
                    {hasCrown && (
                        <rect x="0" y="0" width="100" height="100" rx="15" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="5,2" />
                    )}

                    {/* Surfaces (Standard Box Map for Clarity) */}
                    {/* Top */}
                    <polygon points="0,0 100,0 75,25 25,25" fill={getSurfaceColor(surfaces.top)} stroke="white" strokeWidth="1" onClick={() => onSurfaceClick && onSurfaceClick(surfaces.top)} />
                    {/* Bottom */}
                    <polygon points="25,75 75,75 100,100 0,100" fill={getSurfaceColor(surfaces.bottom)} stroke="white" strokeWidth="1" onClick={() => onSurfaceClick && onSurfaceClick(surfaces.bottom)} />
                    {/* Left */}
                    <polygon points="0,0 25,25 25,75 0,100" fill={getSurfaceColor(surfaces.left)} stroke="white" strokeWidth="1" onClick={() => onSurfaceClick && onSurfaceClick(surfaces.left)} />
                    {/* Right */}
                    <polygon points="100,0 100,100 75,75 75,25" fill={getSurfaceColor(surfaces.right)} stroke="white" strokeWidth="1" onClick={() => onSurfaceClick && onSurfaceClick(surfaces.right)} />
                    {/* Center */}
                    <rect x="25" y="25" width="50" height="50" fill={getSurfaceColor(surfaces.center)} stroke="white" strokeWidth="1" onClick={() => onSurfaceClick && onSurfaceClick(surfaces.center)} />
                </g>

                {/* EXTRACTION OVERLAY (Big Red X) */}
                {hasExtraction && (
                    <g stroke="red" strokeWidth="4" opacity="0.8">
                        <line x1="10" y1={isUpper ? 40 : 10} x2="90" y2={isUpper ? 120 : 90} />
                        <line x1="90" y1={isUpper ? 40 : 10} x2="10" y2={isUpper ? 120 : 90} />
                    </g>
                )}
            </svg>
        </div>
    );
};

export default Tooth;
