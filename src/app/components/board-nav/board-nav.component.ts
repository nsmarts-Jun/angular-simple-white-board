import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, pluck } from 'rxjs/operators'

import { CANVAS_CONFIG } from 'src/@wb/config/config';
import { EventBusService } from 'src/@wb/services/eventBus/event-bus.service';
import { EventData } from 'src/@wb/services/eventBus/event.class';
import { DrawStorageService } from 'src/@wb/storage/draw-storage.service';

import { EditInfoService } from 'src/@wb/store/edit-info.service';
import { ViewInfoService } from 'src/@wb/store/view-info.service';



@Component({
  selector: 'app-board-nav',
  templateUrl: './board-nav.component.html',
  styleUrls: ['./board-nav.component.scss']
})
export class BoardNavComponent implements OnInit {
  isSyncMode: boolean;
  colorList = [
    { color: 'black' },
    { color: 'white' },
    { color: 'red' },
    { color: 'blue' },
    { color: 'green' },
    { color: 'yellow' }
  ]
  currentColor = 'black';
  currentTool: string = 'pen';
  menuName: any;
  numPages: any;
  currentPageNum: any;

  // Width: 3단계 설정
  widthSet = CANVAS_CONFIG.widthSet;
  currentWidth = {
    pen: this.widthSet.pen[0],
    eraser: this.widthSet.eraser[2],
    line: this.widthSet.line[0],
    circle: this.widthSet.circle[0],
    rectangle: this.widthSet.rectangle[0],
    roundedRectangle: this.widthSet.roundedRectangle[0],
  };
  mode: any = 'move';

  private unsubscribe$ = new Subject<void>();

  // canvas editing
  // https://dev.to/nyxtom/how-to-render-code-blocks-in-canvas-from-a-markdown-editor-4lif

  constructor(
    private editInfoService: EditInfoService,
    private eventBusService: EventBusService,
    private drawStorageService: DrawStorageService,
    private viewInfoService: ViewInfoService,
  ) { }


  ngOnInit(): void {
    
    // 현재 Page 변경
    this.viewInfoService.state$
      .pipe(takeUntil(this.unsubscribe$), pluck('currentPage'), distinctUntilChanged())
      .subscribe((currentPage) => {
        this.currentPageNum = currentPage;
      });

    this.editInfoService.state$
      .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged())
      .subscribe((editInfo) => {
        // console.log(editInfo);
        this.mode = editInfo.mode;
        this.currentTool = editInfo.tool;
        this.currentColor = editInfo.toolsConfig.pen.color;
        this.currentWidth = {
          pen: editInfo.toolsConfig.pen.width,
          eraser: editInfo.toolsConfig.eraser.width,
          line: editInfo.toolsConfig.line.width,
          circle: editInfo.toolsConfig.circle.width,
          rectangle: editInfo.toolsConfig.rectangle.width,
          roundedRectangle: editInfo.toolsConfig.roundedRectangle.width,
        }
      });
  }


  /**
   * 색상 변경
   *
   * - 현재 pen인 경우에만 반응
   * @param color 색상 : 향후 HEXA로 변경 고려
   *
   */
  changeColor(color) {
    const editInfo = Object.assign({}, this.editInfoService.state);

    if (editInfo.mode != 'draw' || ( editInfo.tool!='pen' && editInfo.tool!='line' &&
        editInfo.tool !='circle' && editInfo.tool !='rectangle' && editInfo.tool !='roundedRectangle'
    )) return;
    
    editInfo.toolsConfig.pen.color = color;
    editInfo.toolsConfig.line.color = color;
    editInfo.toolsConfig.circle.color = color;
    editInfo.toolsConfig.rectangle.color = color;
    editInfo.toolsConfig.roundedRectangle.color = color;
    this.editInfoService.setEditInfo(editInfo);
  }

  /**
   * Width 변경
   *
   * -현재 Pen 또는 eraser인 경우에만 반응
   *
   * @param width
   */
  changeWidth(width) {

    const editInfo = Object.assign({}, this.editInfoService.state);

    if (editInfo.mode != 'draw') return;

    const tool = editInfo.tool; // tool: 'pen', 'eraser', 'shape'
    editInfo.toolsConfig[tool].width = width;

    this.editInfoService.setEditInfo(editInfo);
  }


  /**
   * Pen, Eraser 선택
   *
   * @param tool : 'pen', 'eraser'
   *
   */
  changeTool(tool) {
    console.log(tool)
    const editInfo = Object.assign({}, this.editInfoService.state);
    editInfo.mode = 'draw';
    
    console.log(this.numPages)
    // 디폴트는 pen
    // 이미 지우개가 선택되어있을때 한번 더 
    if(editInfo.tool == 'eraser' && tool == 'eraser'){
      console.log('지우개 모드 2번 연달아 눌렀습니다----------------')
      this.drawStorageService.clearDrawingEvents(this.currentPageNum);
      this.eventBusService.emit(new EventData('rmoveDrawEventPageRendering',''));
      this.eventBusService.emit(new EventData('rmoveDrawEventThumRendering',''));
    }

    editInfo.tool = tool;
    console.log(editInfo)
    
    this.editInfoService.setEditInfo(editInfo);

    // 지우개 2번 Click은 여기서 check 하는 것이 좋을 듯?
  }


  /**
   * Move 선택
   *
   * @param mode : 현재는 'move'만 있음 (향후 sync?)
   *
   */
  changeMode(mode) {
    const editInfo = Object.assign({}, this.editInfoService.state);
    editInfo.mode = mode;
    this.editInfoService.setEditInfo(editInfo);
  }

}
