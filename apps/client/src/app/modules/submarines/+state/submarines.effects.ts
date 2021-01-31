import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { GearsetService } from '../../../core/database/gearset.service';
import {
  ImportFromPcap,
} from './submarines.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, first, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { SubmarinesActionTypes } from './submarines.actions';
import { ImportSubmarinesFromPcapPopupComponent } from '../import-submarines-from-pcap-popup/import-submarines-from-pcap-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';

@Injectable()
export class SubmarinesEffects {
  @Effect({
    dispatch: false
  })
  importFrompcap$ = this.actions$.pipe(
    ofType<ImportFromPcap>(SubmarinesActionTypes.ImportFromPcap),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: ImportSubmarinesFromPcapPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.Import_using_pcap')
          }).afterClose.pipe(
            filter(opts => opts),
            map((gearset) => {
              gearset.authorId = userId;
              return gearset;
            })
          );
        }),
        // switchMap(gearset => {
        //   return this.gearsetService.add(gearset);
        // })
      );
    }),
    tap((res) => {
      this.router.navigate(['/gearset', res]);
    }),
    switchMapTo(EMPTY)
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private gearsetService: GearsetService, private dialog: NzModalService,
              private translate: TranslateService, private router: Router,) {
  }
}
