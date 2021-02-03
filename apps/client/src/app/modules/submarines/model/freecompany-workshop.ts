import { Submarine } from './submarine';
import { Airship } from './airship';
import { FreecompanyAirships } from './freecompany-airships';
import { FreecompanySubmarines } from './freecompany-submarines';

export class FreecompanyWorkshop {
  id: string;
  name: string;
  world: string;
  airships?: FreecompanyAirships;
  submarines?: FreecompanySubmarines;
}
