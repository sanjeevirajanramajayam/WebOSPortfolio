const desktopIcons = document.querySelectorAll(".desktop-icon");
const menuBar = document.querySelector(".menu-bar");
const windows = document.querySelectorAll("#window");
const WOLF3D_URL = "https://git.nihilogic.dk/wolf3d/";
const SOLITAIRE_URL = "https://leyanlo-minesweeper.netlify.app/";

async function boot_screen() {
  await delay(20);
  document.querySelector('.screen-wrapper').style.display = "block";
  document.querySelector('.boot-img').style.display = "none";
}

boot_screen()

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}
var rightMenu = document.querySelector(".context-menu");

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
  var dragDistance = 0;
  var hasDragged = false;

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
    dragDistance = 0;
    hasDragged = false;
    // console.log(rightMenu)

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

    dragDistance += Math.abs(currentX) + Math.abs(currentY);
    if (dragDistance > 6) {
      hasDragged = true;
    }

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

    // Prevent double-click open handlers from firing right after a drag ends.
    if (elmnt.classList.contains("desktop-icon") && hasDragged) {
      elmnt.dataset.justDragged = "true";
      setTimeout(() => {
        delete elmnt.dataset.justDragged;
      }, 250);
    }

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
    if (!card) {
      return;
    }
    card.style.display = "none";

    const iframe = card.querySelector("iframe");
    if (iframe) {
      iframe.src = "about:blank";
    }
    const card_title = card.dataset.title;
    const taskElement = document.querySelector(`[data-window="${card_title}"]`);
    if (taskElement) {
      taskElement.style.display = "none";
    }
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
    if (windowName === "game2") {
      loadSolitaire();
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

function loadSolitaire(forceReload = false) {
  const gameFrame = document.querySelector('[data-title="game2"] iframe');
  if (!gameFrame) {
    return;
  }

  const frameSrc = gameFrame.getAttribute("src") || "";
  const needsLoad =
    forceReload || frameSrc.trim() === "" || frameSrc === "about:blank";

  if (needsLoad) {
    gameFrame.setAttribute("src", SOLITAIRE_URL);
  }
}

function closeAllGuideWindows() {
  document.querySelectorAll(".card[data-title]").forEach((card) => {
    const title = card.dataset.title;

    // Keep the login window available; guide should start after login.
    if (title === "login") {
      return;
    }

    card.style.display = "none";

    if (title === "game") {
      const gameFrame = card.querySelector("iframe");
      if (gameFrame) {
        gameFrame.setAttribute("src", "about:blank");
      }
    }

    const taskElement = document.querySelector(`[data-window="${title}"]`);
    if (taskElement) {
      taskElement.style.display = "none";
    }
  });
}

function centerCardInViewport(card) {
  if (!card) {
    return false;
  }

  const rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  const top = Math.max(0, (window.innerHeight - rect.height) / 2);
  const left = Math.max(0, (window.innerWidth - rect.width) / 2);

  card.style.position = "fixed";
  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
  card.style.right = "auto";
  card.style.bottom = "auto";
  card.style.transform = "none";
  return true;
}

function centerCardByDefault(card) {
  if (!card || card.dataset.defaultCentered === "true") {
    return;
  }

  if (centerCardInViewport(card)) {
    card.dataset.defaultCentered = "true";
  }
}

function centerVisibleWindowsOnLoad() {
  document.querySelectorAll(".card[data-title]").forEach((card) => {
    const isVisible = window.getComputedStyle(card).display !== "none";
    if (isVisible) {
      centerCardByDefault(card);
    }
  });
}

centerVisibleWindowsOnLoad();

function makeVisible(window) {
  const card = document.querySelector(`[data-title="${window}"]`);
  if (!card) {
    return;
  }
  // console.log(card)
  card.style.display = "block";
  centerCardByDefault(card);

  if (window === "game") {
    loadWolf3D();
  }
  if (window === "game2") {
    loadSolitaire();
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

  if (btn.dataset.justDragged === "true") {
    return;
  }

  await cursor_wait(2000);
  const explorerPath = btn.dataset.explorerPath;
  if (explorerPath) {
    openExplorerToPath(explorerPath);
    menuBar.style.display = "none";
    return;
  }

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

  if (targetWindow === "game2") {
    makeVisible("game2");
    loadSolitaire(true);
    return;
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
    const savedBackground = safeStorageGet("bg");
    if (savedBackground) {
      document.body.style.backgroundImage = savedBackground;
    }
    document.querySelector(".desktop").style.display = "block";

    if (isGuideActive) {
      closeAllGuideWindows();
      renderGuideStep();
    }

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

document.querySelectorAll("[data-explorer-path]").forEach((element) => {
  element.addEventListener("click", (e) => {
    // Desktop icons should open only on double-click, not single click.
    if (e.currentTarget.closest(".desktop-icon")) {
      return;
    }

    const targetPath = element.dataset.explorerPath;
    openExplorerToPath(targetPath);
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
  safeStorageSet("bg", document.body.style.backgroundImage);
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

const explorerAddressInput = document.querySelector("#explorer-address");
const explorerFileGrid = document.querySelector("#explorer-file-grid");
const explorerToolbarActions = document.querySelectorAll("[data-fm-action]");

const explorerIconByType = {
  folder: "./images/explorer-desktop-icon.png",
  app: "./images/explorer-desktop-icon.png",
  file: "./images/explorer-desktop-icon.png",
};

const explorerRoot = {
  name: "C:",
  type: "folder",
  children: [
    {
      name: "Desktop",
      type: "folder",
      children: [
        {
          name: "About Me",
          type: "app",
          window: "about-me",
          icon: "./images/portfolio-desktop.png",
        },
        {
          name: "Resume",
          type: "app",
          window: "resume",
          icon: "./images/resume-desktop-icon.png",
        },
        {
          name: "Projects",
          type: "app",
          window: "projects",
          icon: "./images/desktop-projects-icon.png",
        },
      ],
    },
    {
      name: "Programs",
      type: "folder",
      children: [
        {
          name: "Accessories",
          type: "folder",
          children: [
            {
              name: "Notepad.lnk",
              type: "app",
              window: "dummy",
              icon: "./images/menu-program-icon.png",
            },
            {
              name: "Paint.lnk",
              type: "app",
              window: "dummy",
              icon: "./images/menu-program-icon.png",
            },
          ],
        },
        {
          name: "Games.lnk",
          type: "app",
          window: "dummy",
          icon: "./images/menu-program-icon.png",
        },
        {
          name: "Startup.lnk",
          type: "app",
          window: "dummy",
          icon: "./images/menu-program-icon.png",
        },
      ],
    },
    {
      name: "Favourites",
      type: "folder",
      children: [
        {
          name: "Coding Sites.url",
          type: "file",
          icon: "./images/menu-favourite-icon.png",
        },
        {
          name: "Music Playlist.url",
          type: "file",
          icon: "./images/menu-favourite-icon.png",
        },
        {
          name: "Retro Wallpapers.url",
          type: "file",
          icon: "./images/menu-favourite-icon.png",
        },
      ],
    },
    {
      name: "Documents",
      type: "folder",
      children: [
        {
          name: "todo.txt",
          type: "file",
          icon: "./images/menu-document-icon.png",
        },
        {
          name: "notes.txt",
          type: "file",
          icon: "./images/menu-document-icon.png",
        },
        {
          name: "ideas.txt",
          type: "file",
          icon: "./images/menu-document-icon.png",
        },
      ],
    },
    {
      name: "Games",
      type: "folder",
      children: [
        {
          name: "Wolfenstein 3D",
          type: "app",
          window: "game",
          icon: "./images/wolf3d-desktop-icon.png",
        },
      ],
    },
    {
      name: "Control Panel",
      type: "app",
      window: "settings",
      icon: "./images/menu-settings-icon.png",
    },
    {
      name: "My Computer",
      type: "folder",
      icon: "./images/computer-desktop-icon.png",
      children: [
        {
          name: "Local Disk",
          type: "folder",
          children: [
            {
              name: "Program Files",
              type: "folder",
              children: [],
            },
            {
              name: "Windows",
              type: "folder",
              children: [],
            },
            {
              name: "Users",
              type: "folder",
              children: [],
            },
          ],
        },
        {
          name: "Control Panel.lnk",
          type: "app",
          window: "settings",
          icon: "./images/menu-settings-icon.png",
        },
      ],
    },
    {
      name: "Computer Network",
      type: "folder",
      icon: "./images/network-desktop-icon.png",
      children: [
        {
          name: "WORKGROUP",
          type: "folder",
          children: [
            {
              name: "OFFICE-PC",
              type: "app",
              window: "dummy",
              icon: "./images/network-desktop-icon.png",
            },
            {
              name: "HOME-LAPTOP",
              type: "app",
              window: "dummy",
              icon: "./images/network-desktop-icon.png",
            },
          ],
        },
      ],
    },
    {
      name: "Recycle Bin",
      type: "folder",
      icon: "./images/recycle-desktop-icon.png",
      children: [
        {
          name: "Old Notes.txt",
          type: "file",
          icon: "./images/menu-document-icon.png",
        },
        {
          name: "Temp Shortcut.lnk",
          type: "file",
          icon: "./images/explorer-desktop-icon.png",
        },
      ],
    },
    {
      name: "readme.txt",
      type: "file",
      icon: "./images/explorer-desktop-icon.png",
    },
  ],
};

const explorerState = {
  path: ["C:"],
  history: [["C:"]],
  historyIndex: 0,
  selectedName: null,
  clipboard: null,
};

function cloneExplorerEntry(entry) {
  return JSON.parse(JSON.stringify(entry));
}

function getExplorerNode(path) {
  let node = explorerRoot;
  for (let index = 1; index < path.length; index += 1) {
    const segment = path[index];
    node =
      node?.children?.find(
        (child) => child.type === "folder" && child.name === segment,
      ) || null;
    if (!node) {
      break;
    }
  }
  return node;
}

function getExplorerPathLabel(path) {
  return path.join("\\");
}

function normalizeExplorerPath(pathText) {
  const normalized = pathText.replace(/\//g, "\\").trim();
  if (!normalized) {
    return ["C:"];
  }

  const parts = normalized
    .split("\\")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return ["C:"];
  }

  if (parts[0].toUpperCase() !== "C:") {
    parts.unshift("C:");
  }

  parts[0] = "C:";
  return parts;
}

function pushExplorerHistory(path) {
  explorerState.history = explorerState.history.slice(
    0,
    explorerState.historyIndex + 1,
  );
  explorerState.history.push([...path]);
  explorerState.historyIndex = explorerState.history.length - 1;
}

function renderExplorerFiles() {
  if (!explorerFileGrid || !explorerAddressInput) {
    return;
  }

  const currentFolder = getExplorerNode(explorerState.path);
  if (!currentFolder || currentFolder.type !== "folder") {
    explorerFileGrid.innerHTML = "";
    return;
  }

  explorerAddressInput.value = getExplorerPathLabel(explorerState.path);
  explorerFileGrid.innerHTML = "";
  explorerFileGrid.style.gridAutoRows = "92px";

  const entries = currentFolder.children || [];
  entries.forEach((entry) => {
    const entryEl = document.createElement("div");
    entryEl.className =
      "flex justify-start items-center flex-col w-16 h-[88px] gap-1 desktop-icon";
    entryEl.dataset.fmName = entry.name;

    if (explorerState.selectedName === entry.name) {
      entryEl.classList.add("selected");
    }

    const iconEl = document.createElement("img");
    iconEl.src =
      entry.icon || explorerIconByType[entry.type] || explorerIconByType.file;
    iconEl.className = "w-6 h-6";

    const labelEl = document.createElement("p");
    labelEl.className = "text-center m-0 leading-tight";
    labelEl.style.lineHeight = "1.2";
    labelEl.style.height = "2.4em";
    labelEl.style.overflow = "hidden";
    labelEl.innerText = entry.name;

    entryEl.appendChild(iconEl);
    entryEl.appendChild(labelEl);

    entryEl.addEventListener("click", () => {
      explorerState.selectedName = entry.name;
      renderExplorerFiles();
    });

    entryEl.addEventListener("dblclick", () => {
      openExplorerEntry(entry);
    });

    explorerFileGrid.appendChild(entryEl);
  });
}

function navigateExplorerTo(path, options = { pushHistory: true }) {
  const targetFolder = getExplorerNode(path);
  if (!targetFolder || targetFolder.type !== "folder") {
    return;
  }

  explorerState.path = [...path];
  explorerState.selectedName = null;

  if (options.pushHistory) {
    pushExplorerHistory(path);
  }

  renderExplorerFiles();
}

function openExplorerToPath(pathText) {
  makeVisible("explorer");
  const path = normalizeExplorerPath(pathText || "C:\\");
  navigateExplorerTo(path);
}

function openExplorerEntry(entry) {
  if (entry.type === "folder") {
    navigateExplorerTo([...explorerState.path, entry.name]);
    return;
  }

  if (entry.type === "app" && entry.window) {
    makeVisible(entry.window);
    return;
  }

  const audio = new Audio("./audio/windows-95-error-sound-effect.mp3");
  audio.play();
  makeVisible("dummy");
}

function getSelectedExplorerEntry() {
  const currentFolder = getExplorerNode(explorerState.path);
  if (!currentFolder?.children?.length || !explorerState.selectedName) {
    return null;
  }

  return (
    currentFolder.children.find(
      (entry) => entry.name === explorerState.selectedName,
    ) || null
  );
}

function removeExplorerEntryFromPath(path, entryName) {
  const folder = getExplorerNode(path);
  if (!folder?.children) {
    return null;
  }

  const index = folder.children.findIndex((entry) => entry.name === entryName);
  if (index === -1) {
    return null;
  }

  return folder.children.splice(index, 1)[0];
}

function getUniqueExplorerEntryName(folder, baseName) {
  const existingNames = new Set(
    (folder.children || []).map((entry) => entry.name),
  );
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let copyIndex = 1;
  let candidate = `${baseName} - Copy`;
  while (existingNames.has(candidate)) {
    copyIndex += 1;
    candidate = `${baseName} - Copy ${copyIndex}`;
  }

  return candidate;
}

function handleExplorerToolbarAction(action) {
  if (!action) {
    return;
  }

  if (action === "back") {
    if (explorerState.historyIndex > 0) {
      explorerState.historyIndex -= 1;
      navigateExplorerTo(explorerState.history[explorerState.historyIndex], {
        pushHistory: false,
      });
    }
    return;
  }

  if (action === "forward") {
    if (explorerState.historyIndex < explorerState.history.length - 1) {
      explorerState.historyIndex += 1;
      navigateExplorerTo(explorerState.history[explorerState.historyIndex], {
        pushHistory: false,
      });
    }
    return;
  }

  if (action === "up") {
    if (explorerState.path.length > 1) {
      navigateExplorerTo(explorerState.path.slice(0, -1));
    }
    return;
  }

  const selectedEntry = getSelectedExplorerEntry();

  if (action === "copy") {
    if (!selectedEntry) {
      return;
    }
    explorerState.clipboard = {
      mode: "copy",
      entry: cloneExplorerEntry(selectedEntry),
      sourcePath: [...explorerState.path],
      sourceName: selectedEntry.name,
    };
    return;
  }

  if (action === "cut") {
    if (!selectedEntry) {
      return;
    }
    explorerState.clipboard = {
      mode: "cut",
      entry: cloneExplorerEntry(selectedEntry),
      sourcePath: [...explorerState.path],
      sourceName: selectedEntry.name,
    };
    return;
  }

  if (action === "paste") {
    const targetFolder = getExplorerNode(explorerState.path);
    if (!explorerState.clipboard || !targetFolder?.children) {
      return;
    }

    const clipboard = explorerState.clipboard;

    if (clipboard.mode === "copy") {
      const entryToAdd = cloneExplorerEntry(clipboard.entry);
      entryToAdd.name = getUniqueExplorerEntryName(
        targetFolder,
        entryToAdd.name,
      );
      targetFolder.children.push(entryToAdd);
      explorerState.selectedName = entryToAdd.name;
      renderExplorerFiles();
      return;
    }

    if (clipboard.mode === "cut") {
      const movedEntry = removeExplorerEntryFromPath(
        clipboard.sourcePath,
        clipboard.sourceName,
      );

      if (!movedEntry) {
        explorerState.clipboard = null;
        renderExplorerFiles();
        return;
      }

      movedEntry.name = getUniqueExplorerEntryName(
        targetFolder,
        movedEntry.name,
      );
      targetFolder.children.push(movedEntry);
      explorerState.selectedName = movedEntry.name;
      explorerState.clipboard = null;
      renderExplorerFiles();
    }
  }
}

function initExplorerFileManager() {
  if (!explorerFileGrid || !explorerAddressInput) {
    return;
  }

  renderExplorerFiles();

  explorerAddressInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") {
      return;
    }

    const nextPath = normalizeExplorerPath(explorerAddressInput.value);
    navigateExplorerTo(nextPath);
  });

  explorerToolbarActions.forEach((actionBtn) => {
    actionBtn.addEventListener("click", () => {
      handleExplorerToolbarAction(actionBtn.dataset.fmAction);
    });
  });
}

initExplorerFileManager();

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

function isTourCompleted() {
  const rawValue = safeStorageGet(TOUR_COMPLETED_KEY);
  if (rawValue == null) {
    return false;
  }

  const normalized = String(rawValue).trim().toLowerCase();
  if (normalized === "") {
    safeStorageRemove(TOUR_COMPLETED_KEY);
    return false;
  }

  if (normalized === "true") {
    return true;
  }

  // Any non-empty invalid value should behave as not completed.
  safeStorageRemove(TOUR_COMPLETED_KEY);
  return false;
}

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
let clippyTypewriterTimeout = null;
let isClippyCornerMode = false;
let hasShownClippyJumpscare = false;
let clippyJumpscareTimeout = null;

const guideList = [
  {
    clippyText:
      "Welcome! This tour will walk through the major parts of this Windows 95 WebOS site.",
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
      "These right-side shortcuts open About Me, Resume, Projects, Wolfenstein, and Solitaire.",
    classes: [
      '.desktop-icon[data-windowsrc="about-me"]',
      '.desktop-icon[data-windowsrc="resume"]',
      '.desktop-icon[data-windowsrc="projects"]',
      '.desktop-icon[data-windowsrc="game"]',
      '.desktop-icon[data-windowsrc="game2"]',
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
      "This is your About Me window. It is about the creator. It is pinned on the taskbar for quick return.",
    classes: ['[data-title="about-me"]'],
    ensureWindow: "about-me",
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
      "Solitaire is also available as a second game window if you want a quick classic break.",
    classes: ['[data-title="game2"]'],
    ensureWindow: "game2",
    clippyImage: "./images/clippy-left.png",
  },
  {
    clippyText:
      "Right-click anywhere on the desktop to open the context menu for quick actions like Refresh.",
    classes: [".desktop", ".context-menu"],
    clippyImage: "./images/clippy-right.png",
  },
  {
    clippyText: "Tour complete. Use Prev to review this walkthrough.",
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
    guidePrevBtn.style.display = "none";
    guideNextBtn.style.visibility = "hidden";
    guideNextBtn.style.display = "none";
    guideNextBtn.disabled = true;
    guideNextBtn.innerText = "Done";
    return;
  }

  guidePrevBtn.style.display = "inline-block";
  guideNextBtn.style.display = "inline-block";
  guideNextBtn.style.visibility = "visible";
  guideNextBtn.disabled = false;
  guidePrevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
  guideNextBtn.innerText =
    currentIndex === guideList.length - 1 ? "Finish" : "Next";
}

function endGuide() {
  isGuideActive = false;
  safeStorageSet(TOUR_COMPLETED_KEY, "true");
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
      "Guide finished. Click me for random tips, but not too much.";
  }

  updateGuideNavButtons();
}

function restartGuide() {
  isGuideActive = true;
  safeStorageRemove(TOUR_COMPLETED_KEY);
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
        iframe.setAttribute("src", "about:blank");
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

const wasGuideCompleted = isTourCompleted();
if (wasGuideCompleted) {
  isGuideActive = false;
  clearGuideVisualState();
  document.body.classList.remove("tour-lock");
  if (clippyTextElement) {
    clippyTextElement.innerText =
      "Guide finished earlier. Click me for random tips, but not too much.";
  }
  updateGuideNavButtons();
} else {
  clearGuideVisualState();
  document.body.classList.remove("tour-lock");
  // Guide is now rendered right after successful login.
}

function setClippyTypewriterText(text, speed = 70) {
  if (!clippyTextElement) {
    return;
  }

  if (clippyTypewriterTimeout) {
    clearTimeout(clippyTypewriterTimeout);
    clippyTypewriterTimeout = null;
  }

  clippyTextElement.innerText = "";
  let index = 0;

  const typeNext = () => {
    clippyTextElement.innerText = text.slice(0, index + 1);
    index += 1;

    if (index < text.length) {
      clippyTypewriterTimeout = setTimeout(typeNext, speed);
    } else {
      clippyTypewriterTimeout = null;
    }
  };

  typeNext();
}

function showClippyJumpscare() {
  if (hasShownClippyJumpscare) {
    return;
  }

  hasShownClippyJumpscare = true;
  const BSOD_DURATION_MS = 5000;
  const JUMPSCARE_DURATION_MS = 2200;

  let overlay = document.querySelector("#clippy-jumpscare-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "clippy-jumpscare-overlay";

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999999",
      display: "none",
      justifyContent: "center",
      alignItems: "center",
      background:
        "#000 url('./images/byod.webp') center center / cover no-repeat",
      pointerEvents: "none",
    });

    const image = document.createElement("img");
    image.src = "./images/clippy-grab-attention.png";
    image.alt = "Clippy jumpscare";
    Object.assign(image.style, {
      width: "140vmax",
      height: "140vmax",
      objectFit: "contain",
      transform: "scale(1.2)",
      imageRendering: "auto",
      display: "none",
    });

    overlay.appendChild(image);
    document.body.appendChild(overlay);
  }

  const image = overlay.querySelector("img");
  if (image) {
    image.style.display = "none";
  }
  overlay.style.background =
    "#000 url('./images/byod.webp') center center / cover no-repeat";

  overlay.style.display = "flex";

  // Play BYOD sound at the start of the BSOD phase
  const byodAudio = new Audio("./audio/windows-95-byod-sound-effect.mp3");
  byodAudio.play().catch(() => {});

  if (clippyJumpscareTimeout) {
    clearTimeout(clippyJumpscareTimeout);
  }

  setTimeout(() => {
    overlay.style.background = "#000";
    overlay.style.backgroundImage = "none";
    if (image) {
      image.style.display = "block";
      image.style.backgroundColor = "#000";
    }

    const audio = new Audio("./audio/windows-95-jumpscare-sound-effect.mp3");
    audio.play().catch(() => {});

    clippyJumpscareTimeout = setTimeout(() => {
      overlay.style.display = "none";
      try {
        window.location.reload();
      } catch (error) {
        window.location.href = window.location.href;
      }
    }, JUMPSCARE_DURATION_MS);
  }, BSOD_DURATION_MS);
}

if (clippyElement) {
  clippyElement.addEventListener("click", (e) => {
    if (isGuideActive) {
      return;
    }

    if (isClippyCornerMode) {
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
let count = 0;
let clicks = [];

document.querySelector("#clippy").addEventListener("click", (e) => {
  const hasCompletedTour = isTourCompleted();
  if (!hasCompletedTour) {
    return;
  }

  const now = Date.now();

  clicks.push(now);
  clicks = clicks.filter((time) => now - time <= 10000);
  if (clicks.length >= 10) {
    console.log("Over 10");
    clicks = [];
    isClippyCornerMode = true;
    clippyElement.classList.remove("clippy-top-left", "clippy-top-right");

    const positions = [
      { top: "auto", right: "40px", bottom: "80px", left: "auto", mode: null },
      {
        top: "40px",
        right: "40px",
        bottom: "auto",
        left: "auto",
        mode: "clippy-top-right",
      },
      {
        top: "40px",
        right: "auto",
        bottom: "auto",
        left: "20px",
        mode: "clippy-top-left",
      },
      { top: "auto", right: "auto", bottom: "80px", left: "20px", mode: null },
    ];

    const nextPosition = positions[count % positions.length];
    clippyElement.style.top = nextPosition.top;
    clippyElement.style.right = nextPosition.right;
    clippyElement.style.bottom = nextPosition.bottom;
    clippyElement.style.left = nextPosition.left;

    if (nextPosition.mode) {
      clippyElement.classList.add(nextPosition.mode);
    }

    setClippyTypewriterText("STOP CLICKING ME", 30);

    count += 1;
    if (count === 5) {
      showClippyJumpscare();
    }
  }
});

function showCustomContextMenu(x, y) {
  var rightMenu = document.querySelector(".context-menu");
  rightMenu.style.display = "block";
  rightMenu.style.top = y + "px";
  rightMenu.style.left = x + "px";
}

document.body.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  showCustomContextMenu(e.clientX, e.clientY);
});

window.addEventListener("click", (e) => {
  if (!rightMenu.contains(e.target)) {
    rightMenu.style.display = "none";
  }
});

async function refresh() {
  if (refresh.isRunning) {
    return;
  }

  refresh.isRunning = true;
  const screen = document.createElement("div");
  screen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999999;
        opacity: 0;
        transition: opacity 0.2s ease;
        font-family: 'VT323', monospace;
        font-size: 1.5rem;
      `;
  screen.innerText = "Refreshing desktop icons...";
  document.body.appendChild(screen);

  requestAnimationFrame(() => {
    screen.style.opacity = "1";
  });

  await delay(180);

  desktopIcons.forEach((icon) => {
    icon.classList.remove("selected", "drag-clicked");
    delete icon.dataset.justDragged;
    icon.style.position = "";
    icon.style.top = "";
    icon.style.left = "";
    icon.style.right = "";
    icon.style.bottom = "";
    icon.style.margin = "";
    icon.style.zIndex = "";
  });

  document.querySelectorAll("#drag-placeholder").forEach((placeholder) => {
    placeholder.remove();
  });

  if (rightMenu) {
    rightMenu.style.display = "none";
  }

  await delay(120);
  screen.style.opacity = "0";
  setTimeout(() => {
    screen.remove();
  }, 200);
  refresh.isRunning = false;
}

document.querySelector(".refresh-btn").addEventListener("click", (e) => {
  e.preventDefault();
  refresh();
});
