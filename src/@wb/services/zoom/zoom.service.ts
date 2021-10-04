import { Injectable } from '@angular/core';
import { CANVAS_CONFIG } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {

  maxZoomScale = CANVAS_CONFIG.maxZoomScale;
  minZoomScale = CANVAS_CONFIG.minZoomScale;

  constructor(
  ) { }


  // zoomscale 결정(zoomin, zoomout, fit to page .... etc)
  calcZoomScale(zoomInfo, pageNum, prevZoomScale = 1) {

    let zoomScale = 1;

    switch (zoomInfo) {
      case 'zoomIn':
        zoomScale = this.calcNewZoomScale(prevZoomScale, +1);
        break;

      case 'zoomOut':
        zoomScale = this.calcNewZoomScale(prevZoomScale, -1);
        break;

      // 너비에 맞춤
      case 'fitToWidth':
        zoomScale = this.fitToWidth(pageNum);
        break;

      // page에 맞춤
      case 'fitToPage':
        zoomScale = this.fitToPage(pageNum);
        break;
    }

    return zoomScale;
  }

  calcNewZoomScale(currentScale, sgn) {
    let step;

    // fit to page등 %로 1의 자리수가 남아있는 경우 floow 처리
    const prevScale = Math.floor(currentScale * 10) / 10;
    if (sgn > 0) {
      if (prevScale < 1.1) step = 0.1;
      else if (prevScale < 2) step = 0.2;
      else step = 0.3;
    }
    else {
      if (prevScale <= 1.1) step = 0.1;
      else if (prevScale <= 2.1) step = 0.2;
      else step = 0.3;
    }

    let newScale = Math.round((prevScale + step * sgn) * 10) / 10;

    newScale = Math.min(newScale, this.maxZoomScale);
    newScale = Math.max(newScale, this.minZoomScale);

    console.log('new Scale:', newScale);

    return newScale;
  }

  // page 폭에 맞추기
  fitToWidth(currentPage) {
    const containerSize = {
      width: CANVAS_CONFIG.maxContainerWidth,
      height: CANVAS_CONFIG.maxContainerHeight
    };
    // const pdfPage: any = this.pdfStorageService.getPdfPage(currentDoc, currentPage);
    const docSize = CANVAS_CONFIG.fullSize;
    const zoomScale = containerSize.width / docSize.width;

    return zoomScale;
  }

  // page에 맞추기
  fitToPage(currentPage) {
    const containerSize = {
      width: CANVAS_CONFIG.maxContainerWidth,
      height: CANVAS_CONFIG.maxContainerHeight
    };


    const docSize = CANVAS_CONFIG.fullSize;
    const ratio = {
      w: containerSize.width / docSize.width,
      h: containerSize.height / docSize.height
    };

    const zoomScale = Math.min(ratio.h, ratio.w);
    // const zoomScale = 1;

    return zoomScale;
  }
}
