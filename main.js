/* jshint esversion: 6 */

// Utility debouncer function used for resize/scroll events
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

class Navigation {
  constructor(selectorNav, selectorLight, navY = 54, navZ = 82) {
    this.nav = document.querySelector(selectorNav);
    this.links = this.nav ? this.nav.querySelectorAll("a") : [];
    this.navLight = document.querySelector(selectorLight);
    this.NAV_Y = navY;
    this.NAV_Z = navZ;
    // Bind the pointer move callback so that it can be added/removed properly.
    this._pointerMoveHandler = this._pointerMoveHandler.bind(this);
    this.init();
  }

  centerX(element) {
    const navRect = this.nav.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    return elRect.left - navRect.left + elRect.width / 2;
  }

  moveNavLight(xPos, force = false) {
    if (this.navLight) {
      // Batch attribute changes (if needed, further optimized via requestAnimationFrame if desired)
      this.navLight.setAttribute("x", xPos);
      this.navLight.setAttribute("y", this.NAV_Y);
      this.navLight.setAttribute("z", this.NAV_Z);
    }
  }

  setActivePage(id) {
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    const pageEl = document.getElementById(id);
    if (pageEl) pageEl.classList.add("active");
    // Update body classes with minimal DOM manipulation
    const bodyClasses = document.body.className.split(" ").filter(c => !c.endsWith("-active"));
    document.body.className = bodyClasses.join(" ");
    document.body.classList.add(`${id.replace("page-", "")}-active`);
  }

  _pointerMoveHandler(event) {
    const navRect = this.nav.getBoundingClientRect();
    this.moveNavLight(event.clientX - navRect.left);
  }

  attachEvents(callback) {
    // Pre-bind the click callback for links to avoid creating a new function for every click
    this.links.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.links.forEach(l => l.removeAttribute("data-active"));
        link.setAttribute("data-active", "true");
        this.setActivePage(`page-${link.dataset.page}`);
        this.moveNavLight(this.centerX(link));
        if (typeof callback === "function") callback();
      });
    });

    // Use passive listeners where we only read the pointer event info
    this.nav.addEventListener("pointerenter", () => {
      this.nav.addEventListener("pointermove", this._pointerMoveHandler, { passive: true });
    });

    this.nav.addEventListener("pointerleave", () => {
      this.nav.removeEventListener("pointermove", this._pointerMoveHandler);
      // Recenter on the active link (cache the active link query)
      const activeLink = this.nav.querySelector("[data-active='true']");
      if (activeLink) {
        this.moveNavLight(this.centerX(activeLink));
      }
    });
  }

  resizeLogoCenter(resizeCallback) {
    window.addEventListener("resize", debounce(() => {
      const activeLink = this.nav.querySelector("[data-active='true']");
      if (activeLink) {
        this.moveNavLight(this.centerX(activeLink), true);
      }
      if (typeof resizeCallback === "function") resizeCallback();
    }, 50));
  }

  init() {
    if (this.nav) {
      const activeLink = this.nav.querySelector("[data-active='true']");
      if (activeLink) {
        this.moveNavLight(this.centerX(activeLink), true);
      }
    }
  }
}

class LogoSpotlight {
  constructor(selectorWrap, lightId) {
    this.logoWrap = document.querySelector(selectorWrap);
    this.logoLight = document.getElementById(lightId);
    // Bind callbacks for event handling
    this.centreLogo = this.centreLogo.bind(this);
    this.trackLogo = this.trackLogo.bind(this);
    this.attachEvents();
    this.centreLogo();
  }

  centreLogo() {
    if (!this.logoWrap || !this.logoLight) return;
    const rect = this.logoWrap.getBoundingClientRect();
    this.logoLight.setAttribute("x", rect.width / 2);
    this.logoLight.setAttribute("y", rect.height / 2);
  }

  trackLogo(event) {
    if (!this.logoWrap || !this.logoLight) return;
    const rect = this.logoWrap.getBoundingClientRect();
    this.logoLight.setAttribute("x", event.clientX - rect.left);
    this.logoLight.setAttribute("y", event.clientY - rect.top);
  }

  attachEvents() {
    if (this.logoWrap) {
      this.logoWrap.addEventListener("pointerenter", this.trackLogo, { passive: true });
      this.logoWrap.addEventListener("pointermove", this.trackLogo, { passive: true });
      this.logoWrap.addEventListener("pointerleave", this.centreLogo);
    }
  }
}

class GooeyCursor {
  constructor(cursorId, tailCount = 16) {
    this.cursor = document.getElementById(cursorId);
    this.TAIL = tailCount;
    this.cx = window.innerWidth / 2;
    this.cy = window.innerHeight / 2;
    this.history = Array.from({ length: this.TAIL }, () => ({ x: this.cx, y: this.cy }));
    this.gooLoopStarted = false;
    this.gooLoop = this.gooLoop.bind(this);
    this.init();
  }

