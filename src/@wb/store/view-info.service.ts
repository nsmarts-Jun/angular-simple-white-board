import { Injectable } from '@angular/core';
import { Store } from './store';


class InitViewInfo {
  numPages = 0;
  currentPage = 1;
  zoomScale = 1;
}


@Injectable({
  providedIn: 'root'
})

export class ViewInfoService extends Store<any> {

  constructor() {
    super(new InitViewInfo());
  }

  setViewInfo(data: any): void {
    this.setState({
      ...this.state, ...data
    });
  }


  /**
   * 페이지 변경에 따른 Data Update
   *
   * @param pageNum 페이지 번호
   */
  updateCurrentPageNum(pageNum: any): void {
    this.setState({
      ...this.state, currentPage: pageNum
    })
  }


  /**
   * Update Zoom Scale
   * @param
   * @param Zoom
   */
  updateZoomScale(newZoomScale): void {
    this.setState({
      ...this.state, zoomScale: newZoomScale
    })
  }

  // 한장 추가
  addPage(): void {
    const numPages = this.state.numPages;
    this.setState({
      ...this.state, numPages: numPages+1
    })
  }

  // 마지막장 삭제
  deletePage(): void {

    const numPages = this.state.numPages;
    if (numPages == 1) return;

    const obj:any = {
      numPages: numPages - 1
    }

    // 마지막 page면 page 번호 이동
    const currentPage = this.state.currentPage;
    if (currentPage == numPages) {
      obj.currentPage = currentPage-1;
    }

    this.setState({
      ...this.state, ...obj
    })
  }

}
