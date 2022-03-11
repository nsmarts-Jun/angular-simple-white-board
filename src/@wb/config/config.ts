

/***************  [ DRAWING/RECORDING 관련 설정 ]  **************** */
export const CANVAS_CONFIG = {
  // main canvas의 초기 size (scale 1)
  fullSize: {
    width: 0,
    height:0
  },
	thumbnailMaxSize: 150,
	maxContainerHeight: 0,
	maxContainerWidth: 0,
	deviceScale: 1,
	maxZoomScale: 3,
	minZoomScale: 0.1,
	penWidth: 2,
	eraserWidth: 30,
	sidebarWidth: 175,
	navbarHeight: 70,
	widthSet: {
		pointer: [20, 25, 30],
		pen: [4, 7, 13],
		highlighter: [30, 45, 60],
		eraser: [20, 25, 30],
		line: [4, 7, 13],
		circle: [4, 7, 13],
		rectangle: [4, 7, 13],
		roundedRectangle: [4, 7, 13],
		textarea: [4, 7, 13],
		text: [4, 7, 13],
	}
};
