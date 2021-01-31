import { SubmarinesAction, SubmarinesActionTypes } from './submarines.actions';
import { Submarine } from '../../../model/submarine/submarine';
import { FreeCompanySubmarines } from '../../../model/submarine/free-company-submarines';

export const SUBMARINES_FEATURE_KEY = 'submarines';

export interface SubmarinesState {
  submarines: FreeCompanySubmarines,
  loaded: boolean; // has the Inventory been loaded
}

export interface SubmarinesPartialState {
  readonly [SUBMARINES_FEATURE_KEY]: SubmarinesState;
}

export const initialState: SubmarinesState = {
  submarines: null,
  loaded: false
};

export function submarinesReducer(
  state: SubmarinesState = initialState,
  action: SubmarinesAction
): SubmarinesState {
  switch (action.type) {
    case SubmarinesActionTypes.SubmarinesLoaded: {
      state = {
        ...state,
        submarines: action.payload,
        loaded: true
      };
      break;
    }
    case SubmarinesActionTypes.UpdateSubmarines: {
      state = {
        ...state,
        submarines: action.payload
      };
      break;
    }
    case SubmarinesActionTypes.ApplyFreeCompanyId: {
      state.submarines = {...state.submarines};
      if (!this.submarines[action.freeCompanyId] && action.freeCompanyId) {
        this.submarines[action.freeCompanyId] = [];
      }
      state = {
        ...state
      };
      break;
    }
  }
  return state;
}
