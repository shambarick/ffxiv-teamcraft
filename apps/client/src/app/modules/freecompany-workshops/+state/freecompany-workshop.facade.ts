import { Injectable } from '@angular/core';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import * as FreecompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { select, Store } from '@ngrx/store';
import { Submarine } from '../model/submarine';
import { VesselStats } from '../model/vessel-stats';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { AirshipTimers, ItemInfo, SubmarineTimers, UpdateInventorySlot } from '../../../model/pcap';
import { VesselType } from '../model/vessel-type';
import { BehaviorSubject, merge } from 'rxjs';
import { ofPacketType } from '../../../core/rxjs/of-packet-type';
import { Airship } from '../model/airship';
import { VesselTimersUpdate } from '../model/vessel-timers-update';
import { Memoized } from '../../../core/decorators/memoized';
import { AirshipPartClass } from '../model/airship-part-class';
import { SubmarinePartClass } from '../model/submarine-part-class';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AirshipPartType } from '../model/airship-part-type';
import { SubmarinePartType } from '../model/submarine-part-type';
import { VesselPartUpdate } from '../model/vessel-part-update';
import { VesselPart } from '../model/vessel-part';
import { SectorExploration } from '../model/sector-exploration';
import { VesselProgressionStatusUpdate } from '../model/vessel-progression-status-update';

