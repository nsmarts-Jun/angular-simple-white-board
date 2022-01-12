import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  constructor() { }
  /**
     * Drawing Start
     */
  start(context, points, tool) {
    context.globalCompositeOperation = 'source-over';
    context.lineCap = "round";
    context.lineJoin = 'round';
    context.fillStyle = tool.color;
    context.strokeStyle = tool.color;
    context.lineWidth = 1; // check line width 영향...
    context.beginPath();
    context.arc(points[0], points[1], tool.width / 2, 0, Math.PI * 2, !0);
    context.fill();
    console.log('Start')
    context.closePath();
    if (tool.type === "eraser") {
      // eraser Marker 표시
      this.eraserMarker(context, [points[0], points[1]], tool.width);
    }
    console.log(points)
  }


  /**
   * Drawing Move
   */
  move(context, points, tool, zoomScale, sourceCanvas) {
    context.globalCompositeOperation = 'source-over';

    context.lineCap = "round";
    context.lineJoin = 'round';
    context.lineWidth = tool.width;
    context.fillStyle = tool.color;
    context.strokeStyle = tool.color;

    let a;
    let b;
    let c;
    let d;
    let i;
    const len = points.length / 2; // x, y 1차원 배열로 처리 --> /2 필요.
    context.beginPath();
    // console.log('move')
    switch (tool.type) {
      case 'pen': // Drawing은 새로운 부분만 그림 : 전체를 다시 그리면 예전 PC에서 약간 티가남...
        if (len < 3) {
          // context.moveTo(points[len-2].x, points[len-2].y);
          // context.lineTo(points[len-1].x, points[len-1].y);
          context.moveTo(points[2 * (len - 2)], points[2 * (len - 2) + 1]);
          context.lineTo(points[2 * (len - 1)], points[2 * (len - 1) + 1]);
          context.stroke();
          context.closePath();
          break;
        }

        // a = (points[len - 3].x + points[len - 2].x) / 2;
        // b = (points[len - 3].y + points[len - 2].y) / 2;
        // c = (points[len - 2].x + points[len - 1].x) / 2;
        // d = (points[len - 2].y + points[len - 1].y) / 2;
        a = (points[2 * (len - 3)] + points[2 * (len - 2)]) / 2;
        b = (points[2 * (len - 3) + 1] + points[2 * (len - 2) + 1]) / 2;
        c = (points[2 * (len - 2)] + points[2 * (len - 1)]) / 2;
        d = (points[2 * (len - 2) + 1] + points[2 * (len - 1) + 1]) / 2;

        context.moveTo(a, b);
        // context.quadraticCurveTo(points[len - 2].x, points[len - 2].y, c, d);
        context.quadraticCurveTo(points[2 * (len - 2)], points[2 * (len - 2) + 1], c, d);
        context.stroke();
        context.closePath();
        break;

      case 'eraser':	// 지우개는 cover canvas 초기화 후 처음부터 다시 그림 : eraser marker 표시용도...
        context.clearRect(0, 0, context.canvas.width / zoomScale, context.canvas.height / zoomScale);
        if (len < 3) {
          context.beginPath();
          // context.arc(points[0].x, points[0].y, tool.width/ 2, 0, Math.PI * 2, !0);
          context.arc(points[0], points[1], tool.width / 2, 0, Math.PI * 2, !0);
          context.fill();
          context.closePath();
          // eraser Marker
          // eraserMarker(context,points[len-1],tool.width);
          this.eraserMarker(context, [points[2 * (len - 1)], points[2 * (len - 1) + 1]], tool.width);
          break;
        }

        context.moveTo(points[0], points[1]);
        for (i = 1; i < len - 2; i++) {
          c = (points[2 * i] + points[2 * (i + 1)]) / 2;
          d = (points[2 * i + 1] + points[2 * (i + 1) + 1]) / 2;
          context.quadraticCurveTo(points[2 * i], points[2 * i + 1], c, d);
        }

        context.quadraticCurveTo(points[2 * i], points[2 * i + 1], points[2 * (i + 1)], points[2 * (i + 1) + 1]);
        context.stroke();
        context.closePath();

        // eraser Marker
        this.eraserMarker(context, [points[2 * (len - 1)], points[2 * (len - 1) + 1]], tool.width);
        break;

      // https://github.com/SidRH/Drawing-Different-Shapes-using-JavaScript-on-Mousedrag-
      // https://github.com/demihe/HTML5-Canvas-Paint-Application/blob/bfdee5248a46c6955b52e2e23db8fc51dc785110/drawing.js#L206
      // 선 그리기
      case 'line':
        console.log('shape moving~~~~~~')
        context.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        console.log(points)
        context.moveTo(points[0], points[1]);
        context.lineTo(points[2 * (len - 1)], points[2 * (len - 1) + 1]);
        context.quadraticCurveTo(points[2 * i], points[2 * i + 1], points[2 * (i + 1)], points[2 * (i + 1) + 1]);
        context.closePath();
        context.stroke();
        break;

      // https://github.com/SidRH/Drawing-Different-Shapes-using-JavaScript-on-Mousedrag-
      // https://github.com/demihe/HTML5-Canvas-Paint-Application/blob/bfdee5248a46c6955b52e2e23db8fc51dc785110/drawing.js#L206

      // 타원그리기
      case 'circle':
        if (len > 3) {
          context.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
          // https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
          var radiusX = (points[2 * (len - 1)] - points[0]) * 0.5,   /// radius for x based on input
            radiusY = (points[2 * (len - 1) + 1] - points[1]) * 0.5,   /// radius for y based on input
            centerX = points[0] + radiusX,      /// calc center
            centerY = points[1] + radiusY,
            step = 0.01,                 /// resolution of ellipse
            temp = step,                    /// counter
            pi2 = Math.PI * 2 - step;    /// end angle

          /// start a new path
          context.beginPath();

          /// set start point at angle 0
          context.moveTo(centerX + radiusX * Math.cos(0),
            centerY + radiusY * Math.sin(0));

          /// create the ellipse    
          for (; temp < pi2; temp += step) {
            context.lineTo(centerX + radiusX * Math.cos(temp),
              centerY + radiusY * Math.sin(temp));
          }

          /// close it and stroke it for demo
          context.closePath();
          context.strokeStyle = 'black';
          context.stroke();
        }
        break;

      // 사각형 그리기
      case 'rectangle':
        if (len > 3) {
          console.log('shape moving~~~~~~')
          context.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
          console.log(points)
          context.strokeRect(points[0], points[1], (points[2 * (len - 1)] - points[0]), (points[2 * (len - 1) + 1] - points[1]));
          // fillRect는 색이 채워지고 strokeRect은 색이 채워지지 않는다.
          // context.fillRect(points[0], points[1], (points[2 * (len - 1)] - points[0]), (points[2 * (len - 1) + 1] - points[1]));
          context.closePath();
          context.stroke();
        }
        break;



      // 모서리가 둥근 사각형 그리기
      case 'roundedRectangle':
        if (len > 3) {
          const x = points[0];
          const y = points[1];
          const width = (points[2 * (len - 1)] - points[0])
          const height = (points[2 * (len - 1) + 1] - points[1])
          let radius = 20;

          context.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
          context.beginPath();
          if (points[0] > points[2 * (len - 1)]) {
            context.moveTo(x - radius, y);
          } else {
            context.moveTo(x + radius, y);
          }
          context.arcTo(x + width, y, x + width, y + height, radius);
          context.arcTo(x + width, y + height, x, y + height, radius);
          context.arcTo(x, y + height, x, y, radius);
          context.arcTo(x, y, x + width, y, radius);
          context.closePath();
          context.stroke();
        }
        break;

      default:
        break;
    }

  }

  end(context, points, tool) {
    context.lineCap = "round";
    context.lineJoin = 'round';
    context.lineWidth = tool.width;
    context.strokeStyle = tool.color;
    context.fillStyle = tool.color;

    // cover canvas 초기화 후 다시 그림.
    // context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    let i;
    let c;
    let d;
    const len = points.length / 2;

    if (tool.type === "pen" || tool.type === "line" || tool.type === "circle" ||
      tool.type === "rectangle" || tool.type === "roundedRectangle") {
      context.globalCompositeOperation = 'source-over';
    }
    else {
      context.globalCompositeOperation = 'destination-out';
    }

    // context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    switch (tool.type) {
      case 'pen':
      case 'eraser':
        if (len < 3) {
          context.beginPath();
          context.arc(points[0], points[1], tool.width / 2, 0, Math.PI * 2, !0);
          context.fill();
          // context.closePath();
          return;
        }

        context.beginPath();
        context.moveTo(points[0], points[1]);
        // console.log('end')
        for (i = 1; i < len - 2; i++) {
          // var c = (points[i].x + points[i + 1].x) / 2,
          // 	d = (points[i].y + points[i + 1].y) / 2;
          //	context.quadraticCurveTo(points[i].x, points[i].y, c, d);
          c = (points[2 * i] + points[2 * (i + 1)]) / 2;
          d = (points[2 * i + 1] + points[2 * (i + 1) + 1]) / 2;
          context.quadraticCurveTo(points[2 * i], points[2 * i + 1], c, d);
        }
        // context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        context.quadraticCurveTo(points[2 * i], points[2 * i + 1], points[2 * (i + 1)], points[2 * (i + 1) + 1]);
        context.stroke();
        // --------------------------------------------------------------------
        // 원본 코드에는 있었으나 shape랑 있을시 오류 발생
        // 우선 주석 처리
        // --------------------------------------------------------------------
        // context.closePath();

        break;
      // 선 함수
      case 'line':
        context.beginPath();
        context.moveTo(points[0], points[1]);
        context.lineTo(points[2 * (len - 1)], points[2 * (len - 1) + 1]);
        context.quadraticCurveTo(points[2 * i], points[2 * i + 1], points[2 * (i + 1)], points[2 * (i + 1) + 1]);
        context.closePath();
        context.stroke();
        context.strokeStyle = tool.color;
        break;

      // 타원 함수
      case 'circle':
        // https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
        var radiusX = (points[2 * (len - 1)] - points[0]) * 0.5,   /// radius for x based on input
          radiusY = (points[2 * (len - 1) + 1] - points[1]) * 0.5,   /// radius for y based on input
          centerX = points[0] + radiusX,      /// calc center
          centerY = points[1] + radiusY,
          step = 0.01,                 /// resolution of ellipse
          a = step,                    /// counter
          pi2 = Math.PI * 2 - step;    /// end angle

        /// start a new path
        context.beginPath();

        /// set start point at angle 0
        context.moveTo(centerX + radiusX * Math.cos(0),
          centerY + radiusY * Math.sin(0));

        /// create the ellipse    
        for (; a < pi2; a += step) {
          context.lineTo(centerX + radiusX * Math.cos(a),
            centerY + radiusY * Math.sin(a));
        }

        /// close it and stroke it for demo
        context.closePath();
        context.stroke();
        context.strokeStyle = tool.color;
        break;

      // 사각형 함수
      case 'rectangle':
        console.log('done')
        context.beginPath();
        context.strokeRect(points[0], points[1], (points[2 * (len - 1)] - points[0]), (points[2 * (len - 1) + 1] - points[1]));
        context.closePath();
        // fillRect는 색이 채워지고 strokeRect은 색이 채워지지 안흔다.
        // context.fillRect(points[0], points[1], (points[2 * (len - 1)] - points[0]), (points[2 * (len - 1) + 1] - points[1]));
        context.strokeStyle = tool.color;
        break;

      // 모서리가 둥근 사각형 그리기
      case 'roundedRectangle':
        const x = points[0];
        const y = points[1];
        const width = (points[2 * (len - 1)] - points[0])
        const height = (points[2 * (len - 1) + 1] - points[1])
        let radius = 20;
        context.beginPath();
        if (points[0] > points[2 * (len - 1)]) {
          context.moveTo(x - radius, y);
        } else {
          context.moveTo(x + radius, y);
        }
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
        context.stroke();
        context.strokeStyle = tool.color;
        break;

      default:
        break;
    }


  }

  /**
       * 지우개 marker 표시
       */
  eraserMarker(ctx, point, width) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(point[0], point[1], width / 2, 0, Math.PI * 2, !0);
    ctx.stroke();
    ctx.closePath();
  }

  // Thumbnail에 그리기
  drawThumb(data, thumbCanvas, thumbScale) {
    const thumbCtx = thumbCanvas.getContext('2d');
    // prepare scale
    thumbCtx.save();
    thumbCtx.scale(thumbScale, thumbScale);
    this.end(thumbCtx, data.points, data.tool);
    thumbCtx.restore();
  }

  dataArray: any = [];
  stop: any = null;

  /**
 * page 전환 등...--> 기존에 그려지고 있던 event stop.
 */
  stopRxDrawing() {
    if (this.stop) {
      clearInterval(this.stop);
      this.stop = null;
    }
    this.dataArray = [];
  }

  /**
   * page 전환 등...--> 기존에 그려지고 있던 event stop.
   *
   */
  rxDrawing(data, sourceCanvas, targetCanvas, scale, docNum, pageNum) {
    const tmpData = {
      data,
      sourceCanvas,
      targetCanvas,
      scale,
      docNum,
      pageNum
    };

    this.dataArray.push(tmpData);
    // 하나의 event인 경우 그리기 시작.
    if (this.dataArray.length === 1) {
      this.rxDrawingFunc();
    }
  }


  rxDrawingFunc() {

    if (this.dataArray.length === 0) return;

    const data = this.dataArray[0].data;
    const pointsLength = data.points.length / 2;

    const sourceCanvas = this.dataArray[0].sourceCanvas;
    const context = sourceCanvas.getContext("2d");

    const targetCanvas = this.dataArray[0].targetCanvas;
    const targetContext = targetCanvas.getContext("2d");

    const scale = this.dataArray[0].scale;


    context.lineCap = "round";
    context.lineJoin = 'round';
    context.lineWidth = data.tool.width;

    if (data.tool.type === "pen") {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = data.tool.color;
      context.fillStyle = data.tool.color;
    }
    else {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = "rgba(0, 0, 0, 1)";
      context.fillStyle = "rgba(0, 0, 0, 1)";
    }

    if (pointsLength < 3) {
      context.beginPath();
      context.arc(data.points[0], data.points[1], data.tool.width / 2, 0, Math.PI * 2, !0);
      context.fill();
      context.closePath();

      this.dataArray.shift();
      this.rxDrawingFunc();
      return;
    }

    let i = 2;

    this.stop = setInterval(() => {
      context.beginPath();
      if (i === 2) {
        context.moveTo(data.points[0], data.points[1]);
      }
      else {
        const a = (data.points[2 * (i - 2)] + data.points[2 * (i - 1)]) / 2;
        const b = (data.points[2 * (i - 2) + 1] + data.points[2 * (i - 1) + 1]) / 2;
        context.moveTo(a, b);
      }
      const c = (data.points[2 * (i - 1)] + data.points[2 * i]) / 2;
      const d = (data.points[2 * (i - 1) + 1] + data.points[2 * i + 1]) / 2;

      context.quadraticCurveTo(data.points[2 * (i - 1)], data.points[2 * (i - 1) + 1], c, d);
      context.stroke();
      i += 1;

      if (i === pointsLength) {
        clearInterval(this.stop);
        this.stop = null;

        this.dataArray.shift();
        context.clearRect(0, 0, sourceCanvas.width / scale, sourceCanvas.height / scale);

        // 최종 target에 그리기
        this.end(targetContext, data.points, data.tool);

        // 다음 event 그리기 시작.
        this.rxDrawingFunc();
      }

    }, data.timeDiff / pointsLength);
  }

  /**
   * 수신 DATA 썸네일에 그리기
   *
   * @param data
   * @param thumbCanvas
   * @param thumbScale
   */
  rxDrawingThumb(data, thumbCanvas, thumbScale) {
    const thumbCtx = thumbCanvas.getContext('2d');
    // prepare scale
    thumbCtx.save();
    thumbCtx.scale(thumbScale, thumbScale);
    this.end(thumbCtx, data.points, data.tool);
    thumbCtx.restore();
  }
}
