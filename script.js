if (localStorage.getItem("bg")) {
  document.body.style.backgroundImage = localStorage.getItem("bg");
}

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

  var originalZIndex = elmnt.style.zIndex;

  function startDragging(e) {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "LABEL" ||
      e.target.tagName === "A" ||
      e.target.tagName === "SELECT" ||
      e.target.tagName === "OPTION"
    ) {
      return;
    }

    e.preventDefault();
    const placeholder = document.createElement("div");

    if (
      elmnt.classList.contains("desktop-icon") &&
      !elmnt.classList.contains("drag-clicked")
    ) {
      console.log(elmnt);
      placeholder.style.width = elmnt.offsetWidth + "px";
      placeholder.style.height = elmnt.offsetHeight + "px";
      placeholder.style.display = "none";
      placeholder.id = "drag-placeholder";
      elmnt.parentNode.insertBefore(placeholder, elmnt);
      elmnt.classList.add("drag-clicked");
    }

    const rect = elmnt.getBoundingClientRect();
    elmnt.style.position = "fixed";
    elmnt.style.top = rect.top + "px";
    elmnt.style.left = rect.left + "px";
    elmnt.style.margin = "0";

    placeholder.style.display = "block";

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
    elmnt.style.zIndex = 9999;
    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";

    if (elmnt.classList.contains("desktop-icon")) {
      document.querySelectorAll(".desktop-icon").forEach((i) => {
        i.classList.remove("selected");
      });
      elmnt.classList.add("selected");
    }
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.style.zIndex = originalZIndex;
  }
}

document.querySelectorAll(".custom-window").forEach((elmnt) => {
  dragElement(elmnt);
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

    const iframe = card.querySelector("iframe");
    if (iframe) {
      iframe.src = ""; // stop game
    }
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

  document.querySelectorAll("#window").forEach((element) => {
    element.style.zIndex = 10;
    element.closest(".card").classList.remove("card-tertiary");
  });

  card.style.zIndex = 9999;
  card.closest(".card").classList.add("card-tertiary");

  const taskElement = document.querySelector(`[data-window="${window}"]`);
  if (taskElement) {
    taskElement.style.display = "block";
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cursor_wait() {
  document.body.style.cursor = `url('./cursor/Cursor_3.cur'), auto`;
  await delay(1000);
  document.body.style.cursor = `url('./cursor/arrow.cur'), auto`;
}

document.addEventListener("dblclick", async (e) => {
  await cursor_wait();
  const btn = e.target.closest("[data-windowsrc]");
  const card = document.querySelector(
    `[data-title="${btn.dataset.windowsrc}"]`,
  );
  if (!card) return;

  const iframe = card.querySelector("iframe");
  if (iframe) {
    iframe.src = "https://git.nihilogic.dk/wolf3d/";
  }
  if (btn) {
    makeVisible(btn.dataset.windowsrc);
  }
});

document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("click", (e) => {
    console.log(e);
    document.querySelectorAll(".desktop-icon").forEach((i) => {
      i.classList.remove("selected");
    });
    icon.classList.add("selected");
  });
  // icon.style.position = "fixed";
  dragElement(icon);
});

document.querySelector(".login-submit").addEventListener("click", (e) => {
  if (
    document.querySelector("#username").value == "admin" &&
    document.querySelector("#password").value == "1234"
  ) {
    document.querySelector(".login-window").style.display = "none";
    const audio = new Audio("./audio/windows-95-startup-sound.mp3");
    audio.play();
    audio.addEventListener("ended", () => {});
    document.querySelector(".desktop").style.display = "block";
  } else {
    let error_card = document.querySelector(`[data-title=error]`);
    const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
    audio.play();
    document.querySelector(".error-ok").addEventListener("click", (e) => {
      e.target.closest(".card").style.display = "none";
    });
    error_card.style.display = "block";
    document.querySelector(".login-window").style.zIndex = "10";
    error_card.style.zIndex = "99999999";
  }
  // document.querySelector(".login-window").style.display = "none";
  // const audio = new Audio("./audio/windows-95-startup-sound.mp3");
  // audio.play();
  // document.querySelector(".desktop").style.display = "block";
});

document.querySelector(".dummy-ok").addEventListener("click", (e) => {
  e.target.closest(".card").style.display = "none";
});

let width = 0;

if (document.querySelector(".download-btn")) {
  document.querySelector(".download-btn").addEventListener("click", (e) => {
    e.target.parentElement.parentElement.querySelector(
      ".download-text",
    ).innerText = "Downloading Resume...";

    const interval = setInterval(() => {
      width += Math.floor(Math.random() * 0.1) + 0.1;
      e.target.parentElement.parentElement.querySelector(
        ".download-progress",
      ).value = width;
      if (width >= 1) {
        let download_a = document.querySelector(".download-resume");
        download_a.click();
        width = 0;
        e.target.parentElement.parentElement.querySelector(
          ".download-progress",
        ).value = width;
        e.target.parentElement.parentElement.querySelector(
          ".download-text",
        ).innerText = "Download Resume";
        console.log(width);
        const taskElement = document.querySelector(`[data-window="resume"]`);
        taskElement.style.display = "none";
        document.querySelector("[data-title=resume]").style.display = "none";
        clearInterval(interval);
      }
    }, 200);

    // e.target.parentElement.parentElement.querySelector(".download-progress").value = 20;
  });
}
console.log(width);
document.querySelectorAll("#window").forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelectorAll("#window").forEach((element) => {
      element.style.zIndex = 10;
      element.closest(".card").classList.remove("card-tertiary");
    });
    element.style.zIndex = 20;
    element.closest(".card").classList.add("card-tertiary");
  });
});

