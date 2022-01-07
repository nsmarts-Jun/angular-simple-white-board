

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
		pen: [4, 7, 13],
		eraser: [30, 45, 60]
	}
};
