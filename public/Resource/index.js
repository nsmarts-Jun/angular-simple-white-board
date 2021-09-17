var socket = io()

/* 접속 되었을 때 실행 */
socket.on('connect', function() {
  var name = ''

  /* 이름이 빈칸인 경우 */
  if(!name) {
    name = '익명'
  }

  /* 서버에 새로운 유저가 왔다고 알림 */
  socket.emit('newUser', name)
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update', function(data) {
  var className = ''

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch(data.type) {

    case 'connect':
      className = 'connect'
      break

    case 'disconnect':
      className = 'disconnect'
      break
  }


})

