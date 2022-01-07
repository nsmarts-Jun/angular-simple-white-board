import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Subject, fromEvent } from 'rxjs';
import { pluck, takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { CANVAS_CONFIG } from 'src/@wb/config/config';

import { CanvasService } from 'src/@wb/services/canvas/canvas.service';
import { RenderingService } from 'src/@wb/services/rendering/rendering.service';
import { DrawingService } from 'src/@wb/services/drawing/drawing.service';

import { EventBusService } from 'src/@wb/services/eventBus/event-bus.service';
import { EventData } from 'src/@wb/services/eventBus/event.class';

import { DrawStorageService } from 'src/@wb/storage/draw-storage.service';

import { ViewInfoService } from 'src/@wb/store/view-info.service';
import { EditInfoService } from 'src/@wb/store/edit-info.service';



export interface DialogData {
  title: string;
  content: string;
}

@Component({
  selector: 'app-board-canvas',
  templateUrl: './board-canvas.component.html',
  styleUrls: ['./board-canvas.component.scss']
})
export class BoardCanvasComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  editDisabled = true;
  dragOn = true;
  currentToolInfo = {
    type: '',
    color: '',
    width: '',
  };

  // ************* Subject
  canvasClearBoardA$;

  // ************* Subject

  // static: https://stackoverflow.com/questions/56359504/how-should-i-use-the-new-static-option-for-viewchild-in-angular-8
  @ViewChild('canvasContainer', { static: true }) public canvasContainerRef: ElementRef;
  @ViewChild('canvasCover', { static: true }) public coverCanvasRef: ElementRef;
  @ViewChild('teacherCanvas', { static: true }) public teacherCanvasRef: ElementRef;


  canvasContainer: HTMLDivElement;
  coverCanvas: HTMLCanvasElement;
  teacherCanvas: HTMLCanvasElement;

  rendererEvent1: any;

  constructor(
    private viewInfoService: ViewInfoService,
    private editInfoService: EditInfoService,

    private canvasService: CanvasService,
    private renderingService: RenderingService,
    private eventBusService: EventBusService,
    private renderer: Renderer2,
    private drawStorageService: DrawStorageService,
    private drawingService: DrawingService,

  ) {

  }

  // Resize Event Listener
  @HostListener('window:resize') resize() {
    const newWidth = window.innerWidth - CANVAS_CONFIG.sidebarWidth;
    const newHeight = window.innerHeight - CANVAS_CONFIG.navbarHeight;
    // sidenav 열릴때 resize event 발생... 방지용도.
    if (CANVAS_CONFIG.maxContainerWidth === newWidth && CANVAS_CONFIG.maxContainerHeight === newHeight) {
      return;
    }
    CANVAS_CONFIG.maxContainerWidth = newWidth;
    CANVAS_CONFIG.maxContainerHeight = newHeight;
    this.onResize();
  }


  ngOnInit(): void {

    // canvas Element 할당
    this.coverCanvas = this.coverCanvasRef.nativeElement;
    this.teacherCanvas = this.teacherCanvasRef.nativeElement;
    this.canvasContainer = this.canvasContainerRef.nativeElement;


    // page 변경
    this.viewInfoService.state$
      .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged())
      .subscribe((viewInfo) => {
        this.onChangePage();
      });



    // Tool update(nav Menu)에 따른 event handler 변경
    this.editInfoService.state$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((editInfo) => {
        console.log('[Editor Setting]: ', editInfo);

        this.editDisabled = editInfo.toolDisabled || editInfo.editDisabled;

        // drag Enable
        this.dragOn = false;
        if (editInfo.mode == 'move') this.dragOn = true;

        const currentTool = editInfo.tool;
        this.currentToolInfo = {
          type: editInfo.tool, // pen, eraser
          color: editInfo.toolsConfig[currentTool].color,
          width: editInfo.toolsConfig[currentTool].width
        };

        const zoomScale = this.viewInfoService.state.zoomScale;

        // canvas Event Handler 설정
        this.canvasService.addEventHandler(this.coverCanvas, this.teacherCanvas, this.currentToolInfo, zoomScale);
      });


    // continer scroll Listener : thumbnail의 window 처리 용도
    this.rendererEvent1 = this.renderer.listen(this.canvasContainer, 'scroll', event => {
      this.onScroll();
    });

    this.eventBusListeners();
  }

  // end of ngOnInit
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // render listener 해제
    this.rendererEvent1();
  }

  eventBusListeners() {
    // board-nav로 부터 현재 페이지 드로잉 이벤트 삭제 
    // 다시 페이지 렌더링
    this.eventBusService.on('rmoveDrawEventPageRendering',this.unsubscribe$,(data)=>{
      const viewInfo = this.viewInfoService.state;
      //document Number -> 1부터 시작.
      const pageNum = viewInfo.currentPage;
      const zoomScale = viewInfo.zoomScale;
      this.pageRender(pageNum, zoomScale)
    })
  }

  /**
   * 판서 Rendering
   *
   * @param currentPage
   * @param zoomScale
   */
  async pageRender(currentPage, zoomScale) {
    console.log('>>> page Board Render!');

    // board rendering
    const drawingEvents = this.drawStorageService.getDrawingEvents(currentPage);
    this.renderingService.renderBoard(this.teacherCanvas, zoomScale, drawingEvents);
  }



  /**
   * Canvas size 설정
   *
   * @param currentPage
   * @param zoomScale
   * @returns
   */
  setCanvasSize(currentPage, zoomScale) {
    const ratio = this.canvasService.setCanvasSize(currentPage, zoomScale, this.canvasContainer, this.coverCanvas, this.teacherCanvas);
    return ratio;
  }

  /**
   * 창 크기 변경시
   *
   */
  onResize() {
    // Resize시 container size 조절.
    const ratio = this.canvasService.setContainerSize(this.coverCanvas, this.canvasContainer);

    // thumbnail window 크기 변경을 위한 처리.
    this.eventBusService.emit(new EventData("change:containerSize", {
      ratio,
      coverWidth: this.coverCanvas.width,
    }));

  }

  /**
   * Scroll 발생 시
   */
  onScroll() {
    this.eventBusService.emit(new EventData('change:containerScroll', {
      left: this.canvasContainer.scrollLeft,
      top: this.canvasContainer.scrollTop
    }))
  }


  /**
     * change Page : 아래 사항에 대해 공통으로 사용
     * - 최초 Load된 경우
     * - 페이지 변경하는 경우
     * - scale 변경하는 경우
     */
  onChangePage() {

    const viewInfo = this.viewInfoService.state;

    //document Number -> 1부터 시작.
    const pageNum = viewInfo.currentPage;
    const zoomScale = viewInfo.zoomScale;

    console.log(`>> changePage to page: ${pageNum}, scale: ${zoomScale} `);

    // 기존의 rx drawing event 삭제: 다른 page에 그려지는 현상 방지
    // this.drawingService.stopRxDrawing();

    // Canvas Size 설정: ratio는 canvas container와 실제 canvas의 비율
    const ratio = this.setCanvasSize(pageNum, zoomScale);

    // Thumbnail window 조정
    this.eventBusService.emit(new EventData('change:containerSize', {
      ratio,
      coverWidth: this.coverCanvas.width,
    }));

    // Board Render
    this.pageRender(pageNum, zoomScale);

    // Canvas Event Set (zoom 조절)
    this.canvasService.addEventHandler(this.coverCanvas, this.teacherCanvas, this.currentToolInfo, zoomScale);


    // scroll bar가 있는 경우 page 전환 시 초기 위치로 변경
    this.canvasContainer.scrollTop = 0;
    this.canvasContainer.scrollLeft = 0;
  };




}