  init() {
    if (this.cursor) {
      if (this.cursor.children.length < this.TAIL) {
        for (let i = 0; i < this.TAIL; i++) {
          const div = document.createElement("div");
          div.className = "cursor-circle";
          div.style.willChange = "transform";
          this.cursor.appendChild(div);
        }
      }
      this.dots = Array.from(this.cursor.children);
      window.addEventListener("pointermove", (e) => {
        this.cx = e.clientX;
        this.cy = e.clientY;
      }, { passive: true });
      window.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        this.cx = touch.clientX;
        this.cy = touch.clientY;
      }, { passive: true });
      if (!this.gooLoopStarted) {
        this.gooLoopStarted = true;
        this.gooLoop();
      }
    }
  }

  gooLoop() {
    this.history[0].x += 0.5 * (this.cx - this.history[0].x);
    this.history[0].y += 0.5 * (this.cy - this.history[0].y);
    for (let i = 1; i < this.TAIL; i++) {
      this.history[i].x += 0.3 * (this.history[i - 1].x - this.history[i].x);
      this.history[i].y += 0.3 * (this.history[i - 1].y - this.history[i].y);
    }
    for (let i = 0; i < this.TAIL; i++) {
      const scale = 0.7 * (1 - i / this.TAIL) + 0.1;
      this.dots[i].style.transform = `translate3d(${this.history[i].x}px, ${this.history[i].y}px, 0) scale(${scale})`;
      this.dots[i].style.opacity = 1 - i / this.TAIL;
    }
    requestAnimationFrame(this.gooLoop);
  }
}

class HomeGallery {
  constructor({ items, imageUrls, settings, containerSelector, canvasSelector }) {
    this.items = this.shuffleArray(items);
    this.imageUrls = this.shuffleArray(imageUrls);
    this.settings = settings;
    this.container = document.querySelector(containerSelector);
    this.canvas = document.getElementById(canvasSelector);
    this.visibleItems = new Set();
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;
    this.lastDragTime = 0;
    this.mouseHasMoved = false;
    this.columns = 4;
    this.itemCount = this.items.length;
    this.cellWidth = this.settings.baseWidth + this.settings.itemGap;
    this.cellHeight = Math.max(this.settings.smallHeight, this.settings.largeHeight) + this.settings.itemGap;
    this.init();
  }

  shuffleArray(arr) {
    let currentIndex = arr.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }
    return arr;
  }

  getItemId(col, row) {
    return `${col},${row}`;
  }

  getItemSize(row, col) {
    const sizes = [
      { width: this.settings.baseWidth, height: this.settings.smallHeight },
      { width: this.settings.baseWidth, height: this.settings.largeHeight }
    ];
    return sizes[Math.abs((row * this.columns + col) % sizes.length)];
  }

  getItemPosition(col, row) {
    return { x: col * this.cellWidth, y: row * this.cellHeight };
  }

  updateVisibleItems() {
    const buffer = this.settings.bufferZone;
    const eWidth = window.innerWidth * (1 + buffer);
    const eHeight = window.innerHeight * (1 + buffer);
    const s = Math.floor((-this.currentX - eWidth / 2) / this.cellWidth);
    const n = Math.ceil((-this.currentX + 1.5 * eWidth) / this.cellWidth);
    const a = Math.floor((-this.currentY - eHeight / 2) / this.cellHeight);
    const o = Math.ceil((-this.currentY + 1.5 * eHeight) / this.cellHeight);
    const newVisible = new Set();
    const placedCandidates = [];
    const minSpacing = window.matchMedia("(max-width: 600px)").matches ? 5 : 4;

    for (let row = a; row <= o; row++) {
      for (let col = s; col <= n; col++) {
        const itemId = this.getItemId(col, row);
        newVisible.add(itemId);
        if (this.visibleItems.has(itemId)) continue;
        const size = this.getItemSize(row, col);
        const pos = this.getItemPosition(col, row);
        let candidate = Math.abs((row * this.columns + col) % this.itemCount) % this.imageUrls.length;
        let attempts = 0;
        while (attempts < this.imageUrls.length) {
          let conflict = false;
          for (let placed of placedCandidates) {
            const dCol = col - placed.col;
            const dRow = row - placed.row;
            if (Math.sqrt(dCol * dCol + dRow * dRow) <= minSpacing && candidate === placed.candidate) {
              conflict = true;
              break;
            }
          }
          if (!conflict) break;
          candidate = (candidate + 1) % this.imageUrls.length;
          attempts++;
        }
        placedCandidates.push({ col, row, candidate });
        const itemElem = document.createElement("div");
        itemElem.className = "item";
        itemElem.id = itemId;
        itemElem.style.cssText = `width: ${size.width}px;
          height: ${size.height}px;
          left: ${pos.x}px;
          top: ${pos.y}px;
          position: absolute;
          will-change: transform;`;
        itemElem.dataset.col = col;
        itemElem.dataset.row = row;
        const imgContainer = document.createElement("div");
        imgContainer.className = "item-image-container";
        const imgElem = document.createElement("img");
        imgElem.src = this.imageUrls[candidate];
        imgElem.alt = `Image ${candidate + 1}`;
        imgElem.loading = "lazy";
        imgContainer.appendChild(imgElem);
        itemElem.appendChild(imgContainer);
        const caption = document.createElement("div");
        caption.className = "item-caption";
        const nameDiv = document.createElement("div");
        nameDiv.className = "item-name";
        nameDiv.textContent = this.items[candidate];
        caption.appendChild(nameDiv);
        const numberDiv = document.createElement("div");
        numberDiv.className = "item-number";
        numberDiv.textContent = `#${(candidate + 1).toString().padStart(5, "0")}`;
        caption.appendChild(numberDiv);
        itemElem.appendChild(caption);
        this.canvas.appendChild(itemElem);
        this.visibleItems.add(itemId);
      }
    }
    this.visibleItems.forEach(itemId => {
      if (!newVisible.has(itemId)) {
        const elem = document.getElementById(itemId);
        if (elem && elem.parentNode === this.canvas) {
          this.canvas.removeChild(elem);
        }
        this.visibleItems.delete(itemId);
      }
    });
  }

  animate() {
    const ease = this.settings.dragEase;
    this.currentX += (this.targetX - this.currentX) * ease;
    this.currentY += (this.targetY - this.currentY) * ease;
    this.canvas.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    this.updateVisibleItems();
    requestAnimationFrame(this.animate.bind(this));
  }

  attachDragEvents() {
    if (this.container) {
      this.container.addEventListener("mousedown", (e) => {
        this.isDragging = true;
        this.mouseHasMoved = false;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.container.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          this.mouseHasMoved = true;
        }
        const now = Date.now();
        const dt = Math.max(10, now - this.lastDragTime);
        this.lastDragTime = now;
        this.dragVelocityX = deltaX / dt;
        this.dragVelocityY = deltaY / dt;
        this.targetX += deltaX;
        this.targetY += deltaY;
        this.startX = e.clientX;
        this.startY = e.clientY;
      });

      window.addEventListener("mouseup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.container.style.cursor = "grab";
          if (Math.abs(this.dragVelocityX) > 0.1 || Math.abs(this.dragVelocityY) > 0.1) {
            this.targetX += this.dragVelocityX * this.settings.momentumFactor;
            this.targetY += this.dragVelocityY * this.settings.momentumFactor;
          }
        }
      });

      this.container.addEventListener("touchstart", (e) => {
        this.isDragging = true;
        this.mouseHasMoved = false;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
      });

      window.addEventListener("touchmove", (e) => {
        if (!this.isDragging) return;
        const deltaX = e.touches[0].clientX - this.startX;
        const deltaY = e.touches[0].clientY - this.startY;
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          this.mouseHasMoved = true;
        }
        this.targetX += deltaX;
        this.targetY += deltaY;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
      }, { passive: false });

      window.addEventListener("touchend", () => {
        this.isDragging = false;
      });
    }
  }

  init() {
    if (this.container && this.canvas) {
      const totalWidth = this.columns * this.cellWidth;
      const totalRows = Math.ceil(this.itemCount / this.columns);
      const totalHeight = totalRows * this.cellHeight;
      this.currentX = this.targetX = (this.container.clientWidth - totalWidth) / 2;
      this.currentY = this.targetY = (this.container.clientHeight - totalHeight) / 2;
      this.updateVisibleItems();
      this.attachDragEvents();
      this.animate();
    }
  }
}

