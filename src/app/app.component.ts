import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { pluck, takeUntil } from 'rxjs/operators';

import { EventBusService } from 'src/@wb/services/eventBus/event-bus.service';

import { EventData } from 'src/@wb/services/eventBus/event.class';
import { ZoomService } from 'src/@wb/services/zoom/zoom.service'

import { ViewInfoService } from 'src/@wb/store/view-info.service';

import { DrawStorageService } from 'src/@wb/storage/draw-storage.service';


import { CANVAS_CONFIG } from 'src/@wb/config/config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  constructor(
    private viewInfoService: ViewInfoService,
    private eventBusService: EventBusService,

    private drawStorageService: DrawStorageService,
    private zoomService: ZoomService
  ) {

  }

  ngOnInit(): void {

    // 초기 화면 크기 저장
    CANVAS_CONFIG.fullSize = {
      width: window.innerWidth - CANVAS_CONFIG.sidebarWidth,
      height: window.innerHeight - CANVAS_CONFIG.navbarHeight
    }

    CANVAS_CONFIG.maxContainerWidth = window.innerWidth - CANVAS_CONFIG.sidebarWidth;
    CANVAS_CONFIG.maxContainerHeight = window.innerHeight - CANVAS_CONFIG.navbarHeight;


    // view Info 초기화
    this.updateViewInfoStore();

    // 새로운 판서 Event 저장
    this.eventBusService.on('gen:newDrawEvent', this.unsubscribe$, async (data) => {
      const currentPage = this.viewInfoService.state.currentPage;
      this.drawStorageService.setDrawEvent(currentPage, data);
    });

  }
  ///////////////////////////////////////////////////////////

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * ViewInfo Store update
   * - numPages, currentPage, zoomScale
   * - 초기에 1page 설정
   */

  updateViewInfoStore() {
    const obj = {
      numPages: 1,
      currentPage: 1,
      zoomScale: 1,
    }

    this.viewInfoService.setViewInfo(obj);
  }
  ///////////////////////////////////////////////////////////

}