@Injectable({
  providedIn: 'root'
})
export class FreecompanyWorkshopFacade {
  public readonly workshops$ = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectWorkshops)
  );

  public readonly currentWorkshop$ = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectCurrentWorkshop)
  );

  public readonly vesselTimers$ = merge(
    this.ipc.packets$.pipe(
      ofPacketType<AirshipTimers>('airshipTimers'),
      map((packet) => ({
        type: VesselType.AIRSHIP,
        timers: packet.timersList.map((vessel) => ({
          ...vessel,
          destinations: [
            vessel.dest1,
            vessel.dest2,
            vessel.dest3,
            vessel.dest4,
            vessel.dest5
          ].filter((dest) => (vessel.returnTime > 0 && dest > -1 && dest < 128))
        }))
      }))
    ),
    this.ipc.packets$.pipe(
      ofPacketType<SubmarineTimers>('submarineTimers'),
      map((packet) => ({
        type: VesselType.SUBMARINE,
        timers: packet.timersList.map((vessel) => ({
          ...vessel,
          destinations: [
            vessel.dest1,
            vessel.dest2,
            vessel.dest3,
            vessel.dest4,
            vessel.dest5
          ].filter((dest) => dest > 0)
        }))
      }))
    )
  );

  public readonly vesselPartUpdate$ = merge(
    this.ipc.itemInfoPackets$,
    this.ipc.updateInventorySlotPackets$
  ).pipe(
    filter((packet) => this.isAirshipItemInfo(packet) || this.isSubmarineItemInfo(packet))
  );

  public readonly currentFreecompany$ = this.store.pipe(
    select(FreecompanyWorkshopSelectors.selectCurrentFreeCompanyId)
  );

  public readonly vesselParts = new BehaviorSubject<Record<VesselType, Record<string, keyof Pick<Airship, 'parts'>>> | Record<VesselType, keyof Record<string, Pick<Submarine, 'parts'>>>>({
    [VesselType.AIRSHIP]: {},
    [VesselType.SUBMARINE]: {}
  });

  public readonly airshipStatusList$ = this.ipc.airshipStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([airshipStatusList, fcId]): Airship[] => airshipStatusList.statusList.map((airship, i) => ({
      vesselType: VesselType.AIRSHIP,
      rank: airship.rank,
      status: airship.status,
      name: airship.name,
      birthdate: airship.birthdate,
      returnTime: airship.returnTime,
      freecompanyId: fcId,
      parts: this.vesselParts.getValue()[VesselType.AIRSHIP][i]
    })))
  );

  public readonly airshipPartialStatusFromList$ = this.ipc.eventPlay8Packets$.pipe(
    filter((event) => event.eventId === 0xB0102),
    map((event) => event.param1),
    withLatestFrom(this.airshipStatusList$),
    map(([slot, statusList]) => ({ slot: slot, partialStatus: statusList[slot] }))
  );

  public readonly airshipStatus$ = this.ipc.airshipStatusPackets$.pipe(
    withLatestFrom(this.airshipPartialStatusFromList$),
    map(([airship, statusFromList]): { slot: number, vessel: Airship } => ({
      slot: statusFromList.slot,
      vessel: {
        ...statusFromList.partialStatus,
        capacity: airship.capacity,
        currentExperience: airship.currentExp,
        totalExperienceForNextRank: airship.totalExpForNextRank,
        destinations: [
          airship.dest1,
          airship.dest2,
          airship.dest3,
          airship.dest4,
          airship.dest5
        ].filter((dest) => dest > -1)
      }
    }))
  );

  public readonly vesselProgressionStatus$ = merge(
    this.ipc.airshipStatusListPackets$.pipe(
      map((packet) => ({
        type: VesselType.AIRSHIP,
        sectorsProgression: FreecompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    ),
    this.ipc.airshipStatusPackets$.pipe(
      map((packet) => ({
        type: VesselType.AIRSHIP,
        sectorsProgression: FreecompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    ),
    this.ipc.submarineProgressionStatusPackets$.pipe(
      map((packet) => ({
        type: VesselType.SUBMARINE,
        sectorsProgression: FreecompanyWorkshopFacade.toSectorsProgression(packet.unlockedSectors, packet.exploredSectors)
      }))
    )
  );

  public readonly submarineStatusList$ = this.ipc.submarinesStatusListPackets$.pipe(
    withLatestFrom(this.currentFreecompany$),
    map(([submarineStatusList, fcId]): Submarine[] => submarineStatusList.statusList.map((submarine, i) => {
      return {
        vesselType: VesselType.SUBMARINE,
        rank: submarine.rank,
        status: submarine.status,
        name: submarine.name,
        freecompanyId: fcId,
        birthdate: submarine.birthdate,
        returnTime: submarine.returnTime,
        parts: { ...this.vesselParts.getValue()[VesselType.SUBMARINE][i] },
        capacity: submarine.capacity,
        currentExperience: submarine.currentExp,
        totalExperienceForNextRank: submarine.totalExpForNextRank,
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

  constructor(private readonly lazyData: LazyDataService, private readonly ipc: IpcService,
              private readonly store: Store<fromFreecompanyWorkshop.State>, private readonly translate: TranslateService,
              private i18n: I18nToolsService, private l12n: LocalizedDataService) {
  }

  private static toSectorsProgression(unlockedSectors: boolean[], exploredSectors: boolean[]): Record<string, SectorExploration> {
    const sectorsProgression: Record<string, SectorExploration> = {};
    for (let i = 0; i < unlockedSectors.length; i++) {
      sectorsProgression[i] = {
        id: i,
        unlocked: unlockedSectors[i],
        explored: exploredSectors[i]
      };
    }
    return sectorsProgression;
  }

  public isSubmarineItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25004 && itemInfo.slot <= 18;
  }

  public isAirshipItemInfo(itemInfo: ItemInfo | UpdateInventorySlot): boolean {
    return itemInfo.containerId === 25003 && itemInfo.slot >= 30 && itemInfo.slot <= 48;
  }

  public load(): void {
    this.store.dispatch(FreecompanyWorkshopActions.readFromFile());
  }

  public setCurrentFreecompanyId(id: string): void {
    this.store.dispatch(FreecompanyWorkshopActions.setFreecompanyId({ id }));
  }

  public importFromPcap(): void {
    this.store.dispatch(FreecompanyWorkshopActions.importFromPcap());
  }

  public getVesselPartCondition(itemInfo: ItemInfo | UpdateInventorySlot): VesselPartUpdate {
    const partUpdate: VesselPartUpdate = {
      type: null,
      partId: null,
      partSlot: null,
      vesselSlot: null,
      condition: itemInfo.condition
    };

    if (itemInfo.containerId === 25003) {
      partUpdate.type = VesselType.AIRSHIP;
      partUpdate.partId = +Object.keys(this.lazyData.data.airshipParts).find((id) => this.lazyData.data.airshipParts[id].itemId === itemInfo.catalogId);
    } else if (itemInfo.containerId === 25004) {
      partUpdate.type = VesselType.SUBMARINE;
      partUpdate.partId = +Object.keys(this.lazyData.data.submarineParts).find((id) => this.lazyData.data.submarineParts[id].itemId === itemInfo.catalogId);
    }

    partUpdate.vesselSlot = this.getVesselSlotByContainerSlot(itemInfo.slot);
    partUpdate.partSlot = this.getVesselPartSlotByContainerSlot(itemInfo.slot);

    return partUpdate.type !== null ? partUpdate : null;
  }

  public updateAirshipStatus(slot: number, vessel: Airship): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateAirshipStatus({ slot, vessel }));
  }

  public updateAirshipStatusList(vessels: Airship[]): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateAirshipStatusList({ vessels }));
  }

  public updateSubmarineStatusList(vessels: Submarine[]): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateSubmarineStatusList({ vessels }));
  }

  public deleteWorkshop(id: string): void {
    this.store.dispatch(FreecompanyWorkshopActions.deleteFreecompanyWorkshop({id}));
  }

  public updateVesselParts(packet: ItemInfo | UpdateInventorySlot): void {
    const partUpdate = this.getVesselPartCondition(packet);
    const newState = { ...this.vesselParts.getValue() };
    if (!newState[partUpdate.type][partUpdate.vesselSlot]) {
      newState[partUpdate.type][partUpdate.vesselSlot] = {};
    }
    if (!newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot]) {
      newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot] = {};
    }
    newState[partUpdate.type][partUpdate.vesselSlot][partUpdate.partSlot] = { partId: partUpdate.partId, condition: partUpdate.condition };
    this.vesselParts.next(newState);
    this.store.dispatch(FreecompanyWorkshopActions.updateVesselPart({ vesselPartUpdate: partUpdate }));
  }

  public updateVesselTimers(data: VesselTimersUpdate): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateVesselTimers({
      vesselTimersUpdate: {
        type: data.type,
        timers: data.timers
      }
    }));
  }

  public updateVesselProgressionStatus(data: VesselProgressionStatusUpdate): void {
    this.store.dispatch(FreecompanyWorkshopActions.updateVesselProgressionStatus({
      vesselProgressionStatusUpdate: {
        type: data.type,
        sectorsProgression: data.sectorsProgression
      }
    }));
  }

  public getRemainingTime(unixTimestamp): number {
    return unixTimestamp - Math.floor(Date.now() / 1000);
  }

  getVesselBuild(type: VesselType, rank: number, parts: Record<string, VesselPart>): { abbreviation: string, stats: VesselStats } {
    if (!parts) {
      return null;
    }
    const rankBonus: VesselStats = type === VesselType.AIRSHIP ? {
      surveillance: 0,
      retrieval: 0,
      speed: 0,
      range: 0,
      favor: 0
    } : {
      surveillance: +this.lazyData.data.submarineRanks[rank]?.surveillanceBonus,
      retrieval: +this.lazyData.data.submarineRanks[rank]?.retrievalBonus,
      speed: +this.lazyData.data.submarineRanks[rank]?.speedBonus,
      range: +this.lazyData.data.submarineRanks[rank]?.rangeBonus,
      favor: +this.lazyData.data.submarineRanks[rank]?.favorBonus
    };
    return Object.keys(parts).map((slot) => {
      const vesselPart = type === VesselType.AIRSHIP ? this.lazyData.data.airshipParts[parts[slot].partId] : this.lazyData.data.submarineParts[parts[slot].partId];
      const partClass = type === VesselType.AIRSHIP ? AirshipPartClass[vesselPart.class] : SubmarinePartClass[vesselPart.class];
      return {
        abbreviation: this.translate.instant(`${VesselType[type]}.CLASS.${partClass}.Abbreviation`),
        stats: {
          surveillance: vesselPart.surveillance,
          retrieval: vesselPart.retrieval,
          speed: vesselPart.speed,
          range: vesselPart.range,
          favor: vesselPart.favor
        }
      };
    }).reduce((a, b) => ({
      abbreviation: `${a.abbreviation}${b.abbreviation}`,
      stats: {
        surveillance: +a.stats.surveillance + +b.stats.surveillance,
        retrieval: +a.stats.retrieval + +b.stats.retrieval,
        speed: +a.stats.speed + +b.stats.speed,
        range: +a.stats.range + +b.stats.range,
        favor: +a.stats.favor + +b.stats.favor
      }
    }), { abbreviation: '', stats: rankBonus });
  }

  public getVesselPartName(vesselType: VesselType, partId: number) {
    if (vesselType === VesselType.AIRSHIP) {
      return this.i18n.getName(this.l12n.getItem(this.lazyData.data.airshipParts[partId].itemId));
    }
    return this.i18n.getName(this.l12n.getItem(this.lazyData.data.submarineParts[partId].itemId));
  }

  public toDestinationNames(vesselType: VesselType, destinations: number[]): string[] {
    if (vesselType === VesselType.AIRSHIP) {
      return destinations.map((id) => this.i18n.getName(this.l12n.getAirshipSectorName(id)));
    }
    return destinations.map((id) => this.i18n.getName(this.l12n.getSubmarineSectorName(id)));
  }

  @Memoized()
  public getVesselPartSlotByContainerSlot(containerSlot: number): AirshipPartType | SubmarinePartType {
    switch (containerSlot) {
      // Submersible
      case 0:
      case 5:
      case 10:
      case 15:
        return SubmarinePartType.HULL;
      case 1:
      case 6:
      case 11:
      case 16:
        return SubmarinePartType.STERN;
      case 2:
      case 7:
      case 12:
      case 17:
        return SubmarinePartType.BOW;
      case 3:
      case 8:
      case 13:
      case 18:
        return SubmarinePartType.BRIDGE;
      // Airship
      case 30:
      case 35:
      case 40:
      case 45:
        return AirshipPartType.HULL;
      case 31:
      case 36:
      case 41:
      case 46:
        return AirshipPartType.RIGGING;
      case 32:
      case 37:
      case 42:
      case 47:
        return AirshipPartType.FORECASTLE;
      case 33:
      case 38:
      case 43:
      case 48:
        return AirshipPartType.AFTCASTLE;
    }
    return null;
  }

  @Memoized()
  public getVesselSlotByContainerSlot(containerSlot: number): string {
    switch (containerSlot) {
      // Submersible
      case 0:
      case 1:
      case 2:
      case 3:
        return '0';
      case 5:
      case 6:
      case 7:
      case 8:
        return '1';
      case 10:
      case 11:
      case 12:
      case 13:
        return '2';
      case 15:
      case 16:
      case 17:
      case 18:
        return '3';
      // Airship
      case 30:
      case 31:
      case 32:
      case 33:
        return '0';
      case 35:
      case 36:
      case 37:
      case 38:
        return '1';
      case 40:
      case 41:
      case 42:
      case 43:
        return '2';
      case 45:
      case 46:
      case 47:
      case 48:
        return '3';
    }
    return null;
  }
}
