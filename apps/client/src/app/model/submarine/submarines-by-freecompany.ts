import { Submarine } from './submarine';
import { FreeCompanySubmarines } from './free-company-submarines';

export class SubmarinesByFreecompany {
  submarines: FreeCompanySubmarines = {};

  private _freeCompanyId?: string;

  public set freeCompanyId(freeCompanyId: string) {
    this._freeCompanyId = freeCompanyId;
    if (!this.submarines[freeCompanyId] && freeCompanyId) {
      this.submarines[freeCompanyId] = [];
    }
  }
}
