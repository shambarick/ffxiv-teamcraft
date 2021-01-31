import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ImportFromPcap } from './submarines.actions';
import { SubmarinesState } from './submarines.reducer';

@Injectable({
  providedIn: 'root'
})
export class SubmarinesFacade {
  constructor(private store: Store<SubmarinesState>) {
  }

  importFromPcap(): void {
    this.store.dispatch(new ImportFromPcap());
  }
}
