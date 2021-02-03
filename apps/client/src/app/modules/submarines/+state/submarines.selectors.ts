import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FREECOMPANYWORKSHOP_FEATURE_KEY, FreecompanyWorkshopState } from './freecompany-workshop.reducer';

const getFreecompanyWorkshopState = createFeatureSelector<FreecompanyWorkshopState>(
  FREECOMPANYWORKSHOP_FEATURE_KEY
);

const getLoaded = createSelector(
  getFreecompanyWorkshopState,
  (state: FreecompanyWorkshopState) => state.loaded
);

const getWorkshops = createSelector(
  getFreecompanyWorkshopState,
  (state) => {
    return state.workshops;
  }
);


