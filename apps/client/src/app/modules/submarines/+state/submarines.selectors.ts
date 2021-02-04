import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FREECOMPANYWORKSHOP_FEATURE_KEY, freecompanyWorkshopAdapter as adapter, FreecompanyWorkshopState } from './freecompany-workshop.reducer';

export const selectFreecompanyWorkshopState = createFeatureSelector<FreecompanyWorkshopState>(
  FREECOMPANYWORKSHOP_FEATURE_KEY
);

const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = adapter.getSelectors();

export const selectAllWorkshops = createSelector(
  selectFreecompanyWorkshopState,
  selectAll,
);
