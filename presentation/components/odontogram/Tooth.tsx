import React, { useMemo } from 'react';

interface ToothProps {
    id: string; // ISO format (e.g., "11", "48")
    isDeciduous?: boolean; // Süt dişi mi?
    treatments?: {
        surface: string; // 'M', 'O', 'D', 'B', 'L', 'General'
        status: 'planned' | 'completed' | 'existing';
        color?: string;
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
    // Determine quadrant and position
    const quadrant = parseInt(id.charAt(0));
    const position = parseInt(id.charAt(1));

    // Define colors for states
    const colors = {
        default: '#f1f5f9', // slate-100
        hover: '#e2e8f0',   // slate-200
        selected: '#0d9488', // teal-600
        restoration: '#3b82f6', // blue-500 (completed)
        decay: '#ef4444',     // red-500 (planned/issue)
        missing: '#94a3b8',   // slate-400
    };

    const getSurfaceColor = (surface: string) => {
        // 1. Check if selected
        if (selectedSurfaces.includes(surface)) return colors.selected;

        // 2. Check treatments
        const treatment = treatments.find(t => t.surface === surface) ||
            treatments.find(t => t.surface === 'General'); // General covers all if needed

        if (treatment) {
            return treatment.color || (treatment.status === 'completed' ? colors.restoration : colors.decay);
        }

        return colors.default;
    };

    // SVG Paths for a stylized tooth map (Geometric / Box style)
    // Layout:
    //      Buccal (Top)
    // Distal (L)  Occlusal (Center)  Mesial (R)  <-- Depends on quadrant!
    //      Lingual (Bottom)

    // For ISO 11-18 (Right Upper): Mesial is Left (towards midline 11), Distal is Right (towards 18)
    // Actually in a 2D map:
    // Q1 (Upper Right from doc view, Left from patient view? No, standard chart is patient's face to us)
    // Standard Dental Chart (FDI):
    // Right (18-11) | Left (21-28)
    // ----------------------------
    // Right (48-41) | Left (31-38)

    // So for Q1 (18->11): Mesial is towards 11 (Right side of specific tooth graphic), Distal is Left.
    // Wait, let's stick to a simpler generic logic:
    // Center = Occlusal
    // Top = Buccal (for Upper), Lingual (for Lower)? No, usually standardized to Top/Bottom in view.
    // Let's standard: Top=Buccal (Maxillary) / Lingual (Mandibular)? 
    // Usually Charts are:
    //     B
    // D O M  (For Q1)
    //     P (Palatal)

    // Let's implement a generic 5-zone box map and handle labeling at parent level or mentally.
    // Top, Bottom, Left, Right, Center.

    // Surfaces mapping based on ISO quadrant to coordinate
    // Q1 (18-11): Top=B, Bot=P, Left=D, Right=M
    // Q2 (21-28): Top=B, Bot=P, Left=M, Right=D
    // Q3 (31-38): Top=L, Bot=B, Left=M, Right=D  (Lower Left)
    // Q4 (48-41): Top=L, Bot=B, Left=D, Right=M  (Lower Right)

    const surfaces = useMemo(() => {
        let map = { top: 'B', bottom: 'L', left: 'D', right: 'M', center: 'O' };

        if (quadrant === 1) { map = { top: 'B', bottom: 'P', left: 'D', right: 'M', center: 'O' }; } // P = Palatal ~ Lingual
        if (quadrant === 2) { map = { top: 'B', bottom: 'P', left: 'M', right: 'D', center: 'O' }; }
        if (quadrant === 3) { map = { top: 'L', bottom: 'B', left: 'M', right: 'D', center: 'O' }; }
        if (quadrant === 4) { map = { top: 'L', bottom: 'B', left: 'D', right: 'M', center: 'O' }; }

        // Normalize P to L for simplicity in DB usually
        if (map.bottom === 'P') map.bottom = 'L'; // Treat Palatal as Lingual for data storage

        return map;
    }, [quadrant]);

    return (
        <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 mb-1">{id}</div>
            <svg width="40" height="40" viewBox="0 0 100 100" className="cursor-pointer transition-transform hover:scale-105">
                {/* Top (Buccal/Lingual) */}
                <polygon
                    points="0,0 100,0 70,30 30,30"
                    fill={getSurfaceColor(surfaces.top)}
                    stroke="white"
                    strokeWidth="2"
                    onClick={() => onSurfaceClick && onSurfaceClick(surfaces.top)}
                    className="hover:opacity-80 transition-colors"
                />
                {/* Bottom (Lingual/Buccal) */}
                <polygon
                    points="30,70 70,70 100,100 0,100"
                    fill={getSurfaceColor(surfaces.bottom)}
                    stroke="white"
                    strokeWidth="2"
                    onClick={() => onSurfaceClick && onSurfaceClick(surfaces.bottom)}
                    className="hover:opacity-80 transition-colors"
                />
                {/* Left (Distal/Mesial) */}
                <polygon
                    points="0,0 30,30 30,70 0,100"
                    fill={getSurfaceColor(surfaces.left)}
                    stroke="white"
                    strokeWidth="2"
                    onClick={() => onSurfaceClick && onSurfaceClick(surfaces.left)}
                    className="hover:opacity-80 transition-colors"
                />
                {/* Right (Mesial/Distal) */}
                <polygon
                    points="100,0 100,100 70,70 70,30"
                    fill={getSurfaceColor(surfaces.right)}
                    stroke="white"
                    strokeWidth="2"
                    onClick={() => onSurfaceClick && onSurfaceClick(surfaces.right)}
                    className="hover:opacity-80 transition-colors"
                />
                {/* Center (Occlusal) */}
                <rect
                    x="30" y="30" width="40" height="40"
                    fill={getSurfaceColor(surfaces.center)}
                    stroke="white"
                    strokeWidth="2"
                    onClick={() => onSurfaceClick && onSurfaceClick(surfaces.center)}
                    className="hover:opacity-80 transition-colors"
                />
            </svg>
        </div>
    );
};

export default Tooth;
