import { ElementRef, Injectable, ViewChild, Renderer2, RendererFactory2 } from '@angular/core';
import { CANVAS_CONFIG } from '../../config/config';
import { DrawingService } from '../drawing/drawing.service';
import { DrawStorageService } from '../../storage/draw-storage.service';



@Injectable({
  providedIn: 'root'
})
export class RenderingService {


  constructor(
    private drawingService: DrawingService,
    private drawStorageService: DrawStorageService
  ) { }

  isPageRendering = false;
  pageNumPending: boolean = null;


  /**
   * 1. Thumbnail의 보드 rendering
   *
   * @param {element} thumbCanvas thumbnail canvas element
   * @param {number} pageNum 페이지 번호
   * @param {Object} data drawing data (tool, timediff, points)
   */
  renderThumbBoard(thumbCanvas, pageNum) {
    let drawingEvents = this.drawStorageService.getDrawingEvents(pageNum);

    // 해당 page의 drawing 정보가 있는 경우
    if (drawingEvents?.drawingEvent && drawingEvents?.drawingEvent.length > 0) {

      const viewport = CANVAS_CONFIG.fullSize;
      const scale = thumbCanvas.width / (viewport.width);

      const thumbCtx = thumbCanvas.getContext('2d');

      thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
      thumbCtx.save();
      thumbCtx.scale(scale, scale);

      // Draw Service의 'end'관련 event 이용 전체 redraw
      for (const item of drawingEvents?.drawingEvent) {
        this.drawingService.end(thumbCtx, item.points, item.tool);
      }
      thumbCtx.restore();
    }
  }


  /**
   * Teacher Canvas의 board rendering
   * @param {element} targetCanvas canvas element
   * @param {number} zoomScale zoomScale
   * @param {Object} drawingEvents 판서 event (tool, points, timeDiff)
   */
  renderBoard(targetCanvas, zoomScale, drawingEvents) {
    const targetCtx = targetCanvas.getContext('2d');
    const scale = zoomScale || 1;
    targetCtx.clearRect(0, 0, targetCanvas.width / scale, targetCanvas.height / scale);
    console.log(targetCanvas.width, scale)
    /*----------------------------------------
      해당 page의 drawing 정보가 있는 경우
      drawing Service의 'end'관련 event 이용.
    -----------------------------------------*/

    // 전체 redraw
    if (drawingEvents?.drawingEvent && drawingEvents?.drawingEvent.length > 0) {
      for (const item of drawingEvents?.drawingEvent) {
        console.log(item.txt)
        this.drawingService.end(targetCtx, item.points, item.tool);
      }
    }
  }


}

