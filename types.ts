export interface InitialAnchor {
  age: number;
  date: string;
  description: string;
}

export interface ConflictEvent {
  id: string;
  age: number;
  date: string;
  description: string;
  characters: string;
  feelings: string;
  bodyLocation: string;
  // AI-populated fields
  conflictType?: string;
  germLayer?: string;
  healingSymptoms?: string;
  gnmExplanation?: string;
}

export interface Track {
    theme: string;
    description: string;
    relatedEventIds: string[];
    affectedOrgans?: string[];
}

export interface AiAnalysis {
    tracks: Track[];
    futurePrediction: string;
}

export interface TimelineData {
  initialAnchor: InitialAnchor | null;
  events: ConflictEvent[];
}

// Types for the Full Report Generation
export interface CaseSummary {
    caseDetails: string;
    symptoms: string;
}

export interface TimelineAnalysisEntry {
    ageEvent: string;
    phase: string;
    conflictType: string;
    biologicalPurpose: string;
    trackIdentified: string;
}

export interface ConflictMapping {
    primaryConflicts: string[];
    secondaryConflicts: string[];
}

export interface AdvancedTrigger {
    symptom: string;
    biologicalPurpose: string;
    triggers: string;
}

export interface SpiritualComponent {
    denial: string;
    affirmation: string;
}

export interface ActionProtocol {
    gnmCommands: string[];
    trackNeutralization: string[];
    nutritionalSupport: string[];
}

export interface ReportData {
    caseSummary: CaseSummary;
    timelineAnalysis: TimelineAnalysisEntry[];
    conflictMapping: ConflictMapping;
    // Fix: Corrected typo from advancedTriggeringReasoning to advancedTriggerReasoning
    advancedTriggerReasoning: AdvancedTrigger[];
    spiritualComponent: SpiritualComponent;
    actionProtocol: ActionProtocol;
    expectedHealingPhase: string[];
    finalAnchor: string;
    nextSteps: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface MentorConfig {
  name: string;
  personality: 'malcolm-kingley' | 'fun-doctor-jim' | 'loving-mother-mary' | 'coach-ekhart';
}

export interface AuthUser {
    username: string;
}

export interface SymptomEntry {
  id: string;
  name: string;
  initialRating: number;
  currentRating: number;
  relatedTracks: string;
  actionsTaken: string;
  createdAt: string;
  updatedAt: string;
}

// Types for the Self-Awareness Protocol
export interface QuantifiedImpact {
    financial: string;
    physical: string;
    emotional: string;
    spiritual?: string;
}

export interface LeveragePoint {
    theme: string;
    reasoning: string;
    sequentialTriggers: string[];
    rawsonTreatmentScript: string;
}

export interface IdentityShiftProtocol {
    familiarPatterns: string[];
    newBehaviors: string[];
}

export interface SelfAwarenessProtocol {
    spiritualRemedy: {
        scripture: string;
        explanation: string;
    };
    predictiveAnalysis: string;
    quantifiedCosts: QuantifiedImpact;
    leveragePoint: LeveragePoint;
    identityShiftProtocol: IdentityShiftProtocol;
    futureForecast: {
        vision: string;
        quantifiedGains: QuantifiedImpact;
    };
    disclaimer: string;
}
