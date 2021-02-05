import { Injectable } from '@angular/core';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class FreecompanyWorkshopFacade {
  public readonly workshops$;

  constructor(private store: Store<fromFreecompanyWorkshop.State>) {
  }

  public load(): void {
    this.store.dispatch(FreecompanyWorkshopActions.readFromFile());
  }

  public importFromPcap(): void {
    this.store.dispatch(FreecompanyWorkshopActions.importFromPcap());
  }
}
