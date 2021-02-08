import { Vessel } from './vessel';

export interface Airship extends Vessel {
  hullId?: number;
  riggingId?: number;
  forecastleId?: number;
  aftcastleId?: number;
}
