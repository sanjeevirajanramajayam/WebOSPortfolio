function updateTime() {
  var currentTime = dayjs().format("YYYY-MM-DD HH:mm A");
  var timeElement = document.getElementById("datetime");
  timeElement.innerText = currentTime;
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
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "LABEL" ||
      e.target.tagName === "A"
    ) {
      return;
    }

    e.preventDefault();

    const rect = elmnt.getBoundingClientRect();
    elmnt.style.position = "fixed";
    elmnt.style.top = rect.top + "px";
    elmnt.style.left = rect.left + "px";
    elmnt.style.margin = "0";

    initialX = e.clientX;
    initialY = e.clientY;
    document.onmousemove = dragging;
    document.onmouseup = stopDragging;
  }

  function dragging(e) {
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;

    let newTop = elmnt.offsetTop - currentY;
    let newLeft = elmnt.offsetLeft - currentX;

    const maxTop = window.innerHeight - elmnt.offsetHeight;
    const maxLeft = window.innerWidth - elmnt.offsetWidth;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
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

// dragElement(document.getElementById("window"));
document.querySelectorAll(".custom-window").forEach((elmnt) => {
  dragElement(elmnt);
});

document.querySelectorAll(".desktop-icon").forEach((element) => {
  element.addEventListener("click", (e) => {
    document.querySelectorAll(".desktop-icon").forEach((element) => {
      element.classList.remove("selected");
    });
    element.classList.add("selected");
  });
});

document.body.addEventListener("click", (e) => {
  if (!e.target.closest(".desktop-icon")) {
    document.querySelectorAll(".desktop-icon").forEach((element) => {
      element.classList.remove("selected");
    });
  }
});

document.querySelectorAll("#window").forEach((element) => {
  element.addEventListener("click", (e) => {
    document.querySelectorAll(".desktop-icon").forEach((element) => {
      element.classList.remove("selected");
    });
    element.classList.add("selected");
  });
});

document.addEventListener("click", (e) => {
  if (e.target.id == "btn-close") {
    const card = e.target.closest(".card");
    card.style.display = "none";
    const card_title = card.dataset.title;
    const taskElement = document.querySelector(`[data-window="${card_title}"]`);
    taskElement.style.display = "none";
    console.log(card_title, taskElement);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id == "btn-minimize") {
    const card = e.target.closest(".card");
    card.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (e.target?.dataset?.window) {
    const card = document.querySelector(
      `[data-title="${e.target?.dataset?.window}"]`,
    );
    card.style.display = "block";
  }
});

function makeVisible(window) {
  const card = document.querySelector(`[data-title="${window}"]`);
  card.style.display = "block";
  const taskElement = document.querySelector(`[data-window="${window}"]`);
  taskElement.style.display = "block";
}
document.addEventListener("dblclick", (e) => {
  const btn = e.target.closest("[data-windowsrc]");
  if (btn) {
    makeVisible(btn.dataset.windowsrc);
  }
});

document.querySelectorAll(".desktop-icon").forEach((icon) => {
  // icon.style.position = "fixed";
  dragElement(icon, true);
});

document.querySelector(".login-submit").addEventListener("click", (e) => {
  if (
    document.querySelector("#username").value == "admin" &&
    document.querySelector("#password").value == "1234"
  ) {
    document.querySelector(".login-window").style.display = "none";
    const audio = new Audio("./audio/windows-95-startup-sound.mp3");
    audio.play();
    audio.addEventListener("ended", () => {
      document.querySelector(".desktop").style.display = "block";
    });
  } else {
    console.log("Wrong");
  }
});
