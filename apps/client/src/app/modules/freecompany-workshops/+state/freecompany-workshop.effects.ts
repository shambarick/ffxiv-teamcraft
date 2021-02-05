import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import { filter, map, switchMap } from 'rxjs/operators';
import { Submarine } from '../model/submarine';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { ImportWorkshopFromPcapPopupComponent } from '../import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class FreecompanyWorkshopEffects {

  importFromPcap$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.importFromPcap),
    switchMap(() => {
        return this.dialog.create({
          nzContent: ImportWorkshopFromPcapPopupComponent,
          nzFooter: null,
          nzTitle: this.translate.instant('SUBMARINES.Import_using_pcap')
        }).afterClose.pipe(
          filter(opts => opts),
          map((data: { freecompany: any, submarines: Submarine[] }): FreecompanyWorkshop => {
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
      }
    ),
    map((workshop: FreecompanyWorkshop) => {
      console.log(workshop);
      return FreecompanyWorkshopActions.upsertFreecompanyWorkshop({ freecompanyWorkshop: workshop });
    })
  ))
  ;

  constructor(private actions$: Actions, private dialog: NzModalService,
              private translate: TranslateService) {
  }

}