function initBlur() {
  const root = document.documentElement;
  document.querySelectorAll(".blur").forEach(el => {
    const layers = parseInt(getComputedStyle(root).getPropertyValue("--layers")) || 5;
    const content = Array.from({ length: layers }, (_, i) => `<div style="--i:${i}"></div>`).join("");
    el.innerHTML = content;
  });
}

const projects = [
  { id: 1, title: "Phenom", year: "UX Strategist", image: "https://i.ibb.co/WWCxWtK8/603d61b96ca6f0c336165b6e-DSC09310.webp" },
  { id: 2, title: "Independent", year: "UX Consultant", image: "https://i.ibb.co/TDk7M7zh/1-KE8g-FA6w4wud1u-DAr-A4-Yv-Q.webp" },
  { id: 3, title: "Publicis Sapient", year: "Sr. Product Designer", image: "https://i.ibb.co/mCK7D4Xb/1-Oen-HCQm-Ga10wp-Cz-R8o9-Pt-A.webp" },
  { id: 4, title: "Code & Theory", year: "ACD, Interactive", image: "https://i.ibb.co/GQM6jmpJ/1-1gjr-Eff-Bio-JYo-EAv-MWHf-KQ.webp" },
  { id: 5, title: "Elva Design Group", year: "Sr. UX Designer", image: "https://i.ibb.co/pvJvGhnt/ZAX02330-1.webp" },
  { id: 6, title: "Huge", year: "Sr. UX Designer", image: "https://i.ibb.co/B6vFwH6/zoom-zack.gif" },
  { id: 7, title: "LiveArea", year: "Manager, UX", image: "https://i.ibb.co/Xr97WzXX/DSC06055-1.webp" },
  { id: 8, title: "PHI → NYC", year: "Paradigm Shift", image: "https://i.ibb.co/fYM2drZG/1-UATKEet6-Vtc-Lk-A8r-Yspj-FQ.webp" },
  { id: 9, title: "Workarea", year: "UX Designer", image: "https://i.ibb.co/N2yd0jJV/1-l-EJetj-Ut85-CTbb24d-BTFk-A.webp" },
  { id: 10, title: "O3 World", year: "UX Designer", image: "https://i.ibb.co/LXmyD2hq/IMG-20170104-184947-650.webp" },
  { id: 11, title: "160 Over 90", year: "Interactive Designer", image: "https://i.ibb.co/CpkzWmRn/IMG-20151206-143245434-01.webp" }
];

function renderProjects(container) {
  if (container) {
    container.innerHTML = "";
    projects.forEach(proj => {
      const item = document.createElement("div");
      item.classList.add("project-item");
      item.dataset.id = proj.id;
      item.dataset.image = proj.image;
      item.innerHTML = `<div class="project-title">${proj.title}</div><p class="project-year">${proj.year}</p>`;
      container.appendChild(item);
    });
  }
}

function initialAnimation() {
  const items = document.querySelectorAll(".project-item");
  items.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    setTimeout(() => {
      item.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, 60 * index);
  });
}

function setupHoverEvents(imgEl, projectsContainer) {
  projects.forEach(proj => {
    const preloadImg = new Image();
    preloadImg.crossOrigin = "anonymous";
    preloadImg.src = proj.image;
  });
  if (imgEl && projectsContainer) {
    projectsContainer.querySelectorAll(".project-item").forEach(item => {
      item.addEventListener("mouseenter", () => {
        imgEl.style.transition = "none";
        imgEl.style.transform = "scale(1.2)";
        imgEl.src = item.dataset.image;
        imgEl.style.opacity = "1";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            imgEl.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            imgEl.style.transform = "scale(1.0)";
          });
        });
      });
    });
    projectsContainer.addEventListener("mouseleave", () => {
      imgEl.style.opacity = "0";
    });
  }
}

