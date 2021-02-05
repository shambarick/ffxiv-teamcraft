import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreecompanyWorkshopFacade } from '../../../modules/freecompany-workshops/+state/freecompany-workshop.facade';

@Component({
  selector: 'app-voyage-tracker',
  templateUrl: './voyage-tracker.component.html',
  styleUrls: ['./voyage-tracker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoyageTrackerComponent implements OnInit {

  private machinaToggle = false;

  public display$ = this.freecompanyWorkshopFacade.workshops$.pipe(
    tap((data) => {
      console.log(data);
    }),
  );

  constructor(private dialog: NzModalService, private ipc: IpcService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade) {
  }

  ngOnInit(): void {
    this.freecompanyWorkshopFacade.load();
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
  }

  importFromPcap(): void {
    this.freecompanyWorkshopFacade.importFromPcap();
  }
}
