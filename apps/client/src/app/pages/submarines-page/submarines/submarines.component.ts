import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { IpcService } from '../../../core/electron/ipc.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SubmarinesFacade } from '../../../modules/submarines/+state/submarines.facade';
import { combineLatest } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-submarines',
  templateUrl: './submarines.component.html',
  styleUrls: ['./submarines.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmarinesComponent extends TeamcraftComponent implements OnInit {

  private machinaToggle = false;

  public display$ = this.submarinesFacade.workshops$.pipe(
    tap((data) => {
      console.log(data);
    }),
  );

  constructor(private dialog: NzModalService, private ipc: IpcService,
              private submarinesFacade: SubmarinesFacade) {
    super();
  }

  ngOnInit(): void {
    this.submarinesFacade.load();
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
  }

  importFromPcap(): void {
    this.submarinesFacade.importFromPcap();
  }
}
