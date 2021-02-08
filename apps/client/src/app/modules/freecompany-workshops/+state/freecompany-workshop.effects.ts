import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import * as FreecompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Submarine } from '../model/submarine';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { ImportWorkshopFromPcapPopupComponent } from '../import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of, Subject } from 'rxjs';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { select, Store } from '@ngrx/store';
import { Airship } from '../model/airship';

@Injectable()
export class FreecompanyWorkshopEffects {

  readFromFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.readFromFile),
    switchMap(() => {
      console.log('loading');
      const result$ = new Subject<FreecompanyWorkshop[]>();
      this.ipc.once('freecompany-workshops:value', (e, workshops) => {
        const data = this.serializer.deserialize<FreecompanyWorkshops>(workshops, FreecompanyWorkshops);
        result$.next(data.freecompanyWorkshops);
      });
      setTimeout(() => {
        this.ipc.send('freecompany-workshops:get');
      }, 200);
      return result$;
    }),
    map(freecompanyWorkshops => FreecompanyWorkshopActions.loadFreecompanyWorkshops({ freecompanyWorkshops }))
  ));

  saveToFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.saveToFile),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.store.pipe(select(FreecompanyWorkshopSelectors.selectWorkshops)))
    )),
    switchMap(([action, state]) => {
      const savePayload = JSON.parse(JSON.stringify({freecompanyWorkshops: state}));
      this.ipc.send('freecompany-workshops:set', savePayload);
      return EMPTY;
    })
  ), {dispatch: false});

  importFromPcap$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.importFromPcap),
    switchMap(() => {
        return this.dialog.create({
          nzContent: ImportWorkshopFromPcapPopupComponent,
          nzFooter: null,
          nzTitle: this.translate.instant('FREECOMPANY_WORKSHOPS.Import_using_pcap')
        }).afterClose.pipe(
          filter(opts => opts),
          map((data: { freecompany: any, submarines: Submarine[], airships: Airship[] }): FreecompanyWorkshop => {
            return {
              id: data.freecompany.id,
              name: data.freecompany.name,
              world: data.freecompany.server,
              tag: data.freecompany.tag,
              airships: {
                sectors: {},
                slots: [...data.airships]
              },
              submarines: {
                sectors: {},
                slots: [...data.submarines]
              }
            };
          })
        );
      }
    ),
    map((workshop: FreecompanyWorkshop) => {
      this.store.dispatch(FreecompanyWorkshopActions.upsertFreecompanyWorkshop({ freecompanyWorkshop: workshop }));
      return FreecompanyWorkshopActions.saveToFile();
    })
  ))
  ;

  constructor(private actions$: Actions, private dialog: NzModalService,
              private ipc: IpcService, private translate: TranslateService,
              private store: Store, private serializer: NgSerializerService) {
  }

}
