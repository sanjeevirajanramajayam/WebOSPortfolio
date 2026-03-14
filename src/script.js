function updateTime() {
  var currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  var timeElement = document.getElementById("datetime");
  timeElement.innerHTML = currentTime;
}

setInterval(updateTime, 1000);

function dragElement(elmnt) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;

  elmnt.onmousedown = startDragging;
  elmnt.onmouseup = stopDragging;

  function startDragging(e) {
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;

    document.onmousemove = dragging;
  }

  function dragging(e) {
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;

    elmnt.style.top = elmnt.offsetTop - currentY + "px";
    elmnt.style.left = elmnt.offsetLeft - currentX + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

dragElement(document.getElementById("window"));
