export interface AirshipStatus {
  currentExperience?: number;
  totalExperienceForNextRank?: number;
  capacity?: number;
  destinations?: number[];
  parts: {
    hull: number;
    rigging: number;
    forecastle: number;
    aftcastle: number;
  };
}