document.querySelector(".start-btn").addEventListener("click", (e) => {
  console.log(document.querySelector(".menu-bar").style.display);

  if (document.querySelector(".menu-bar").style.display === "") {
    document.querySelector(".menu-bar").style.display = "flex";
  } else {
    document.querySelector(".menu-bar").style.display = "";
  }
});

document.querySelector(".logout-btn").addEventListener("click", (e) => {
  document.querySelector(".login-window").style.display = "block";
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  audio.play();
  audio.addEventListener("ended", () => {});
  document.querySelector(".desktop").style.display = "none";
  document.querySelector(".menu-bar").style.display = "none";
});

document.querySelector(".settings-btn").addEventListener("click", (e) => {
  // document.querySelector(".login-window").style.display = "block";
  // const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  // audio.play();
  makeVisible("settings");
  // document.querySelector(".settings-window").style.display = "block";
  // audio.addEventListener("ended", () => {});
  // document.querySelector(".desktop").style.display = "none";
  document.querySelector(".menu-bar").style.display = "none";
});

document.querySelectorAll(".dummy-btn").forEach((element) => {
  element.addEventListener("click", (e) => {
    // document.querySelector(".login-window").style.display = "block";
    // const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
    // audio.play();
    document.querySelector(".dummy-window").style.display = "block";
    // audio.addEventListener("ended", () => {});
    // document.querySelector(".desktop").style.display = "none";
    document.querySelector(".menu-bar").style.display = "none";
  });
});

document.querySelector(".sleep-btn").addEventListener("click", (e) => {
  document.querySelector(".login-window").style.display = "block";
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  audio.play();
  audio.addEventListener("ended", () => {});
  document.querySelector(".desktop").style.display = "none";
  document.querySelector(".menu-bar").style.display = "none";
});

document.querySelector(".shutdown-btn").addEventListener("click", (e) => {
  document.querySelector(".login-window").style.display = "block";
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  audio.play();
  audio.addEventListener("ended", () => {});
  document.querySelector(".desktop").style.display = "none";
  document.querySelector(".menu-bar").style.display = "none";
});

document.querySelector(".bg-apply").addEventListener("click", (e) => {
  document.body.style.backgroundImage = `url(${"./images/" + document.querySelector("#bg-select").value})`;
  localStorage.setItem("bg", document.body.style.backgroundImage);
});

document.querySelectorAll(".bg-option").forEach((e) => {
  e.addEventListener("click", (eve) => {
    document.querySelector(".monitor-display").src =
      "./images/" + document.querySelector("#bg-select").value;
  });
});

document.querySelectorAll(".tab").forEach((element) => {
  element.addEventListener("click", (e) => {
    console.log(element.dataset.set);
    document.querySelectorAll(".tab").forEach((e) => {
      e.classList.remove("is-active");
    });
    document.querySelectorAll(".tab-content").forEach((e) => {
      e.classList.remove("is-active");
    });
    element.classList.add("is-active");
    document
      .getElementById(`${element.dataset.set}`)
      .classList.add("is-active");
    // document.target.element.id;
  });
});
