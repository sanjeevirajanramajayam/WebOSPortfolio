const desktopIcons = document.querySelectorAll(".desktop-icon");
const menuBar = document.querySelector(".menu-bar");
const windows = document.querySelectorAll("#window");
const WOLF3D_URL = "https://git.nihilogic.dk/wolf3d/";
function updateTime() {
  var currentTime = dayjs().format("YYYY-MM-DD HH:mm A");
  var timeElement = document.getElementById("datetime");
  timeElement.innerText = currentTime;
}
const trashIcon = document.querySelector(".trash");

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
      desktopIcons.forEach((i) => {
        i.classList.remove("selected");
      });
      elmnt.classList.add("selected");
    }
  }

  async function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.style.zIndex = originalZIndex;
    if (elmnt.classList.contains("computer-sys")) {
      const trash = trashIcon.getBoundingClientRect();
      const rect = elmnt.getBoundingClientRect();
      const overlap =
        rect.right > trash.left &&
        rect.left < trash.right &&
        rect.top < trash.bottom &&
        rect.bottom > trash.top;
      if (overlap) {
        console.log(overlap, elmnt, trash);
        const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
        audio.play();
        const div = document.createElement("div");
        div.className = "bsod-overlay";

        div.innerHTML = `
        <img src="./images/byod.webp" alt="Error Screen" />
      `;

        Object.assign(div.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          background: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "99999999",
        });

        const img = div.querySelector("img");
        Object.assign(img.style, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
        });

        document.body.appendChild(div);
        cursor_wait(500);
        await delay(750);
        window.close();
      }
    }
  }
}

document.querySelectorAll(".custom-window").forEach((elmnt) => {
  dragElement(elmnt);
});

document.body.addEventListener("click", (e) => {
  if (!e.target.closest(".desktop-icon")) {
    desktopIcons.forEach((element) => {
      element.classList.remove("selected");
    });
  }
});

