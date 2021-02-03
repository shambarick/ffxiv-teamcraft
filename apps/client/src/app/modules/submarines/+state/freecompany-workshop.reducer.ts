import * as FreecompanyWorkshopActions  from './submarines.actions';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';
import { Action, createReducer, on } from '@ngrx/store';
import * as MetricsDashboardsActions from '../../player-metrics/+state/metrics-dashboards.actions';
import { metricsDashboardsAdapter, State } from '../../player-metrics/+state/metrics-dashboards.reducer';

export const FREECOMPANYWORKSHOP_FEATURE_KEY = 'freecompanyWorkshop';

export interface FreecompanyWorkshopState {
  workshops: FreecompanyWorkshops,
  loaded: boolean;
}

export interface FreecompanyWorkshopPartialState {
  readonly [FREECOMPANYWORKSHOP_FEATURE_KEY]: FreecompanyWorkshopState;
}

export const initialState: FreecompanyWorkshopState = {
  workshops: null,
  loaded: false
};

export function freecompanyWorkshopReducere=(
  state: FreecompanyWorkshopState = initialState,
  action: FreecompanyWorkshopAction
): FreecompanyWorkshopState {
  switch (action.type) {
    case FreecompanyWorkshopActionTypes.SubmarinesLoaded: {
      state = {
        ...state,
        workshops: action.payload,
        loaded: true
      };
      break;
    }
    case FreecompanyWorkshopActionTypes.SetWorkshop: {
      state = {
        ...state,
        workshops: action.payload
      };
      break;
    }
    case FreecompanyWorkshopActionTypes.ApplyFreecompanyId: {
      state.workshops = state.workshops.clone();
      if (!this.submarines[action.freecompanyId] && action.freecompanyId) {
        this.submarines[action.freecompanyId] = {};
      }
      state = {
        ...state
      };
      break;
    }
  }
  return state;
}

const freecompanyWorkshopReducer = createReducer(
  initialState,
  on(FreecompanyWorkshopActions.workshopLoaded, (state, {workshops}) => ({
    ...state,
    workshops,
    loaded: true
  })),
  on(
    FreecompanyWorkshopActions.setWorkshop,
    (state, { workshop }) =>
      metricsDashboardsAdapter.setAll(metricsDashboards, {
        ...state,
        loaded: true
      })
  ),
  on(
    MetricsDashboardsActions.selectMetricsDashboard,
    (state, { id }) => {
      return {
        ...state,
        selectedId: id
      };
    }
  ),
  on(
    MetricsDashboardsActions.updateMetricsDashboard,
    (state, { dashboard }) => {
      return metricsDashboardsAdapter.setOne(dashboard, {
        ...state,
        loaded: true
      });
    }
  )
);

export function reducer(state: State | undefined, action: Action) {
  return freecompanyWorkshopReducer(state, action);
}
