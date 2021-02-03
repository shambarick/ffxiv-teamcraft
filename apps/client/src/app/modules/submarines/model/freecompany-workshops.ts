import { FreecompanyWorkshop } from './freecompany-workshop';

export class FreecompanyWorkshops {
  workshops: { [freecompanyId: string]: FreecompanyWorkshop; }

  public setFreecompanyWorkshop(fc: FreecompanyWorkshop) {
    if (!this.workshops[fc.id] && fc.id) {
      this.workshops[fc.id] = {
        id: fc.id,
        name: fc.name,
        world: fc.world,
      };
    }
  }

  clone(): FreecompanyWorkshops {
    const clone = new FreecompanyWorkshops();
    clone.workshops = { ...this.workshops };
    return clone;
  }
}
