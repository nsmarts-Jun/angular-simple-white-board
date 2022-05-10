import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, QueryList, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { pluck, takeUntil, distinctUntilChanged, pairwise } from 'rxjs/operators';


import { CanvasService } from 'src/@wb/services/canvas/canvas.service';
import { DrawingService } from 'src/@wb/services/drawing/drawing.service';
import { EventBusService } from 'src/@wb/services/eventBus/event-bus.service';
import { RenderingService } from 'src/@wb/services/rendering/rendering.service';
import { DrawStorageService } from 'src/@wb/storage/draw-storage.service';

import { ViewInfoService } from 'src/@wb/store/view-info.service';



@Component({
    selector: 'app-board-slide-view',
    templateUrl: './board-slide-view.component.html',
    styleUrls: ['./board-slide-view.component.scss']
})

export class BoardSlideViewComponent implements OnInit {

    constructor(
        private canvasService: CanvasService,
        private renderingService: RenderingService,
        private viewInfoService: ViewInfoService,
        private eventBusService: EventBusService,
        private drawingService: DrawingService,
        private drawStorageService: DrawStorageService

    ) {
    }

    private unsubscribe$ = new Subject<void>();


    currentPageNum: number = 0;
    numPages: number = 1;

    thumbWindow: HTMLDivElement;
    thumbWindowSize = {
        width: '',
        height: ''
    };

    thumbArray = []; // page별 thumbnail size
    scrollRatio: any;


    @ViewChildren('thumb') thumRef: QueryList<ElementRef> // 부모 thumb-item 안에 자식 element
    @ViewChildren('thumbCanvas') thumbCanvasRef: QueryList<ElementRef>
    @ViewChildren('thumbWindow') thumbWindowRef: QueryList<ElementRef>


    ngOnInit(): void {

        // Page수 변경
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('numPages'), distinctUntilChanged())
            .subscribe((numPages) => {
                this.numPages = numPages;
                this.renderThumbnails();
            });

        // 현재 Page 변경
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('currentPage'), distinctUntilChanged())
            .subscribe((currentPage) => {
                this.currentPageNum = currentPage;
            });

        // container Scroll, Size, 판서event
        this.eventBusListeners();
    }


    ngOnDestory(): void {
        // unsubscribe all subscription
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


    /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Event Bus 관련 Listeners
     * Thumbnail Window 관련
     * 판서 Event 관련
     */
    eventBusListeners() {

        // 내가 그린 Event thumbnail에 그리기
        this.eventBusService.on('gen:newDrawEvent', this.unsubscribe$, async (data) => {
            this.drawThumb(data);
        });


        /*--------------------------------------
            Scroll event에 따라서 thumbnail window 위치/크기 변경
            --> broadcast from comclass component
        --------------------------------------*/
        this.eventBusService.on('change:containerScroll', this.unsubscribe$, async (data) => {
            this.thumbWindow = this.thumbWindowRef.last.nativeElement;
            this.thumbWindow.style.left = data.left * this.scrollRatio + 'px';
            this.thumbWindow.style.top = data.top * this.scrollRatio + 'px';
        })

        /*-------------------------------------------
            zoom, page 전환등을 하는 경우
    
            1. scroll에 필요한 ratio 계산(thumbnail과 canvas의 크기비율)은 여기서 수행
            2. thumbnail의 window size 계산 수행
        ---------------------------------------------*/
        this.eventBusService.on('change:containerSize', this.unsubscribe$, async (data) => {
            this.scrollRatio = this.thumbArray[this.currentPageNum - 1].width / data.coverWidth;
            this.thumbWindowSize = {
                width: this.thumbArray[this.currentPageNum - 1].width * data.ratio.w + 'px',
                height: this.thumbArray[this.currentPageNum - 1].height * data.ratio.h + 'px'
            };

            // console.log('<---[BUS] change:containerSize ::  this.thumbWindowSize : ', this.thumbWindowSize)
        });

        this.eventBusService.on('rmoveDrawEventThumRendering', this.unsubscribe$, (data) => {
            this.renderThumbnails();
        })

    }

    /////////////////////////////////////////////////////////////////////////////////////////


    /**
    * Thumbnail Click
    *
    * @param pageNum 페이지 번호
    * @returns
    */
    clickThumb(pageNum) {
        if (pageNum == this.currentPageNum) return; // 동일 page click은 무시

        console.log('>> [clickThumb] change Page to : ', pageNum);
        this.viewInfoService.updateCurrentPageNum(pageNum);
    }


    /**
     * page 추가
     */
    addPage() {
        this.viewInfoService.addPage();
    }

    /**
     * page 삭제
     */
    deletePage() {

        if (this.numPages === 1) return;

        this.drawStorageService.clearDrawingEvents(this.numPages);
        this.viewInfoService.deletePage();

    }


    /**
     * PAGE 수 변경에 따른 동작
     *
     */
    async renderThumbnails() {

        this.thumbArray = [];
        const thumbSize = this.canvasService.getThumbnailSize();

        for (let pageNum = 1; pageNum <= this.numPages; pageNum++) {
            this.thumbArray.push(thumbSize);
        }

        await new Promise(res => setTimeout(res, 0));
        // console.log(this.thumbArray);

        // Thumbnail Board (판서)
        for (let i = 0; i < this.thumbCanvasRef.toArray().length; i++) {
            await this.renderingService.renderThumbBoard(this.thumbCanvasRef.toArray()[i].nativeElement, i + 1);
        };

    }



    /**
     * 판서 Thumbnail에 그리기 (현재 leftSideView: thumbnail)
     *
     * @param {Object} data 내가 판서한 draw event.
     */
    drawThumb(data) {
        const thumbCanvas = this.thumbCanvasRef.toArray()[this.currentPageNum - 1].nativeElement;
        const thumbScale = this.thumbArray[this.currentPageNum - 1].scale;

        this.drawingService.drawThumb(data, thumbCanvas, thumbScale);
    };


}
