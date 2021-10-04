import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CANVAS_CONFIG } from '../../config/config';
import { EventData } from '../eventBus/event.class';
import { DrawingService } from '../drawing/drawing.service';
import { EventBusService } from '../eventBus/event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  listenerSet = [];

  constructor(
    private drawingService: DrawingService,
    private eventBusService: EventBusService,
  ) { }


  /*--------------------------------------
      getThumbnailSize
      - 각 thumbnail 별 canvas width/height
    ----------------------------------------*/
  getThumbnailSize() {

    const viewport = Object.assign({}, CANVAS_CONFIG.fullSize);

    const size = {
      width: 0,
      height: 0,
      scale: 1 // thumbnail draw에서 사용할 scale (thumbnail과 100% pdf size의 비율)
    };

    // landscape : 가로를 150px(thumbnailMaxSize)로 설정
    if (viewport.width > viewport.height) {
      size.width = CANVAS_CONFIG.thumbnailMaxSize;
      size.height = size.width * viewport.height / viewport.width;
    }
    // portrait : 세로를 150px(thumbnailMaxSize)로 설정
    else {
      size.height = CANVAS_CONFIG.thumbnailMaxSize;
      size.width = size.height * viewport.width / viewport.height;
    }
    size.scale = size.width / viewport.width;

    return size;
  }

  /**
   * Main container관련 canvas Size 설정
   *
   */
  setCanvasSize(pageNum, zoomScale, canvasContainer, coverCanvas, teacherCanvas) {
    console.log(`>>> set Canvas Size: pageNum:${pageNum}`)

    // const pdfPage =  this.pdfStorageService.getPdfPage(pdfNum, pageNum);
    const canvasFullSize = {
      width: CANVAS_CONFIG.fullSize.width * zoomScale,
      height: CANVAS_CONFIG.fullSize.height * zoomScale
    }

    /*------------------------------------
      container Size
      - 실제 canvas 영역을 고려한 width와 height
      - deviceScale은 고려하지 않음
    -------------------------------------*/
    const containerSize = {
      width: Math.min(CANVAS_CONFIG.maxContainerWidth, canvasFullSize.width),
      height: Math.min(CANVAS_CONFIG.maxContainerHeight, canvasFullSize.height)
    };

    // Canvas Container Size 조절
    canvasContainer.style.width = containerSize.width + 'px';
    canvasContainer.style.height = containerSize.height + 'px';

    // Cover Canvas 조절
    teacherCanvas.width =  coverCanvas.width = canvasFullSize.width;
    teacherCanvas.height = coverCanvas.height = canvasFullSize.height;

    // container와 canvas의 비율 => thumbnail window에 활용
    const ratio = {
      w: containerSize.width / coverCanvas.width,
      h: containerSize.height / coverCanvas.height
    };

    // canvas scale 조절
    const ctx = coverCanvas.getContext("2d");
    ctx.setTransform(zoomScale, 0, 0, zoomScale, 0, 0);


    const teacherCtx = teacherCanvas.getContext("2d");
    teacherCtx.setTransform(zoomScale, 0, 0, zoomScale, 0, 0);


    return ratio;
  }


  /**
   *
   * Canvas Container size 설정
   *
   * @param coverCanvas
   * @param canvasContainer
   * @returns
   */
  setContainerSize(coverCanvas, canvasContainer) {
    /*------------------------------------
      container Size
      - 실제 canvas 영역을 고려한 width와 height
    -------------------------------------*/
    const containerSize = {
      width: Math.min(CANVAS_CONFIG.maxContainerWidth, coverCanvas.width),
      height: Math.min(CANVAS_CONFIG.maxContainerHeight, coverCanvas.height)
    };

    // Canvas Container Size 조절
    canvasContainer.style.width = containerSize.width + 'px';
    canvasContainer.style.height = containerSize.height + 'px';


    // container와 canvas의 비율 => thumbnail window에 활용
    const ratio = {
      w: containerSize.width / coverCanvas.width,
      h: containerSize.height / coverCanvas.height
    };
    return ratio;
  }

  /**
   * Canvas에 event listener 추가
   * @param {canvas element} sourceCanvas event를 받아들일 canvas
   * @param {canvas element} targetCanvas event가 최종적으로 그려질 canvas
   * @param {object} tool  사용 tool (type, color, width)
   * @param {number} zoomScale 현재의 zoom scale
   */
  addEventHandler(sourceCanvas, targetCanvas, tool, zoomScale) {
    console.log(">>>> Add Event handler:", tool, zoomScale);
    const drawingService = this.drawingService;
    const eventBusService = this.eventBusService;

    const sourceCtx = sourceCanvas.getContext("2d");
    const targetCtx = targetCanvas.getContext("2d");

    let oldPoint = {};
    let newPoint = {};
    let points:any = [];

    // var maxNumberOfPointsPerSocket = 100;
    let startTime = null;
    let endTime = null;

    let isDown = false;
    let isTouch = false;

    const scale = zoomScale || 1;

    // **************************** Mouse/touch Event **************************************** //
    // sourceCanvas.onmousedown = sourceCanvas.ontouchstart = downEvent;
    // sourceCanvas.onmousemove = sourceCanvas.ontouchmove = moveEvent;
    // sourceCanvas.onmouseout = sourceCanvas.onmouseup = sourceCanvas.ontouchend = upEvent;
    // *************************************************************************************** //

    for (const item of this.listenerSet) {
      if (item.id === sourceCanvas.id) {
        sourceCanvas.removeEventListener(item.name, item.handler);
      }
    }
    // sourceCanvas가 동일한 경우에 대한 내용 삭제.
    this.listenerSet = this.listenerSet.filter(item => item.id !== sourceCanvas.id);

    sourceCanvas.addEventListener('mousedown', downEvent);
    sourceCanvas.addEventListener('mousemove', moveEvent);
    sourceCanvas.addEventListener('mouseup', upEvent);
    sourceCanvas.addEventListener('mouseout', upEvent);
    sourceCanvas.addEventListener('touchstart', downEvent);
    sourceCanvas.addEventListener('touchmove', moveEvent);
    sourceCanvas.addEventListener('touchend', upEvent);

    this.listenerSet.push({ id: sourceCanvas.id, name: 'mousedown', handler: downEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mousemove', handler: moveEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mouseup', handler: upEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mouseout', handler: upEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'touchstart', handler: downEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'touchmove', handler: moveEvent });
    this.listenerSet.push({ id: sourceCanvas.id, ame: 'touchend', handler: upEvent });


    // console.log(this.listenerSet);

    function downEvent(event) {
      event.preventDefault();
      isDown = true;
      // 시작시 touch/mouse가 동시에 발생할 때 (chrome dev 등)
      // --> touch기준으로 나머지 drawing 동작.
      if (event.touches) {
        isTouch = true;
      }

      oldPoint = getPoint(isTouch ? event.touches[0] : event, this, scale);
      points = oldPoint;


      drawingService.start(sourceCtx, points, tool);
      startTime = Date.now();
      event.preventDefault();
    };


    // kje: todo: mouse와 touch가 move 도중에 중복되는 경우는 없는지 확인...
    function moveEvent(event) {
      if (!isDown) return;

      newPoint = getPoint(isTouch ? event.touches[0] : event, this, scale);
      if (oldPoint[0] !== newPoint[0] || oldPoint[1] !== newPoint[1]) {
        oldPoint = newPoint;
        points.push(oldPoint[0]); // x
        points.push(oldPoint[1]); // y

        drawingService.move(sourceCtx, points, tool, scale); // scale: eraser marker 정확히 지우기 위함.
        event.preventDefault();
        // console.log(points)
      }
    };

    function upEvent() {
      if (!isDown) return;
      isDown = false;
      isTouch = false;
      drawingService.end(targetCtx, points, tool);

      /*----------------------------------------------
        Drawing Event 정보
        -> gen:newDrawEvent로 publish.
      -----------------------------------------------*/
      endTime = Date.now();
      const drawingEvent = {
        points,
        tool,
        timeDiff: endTime - startTime
      };

      // Generate Event Emitter: new Draw 알림
      eventBusService.emit(new EventData('gen:newDrawEvent', drawingEvent));

      // 3. cover canvas 초기화
      clear(sourceCanvas, scale);

      points = [];

      // console.log('upEvent', points)
    };
    /**
     * canvas 초기화
     * @param {canvas element} targetCanvas
     * @param {number} zoomScale
     */
    function clear(targetCanvas, zoomScale) {
      const targetCtx = targetCanvas.getContext('2d');
      const scale = zoomScale || 1;
      targetCtx.clearRect(0, 0, targetCanvas.width / scale, targetCanvas.height / scale);
    }

    /**
     * Point 받아오기
     * - zoom인 경우 zoom 처리 전의 좌표 *
     * @param {*} event touch 또는 mouse event
     * @param {*} target event를 받아들이는 canvas
     * @param {*} zoomScale 현재의 zoom scale
     */
    function getPoint(event, target, zoomScale) {
      const canvasRect = target.getBoundingClientRect();
      // console.log(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
      const scale = zoomScale || 1;
      const point = [Math.round((event.clientX - canvasRect.left) / scale), Math.round((event.clientY - canvasRect.top) / scale)];
      return point;
    }
  }

}
