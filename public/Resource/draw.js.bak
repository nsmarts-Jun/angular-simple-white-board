$(document).ready(function () {

    var socket = io()

    var canvas = document. getElementById ( "canvas" );
    var context = canvas. getContext ( "2d" );

    /* Get screen size
        이렇게 구하면 현재 window 화면을 구하는 것이어서
        resizing 시 그려지는 좌표가 달라짐 

    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    */


    /* resize screen

        Canvas의 크기가 설정되면 Context에 그려졌던 모든 그림이 초기화됩니다.
        그림을 계속 유지하려면 Canvas 크기를 설정한 후 그림을 다시 그려줘야합니다.
         clearRect 함수로 Canvas 크기만큼을 지우는 대신 width값을 다시 넣어주기도 하더군요.

    */
    context.clearRect(0, 0, canvas.width, canvas.height);        
    canvas.width = canvas.width;

    // 마우스 좌표
    var prevX, prevY, currentX, currentY;

    //마우스를 캔버스에서 움직였을 때 그림 그리기 여부
    var drag = false ;


    //canvas에 mousedown 이벤트 추가 : 이벤트 발생시 mDown 호출
    canvas.addEventListener("mousedown" , function (event) {
        mouseDown (event)
    }, false );
    //canvas에 mousemove 이벤트 추가 : 이벤트 발생시 mMove 호출
    canvas.addEventListener ("mousemove" , function (event) {
        mouseMove (event)
    }, false );
    //canvas에 mouseup 이벤트 추가 : 이벤트 발생시 : mUp 호출
    canvas.addEventListener ("mouseup" , function (event) {
        mouseUp (event)
    }, false );
    //canvas에 mouseout 이벤트 추가 : 이벤트 발생시 mOut 호출
    canvas.addEventListener ("mouseout" , function (event) {
        mouseOut (event)
    }, false );


    
    /* 
        offsetX : 이벤트 대상이 기준이 됩니다. 
                    화면 중간에 있는 박스 내부에서 클릭한 위치를 찾을 때 
                    해당 박스의 왼쪽 모서리 좌표가 0이됩니다. 화면의 기준이 아닙니다
    */        
    function mouseDown(event){
        drag = true; //그림 그리기는 그리는 상태로 변경

        // 마우스 클릭 시 현재 마우스 x, y 좌표
        prevX = event.offsetX;
        prevY = event.offsetY;

        // 화면 조정시 마우스와 위치가 맞지 않기 때문에 
        var canvas_ract = canvas.getBoundingClientRect();
        prevX /= canvas_ract.width; 
        prevY /= canvas_ract.height;
        prevX *= canvas.width;
        prevY *= canvas.height;
    }
        


    // 마우스 움직이기 
    function mouseMove(event){
    //drag가 false 일때는 return(return 아래는 실행 안함)
        if (!drag){
            return ;
        }

        // 현재 이동하는 마우스 좌표 값
        currentX = event.offsetX;
        currentY = event.offsetY;
       

        // 화면 조정시 마우스와 위치가 맞지 않기 때문에 
        var canvas_ract = canvas.getBoundingClientRect();
        currentX /= canvas_ract.width; 
        currentY /= canvas_ract.height;
        currentX *= canvas.width;
        currentY *= canvas.height;


        // 현재 이동하는 마우스 x, y좌표를 서버로 보내기
        socket.emit('drawInfo', {
            'x1' : prevX,
            'y1' : prevY,
            'x2' : currentX,
            'y2': currentY
        });
        console.log('클라이언트 : ' + prevX, prevY, currentX, currentY);
        
        canvasDraw(context, prevX, prevY, currentX, currentY)
        // 움직일 때 마다 x, y 값 담기
        prevX = currentX;
        prevY = currentY;
    }


    // 서버에서 뿌린 마우스 좌표 값 받기
    socket.on('draw', function(data){
        console.log(data);
        
        // 받은 값을 기반으로 자신을 제외한 소켓에 그리기
        canvasDraw(context, data.x1, data.y1, data.x2, data.y2)
    })



    // 그리기
    function canvasDraw(context, prevX, prevY, currentX, currentY){
        context. beginPath ();
        //마우스를 누르고 움직일 때마다 시작점을 재지정
        context. moveTo (prevX, prevY);
        //마우스 시작점부터 현재 점까지 라인 그리기
        context. lineTo (currentX, currentY);
        context. stroke ();
    }




 
    function mouseUp(event){
        drag = false ; //마우스를 떼었을 때 그리기 중지
    }
    
    function mouseOut(event){
        drag = false ; //마우스가 캔버스 밖으로 벗어났을 때 그리기 중지
    }

        
        
})
