import { Action, createAction, props } from '@ngrx/store';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { FreecompanySubmarines } from '../model/freecompany-submarines';
import { Submarine } from '../model/submarine';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';

export enum FreecompanyWorkshopActionTypes {
  LoadSubmarines = '[Submarines] Load Submarines',
  SubmarinesLoaded = '[Submarines] Submarines Loaded',
  UpdateSubmarines = '[Submarines] Update Freecompany Submarines',
  SetWorkshop = '[Submarines] Set Workshop',
  UpdateWorkshops = '[Submarines] Update Workshops',
  ApplyFreecompanyId = '[Submarines] Set FreecompanyId',
  ImportFromPcap = '[Submarines] Import From Pcap',
}

const PREFIX = '[FreecompanyWorkshop]';

export const setWorkshop = createAction(
  `${PREFIX} Set Workshop`,
  props<{ workshop }>()
);

export const updateWorkshops = createAction(
  `${PREFIX} Update Workshops`,
  props<{ workshops: FreecompanyWorkshops }>()
);

export const saveToFile = createAction(
  `${PREFIX} Save to file`,
);

export const loadWorkshops = createAction(
  `${PREFIX} Load Workshops`
);

export const workshopLoaded = createAction(
  `${PREFIX} Workshops Loaded`,
  props<{ workshops: FreecompanyWorkshop[] }>()
);

export const importFromPcap = createAction(
  `${PREFIX} Import from Pcap`
);