function preloadImages() {
  projects.forEach(proj => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = proj.image;
  });
}

function onNavigateToHome() {
  document.body.classList.add("homepage");
  document.querySelectorAll(".blur, .vignette-bottom, .page-vignette-container, .page-vignette, .page-vignette-strong, .page-vignette-extreme")
    .forEach(el => {
      el.style.display = "none";
      el.offsetHeight;
      el.style.display = "";
    });
}

function onNavigateAwayFromHome() {
  document.body.classList.remove("homepage");
}

document.addEventListener("DOMContentLoaded", () => {
  const navigation = new Navigation("nav", "#spotlight fePointLight");
  const logoSpotlight = new LogoSpotlight(".logo-wrapper", "logoLight");

  function initLifeScroll() {
    const lifePage = document.getElementById("page-life");
    if (lifePage && lifePage.classList.contains("active") && typeof initLifeScrollProgress === "function") {
      initLifeScrollProgress();
    }
  }

  navigation.attachEvents(initLifeScroll);
  navigation.resizeLogoCenter(logoSpotlight.centreLogo);
  navigation.setActivePage("page-home");

  // Remove all nav active states on first load
  const homeLink = document.querySelector('nav a[data-page="home"]');
  if (homeLink) {
    document.querySelectorAll("nav a").forEach(link => link.removeAttribute("data-active"));
    // Do not set any link as active here.
  }

  const logoWrapper = document.querySelector(".logo-wrapper");
  if (logoWrapper) {
    logoWrapper.addEventListener("click", (e) => {
      e.preventDefault();
      const homeLink = document.querySelector('nav a[data-page="home"]');
      if (homeLink) {
        document.querySelectorAll("nav a").forEach(link => link.removeAttribute("data-active"));
        homeLink.setAttribute("data-active", "true");
      }
      navigation.setActivePage("page-home");
      navigation.moveNavLight(navigation.centerX(homeLink));
      initLifeScroll();
    });
    logoWrapper.style.cursor = "pointer";
  }

  initLifeScroll();
  new GooeyCursor("cursor", 16);

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  new HomeGallery({
    items: [
      "Gallery Image 1", "Gallery Image 2", "Gallery Image 3", "Gallery Image 4", "Gallery Image 5",
      "Gallery Image 6", "Gallery Image 7", "Gallery Image 8", "Gallery Image 9", "Gallery Image 10",
      "Gallery Image 11", "Gallery Image 12", "Gallery Image 13", "Gallery Image 14", "Gallery Image 15",
      "Gallery Image 16", "Gallery Image 17", "Gallery Image 18", "Gallery Image 19", "Gallery Image 20",
      "Gallery Image 21", "Gallery Image 22", "Gallery Image 23", "Gallery Image 24", "Gallery Image 25",
      "Gallery Image 26", "Gallery Image 27", "Gallery Image 28", "Gallery Image 29", "Gallery Image 30",
      "Gallery Image 31", "Gallery Image 32", "Gallery Image 33", "Gallery Image 34", "Gallery Image 35",
      "Gallery Image 36", "Gallery Image 37", "Gallery Image 38", "Gallery Image 39"
    ],
    imageUrls: [
      "https://i.ibb.co/PztRrNhR/603a93eddcd3ab104d64fcbb-ZAX09767.webp",
      "https://i.ibb.co/9HzBPc7Y/603a93eea83b1aab7a98c35b-DSC08228.webp",
      "https://i.ibb.co/mrYPqc5K/603a93eedcd3ab4b2e64fcbc-IMG-4204.webp",
      "https://i.ibb.co/RG7ymtn5/603a93eedce047078935438a-IMG-5686.webp",
      "https://i.ibb.co/VcxChJB1/603a93eef8754819192222f7-DSC09720.webp",
      "https://i.ibb.co/bjCjbfbT/603a93efdfd184c21ef2d238-IMG-3352.webp",
      "https://i.ibb.co/39wDDcbS/603a93f0e815e830d1783e07-IMG-2033.webp",
      "https://i.ibb.co/wNFR8hJR/603a93f1d03490ae9d2aa64a-IMG-3824.webp",
      "https://i.ibb.co/5Xr0MDSw/603a93f06a41f45766a3361a-DSC09212.webp",
      "https://i.ibb.co/FLS6ZdgN/603a95ed29478f4bc91875b5-DSC08933.webp",
      "https://i.ibb.co/9HWqZ86P/603a95edd9a3b56723de7edc-DSC00910.webp",
      "https://i.ibb.co/fdT1YyzJ/603a95edd03490eb412aaedc-DSC08676.webp",
      "https://i.ibb.co/zWBgb5Sj/603a95ee83ba30ff4ac9bc6a-DSC00423-1.webp",
      "https://i.ibb.co/0yjJ4j8L/603a967a5dc3e982f571b744-ZAX00968.webp",
      "https://i.ibb.co/Kph6fp3M/603a967a6a41f4d56ca33b1a-ZAX00794.webp",
      "https://i.ibb.co/tpK7LjSv/603a967ac64cec73069e2454-ZAX09877.webp",
      "https://i.ibb.co/rR91Q0Z4/603a967ad03490104c2aaefe-ZAX01042-2.webp",
      "https://i.ibb.co/m5sNTvYX/603a967916b10d5bef5a6dd8-ZAX02712-1.webp",
      "https://i.ibb.co/QvHqKh2P/603afe37ba16f8f9174cf501-IMG-1878.webp",
      "https://i.ibb.co/JX320Vw/603b3890dcd3ab104d67d405-ZAX01233-2.webp",
      "https://i.ibb.co/VYQs1pyb/603d0b8abf1990616037cc35-ZAX03810.webp",
      "https://i.ibb.co/yFz4P7cG/603d0b8b04655c6fd42d2253-DSC08281.webp",
      "https://i.ibb.co/9HZMK0nw/603d0b8b038105ae6904872a-DSC08334.webp",
      "https://i.ibb.co/8njbYh3K/603d0b5635e8053bc120bec7-DSC09034.webp",
      "https://i.ibb.co/5gddKNw3/603d0bb2331da47ee88db089-DSC02085.webp",
      "https://i.ibb.co/Fbr1sSb6/603d8d7a3a6df470a4a661a1-DSC00726.webp",
      "https://i.ibb.co/zWkXCBb9/603d61b96ca6f0c336165b6e-DSC09310.webp",
      "https://i.ibb.co/DPyhP1T7/603d100d889053cc334ee5fc-IMG-2083.webp",
      "https://i.ibb.co/KjzkkW68/603d102d0f02c70fdf7d84eb-IMG-4696.webp",
      "https://i.ibb.co/N2cSNMf4/603d102d9f59a611886a6893-IMG-2151.webp",
      "https://i.ibb.co/RkfwmHWj/603d102dae26b192aef6ab4a-IMG-3023.webp",
      "https://i.ibb.co/QFKMY1sH/603d138e1d5ed053b509992a-IMG-5199.webp",
      "https://i.ibb.co/pvFThr4K/603d1185b8ec32082f451ba9-IMG-3882.webp",
      "https://i.ibb.co/WNtnFQqP/603d1185cafcb2591f42b1ad-IMG-3932.webp",
      "https://i.ibb.co/1Y2gsgBy/603d6207dcd0225713fe1549-IMG-4484.webp",
      "https://i.ibb.co/k2svMNFv/603d10120fba838e599b6b5e-IMG-1563.webp",
      "https://i.ibb.co/BKv7177j/603d6216612acc7c7e54bef2-IMG-1158.webp",
      "https://i.ibb.co/6Rqf37ft/6039d4bbb15be328fc33b54d-IMG-6478.webp",
      "https://i.ibb.co/ccSZT30x/603985613b870e6cd6c49a29-IMG-3457.webp"
    ],
    settings: isMobile ? {
      baseWidth: 320,
      smallHeight: 320,
      largeHeight: 320,
      itemGap: 5,
      hoverScale: 1.05,
      expandedScale: 0.4,
      dragEase: 0.075,
      momentumFactor: 140,
      bufferZone: 1,
      borderRadius: 0,
      vignetteSize: 140,
      vignetteStrength: 0.7,
      overlayOpacity: 0.9,
      overlayEaseDuration: 0.8,
      zoomDuration: 0.6
    } : {
      baseWidth: 400,
      smallHeight: 400,
      largeHeight: 400,
      itemGap: 15,
      hoverScale: 1.05,
      expandedScale: 0.4,
      dragEase: 0.075,
      momentumFactor: 200,
      bufferZone: 1,
      borderRadius: 0,
      vignetteSize: 200,
      vignetteStrength: 0.7,
      overlayOpacity: 0.9,
      overlayEaseDuration: 0.8,
      zoomDuration: 0.6
    },
    containerSelector: "#page-home .container",
    canvasSelector: "canvas"
  });

  initBlur();

  if (typeof Sketch === "function") {
    new Sketch({ dom: document.getElementById("webgl-bg") });
  }

  const projectsContainer = document.querySelector("#page-work .projects-container");
  const backgroundImage = document.getElementById("background-image");
  renderProjects(projectsContainer);
  initialAnimation();
  preloadImages();
  setupHoverEvents(backgroundImage, projectsContainer);
});

