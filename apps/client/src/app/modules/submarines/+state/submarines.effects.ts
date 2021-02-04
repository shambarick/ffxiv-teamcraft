import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as FreecompanyWorkshopActions from './submarines.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { concatMap, filter, first, map, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ImportSubmarinesFromPcapPopupComponent } from '../import-submarines-from-pcap-popup/import-submarines-from-pcap-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { Submarine } from '../model/submarine';
import { IpcService } from '../../../core/electron/ipc.service';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';
import { select, Store } from '@ngrx/store';
import { selectAllWorkshops } from './submarines.selectors';
import { FreecompanyWorkshopState } from './freecompany-workshop.reducer';

@Injectable()
export class SubmarinesEffects {
  @Effect()
  loadSubmarines$ = this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.loadWorkshops),
    switchMap(() => {
      console.log('loading');
      const result$ = new Subject<FreecompanyWorkshop[]>();
      this.ipc.once('freecompany-workshop:value', (e, workshops) => {
        console.log(workshops);
        const data = this.serializer.deserialize<FreecompanyWorkshops>(workshops, FreecompanyWorkshops);
        const workshopsData = Object.keys(data.workshops).map((key) => data.workshops[key]);
        result$.next(workshopsData);
      });
      setTimeout(() => {
        this.ipc.send('freecompany-workshop:get');
      }, 200);
      return result$;
    }),
    map(workshops => FreecompanyWorkshopActions.workshopLoaded({ workshops }))
  );

  @Effect()
  importFrompcap$ = this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.importFromPcap),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: ImportSubmarinesFromPcapPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('SUBMARINES.Import_using_pcap')
          }).afterClose.pipe(
            filter(opts => opts),
            map((data: {freecompany: any, submarines: Submarine[]}): FreecompanyWorkshop => {
              return {
                id: data.freecompany.id,
                name: data.freecompany.name,
                world: data.freecompany.server,
                submarines: {
                  sectors: {},
                  slots: [...data.submarines]
                }
              };
            })
          );
        }),
      );
    }),
    map((workshop) => {
      console.log(workshop);
      return FreecompanyWorkshopActions.setWorkshop({workshop});
    }),
    map((state) => {
      console.log(state);
      return FreecompanyWorkshopActions.saveToFile();
    })
  );

  @Effect({ dispatch: false })
  updateWorkshops$ = this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.saveToFile),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store.select(selectAllWorkshops))
    )),
    map(([type, state]) => {
      console.log(state);
      const savePayload = JSON.parse(JSON.stringify(state));
      this.ipc.send('freecompany-workshop:set', savePayload);
    }),
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private ipc: IpcService, private dialog: NzModalService,
              private translate: TranslateService, private routerd: Router,
              private serializer: NgSerializerService, private store: Store<FreecompanyWorkshopState>) {
  }
}
