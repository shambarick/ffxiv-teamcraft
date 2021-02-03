import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceBufferTime } from '../../../core/rxjs/debounce-buffer-time';
import { filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Memoized } from '../../../core/decorators/memoized';
import { DataService } from '../../../core/api/data.service';
import { FreecompanySubmarines } from '../model/freecompany-submarines';
import { Submarine } from '../model/submarine';

@Component({
  selector: 'app-import-submarines-from-pcap-popup',
  templateUrl: './import-submarines-from-pcap-popup.component.html',
  styleUrls: ['./import-submarines-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSubmarinesFromPcapPopupComponent extends TeamcraftComponent {
  public freeCompany = new BehaviorSubject(null);

  public dataLoaded$ = new BehaviorSubject<boolean>(false);
  public data$ = new BehaviorSubject(null);

  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private dataService: DataService, private lazyData: LazyDataService) {
    super();
    combineLatest([
      this.ipc.freecompanyId$,
      this.ipc.submarinesStatusList$
    ]).pipe(
      switchMap(([freecompanyId, submarineStatusList]) => {
        this.dataLoaded$.next(freecompanyId && submarineStatusList.statusList !== undefined);
        this.isLoading$.next(true);
        return this.dataService.getFeeCompany(freecompanyId)
          .pipe(
            map((result: any) => {
              const freeCompany = {
                id: freecompanyId,
                name: result.FreeCompany.Name,
                rank: result.FreeCompany.Rank,
                server: result.FreeCompany.Server,
                estatePlot: result.FreeCompany.Estate.Plot
              };
              const submarines: Submarine[] = submarineStatusList.statusList.map((submarine) => {
                return {
                  rank: submarine.rank,
                  status: submarine.status,
                  name: submarine.name,
                  birthdate: new Date(submarine.birthdate * 1000),
                  returnTime: new Date(submarine.returnTime * 1000),
                  hullId: submarine.hull,
                  sternId: submarine.stern,
                  bowId: submarine.bow,
                  bridgeId: submarine.bridge,
                  capacity: submarine.capacity,
                  currentExperience: submarine.currentExp,
                  totalExperienceForNextRank: submarine.totalExpForNextRank,
                  freecompanyId: freecompanyId,
                  destinations: [
                    submarine.dest1,
                    submarine.dest2,
                    submarine.dest3,
                    submarine.dest4,
                    submarine.dest5
                  ].filter((dest) => dest > 0)
                };
              });
              return {
                freeCompany,
                submarines
              };
            }),
            finalize(() => this.hideLoading()));
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((data) => {
      this.data$.next(data);
    });
  }

  save(): void {
    this.modalRef.close(this.data$.getValue());
  }

  private hideLoading() {
    this.isLoading$.next(false);
  }
}