/* ===================================================================== */
/* RESUME BUTTON CREATION & VISIBILITY TOGGLING FUNCTIONALITY */
/* ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Create the glassy button container and its inner elements
  const resumeContainer = document.createElement('div');
  resumeContainer.classList.add('work-glassy-button-container');
  // Initially hide the container with display:none and 0 opacity
  resumeContainer.style.display = 'none';
  resumeContainer.style.opacity = '0';
  resumeContainer.style.transition = 'opacity 0.5s ease-in';

  const wrap = document.createElement('div');
  wrap.classList.add('glassy-button-wrap');

  const shadow = document.createElement('div');
  shadow.classList.add('glassy-button-shadow');

  const button = document.createElement('button');
  button.classList.add('glassy-button');
  button.type = 'button';
  button.addEventListener('click', () => {
    window.location.href = 'https://reasonably.cc/resume';
  });

  const span = document.createElement('span');
  span.textContent = 'View Resume';

  // Assemble the button elements
  button.appendChild(span);
  wrap.appendChild(shadow);
  wrap.appendChild(button);
  resumeContainer.appendChild(wrap);

  // Append the resume container to the body
  document.body.appendChild(resumeContainer);

  // Function to update resume button visibility based on active page id
  function toggleResumeButton() {
    const activePage = document.querySelector(".page.active");
    if (activePage && (activePage.id === "page-home" || activePage.id === "page-connect")) {
      // Hide resume button on homepage and connect page
      resumeContainer.style.display = "none";
      resumeContainer.style.opacity = "0";
    } else {
      // Show the resume button on all other pages
      resumeContainer.style.display = "block";
      // Force reflow to ensure the opacity transition takes effect
      void resumeContainer.offsetWidth;
      resumeContainer.style.opacity = "1";
    }
  }

  // Call toggle function on load
  toggleResumeButton();

  // Use a MutationObserver to watch for changes in page active state
  const pages = document.querySelectorAll(".page");
  const observer = new MutationObserver(toggleResumeButton);
  pages.forEach(page => {
    observer.observe(page, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  // Listen for hashchange and popstate for additional navigation events
  window.addEventListener("hashchange", toggleResumeButton);
  window.addEventListener("popstate", toggleResumeButton);
});

/* ===================================================================== */
/* Additional Back-to-Top & Scroll Events, WebGL sketch code, etc. Below */
/* ===================================================================== */

