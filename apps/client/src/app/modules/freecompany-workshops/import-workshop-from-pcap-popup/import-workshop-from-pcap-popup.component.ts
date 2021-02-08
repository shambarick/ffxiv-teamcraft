import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { filter, finalize, map, share, shareReplay, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { Submarine } from '../model/submarine';
import { XivapiService } from '@xivapi/angular-client';
import { Airship } from '../model/airship';
import { AirshipBuild } from '../model/airship-build';
import { FreecompanyWorkshopFacade } from '../+state/freecompany-workshop.facade';
import { VesselType } from '../model/vessel-type';
import { VesselPart } from '../model/vessel-part';
import { AirshipStatus } from './model/airship-status';

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

  public airshipStatusList: { [airshipSlot: string]: AirshipStatus } = {};
  private partConditions = {
    [VesselType.AIRSHIP]: {
      '0': [0, 0, 0, 0],
      '1': [0, 0, 0, 0],
      '2': [0, 0, 0, 0],
      '3': [0, 0, 0, 0]
    },
    [VesselType.SUBMARINE]: {
      '0': [0, 0, 0, 0],
      '1': [0, 0, 0, 0],
      '2': [0, 0, 0, 0],
      '3': [0, 0, 0, 0]
    }
  };

  ngOnInit(): void {
    const freecompanyId$ = this.ipc.freecompanyId$.pipe(
      startWith(0),
      shareReplay(1)
    );

    const currentAirshipSlot$ = this.ipc.eventPlay8Packets$.pipe(
      filter((event) => event.eventId === 0xB0102),
      map((event) => event.param1)
    );

    this.freecompanyWorkshopFacade.vesselItemInfo$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((itemInfo) => {
      const pc = this.freecompanyWorkshopFacade.getVesselPartCondition(itemInfo);
      this.partConditions[pc.type][pc.vesselSlot][pc.partSlot] = pc.condition;
    });

    this.ipc.airshipStatusPackets$.pipe(
      withLatestFrom(currentAirshipSlot$),
      takeUntil(this.onDestroy$)
    ).subscribe(([airship, airshipSlot]) => {
      this.airshipStatusList[airshipSlot] = {
        capacity: airship.capacity,
        currentExperience: airship.currentExp,
        totalExperienceForNextRank: airship.totalExpForNextRank,
        destinations: [
          airship.dest1,
          airship.dest2,
          airship.dest3,
          airship.dest4,
          airship.dest5,
        ].filter((dest) => dest > -1),
        parts: {
          hull: airship.hull,
          rigging: airship.rigging,
          forecastle: airship.forecastle,
          aftcastle: airship.aftcastle,
        },
      };
      console.log(this.airshipStatusList);
    });

    const airshipStatusList$ = this.ipc.airshipStatusListPackets$.pipe(
      withLatestFrom(freecompanyId$),
      filter(([, fcId]) => fcId > 0),
      map(([airshipStatusList, fcId]) => airshipStatusList.statusList.map((airship): Airship => ({
        rank: airship.rank,
        status: airship.status,
        name: airship.name,
        birthdate: airship.birthdate,
        returnTime: airship.returnTime,
        freecompanyId: fcId
      })))
    );

    const submarineStatusList$ = this.ipc.submarinesStatusListPackets$.pipe(
      withLatestFrom(this.ipc.freecompanyId$),
      filter(([, fcId]) => fcId > 0),
      map(([submarineStatusList, fcId]) => submarineStatusList.statusList.map((submarine) => {
        return {
          rank: submarine.rank,
          status: submarine.status,
          name: submarine.name,
          birthdate: submarine.birthdate,
          returnTime: submarine.returnTime,
          hullId: submarine.hull,
          sternId: submarine.stern,
          bowId: submarine.bow,
          bridgeId: submarine.bridge,
          capacity: submarine.capacity,
          currentExperience: submarine.currentExp,
          totalExperienceForNextRank: submarine.totalExpForNextRank,
          freecompanyId: fcId,
          destinations: [
            submarine.dest1,
            submarine.dest2,
            submarine.dest3,
            submarine.dest4,
            submarine.dest5
          ].filter((dest) => dest > 0)
        };
      }))
    );

    combineLatest([
      this.ipc.freecompanyId$,
      this.ipc.submarinesStatusListPackets$,
      airshipStatusList$
    ]).pipe(
      switchMap(([freecompanyId, submarineStatusList, airshipStatusList]) => {
        this.dataLoaded$.next(freecompanyId && submarineStatusList.statusList !== undefined);
        this.isLoading$.next(true);
        return this.xivapiService.getFreeCompany(freecompanyId)
          .pipe(
            map((result: any) => {
              const freecompany = {
                id: freecompanyId,
                name: result.FreeCompany.Name,
                tag: result.FreeCompany.Tag,
                rank: result.FreeCompany.Rank,
                server: result.FreeCompany.Server,
                estatePlot: result.FreeCompany.Estate.Plot
              };
              return {
                freecompany,
                submarines: null,
                airships: null
                // submarines,
                // airships
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
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade,
              private xivapiService: XivapiService, private lazyData: LazyDataService) {
    super();
  }

  save(): void {
    this.modalRef.close(this.data$.getValue());
  }

  private hideLoading() {
    this.isLoading$.next(false);
  }
}