windows.forEach((element) => {
  element.addEventListener("click", (e) => {
    desktopIcons.forEach((element) => {
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
      iframe.src = "";
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
  const taskButton = e.target.closest("[data-window]");
  if (taskButton?.dataset?.window) {
    const windowName = taskButton.dataset.window;
    makeVisible(windowName);

    if (windowName === "game") {
      loadWolf3D();
    }
  }
});

function loadWolf3D(forceReload = false) {
  const gameFrame = document.querySelector('[data-title="game"] iframe');
  if (!gameFrame) {
    return;
  }

  const frameSrc = gameFrame.getAttribute("src") || "";
  const needsLoad =
    forceReload || frameSrc.trim() === "" || frameSrc === "about:blank";

  if (needsLoad) {
    gameFrame.setAttribute("src", WOLF3D_URL);
  }
}

function closeAllGuideWindows() {
  document.querySelectorAll(".card[data-title]").forEach((card) => {
    const title = card.dataset.title;
    card.style.display = "none";

    if (title === "game") {
      const gameFrame = card.querySelector("iframe");
      if (gameFrame) {
        gameFrame.setAttribute("src", "");
      }
    }

    const taskElement = document.querySelector(`[data-window="${title}"]`);
    if (taskElement) {
      taskElement.style.display = "none";
    }
  });
}

function makeVisible(window) {
  const card = document.querySelector(`[data-title="${window}"]`);
  // console.log(card)
  card.style.display = "block";

  if (window === "game") {
    loadWolf3D();
  }

  windows.forEach((element) => {
    if (element.style.zIndex == 999999) {
      return;
    }
    if (element.classList.contains("error-window")) {
      return;
    }
    element.style.zIndex = 10;
    element.closest(".card").classList.remove("card-tertiary");
  });

  card.style.zIndex = 9999;
  card.closest(".card").classList.add("card-tertiary");
  console.log(card.closest(".card").classList, card.style.zIndex);

  const taskElement = document.querySelector(`[data-window="${window}"]`);
  if (taskElement) {
    taskElement.style.display = "block";
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cursor_wait(time) {
  document.body.style.cursor = `url('./cursor/Cursor_3.cur'), auto`;
  await delay(time);
  document.body.style.cursor = `url('./cursor/arrow.cur'), auto`;
}

document.addEventListener("dblclick", async (e) => {
  const btn = e.target.closest("[data-windowsrc]");
  if (!btn) {
    return;
  }

  await cursor_wait(2000);
  const targetWindow = btn.dataset.windowsrc;
  const card = document.querySelector(`[data-title="${targetWindow}"]`);

  if (targetWindow === "dummy") {
    const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
    audio.play();
    makeVisible("dummy");
    menuBar.style.display = "none";
    return;
  }

  if (targetWindow === "game") {
    makeVisible("game");
    loadWolf3D(true);
    return;
  }

  if (targetWindow === "portfolio" && card?.querySelector("iframe")) {
    card.querySelector("iframe").src = WOLF3D_URL;
  }

  makeVisible(targetWindow);
});

desktopIcons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    console.log(e);
    desktopIcons.forEach((i) => {
      i.classList.remove("selected");
    });
    icon.classList.add("selected");
  });
  // icon.style.position = "fixed";
  dragElement(icon);
});

document.querySelector(".error-ok").addEventListener("click", (e) => {
  e.target.closest(".card").style.display = "none";
});

document.querySelector(".login-submit").addEventListener("click", async (e) => {
  if (
    document.querySelector("#username").value == "admin" &&
    document.querySelector("#password").value == "1234"
  ) {
    cursor_wait(1000);
    document.querySelector(".login-window").style.display = "none";
    const audio = new Audio("./audio/windows-95-startup-sound.mp3");
    audio.play();
    await cursor_wait(2000);
    if (localStorage.getItem("bg")) {
      document.body.style.backgroundImage = localStorage.getItem("bg");
    }
    document.querySelector(".desktop").style.display = "block";
    audio.addEventListener("ended", () => {});
  } else {
    // makeVisible("error");
    let error_card = document.querySelector(`[data-title=error]`);
    const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
    audio.play();
    error_card.style.zIndex = 999999;

    console.log(error_card);
    error_card.style.zIndex = 999999;
    error_card.classList.add("card-tertiary");
    // document.querySelector(".login-window").classList.remove("card-teritiary");
    console.log();
    error_card.style.display = "block";
    console.log(error_card);

    // document.querySelector(".login-window").style.zIndex = "-1";
    console.log(document.querySelector(".login-window").style.zIndex);
    // error_card.style.zIndex = "99999999";
    // error_card.style.display = "block";
    console.log(error_card.style.zIndex);
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
  });
}
console.log(width);
windows.forEach((element) => {
  element.addEventListener("click", () => {
    windows.forEach((element) => {
      if (element.style.zIndex == 999999) {
        return;
      }
      element.style.zIndex = 10;
      element.closest(".card").classList.remove("card-tertiary");
    });
    element.style.zIndex = 20;
    element.closest(".card").classList.add("card-tertiary");
  });
});

document.querySelector(".start-btn").addEventListener("click", (e) => {
  if (menuBar.style.display === "" || menuBar.style.display === "none") {
    menuBar.style.display = "flex";
  } else {
    menuBar.style.display = "none";
  }
});

document.querySelector(".logout-btn").addEventListener("click", async (e) => {
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  await cursor_wait(2000);
  audio.play();
  document.querySelector(".desktop").style.display = "none";
  menuBar.style.display = "none";
  document.body.style.backgroundImage = "url('./images/background.png')";
  document.querySelector(".login-window").style.display = "block";
});

document.querySelector(".settings-btn").addEventListener("click", (e) => {
  makeVisible("settings");
  menuBar.style.display = "none";
});

document.querySelectorAll(".dummy-btn").forEach((element) => {
  element.addEventListener("click", (e) => {
    const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
    audio.play();
    // document.querySelector(".dummy-window").style.display = "block";
    makeVisible("dummy");
    menuBar.style.display = "none";
  });
});

document.querySelector(".sleep-btn").addEventListener("click", async (e) => {
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  await cursor_wait(2000);
  audio.play();
  document.querySelector(".desktop").style.display = "none";
  menuBar.style.display = "none";
  document.body.style.backgroundImage = "url('./images/background.png')";
  document.querySelector(".login-window").style.display = "block";
});

document.querySelector(".shutdown-btn").addEventListener("click", async (e) => {
  const audio = new Audio("./audio/windows-95-logout-sound-effect.mp3");
  await cursor_wait(2000);
  audio.play();
  document.querySelector(".desktop").style.display = "none";
  menuBar.style.display = "none";
  document.body.style.backgroundImage = "url('./images/background.png')";
  document.querySelector(".login-window").style.display = "block";
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
  element.addEventListener("click", () => {
    const scope = element.closest(".card-body") || document;
    const tabSet = element.dataset.set;

    scope.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("is-active");
    });

    scope.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("is-active");
    });

    element.classList.add("is-active");

    const target = scope.querySelector(`.tab-content[id="${tabSet}"]`);
    if (target) {
      target.classList.add("is-active");
    }

    // Keep tour cutout in sync when tab content changes size (notably Projects tabs).
    if (typeof renderGuideStep === "function" && isGuideActive) {
      requestAnimationFrame(() => {
        renderGuideStep();
      });
    }
  });
});

