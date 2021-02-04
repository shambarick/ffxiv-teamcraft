import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as FreecompanyWorkshopActions from './submarines.actions';
import { FreecompanyWorkshopState } from './freecompany-workshop.reducer';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, tap } from 'rxjs/operators';
import { Submarine } from '../model/submarine';
import * as FreecompanyWorkshopSelectors from './submarines.selectors';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';

@Injectable({
  providedIn: 'root'
})
export class SubmarinesFacade {
  workshops$: Observable<any> = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectAllWorkshops),
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
