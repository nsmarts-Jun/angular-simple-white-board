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
    // sidenav ????????? resize event ??????... ????????????.
    if (CANVAS_CONFIG.maxContainerWidth === newWidth && CANVAS_CONFIG.maxContainerHeight === newHeight) {
      return;
    }
    CANVAS_CONFIG.maxContainerWidth = newWidth;
    CANVAS_CONFIG.maxContainerHeight = newHeight;
    this.onResize();
  }


  ngOnInit(): void {

    // canvas Element ??????
    this.coverCanvas = this.coverCanvasRef.nativeElement;
    this.teacherCanvas = this.teacherCanvasRef.nativeElement;
    this.canvasContainer = this.canvasContainerRef.nativeElement;


    // page ??????
    this.viewInfoService.state$
      .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged())
      .subscribe((viewInfo) => {
        this.onChangePage();
      });



    // Tool update(nav Menu)??? ?????? event handler ??????
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
        console.log(this.currentToolInfo)

        const zoomScale = this.viewInfoService.state.zoomScale;

        // canvas Event Handler ??????
        this.canvasService.addEventHandler(this.coverCanvas, this.teacherCanvas, this.currentToolInfo, zoomScale);
      });


    // continer scroll Listener : thumbnail??? window ?????? ??????
    this.rendererEvent1 = this.renderer.listen(this.canvasContainer, 'scroll', event => {
      this.onScroll();
    });

    this.eventBusListeners();
  }

  // end of ngOnInit
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // render listener ??????
    this.rendererEvent1();
  }

  eventBusListeners() {
    // board-nav??? ?????? ?????? ????????? ????????? ????????? ?????? 
    // ?????? ????????? ?????????
    this.eventBusService.on('rmoveDrawEventPageRendering',this.unsubscribe$,(data)=>{
      const viewInfo = this.viewInfoService.state;
      //document Number -> 1?????? ??????.
      const pageNum = viewInfo.currentPage;
      const zoomScale = viewInfo.zoomScale;
      this.pageRender(pageNum, zoomScale)
    })
  }

  /**
   * ?????? Rendering
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
   * Canvas size ??????
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
   * ??? ?????? ?????????
   *
   */
  onResize() {
    // Resize??? container size ??????.
    const ratio = this.canvasService.setContainerSize(this.coverCanvas, this.canvasContainer);

    // thumbnail window ?????? ????????? ?????? ??????.
    this.eventBusService.emit(new EventData("change:containerSize", {
      ratio,
      coverWidth: this.coverCanvas.width,
    }));

  }

  /**
   * Scroll ?????? ???
   */
  onScroll() {
    this.eventBusService.emit(new EventData('change:containerScroll', {
      left: this.canvasContainer.scrollLeft,
      top: this.canvasContainer.scrollTop
    }))
  }


  /**
     * change Page : ?????? ????????? ?????? ???????????? ??????
     * - ?????? Load??? ??????
     * - ????????? ???????????? ??????
     * - scale ???????????? ??????
     */
  onChangePage() {

    const viewInfo = this.viewInfoService.state;

    //document Number -> 1?????? ??????.
    const pageNum = viewInfo.currentPage;
    const zoomScale = viewInfo.zoomScale;

    console.log(`>> changePage to page: ${pageNum}, scale: ${zoomScale} `);

    // ????????? rx drawing event ??????: ?????? page??? ???????????? ?????? ??????
    // this.drawingService.stopRxDrawing();

    // Canvas Size ??????: ratio??? canvas container??? ?????? canvas??? ??????
    const ratio = this.setCanvasSize(pageNum, zoomScale);

    // Thumbnail window ??????
    this.eventBusService.emit(new EventData('change:containerSize', {
      ratio,
      coverWidth: this.coverCanvas.width,
    }));

    // Board Render
    this.pageRender(pageNum, zoomScale);

    // Canvas Event Set (zoom ??????)
    this.canvasService.addEventHandler(this.coverCanvas, this.teacherCanvas, this.currentToolInfo, zoomScale);


    // scroll bar??? ?????? ?????? page ?????? ??? ?????? ????????? ??????
    this.canvasContainer.scrollTop = 0;
    this.canvasContainer.scrollLeft = 0;
  };




}

