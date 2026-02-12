import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    vibrant?: 'teal' | 'indigo' | 'rose' | 'none';
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverable = true,
    vibrant = 'none',
    onClick
}) => {
    const vibrantClasses = {
        teal: 'bg-vibrant-teal text-white shadow-teal-200/50 outline-none',
        indigo: 'bg-vibrant-indigo text-white shadow-indigo-200/50 outline-none',
        rose: 'bg-vibrant-rose text-white shadow-rose-200/50 outline-none',
        none: 'glass-card'
    };

    return (
        <div
            onClick={onClick}
            className={`
            rounded-2xl p-6 transition-all duration-300
            ${vibrantClasses[vibrant]}
            ${hoverable ? 'hover-lift cursor-pointer' : ''}
            ${vibrant !== 'none' ? 'shadow-xl' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

export default GlassCard;
