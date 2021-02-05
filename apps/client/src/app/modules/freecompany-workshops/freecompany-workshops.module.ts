import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromFreecompanyWorkshop from './+state/freecompany-workshop.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FreecompanyWorkshopEffects } from './+state/freecompany-workshop.effects';
import { ImportWorkshopFromPcapPopupComponent } from './import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';


@NgModule({
  declarations: [ImportWorkshopFromPcapPopupComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromFreecompanyWorkshop.freecompanyWorkshopsFeatureKey, fromFreecompanyWorkshop.reducer),
    EffectsModule.forFeature([FreecompanyWorkshopEffects])
  ]
})
export class FreecompanyWorkshopsModule {
}
