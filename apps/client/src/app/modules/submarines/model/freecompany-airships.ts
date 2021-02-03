import { Airship } from './airship';
import { SectorExploration } from './sector-exploration';

export interface FreecompanyAirships {
  sectors: { [id: string]: SectorExploration };
  slots: Airship[];
}
