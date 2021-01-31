import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceBufferTime } from '../../../core/rxjs/debounce-buffer-time';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Memoized } from '../../../core/decorators/memoized';
import { DataService } from '../../../core/api/data.service';

@Component({
  selector: 'app-import-submarines-from-pcap-popup',
  templateUrl: './import-submarines-from-pcap-popup.component.html',
  styleUrls: ['./import-submarines-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSubmarinesFromPcapPopupComponent extends TeamcraftComponent{

  public updateMode = false;

  public job: number;

  public gearsetName: string;

  public freeCompanyId$ = new BehaviorSubject(null);
  public freeCompanyName$ = new BehaviorSubject('');
  public freeCompanyServer$ = new BehaviorSubject('');
  public freeCompanyEstatePlot$ = new BehaviorSubject('');
  public freeCompanyRank$ = new BehaviorSubject('');
  public statusList$ = new BehaviorSubject([]);

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private dataService: DataService, private lazyData: LazyDataService) {
    super();
    combineLatest([
      this.ipc.freeCompanyId$,
      this.ipc.submarinesStatusList$
    ]).pipe(
      switchMap(([freeCompanyId, submarineStatusList]) => {
        const data = {};

        this.freeCompanyId$.next(freeCompanyId);
        this.statusList$.next(submarineStatusList.statusList);

        console.log('teeeest');

        console.log(`fcid: ${freeCompanyId}`);
        console.log(freeCompanyId);
        console.log(submarineStatusList);
        return this.dataService.getFeeCompany(freeCompanyId)
          .pipe(
            map((result: any) => {
            this.freeCompanyName$.next(result.FreeCompany.Name);
            this.freeCompanyRank$.next(result.FreeCompany.Rank);
            this.freeCompanyServer$.next(result.FreeCompany.Server);
            this.freeCompanyEstatePlot$.next(result.FreeCompany.Estate?.Plot);
            console.log(result);
          }));
      }),
      takeUntil(this.onDestroy$),
    ).subscribe(([freeCompanyId, submarineStatusList]) => {

      // this.modalRef.close(data);
    });
  }
}
