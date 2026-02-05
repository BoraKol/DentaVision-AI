export enum UrgencyLevel {
    LOW = 1,
    MODERATE = 2,
    HIGH = 3,
    URGENT = 4,
    EMERGENCY = 5
}

export const getUrgencyLabel = (level: UrgencyLevel): string => {
    switch (level) {
        case UrgencyLevel.LOW: return 'Low Priority';
        case UrgencyLevel.MODERATE: return 'Moderate Priority';
        case UrgencyLevel.HIGH: return 'High Priority';
        case UrgencyLevel.URGENT: return 'Urgent Attention Needed';
        case UrgencyLevel.EMERGENCY: return 'Immediate Emergency';
        default: return 'Unknown';
    }
};
