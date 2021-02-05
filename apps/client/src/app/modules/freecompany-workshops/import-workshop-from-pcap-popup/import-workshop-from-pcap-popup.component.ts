import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { Submarine } from '../model/submarine';

@Component({
  selector: 'app-import-workshop-from-pcap-popup',
  templateUrl: './import-workshop-from-pcap-popup.component.html',
  styleUrls: ['./import-workshop-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportWorkshopFromPcapPopupComponent extends TeamcraftComponent implements OnInit {
  public freeCompany = new BehaviorSubject(null);

  public dataLoaded$ = new BehaviorSubject<boolean>(false);
  public data$ = new BehaviorSubject(null);

  public isLoading$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
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
              const freecompany = {
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
                freecompany,
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

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private dataService: DataService, private lazyData: LazyDataService) {
    super();
  }

  save(): void {
    this.modalRef.close(this.data$.getValue());
  }

  private hideLoading() {
    this.isLoading$.next(false);
  }
}