function highlightElement(selectors, clipText, options = {}) {
  const spotlight = document.querySelector(".tour-overlay");
  if (!spotlight) {
    return;
  }

  const includeClippyCutout = options.includeClippyCutout ?? true;
  const clippyOpacity = options.clippyOpacity ?? 1;

  const elements = selectors.flatMap((selector) =>
    [...document.querySelectorAll(selector)].filter((el) => el !== null),
  );

  // remove old highlights first
  document
    .querySelectorAll(".highlight-target")
    .forEach((el) => el.classList.remove("highlight-target"));

  // add new highlights
  elements.forEach((el) => el.classList.add("highlight-target"));

  if (!elements.length) {
    return;
  }

  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cutoutRects = [];

  const baseRects = elements.map((el) => el.getBoundingClientRect());
  const baseTop = Math.min(...baseRects.map((r) => r.top));
  const baseLeft = Math.min(...baseRects.map((r) => r.left));
  const baseRight = Math.max(...baseRects.map((r) => r.right));
  const baseBottom = Math.max(...baseRects.map((r) => r.bottom));

  cutoutRects.push({
    x: Math.max(0, baseLeft - padding),
    y: Math.max(0, baseTop - padding),
    width: Math.min(viewportWidth, baseRight - baseLeft + padding * 2),
    height: Math.min(viewportHeight, baseBottom - baseTop + padding * 2),
  });

  const clippy = document.querySelector("#clippy");
  const clippyText = document.querySelector(".clippy-text");
  clippyText.innerText = clipText;
  if (clippy) {
    clippy.style.opacity = `${clippyOpacity}`;
  }

  const clippyAlreadyInPrimarySelectors = clippy && elements.includes(clippy);
  if (clippy && includeClippyCutout && !clippyAlreadyInPrimarySelectors) {
    const clippyRect = clippy.getBoundingClientRect();
    cutoutRects.push({
      x: Math.max(0, clippyRect.left - padding),
      y: Math.max(0, clippyRect.top - padding),
      width: Math.min(viewportWidth, clippyRect.width + padding * 2),
      height: Math.min(viewportHeight, clippyRect.height + padding * 2),
    });
  }

  const pathData = [
    `M 0 0 H ${viewportWidth} V ${viewportHeight} H 0 Z`,
    ...cutoutRects.map(
      ({ x, y, width, height }) =>
        `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`,
    ),
  ].join(" ");

  spotlight.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${viewportWidth} ${viewportHeight}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${pathData}" fill="rgba(0, 0, 0, 0.7)" fill-rule="evenodd"></path>
    </svg>
  `;
  spotlight.classList.remove("hidden");
}

let currentIndex = 0;
let activeGuideSelectors = [];
const activatedGuideSteps = new Set();
let isGuideActive = true;
const TOUR_COMPLETED_KEY = "webos-tour-completed";

const guidePrevBtn = document.querySelector(".guide-prev-btn");
const guideNextBtn = document.querySelector(".guide-next-btn");
const clippyTextElement = document.querySelector(".clippy-text");
const clippyElement = document.querySelector("#clippy");
const clippyImageElement = document.querySelector("#clippy img");
const defaultClippyImageSrc = clippyImageElement?.getAttribute("src") || "";
const clippyTips = [
  "Tip: Double-click desktop icons to open windows faster.",
  "Tip: Use the Start button to find Settings and power actions.",
  "Tip: You can drag windows around by grabbing their title bars.",
  "Tip: Click taskbar items to bring windows back quickly.",
  "Tip: Try changing wallpapers in Settings for a different mood.",
  "Tip: Please do not put My Computer in the Recycle Bin.",
];
const clippyIdleImages = [
  "./images/clippy-idle.png",
  "./images/clippy-idle2.png",
  "./images/clippy-idle3.png",
  "./images/clippy-idle4.png",
  "./images/clippy-idle5.png",
  "./images/clippy-idle6.png",
  "./images/clippy-idle7.png",
  "./images/clippy-idle9.png",
];

const guideList = [
  {
    clippyText:
      "Welcome! This tour will walk through the major parts of this Windows 95 portfolio.",
    classes: [".desktop"],
    includeClippyCutout: false,
    clippyOpacity: 0.9,
    clippyImage: "./images/clippy-grab-attention.png",
  },
  {
    clippyText:
      "These are the classic left-side desktop icons, matching the original Windows vibe. And please do not put My Computer in the Recycle Bin.",
    classes: [".classic-icons"],
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "These right-side shortcuts open Portfolio, Resume, Projects, and Wolfenstein.",
    classes: [
      '.desktop-icon[data-windowsrc="portfolio"]',
      '.desktop-icon[data-windowsrc="resume"]',
      '.desktop-icon[data-windowsrc="projects"]',
      '.desktop-icon[data-windowsrc="game"]',
    ],
    clippyImage: "./images/clippy-right.png",
  },
  {
    clippyText:
      "This bottom taskbar shows running shortcuts and the live clock.",
    classes: [".taskbar", "#datetime"],
    clippyImage: "./images/clippy-down.png",
  },
  {
    clippyText:
      "Click Start to open the Start Menu. Click Start again to close it.",
    classes: [".start-btn"],
    waitForClick: ".start-btn",
    highlightAfterClick: ".menu-bar",
    ensureMenu: "closed",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "The Start Menu gives quick access to Settings and power actions.",
    classes: [".menu-bar", ".settings-btn", ".logout-btn", ".shutdown-btn"],
    ensureMenu: "open",
    clippyImage: "./images/clippy-idle2.png",
  },
  {
    clippyText:
      "Click Settings from the Start Menu to open the control panel window.",
    classes: [".menu-bar .settings-btn"],
    waitForClick: ".menu-bar .settings-btn",
    highlightAfterClick: [
      '[data-title="settings"]',
      '[data-window="settings"]',
    ],
    ensureMenu: "open",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "In Settings, you can preview wallpapers and apply a new background.",
    classes: ['[data-title="settings"]'],
    ensureWindow: "settings",
    clippyImage: "./images/clippy-up.png",
  },
  {
    clippyText:
      "This is your Portfolio window. It is pinned on the taskbar for quick return.",
    classes: ['[data-title="portfolio"]'],
    ensureWindow: "portfolio",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "Projects includes tabbed sections with your work and technical details.",
    classes: [
      '[data-title="projects"] .tabs',
      '[data-title="projects"] .tab-content.is-active',
    ],
    ensureWindow: "projects",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "Resume has a fake nostalgic download flow with a progress bar.",
    classes: ['[data-title="resume"]'],
    ensureWindow: "resume",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "Wolfenstein opens inside this built-in game window for the retro feel.",
    classes: ['[data-title="game"]'],
    ensureWindow: "game",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "Tour complete. Use Prev to review, or Restart to play the guide again.",
    classes: ["#clippy"],
    includeClippyCutout: true,
    closeWindows: ["game"],

    clippyImage: "./images/clippy-finish.png",
  },
];

function setClippyImageForStep(step) {
  if (!clippyImageElement) {
    return;
  }

  const stepImage = step?.clippyImage || defaultClippyImageSrc;
  if (stepImage) {
    clippyImageElement.setAttribute("src", stepImage);
  }
}

function setRandomClippyIdleImage() {
  if (!clippyImageElement || !clippyIdleImages.length) {
    return;
  }

  const currentSrc = clippyImageElement.getAttribute("src") || "";
  let randomImage =
    clippyIdleImages[Math.floor(Math.random() * clippyIdleImages.length)];

  if (clippyIdleImages.length > 1) {
    while (randomImage === currentSrc) {
      randomImage =
        clippyIdleImages[Math.floor(Math.random() * clippyIdleImages.length)];
    }
  }

  clippyImageElement.setAttribute("src", randomImage);
}

function closeStartMenu() {
  menuBar.style.display = "none";
}

function openStartMenu() {
  menuBar.style.display = "flex";
}

function clearGuideVisualState() {
  const spotlight = document.querySelector(".tour-overlay");
  if (spotlight) {
    spotlight.innerHTML = "";
    spotlight.classList.add("hidden");
  }

  document
    .querySelectorAll(".highlight-target")
    .forEach((el) => el.classList.remove("highlight-target"));

  document
    .querySelectorAll(".tour-allow-click")
    .forEach((el) => el.classList.remove("tour-allow-click"));
}

function updateGuideNavButtons() {
  if (!isGuideActive) {
    guidePrevBtn.style.visibility = "hidden";
    guideNextBtn.innerText = "Restart";
    return;
  }

  guidePrevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
  guideNextBtn.innerText =
    currentIndex === guideList.length - 1 ? "Finish" : "Next";
}

function endGuide() {
  isGuideActive = false;
  localStorage.setItem(TOUR_COMPLETED_KEY, "true");
  clearGuideVisualState();
  document.body.classList.remove("tour-lock");
  closeStartMenu();

  const clippy = document.querySelector("#clippy");
  if (clippy) {
    clippy.style.opacity = "1";
  }
  setClippyImageForStep(null);

  if (clippyTextElement) {
    clippyTextElement.innerText =
      "Guide finished. Click me for random tips, or click Restart to run the walkthrough again.";
  }

  updateGuideNavButtons();
}

function restartGuide() {
  isGuideActive = true;
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  currentIndex = 0;
  activatedGuideSteps.clear();
  closeAllGuideWindows();
  renderGuideStep();
}

function showRandomClippyTip() {
  if (!clippyTextElement) {
    return;
  }

  const currentText = clippyTextElement.innerText;
  let randomTip = clippyTips[Math.floor(Math.random() * clippyTips.length)];

  if (clippyTips.length > 1) {
    while (randomTip === currentText) {
      randomTip = clippyTips[Math.floor(Math.random() * clippyTips.length)];
    }
  }

  clippyTextElement.innerText = randomTip;
  setRandomClippyIdleImage();
}

function applyStepUIState() {
  const step = guideList[currentIndex];
  const isCurrentStepActivated = activatedGuideSteps.has(currentIndex);

  if (step.ensureMenu === "open") {
    openStartMenu();
  }

  // For interactive steps (like Start), keep the menu closed initially,
  // but do not force-close once the step is activated by user action.
  if (step.ensureMenu === "closed" && !isCurrentStepActivated) {
    closeStartMenu();
  }

  if (step.ensureWindow) {
    document.querySelectorAll(".card[data-title]").forEach((card) => {
      const title = card.dataset.title;
      if (title !== step.ensureWindow) {
        card.style.display = "none";

        const taskElement = document.querySelector(`[data-window="${title}"]`);
        if (taskElement) {
          taskElement.style.display = "none";
        }
      }
    });

    makeVisible(step.ensureWindow);
  }

  const windowsToClose = normalizeSelectors(step.closeWindows);
  windowsToClose.forEach((windowName) => {
    const card = document.querySelector(`[data-title="${windowName}"]`);
    if (card) {
      card.style.display = "none";
      const iframe = card.querySelector("iframe");
      if (iframe) {
        iframe.setAttribute("src", "");
      }
    }

    const taskElement = document.querySelector(`[data-window="${windowName}"]`);
    if (taskElement) {
      taskElement.style.display = "none";
    }
  });
}

function getStepSelectors() {
  const step = guideList[currentIndex];
  const selectors = [...step.classes];

  if (activatedGuideSteps.has(currentIndex) && step.highlightAfterClick) {
    selectors.push(...normalizeSelectors(step.highlightAfterClick));
  }

  return [...new Set(selectors)];
}

function normalizeSelectors(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function setGuideInteractionLock(selectors) {
  document.body.classList.add("tour-lock");

  document
    .querySelectorAll(".tour-allow-click")
    .forEach((el) => el.classList.remove("tour-allow-click"));

  const alwaysAllowed = ["#clippy", ".guide-prev-btn", ".guide-next-btn"];
  const step = guideList[currentIndex];
  const waitSelectors = normalizeSelectors(step.waitForClick);
  const allowedSelectors = [...alwaysAllowed, ...selectors, ...waitSelectors];

  [...new Set(allowedSelectors)].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add("tour-allow-click");
    });
  });
}

function renderGuideStep() {
  if (!isGuideActive) {
    return;
  }

  setClippyImageForStep(guideList[currentIndex]);
  applyStepUIState();
  activeGuideSelectors = getStepSelectors();

  const stepNumberLabel = `Step ${currentIndex + 1}/${guideList.length}: `;
  highlightElement(
    activeGuideSelectors,
    stepNumberLabel + guideList[currentIndex].clippyText,
    {
      includeClippyCutout: guideList[currentIndex].includeClippyCutout,
      clippyOpacity: guideList[currentIndex].clippyOpacity,
    },
  );
  setGuideInteractionLock(activeGuideSelectors);
  updateGuideNavButtons();
}

const wasGuideCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
if (wasGuideCompleted) {
  isGuideActive = false;
  clearGuideVisualState();
  document.body.classList.remove("tour-lock");
  if (clippyTextElement) {
    clippyTextElement.innerText =
      "Guide finished earlier. Click me for random tips, or click Restart to run the walkthrough again.";
  }
  updateGuideNavButtons();
} else {
  closeAllGuideWindows();
  renderGuideStep();
}

if (clippyElement) {
  clippyElement.addEventListener("click", (e) => {
    if (isGuideActive) {
      return;
    }

    if (e.target.closest(".guide-prev-btn, .guide-next-btn")) {
      return;
    }

    showRandomClippyTip();
  });
}

document.querySelector(".guide-prev-btn").addEventListener("click", (e) => {
  if (!isGuideActive) {
    return;
  }

  closeStartMenu();
  if (currentIndex != 0) {
    currentIndex -= 1;
    activatedGuideSteps.delete(currentIndex);
  }
  renderGuideStep();
});

document.querySelector(".guide-next-btn").addEventListener("click", (e) => {
  if (!isGuideActive) {
    restartGuide();
    return;
  }

  closeStartMenu();
  if (currentIndex != guideList.length - 1) {
    currentIndex += 1;
    activatedGuideSteps.delete(currentIndex);
    renderGuideStep();
    return;
  }

  endGuide();
});

document.addEventListener("click", (e) => {
  if (!isGuideActive) {
    return;
  }

  const step = guideList[currentIndex];
  const waitSelectors = normalizeSelectors(step.waitForClick);

  if (!waitSelectors.length) {
    return;
  }

  const isWaitTargetClicked = waitSelectors.some((selector) =>
    e.target.closest(selector),
  );

  if (isWaitTargetClicked) {
    if (activatedGuideSteps.has(currentIndex)) {
      activatedGuideSteps.delete(currentIndex);
    } else {
      activatedGuideSteps.add(currentIndex);
    }
    renderGuideStep();
  }
});

window.addEventListener("resize", () => {
  if (isGuideActive) {
    renderGuideStep();
  }
});
