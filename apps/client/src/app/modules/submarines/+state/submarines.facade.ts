import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as FreecompanyWorkshopActions from './submarines.actions';
import { FreecompanyWorkshopState } from './freecompany-workshop.reducer';
import { Observable } from 'rxjs';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { inventoryQuery } from '../../inventory/+state/inventory.selectors';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { submarinesQuery } from './submarines.selectors';
import { UserFreeCompanySubmarines } from '../model/user-freecompany-submarines';
import { Submarine } from '../model/submarine';

@Injectable({
  providedIn: 'root'
})
export class SubmarinesFacade {
  submarines$: Observable<UserFreeCompanySubmarines> = this.store.pipe(
    select(submarinesQuery.getSubmarines),
    filter(submarines => submarines !== null),
    tap(submarines => {
      console.log(submarines);
    }),
    map((submarines: UserFreeCompanySubmarines) => ({ ...submarines })),
    shareReplay(1)
  );

  constructor(private store: Store<FreecompanyWorkshopState>) {
  }

  load(): void {
    console.log('load');
    this.store.dispatch(FreecompanyWorkshopActions.loadWorkshops());
  }

  importFromPcap(): void {
    this.store.dispatch(FreecompanyWorkshopActions.importFromPcap());
  }

  getStats(submarine: Submarine) {

  }
}
