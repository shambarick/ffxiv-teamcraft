import * as FreecompanyWorkshopActions  from './submarines.actions';
import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { InventoryAction, InventoryActionTypes } from '../../inventory/+state/inventory.actions';
import { InventoryState } from '../../inventory/+state/inventory.reducer';

export const FREECOMPANYWORKSHOP_FEATURE_KEY = 'freecompanyWorkshop';

export interface FreecompanyWorkshopState extends EntityState<FreecompanyWorkshop> {

}
export function selectUserId(a: FreecompanyWorkshop): string {
  //In this case this would be optional since primary key is id
  return a.id;
}
export const freecompanyWorkshopAdapter: EntityAdapter<FreecompanyWorkshop> = createEntityAdapter<FreecompanyWorkshop>({
  selectId: selectUserId
});

export const initialState: FreecompanyWorkshopState = freecompanyWorkshopAdapter.getInitialState();

// export function freecompanyWorkshopReducere=(
//   state: FreecompanyWorkshopState = initialState,
//   action: FreecompanyWorkshopAction
// ): FreecompanyWorkshopState {
//   switch (action.type) {
//     case FreecompanyWorkshopActionTypes.SubmarinesLoaded: {
//       state = {
//         ...state,
//         workshops: action.payload,
//         loaded: true
//       };
//       break;
//     }
//     case FreecompanyWorkshopActionTypes.SetWorkshop: {
//       state = {
//         ...state,
//         workshops: action.payload
//       };
//       break;
//     }
//     case FreecompanyWorkshopActionTypes.ApplyFreecompanyId: {
//       state.workshops = state.workshops.clone();
//       if (!this.submarines[action.freecompanyId] && action.freecompanyId) {
//         this.submarines[action.freecompanyId] = {};
//       }
//       state = {
//         ...state
//       };
//       break;
//     }
//   }
//   return state;
// }

// export const freecompanyWorkshopReducer = createReducer(
//   initialState,
//   on(FreecompanyWorkshopActions.workshopLoaded, (state, {workshops}) => {
//     console.log('loaded');
//     return freecompanyWorkshopAdapter.addMany(workshops, state);
//   }),
//   on(FreecompanyWorkshopActions.setWorkshop, (state, action) => {
//     console.log('SET');
//     console.log(action.workshop);
//     return freecompanyWorkshopAdapter.addOne(action.workshop, state);
//   }),
// );

// export function reducer(state: FreecompanyWorkshopState | undefined, action: Action) {
//   console.log('lulz');
//   console.log(state);
//   console.log(action);
//   return freecompanyWorkshopReducer(state, action);
// }


export function reducer(
  state: FreecompanyWorkshopState = initialState,
  action: any
): FreecompanyWorkshopState {
  switch (action.type) {
    case FreecompanyWorkshopActions.setWorkshop.type: {
      state = {
        ...state,
        entities: {[action.workshop.id]: action.workshop},
      };
      break;
    }
  }
  return state;
}
