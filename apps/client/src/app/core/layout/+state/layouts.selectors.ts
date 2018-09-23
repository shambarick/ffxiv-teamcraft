import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutsState } from './layouts.reducer';

// Lookup the 'Layouts' feature state managed by NgRx
const getLayoutsState = createFeatureSelector<LayoutsState>('layouts');

const getLoaded = createSelector(
  getLayoutsState,
  (state: LayoutsState) => state.loaded
);

const getAllLayouts = createSelector(
  getLayoutsState,
  getLoaded,
  (state: LayoutsState, isLoaded) => {
    return isLoaded ? state.layouts : [];
  }
);
const getSelectedId = createSelector(
  getLayoutsState,
  (state: LayoutsState) => state.selectedId
);
const getSelectedLayout = createSelector(
  getAllLayouts,
  getSelectedId,
  (layouts, id) => {
    const result = layouts.find(it => it.$key === id);
    return result ? Object.assign({}, result) : undefined;
  }
);

export const layoutsQuery = {
  getLoaded,
  getAllLayouts,
  getSelectedLayout
};
