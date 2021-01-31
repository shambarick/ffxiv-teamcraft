import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportSubmarinesFromPcapPopupComponent } from './import-submarines-from-pcap-popup/import-submarines-from-pcap-popup.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SUBMARINES_FEATURE_KEY, initialState as submarinesInitialState, submarinesReducer } from './+state/submarines.reducer';
import { SubmarinesEffects } from './+state/submarines.effects';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';

@NgModule({
  declarations: [ImportSubmarinesFromPcapPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    StoreModule.forFeature(SUBMARINES_FEATURE_KEY, submarinesReducer, {
      initialState: submarinesInitialState
    }),
    EffectsModule.forFeature([SubmarinesEffects]),
    AntdSharedModule,
    FlexLayoutModule,
    TranslateModule,
    PipesModule,
    CoreModule,
  ]
})
export class SubmarinesModule { }
