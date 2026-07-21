/**
 * Statuts possibles d'une intervention.
 * Utiliser cet enum partout à la place des strings bruts.
 */
export enum InterventionStatus {
    PENDING     = 'pending',
    ACCEPTED    = 'accepted',
    REJECTED    = 'rejected',
    IN_PROGRESS = 'in_progress',
    COMPLETED   = 'completed',
    CANCELLED   = 'cancelled',
}

/**
 * Types d'intervention reconnus par le système.
 */
export enum InterventionType {
    DRAIN_CLEANING     = 'drain_cleaning',
    WASTE_COLLECTION   = 'waste_collection',
    ROAD_REPAIR        = 'road_repair',
    FLOOD_RESPONSE     = 'flood_response',
    INSPECTION         = 'inspection',
    EMERGENCY_RESPONSE = 'emergency_response',
    SANITATION         = 'sanitation',
    MAINTENANCE        = 'maintenance',
}

/** Ensemble des statuts valides sous forme de Set pour validation rapide O(1). */
export const VALID_STATUSES = new Set<string>(Object.values(InterventionStatus));

/** Ensemble des types valides sous forme de Set pour validation rapide O(1). */
export const VALID_TYPES = new Set<string>(Object.values(InterventionType));
