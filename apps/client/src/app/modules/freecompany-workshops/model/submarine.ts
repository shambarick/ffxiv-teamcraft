import { Vessel } from './vessel';

export interface Submarine extends Vessel {
  hullId: number;
  sternId: number;
  bowId: number;
  bridgeId: number;
}
