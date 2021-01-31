import { Action } from '@ngrx/store';

export enum SubmarinesActionTypes {
  LoadSubmarines = '[Submarines] Load Submarines',
  SubmarinesLoaded = '[Submarines] Submarines Loaded',
  UpdateSubmarines = '[Submarines] Update Submarines',
  ApplyFreeCompanyId = '[Submarines] Set FreeCompanyId',
  ImportFromPcap = '[Submarines] Import From Pcap',
}

export class LoadSubmarines implements Action {
  readonly type = SubmarinesActionTypes.LoadSubmarines;
}

export class SubmarinesLoaded implements Action {
  readonly type = SubmarinesActionTypes.SubmarinesLoaded;

  constructor(public readonly payload: any) {
  }
}

export class UpdateSubmarines implements Action {
  readonly type = SubmarinesActionTypes.UpdateSubmarines;

  constructor(public readonly payload: any) {
  }
}

export class ImportFromPcap implements Action {
  readonly type = SubmarinesActionTypes.ImportFromPcap;
}

export class ApplyFreeCompanyId implements Action {
  readonly type = SubmarinesActionTypes.ApplyFreeCompanyId;

  constructor(public readonly freeCompanyId: string) {
  }
}

export type SubmarinesAction =
  | LoadSubmarines
  | SubmarinesLoaded
  | UpdateSubmarines
  | ApplyFreeCompanyId
  | ImportFromPcap