// Back-to-top button handling for the Life page
(function () {
  const backToTopBtn = document.getElementById("back-to-top-life");
  const lifePage = document.getElementById("page-life");
  if (backToTopBtn && lifePage) {
    window.addEventListener("scroll", debounce(() => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > lifePage.offsetTop + 200) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }, 50), { passive: true });
    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: lifePage.offsetTop, behavior: "smooth" });
    });
  }
})();

// Responsive scaling
(function (minWidth = 375) {
  const adjustScale = () => {
    document.documentElement.style.minWidth = `${minWidth}px`;
    document.body.style.minWidth = `${minWidth}px`;
    if (window.innerWidth < minWidth) {
      const scale = window.innerWidth / minWidth;
      document.body.style.transformOrigin = "top left";
      document.body.style.transform = `scale(${scale})`;
      document.body.style.width = `${minWidth}px`;
      document.documentElement.style.overflowX = "hidden";
    } else {
      document.body.style.transform = "";
      document.body.style.width = "";
      document.documentElement.style.overflowX = "auto";
    }
  };
  window.addEventListener("resize", debounce(adjustScale, 50));
  window.addEventListener("DOMContentLoaded", adjustScale);
  adjustScale();
})(375);

// Back-to-glassy button functionality
(function () {
  const container = document.getElementById("back-to-glassy-container");
  const button = document.getElementById("back-to-glassy");
  if (!container || !button) return;
  let scrollContainer = null;
  const lifePage = document.getElementById("page-life");
  if (lifePage) {
    const content = lifePage.querySelector(".content");
    if (content && content.scrollHeight > content.clientHeight) {
      scrollContainer = content;
    }
  }
  if (!scrollContainer) scrollContainer = window;
  const toggleVisibility = () => {
    const scrollTop = scrollContainer === window ? window.scrollY || document.documentElement.scrollTop : scrollContainer.scrollTop;
    if (scrollTop > 0) {
      container.classList.add("visible");
    } else {
      container.classList.remove("visible");
    }
  };
  scrollContainer.addEventListener("scroll", debounce(toggleVisibility, 50), { passive: true });
  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (scrollContainer === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  toggleVisibility();
})();

// Additional back-to-top for Life page
(function () {
  const backToTop = document.getElementById("back-to-top-life");
  const lifePage = document.getElementById("page-life");
  if (backToTop && lifePage) {
    window.addEventListener("scroll", debounce(() => {
      if ((window.scrollY || document.documentElement.scrollTop) > 200) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }, 50), { passive: true });
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();

// WebGL Sketch Code
const vertex = `
  varying vec3 pos;
  uniform float time;
  varying float v_noise;
  varying vec2 vUv;
  void main() {
    pos = position;
    vUv = uv;
    vec3 newPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragment = `
  varying vec3 pos;
  varying vec2 vUv;
  varying float v_noise;
  uniform float time;
  uniform sampler2D matCap;
  uniform vec4 resolution;
  uniform vec2 mouse;
  uniform float progress;
  uniform float particleNumber;
  #define PI 3.14159265359
  mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,        oc * axis.y * axis.z - axis.x * s, 0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,         0.0,
      0.0,                              0.0,                              0.0,                              1.0
    );
  }
  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }
  vec2 getmatcap(vec3 eye, vec3 normal) {
    vec3 reflected = reflect(eye, normal);
    float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
    return reflected.xy / m + 0.5;
  }
  float sdSphere(vec3 p, float s) {
    return length(p) - s;
  }
  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }
  float sdf(vec3 p) {
    vec3 p1 = rotate(p, vec3(0.1), time / 5.0);
    float box = smin(sdBox(p1, vec3(0.3)), sdSphere(p, 0.4), 0.3);
    float final = mix(box, sdSphere(p, 0.2 + progress / 4.0), progress);
    for (int i = 0; i < int(particleNumber); i++) {
      float randOffset = rand(vec2(i, 0.0));
      float progr = fract(time / 4.0 + randOffset * 5.0);
      vec3 rPos = vec3(sin(randOffset * 2.0 * PI) * 2.0, cos(randOffset * 2.0 * PI) * 2.0, 0.0);
      float gotoCenter = sdSphere(p - rPos * progr, 0.12);
      final = smin(final, gotoCenter, 0.3);
    }
    float mouseSphere = sdSphere(p - vec3(mouse * resolution.zw * 2.0, 0.0), 0.25);
    return smin(final, mouseSphere, 0.4);
  }
  vec3 calcNormal(in vec3 p) {
    const float eps = 0.0001;
    const vec2 h = vec2(eps, 0.0);
    return normalize(vec3(
      sdf(p + vec3(h.x, h.y, h.y)) - sdf(p - vec3(h.x, h.y, h.y)),
      sdf(p + vec3(h.y, h.x, h.y)) - sdf(p - vec3(h.y, h.x, h.y)),
      sdf(p + vec3(h.y, h.y, h.x)) - sdf(p - vec3(h.y, h.y, h.x))
    ));
  }
  void main() {
    float dist = length(vUv - vec2(0.5));
    vec3 bg = vec3(mix(vec3(0.1), vec3(0.0), dist));
    vec2 newUv = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec3 cameraPos = vec3(0.0, 0.0, 2.0);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * resolution.zw, -1.0));
    vec3 rayPos = cameraPos;
    float t = 0.0;
    float tMax = 5.0;
    for (int i = 0; i < 256; i++) {
      vec3 pos = cameraPos + t * ray;
      float h = sdf(pos);
      if (h < 0.001 || t > tMax) break;
      t += h;
    }
    vec4 color = vec4(bg, 1.0);
    if (t < tMax) {
      vec3 pos = cameraPos + t * ray;
      vec3 normal = calcNormal(pos);
      float diff = dot(vec3(1.0), normal);
      vec2 matCapUv = getmatcap(ray, normal);
      color = texture2D(matCap, matCapUv);
      float fresnel = pow(1.0 + dot(ray, normal), 3.0);
      color = mix(color, vec4(bg, 0.5), fresnel);
    }
    gl_FragColor = vec4(color);
  }
