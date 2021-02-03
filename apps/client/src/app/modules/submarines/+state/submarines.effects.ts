import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as FreecompanyWorkshopActions from './submarines.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, first, map, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ImportSubmarinesFromPcapPopupComponent } from '../import-submarines-from-pcap-popup/import-submarines-from-pcap-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { Submarine } from '../model/submarine';
import { IpcService } from '../../../core/electron/ipc.service';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';

@Injectable()
export class SubmarinesEffects {
  @Effect()
  loadSubmarines$ = this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.workshopLoaded),
    switchMap(() => {
      console.log('loading');
      const result$ = new Subject<FreecompanyWorkshops>();
      this.ipc.once('freecompany-workshop:value', (e, workshops) => {
        console.log(workshops);
        result$.next(this.serializer.deserialize<FreecompanyWorkshops>(workshops, FreecompanyWorkshops));
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
  );

  @Effect({ dispatch: false })
  updateWorkshops$ = this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateWorkshops),
    map((action) => {
      const savePayload = JSON.parse(JSON.stringify(action.workshops));
      this.ipc.send('freecompany-workshop:set', savePayload);
    }),
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private ipc: IpcService, private dialog: NzModalService,
              private translate: TranslateService, private router: Router,
              private serializer: NgSerializerService) {
  }
}