`;

const matCap = "https://raw.githubusercontent.com/nidorx/matcaps/master/1024/293534_B2BFC5_738289_8A9AA7.png";

class Sketch {
  constructor({ dom }) {
    this.time = 0;
    this.container = dom;
    this.scene = new THREE.Scene();
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1e3, 1e3);
    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.container.appendChild(this.renderer.domElement);
    this.resizeSetup();
    this.mouseEvents();
    this.addObjects();
  }

  resizeSetup() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    if (!this.material) return;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.imageAspect = 1;
    let t, e;
    if (this.width / this.height > this.imageAspect) {
      t = (this.width / this.height) * this.imageAspect;
      e = 1;
    } else {
      t = 1;
      e = (this.width / this.height) * this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = t;
    this.material.uniforms.resolution.value.w = e;
  }

  mouseEvents() {
    this.mouse = new THREE.Vector2();
    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.pageX / this.width - 0.5;
      this.mouse.y = -e.pageY / this.height + 0.5;
    });
  }

  addObjects() {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    loader.load(matCap, (texture) => {
      this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      this.material = new THREE.ShaderMaterial({
        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
        side: THREE.DoubleSide,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          time: { value: this.time },
          mouse: { value: new THREE.Vector2(0, 0) },
          progress: { value: 0 },
          matCap: { value: texture },
          resolution: { value: new THREE.Vector4() },
          particleNumber: { value: 0 }
        }
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);
      this.resize();
      this.render();
    }, undefined, (err) => {
      console.error("Texture failed to load:", err);
    });
  }

  render() {
    this.time += 0.05;
    if (this.material) {
      this.material.uniforms.time.value = this.time;
      if (this.mouse) this.material.uniforms.mouse.value = this.mouse;
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({ dom: document.getElementById("webgl-bg") });

$(function () {
  function spanize($elem, delayFactor) {
    const originalText = $elem.data("original") || $elem.text();
    $elem.data("original", originalText);
    let html = "";
    originalText.split("").forEach((char, index) => {
      const escaped = char === " " ? " " : $("<div/>").text(char).html();
      html += `<span style="animation-delay:${delayFactor * index}s">${escaped}</span>`;
    });
    $elem.html(html);
    return originalText.length;
  }

  function activateSection(type, activate) {
    $(".mast__title, .mast__text").removeClass("active");
    const $title = $(`.mast__title[data-type="${type}"]`).addClass("active");
    const $text = $(`.mast__text[data-type="${type}"]`);
    if (activate) {
      $text.addClass("active");
    } else {
      $text.removeClass("active");
    }
    spanize($title, 0.05);
    if (activate) spanize($text, 0.02);
  }

  $(".mast__title.js-spanize").each(function () {
    spanize($(this), 0.05);
  });

  $(".mast__text.js-spanize").each(function () {
    spanize($(this), 0.02);
  });

  // Default: "&" active instead of "Reason"
  $(".mast__title, .mast__text").removeClass("active");
  activateSection("and", true);

  $(".mast__title").on("click", function () {
    activateSection($(this).data("type"), true);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("back-to-glassy-container");
  function toggleGlassy() {
    if (window.scrollY > 64) {
      container.classList.add("active");
    } else {
      container.classList.remove("active");
    }
  }
  if (container) {
    container.addEventListener("click", function (e) {
      if (e.target.closest(".back-to-glassy-btn")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    window.addEventListener("scroll", debounce(toggleGlassy, 50), { passive: true });
    toggleGlassy();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const lifeSections = document.querySelectorAll("#page-life .life-section");
  if (lifeSections.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    lifeSections.forEach(section => observer.observe(section));
  }
});

(function () {
  const btnContainer = document.getElementById("back-to-top-life-container");
  const backToTop = document.getElementById("back-to-top-life");
  const lifePage = document.getElementById("page-life");
  if (!btnContainer || !backToTop || !lifePage) return;
  const content = lifePage.querySelector(".content");
  const scrollElem = content || window;
  function checkScroll() {
    if ((scrollElem === window ? window.scrollY || document.documentElement.scrollTop : content.scrollTop) > 0) {
      btnContainer.classList.add("visible");
    } else {
      btnContainer.classList.remove("visible");
    }
  }
  if (scrollElem === window) {
    window.addEventListener("scroll", debounce(checkScroll, 50), { passive: true });
  } else {
    content.addEventListener("scroll", debounce(checkScroll, 50), { passive: true });
  }
  backToTop.addEventListener("click", function (e) {
    e.preventDefault();
    if (scrollElem === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      content.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  checkScroll();
})();

(function () {
  const backToTop = document.getElementById("back-to-top-life");
  const lifePage = document.getElementById("page-life");
  if (backToTop && lifePage) {
    window.addEventListener("scroll", debounce(() => {
      if ((window.scrollY || document.documentElement.scrollTop) > 200) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }, 50), { passive: true });
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();

// Optionally, request full-screen mode to minimize system UI interference
function lockScreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}
lockScreen();

// MAST SEQUENTIAL ANIMATION FOR CONNECT PAGE
document.addEventListener("DOMContentLoaded", function () {
  function animateIn(elem, delay = 0, className = 'mast-fadein') {
    return new Promise(resolve => {
      setTimeout(() => {
        elem.classList.add(className);
        resolve();
      }, delay);
    });
  }

  function getMastElements() {
    const container = document.querySelector('.connect-container .mast__header');
    if (!container) return null;
    const h1s = [
      container.querySelector('.mast__title[data-type="and"]'),
      container.querySelector('.mast__title[data-type="reason"]'),
      container.querySelector('.mast__title[data-type="resolution"]')
    ];
    const ps = [
      container.querySelector('.mast__text[data-type="and"]'),
      container.querySelector('.mast__text[data-type="reason"]'),
      container.querySelector('.mast__text[data-type="resolution"]')
    ];
    return { h1s, ps };
  }

  const mastStyles = document.createElement('style');
  mastStyles.textContent = `
    .connect-container .mast__title, 
    .connect-container .mast__text,
    .connect-container .glassy-button-container {
      opacity: 0;
      transition: opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94);
    }
    .connect-container .mast__title.mast-fadein,
    .connect-container .mast__text.mast-fadein,
    .connect-container .glassy-button-container.mast-fadein {
      opacity: 1;
    }
  `;
  document.head.appendChild(mastStyles);

  async function runMastSequence() {
    const glassyButtonCont = document.querySelector('.connect-container .glassy-button-container');
    if (glassyButtonCont) {
      glassyButtonCont.classList.remove('mast-fadein');
    }
    const mast = getMastElements();
    if (!mast) return;
    mast.h1s.forEach(h1 => h1 && h1.classList.remove('mast-fadein'));
    mast.ps.forEach(p => { if (p) p.classList.remove('mast-fadein'); });
    for (let i = 0; i < mast.h1s.length; i++) {
      if (mast.h1s[i]) await animateIn(mast.h1s[i], i === 0 ? 0 : 350);
    }
    for (let i = 0; i < mast.ps.length; i++) {
      if (mast.ps[i]) await animateIn(mast.ps[i], 300);
    }
    if (glassyButtonCont) {
      setTimeout(() => {
        glassyButtonCont.classList.add('mast-fadein');
      }, 400);
    }
  }

  function hideGlassyButton() {
    const glassyButtonCont = document.querySelector('.connect-container .glassy-button-container');
    if (glassyButtonCont) {
      glassyButtonCont.classList.remove('mast-fadein');
    }
  }

  function onConnectPageActive() {
    const connectPage = document.getElementById('page-connect');
    if (connectPage && connectPage.classList.contains('active')) {
      runMastSequence();
    }
  }
  onConnectPageActive();
  let lastWasConnect = false;
  setInterval(() => {
    const isConnect = document.getElementById('page-connect')?.classList.contains('active');
    if (isConnect && !lastWasConnect) {
      runMastSequence();
    } else if (!isConnect && lastWasConnect) {
      hideGlassyButton();
    }
    lastWasConnect = isConnect;
  }, 200);

  const glassyBtn = document.querySelector('.connect-container .glassy-button');
  if (glassyBtn) {
    glassyBtn.addEventListener('click', function () {
      window.location.href = 'mailto:zack@reasonably.cc';
    });
  }
});

$(function () {
  function spanize($elem, delayFactor) {
    const originalText = $elem.data("original") || $elem.text();
    $elem.data("original", originalText);
    let html = "";
    originalText.split("").forEach((char, index) => {
      const escaped = char === " " ? " " : $("<div/>").text(char).html();
      html += `<span style="animation-delay:${delayFactor * index}s">${escaped}</span>`;
    });
    $elem.html(html);
    return originalText.length;
  }

  function activateSection(type, activate) {
    $(".mast__title, .mast__text").removeClass("active");
    const $title = $(`.mast__title[data-type="${type}"]`).addClass("active");
    const $text = $(`.mast__text[data-type="${type}"]`);
    if (activate) {
      $text.addClass("active");
    } else {
      $text.removeClass("active");
    }
    spanize($title, 0.05);
    if (activate) spanize($text, 0.02);
  }

  $(".mast__title.js-spanize").each(function () {
    spanize($(this), 0.05);
  });

  $(".mast__text.js-spanize").each(function () {
    spanize($(this), 0.02);
  });

  $(".mast__title, .mast__text").removeClass("active");
  activateSection("and", true);

  $(".mast__title").on("click", function () {
    activateSection($(this).data("type"), true);
  });
});

    document.addEventListener("DOMContentLoaded", () => {
      const hoverSound = document.getElementById("hoverSound");
      document.querySelectorAll("nav ul.content li a").forEach((link) => {
        link.addEventListener("mouseenter", () => {
          if (hoverSound) {
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.4;
            hoverSound.play().catch((error) => {
              console.error("Error playing sound:", error);
            });
          }
        });
      });
    });
