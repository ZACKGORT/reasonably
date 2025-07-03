// ======= NAVIGATION & LOGO HOVER LIGHT =======
class Navigation {
  constructor(navSelector, spotlightSelector, y = 54, z = 82) {
    this.nav = document.querySelector(navSelector);
    this.links = this.nav ? this.nav.querySelectorAll("a") : [];
    this.navLight = document.querySelector(spotlightSelector);
    this.NAV_Y = y;
    this.NAV_Z = z;
    this.init();
  }

  centerX(el) {
    const navRect = this.nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.left - navRect.left + elRect.width / 2;
  }

  moveNavLight(x, immediate = false) {
    if (!this.navLight) return;
    this.navLight.setAttribute("x", x);
    this.navLight.setAttribute("y", this.NAV_Y);
    this.navLight.setAttribute("z", this.NAV_Z);
  }

  setActivePage(pageId) {
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.remove("active"));
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.classList.add("active");
    // Body state class
    document.body.className = document.body.className
      .split(" ")
      .filter((c) => !c.endsWith("-active"))
      .join(" ");
    document.body.classList.add(`${pageId.replace("page-", "")}-active`);
  }

  attachEvents() {
    this.links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.links.forEach((l) => l.removeAttribute("data-active"));
        link.setAttribute("data-active", "true");
        this.setActivePage(`page-${link.dataset.page}`);
        this.moveNavLight(this.centerX(link));
      });
    });

    // Hover
    const handleMove = (e) => {
      this.moveNavLight(e.clientX - this.nav.getBoundingClientRect().left);
    };

    this.nav.addEventListener("pointerenter", () => {
      this.nav.addEventListener("pointermove", handleMove);
    });
    this.nav.addEventListener("pointerleave", () => {
      this.nav.removeEventListener("pointermove", handleMove);
      this.moveNavLight(
        this.centerX(this.nav.querySelector("[data-active='true']"))
      );
    });
  }

  resizeLogoCenter(centreLogoFn) {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.moveNavLight(
          this.centerX(this.nav.querySelector("[data-active='true']")),
          true
        );
        if (typeof centreLogoFn === "function") centreLogoFn();
      }, 50);
    });
  }

  init() {
    if (!this.nav) return;
    this.moveNavLight(
      this.centerX(this.nav.querySelector("[data-active='true']")),
      true
    );
  }
}

// ======= LOGO SPOTLIGHT =======
class LogoSpotlight {
  constructor(wrapperSelector, lightSelector) {
    this.logoWrap = document.querySelector(wrapperSelector);
    this.logoLight = document.getElementById(lightSelector);
    this.centreLogo();
    this.attachEvents();
  }

  centreLogo = () => {
    if (!this.logoWrap || !this.logoLight) return;
    const r = this.logoWrap.getBoundingClientRect();
    this.logoLight.setAttribute("x", r.width / 2);
    this.logoLight.setAttribute("y", r.height / 2);
  };

  trackLogo = (e) => {
    if (!this.logoWrap || !this.logoLight) return;
    const r = this.logoWrap.getBoundingClientRect();
    this.logoLight.setAttribute("x", e.clientX - r.left);
    this.logoLight.setAttribute("y", e.clientY - r.top);
  };

  attachEvents() {
    if (!this.logoWrap) return;
    this.logoWrap.addEventListener("pointerenter", this.trackLogo);
    this.logoWrap.addEventListener("pointermove", this.trackLogo, {
      passive: true,
    });
    this.logoWrap.addEventListener("pointerleave", this.centreLogo);
  }
}

// ======= GOOEY CURSOR =======
class GooeyCursor {
  constructor(cursorSelector, tailLength = 16) {
    this.cursor = document.getElementById(cursorSelector);
    this.TAIL = tailLength;
    this.cx = window.innerWidth / 2;
    this.cy = window.innerHeight / 2;
    this.history = Array.from({ length: this.TAIL }, () => ({
      x: this.cx,
      y: this.cy,
    }));
    this.gooLoopStarted = false;
    this.init();
  }

  init() {
    if (!this.cursor) return;
    if (this.cursor.children.length < this.TAIL) {
      for (let i = 0; i < this.TAIL; i++) {
        const d = document.createElement("div");
        d.className = "cursor-circle";
        d.style.willChange = "transform";
        this.cursor.appendChild(d);
      }
    }
    this.dots = [...this.cursor.children];

    window.addEventListener(
      "pointermove",
      (e) => {
        this.cx = e.clientX;
        this.cy = e.clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        this.cx = t.clientX;
        this.cy = t.clientY;
      },
      { passive: true }
    );

    if (!this.gooLoopStarted) {
      this.gooLoopStarted = true;
      this.gooLoop();
    }
  }

  gooLoop = () => {
    this.history[0].x += (this.cx - this.history[0].x) * 0.5;
    this.history[0].y += (this.cy - this.history[0].y) * 0.5;
    for (let i = 1; i < this.TAIL; i++) {
      this.history[i].x += (this.history[i - 1].x - this.history[i].x) * 0.3;
      this.history[i].y += (this.history[i - 1].y - this.history[i].y) * 0.3;
    }
    for (let i = 0; i < this.TAIL; i++) {
      const scale = 0.7 * (1 - i / this.TAIL) + 0.1;
      this.dots[i].style.transform =
        `translate3d(${this.history[i].x}px,${this.history[i].y}px,0) scale(${scale})`;
      this.dots[i].style.opacity = 1 - i / this.TAIL;
    }
    requestAnimationFrame(this.gooLoop);
  };
}

// ======= HOME GALLERY (Virtual Grid) =======
class HomeGallery {
  constructor({
    items,
    imageUrls,
    settings,
    containerSelector,
    canvasSelector,
  }) {
    this.items = items;
    this.imageUrls = imageUrls;
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
    this.cellHeight =
      Math.max(this.settings.smallHeight, this.settings.largeHeight) +
      this.settings.itemGap;
    this.init();
  }

  getItemId(c, r) {
    return `${c},${r}`;
  }
  getItemSize(r, c) {
    const sizes = [
      { width: this.settings.baseWidth, height: this.settings.smallHeight },
      { width: this.settings.baseWidth, height: this.settings.largeHeight },
    ];
    return sizes[Math.abs((r * this.columns + c) % sizes.length)];
  }
  getItemPosition(c, r) {
    return { x: c * this.cellWidth, y: r * this.cellHeight };
  }

  updateVisibleItems() {
    const buf = this.settings.bufferZone;
    const viewW = window.innerWidth * (1 + buf),
      viewH = window.innerHeight * (1 + buf);
    const startCol = Math.floor((-this.currentX - viewW / 2) / this.cellWidth);
    const endCol = Math.ceil((-this.currentX + viewW * 1.5) / this.cellWidth);
    const startRow = Math.floor((-this.currentY - viewH / 2) / this.cellHeight);
    const endRow = Math.ceil((-this.currentY + viewH * 1.5) / this.cellHeight);

    const newSet = new Set();
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const id = this.getItemId(c, r);
        newSet.add(id);
        if (this.visibleItems.has(id)) continue;
        const size = this.getItemSize(r, c);
        const pos = this.getItemPosition(c, r);
        const el = document.createElement("div");
        el.className = "item";
        el.id = id;
        el.style.width = `${size.width}px`;
        el.style.height = `${size.height}px`;
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.style.position = "absolute";
        el.style.willChange = "transform";
        el.dataset.col = c;
        el.dataset.row = r;
        const idx = Math.abs((r * this.columns + c) % this.itemCount);
        const imgWrap = document.createElement("div");
        imgWrap.className = "item-image-container";
        const img = document.createElement("img");
        img.src = this.imageUrls[idx % this.imageUrls.length];
        img.alt = `Image ${idx + 1}`;
        img.loading = "lazy";
        imgWrap.appendChild(img);
        el.appendChild(imgWrap);
        const cap = document.createElement("div");
        cap.className = "item-caption";
        const name = document.createElement("div");
        name.className = "item-name";
        name.textContent = this.items[idx];
        cap.appendChild(name);
        const num = document.createElement("div");
        num.className = "item-number";
        num.textContent = `#${(idx + 1).toString().padStart(5, "0")}`;
        cap.appendChild(num);
        el.appendChild(cap);
        this.canvas.appendChild(el);
        this.visibleItems.add(id);
      }
    }
    // Remove items that are no longer visible
    this.visibleItems.forEach((id) => {
      if (!newSet.has(id)) {
        const n = document.getElementById(id);
        if (n && n.parentNode === this.canvas) this.canvas.removeChild(n);
        this.visibleItems.delete(id);
      }
    });
  }

  animate() {
    const ease = this.settings.dragEase;
    this.currentX += (this.targetX - this.currentX) * ease;
    this.currentY += (this.targetY - this.currentY) * ease;
    this.canvas.style.transform = `translate3d(${this.currentX}px,${this.currentY}px,0)`;
    this.updateVisibleItems();
    requestAnimationFrame(this.animate.bind(this));
  }

  attachDragEvents() {
    if (!this.container) return;
    this.container.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.mouseHasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.container.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX,
        dy = e.clientY - this.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.mouseHasMoved = true;
      const now = Date.now(),
        dt = Math.max(10, now - this.lastDragTime);
      this.lastDragTime = now;
      this.dragVelocityX = dx / dt;
      this.dragVelocityY = dy / dt;
      this.targetX += dx;
      this.targetY += dy;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });
    window.addEventListener("mouseup", () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container.style.cursor = "grab";
      if (
        Math.abs(this.dragVelocityX) > 0.1 ||
        Math.abs(this.dragVelocityY) > 0.1
      ) {
        this.targetX += this.dragVelocityX * this.settings.momentumFactor;
        this.targetY += this.dragVelocityY * this.settings.momentumFactor;
      }
    });

    // Touch events
    this.container.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      this.mouseHasMoved = false;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isDragging) return;
        const dx = e.touches[0].clientX - this.startX;
        const dy = e.touches[0].clientY - this.startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.mouseHasMoved = true;
        this.targetX += dx;
        this.targetY += dy;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
      },
      { passive: false }
    );
    window.addEventListener("touchend", () => (this.isDragging = false));
  }

  init() {
    if (!this.container || !this.canvas) return;
    this.updateVisibleItems();
    this.attachDragEvents();
    this.animate();
  }
}

// ======= BLUR EFFECT INIT =======
function initBlur() {
  const root = document.documentElement;
  document.querySelectorAll(".blur").forEach((blur) => {
    const total =
      parseInt(getComputedStyle(root).getPropertyValue("--layers")) || 5;
    blur.innerHTML = Array.from(
      { length: total },
      (_, i) => `<div style="--i:${i}"></div>`
    ).join("");
  });
}

// ========== WORK PAGE LOGIC ==========
const projects = [
  {
    id: 1,
    title: "Phenom",
    year: "2024",
    image:
      "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg",
  },
  {
    id: 2,
    title: "Independent",
    year: "2023",
    image:
      "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg",
  },
  {
    id: 3,
    title: "Publicis Sapient",
    year: "2022",
    image:
      "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg",
  },
  {
    id: 4,
    title: "Elva Design Group",
    year: "2021",
    image:
      "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg",
  },
  {
    id: 5,
    title: "Huge",
    year: "2021",
    image:
      "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg",
  },
  {
    id: 6,
    title: "LiveArea",
    year: "2020-21",
    image:
      "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg",
  },
  {
    id: 7,
    title: "PHI to NYC",
    year: "2019-20",
    image:
      "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg",
  },
  {
    id: 8,
    title: "Workarea",
    year: "2018-19",
    image:
      "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg",
  },
  {
    id: 9,
    title: "O3 World",
    year: "2017-18",
    image:
      "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg",
  },
  {
    id: 10,
    title: "One Sixty Over Ninety",
    year: "2014-16",
    image:
      "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg",
  },
];

function renderProjects(container) {
  if (!container) return;
  container.innerHTML = "";
  projects.forEach((project) => {
    const item = document.createElement("div");
    item.classList.add("project-item");
    item.dataset.id = project.id;
    item.dataset.image = project.image;
    item.innerHTML = `
      <div class="project-title">${project.title}</div>
      <div class="project-year">${project.year}</div>
    `;
    container.appendChild(item);
  });
}

function initialAnimation() {
  document.querySelectorAll(".project-item").forEach((item, i) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    setTimeout(() => {
      item.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, i * 60);
  });
}

function setupHoverEvents(bg, container) {
  projects.forEach((p) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = p.image;
  });
  if (!bg) return;
  container.querySelectorAll(".project-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      bg.style.transition = "none";
      bg.style.transform = "scale(1.2)";
      bg.src = item.dataset.image;
      bg.style.opacity = "1";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bg.style.transition =
            "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          bg.style.transform = "scale(1.0)";
        });
      });
    });
  });
  container.addEventListener("mouseleave", () => {
    bg.style.opacity = "0";
  });
}

function preloadImages() {
  projects.forEach((p) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = p.image;
  });
}

// ======= MAIN INIT FOR NAVIGATION & APP =======
document.addEventListener("DOMContentLoaded", () => {
  // Navigation and logo
  const nav = new Navigation("nav", "#spotlight fePointLight");
  const logo = new LogoSpotlight(".logo-wrapper", "logoLight");

  // Removed scroll progress logic

  nav.attachEvents();
  nav.resizeLogoCenter(logo.centreLogo);

  // Set default page active (e.g., home) via JS
  nav.setActivePage("page-home");
  const homeLink = document.querySelector('nav a[data-page="home"]');
  if (homeLink) {
    document
      .querySelectorAll("nav a")
      .forEach((l) => l.removeAttribute("data-active"));
    homeLink.setAttribute("data-active", "true");
    nav.moveNavLight(nav.centerX(homeLink));
  }

  // Logo click navigates home
  const logoWrap = document.querySelector(".logo-wrapper");
  if (logoWrap) {
    logoWrap.addEventListener("click", (e) => {
      e.preventDefault();
      const homeLink = document.querySelector('nav a[data-page="home"]');
      if (homeLink) {
        document
          .querySelectorAll("nav a")
          .forEach((l) => l.removeAttribute("data-active"));
        homeLink.setAttribute("data-active", "true");
      }
      nav.setActivePage("page-home");
      nav.moveNavLight(nav.centerX(homeLink));
    });
    logoWrap.style.cursor = "pointer";
  }

  // Gooey cursor
  new GooeyCursor("cursor", 16);

  // HomeGallery (virtual grid)
  const desktopSettings = {
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
    zoomDuration: 0.6,
  };

  const mobileSettings = {
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
    zoomDuration: 0.6,
  };

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const gallerySettings = isMobile ? mobileSettings : desktopSettings;

  new HomeGallery({
    items: [
      "Gallery Image 1",
      "Gallery Image 2",
      "Gallery Image 3",
      "Gallery Image 4",
      "Gallery Image 5",
      "Gallery Image 6",
      "Gallery Image 7",
      "Gallery Image 8",
      "Gallery Image 9",
      "Gallery Image 10",
      "Gallery Image 11",
      "Gallery Image 12",
      "Gallery Image 13",
    ],
    imageUrls: [
      "https://i.ibb.co/Q82WBds/2299765761344742582-5144774570.jpg",
      "https://i.ibb.co/nDNfQPD/2302763344874937579-5144774570.jpg",
      "https://i.ibb.co/mSR1GDc/2309287483437628607-5144774570.jpg",
      "https://i.ibb.co/SBBFq8g/2321694150817073052-5144774570.jpg",
      "https://i.ibb.co/9vFZk6n/2327892796382234206-5144774570.jpg",
      "https://i.ibb.co/Jxbs7jg/2344081181031306274-5144774570.jpg",
      "https://i.ibb.co/zsxNHK7/2448148266170177557-5144774570.jpg",
      "https://i.ibb.co/XbnBHmg/2886095297461903371-5144774570.jpg",
      "https://i.ibb.co/3yjTzkp/2448137532291865865-5144774570.jpg",
      "https://i.ibb.co/RcN0rLM/2302765161788654866-5144774570.jpg",
      "https://i.ibb.co/dr55NKK/2288089293770285108-5144774570.jpg",
      "https://i.ibb.co/WP03r4g/2285335292767225477-5144774570.jpg",
      "https://i.ibb.co/3rh0JJT/2280253723450838291-5144774570.jpg",
    ],
    settings: gallerySettings,
    containerSelector: "#page-home .container",
    canvasSelector: "canvas",
  });

  // Blur overlays
  initBlur();

  // Three.js background (must be after #webgl-bg is in DOM)
  if (typeof Sketch === "function") {
    new Sketch({ dom: document.getElementById("webgl-bg") });
  }

  // Work page projects
  const projectsContainer = document.querySelector(
    "#page-work .projects-container"
  );
  const backgroundImage = document.getElementById("background-image");
  renderProjects(projectsContainer);
  initialAnimation();
  preloadImages();
  setupHoverEvents(backgroundImage, projectsContainer);
});

// In your SPA navigation logic
function onNavigateToHome() {
  document.body.classList.add("homepage");
  // Optionally force redraw for overlays
  document
    .querySelectorAll(
      ".blur,.vignette-bottom,.page-vignette-container,.page-vignette,.page-vignette-strong,.page-vignette-extreme"
    )
    .forEach((el) => {
      el.style.display = "none";
      void el.offsetHeight;
      el.style.display = "";
    });
}

function onNavigateAwayFromHome() {
  document.body.classList.remove("homepage");
}

const button = document.querySelector(".spotlight-button");
const ellipse = button?.querySelector(".spotlight-ellipse");

if (button && ellipse) {
  button.addEventListener("pointermove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 70 + 20;
    ellipse.setAttribute("cx", `${x}%`);
    ellipse.setAttribute("cy", `${y}`);
  });

  button.addEventListener("pointerleave", () => {
    ellipse.setAttribute("cx", "50%");
    ellipse.setAttribute("cy", "54");
  });
}

// Show button after scrolling and smooth scroll to top
(function() {
  const btn = document.getElementById('back-to-top-life');
  const page = document.getElementById('page-life');
  if (!btn || !page) return;

  function toggleBtn() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > (page.offsetTop + 200)) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBtn);

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: page.offsetTop, behavior: 'smooth' });
  });
})();

(function ensureMinWidth(minWidth = 375) {
  function setMinWidth() {
    document.documentElement.style.minWidth = minWidth + "px";
    document.body.style.minWidth = minWidth + "px";
    document.documentElement.style.overflowX = "auto";
    document.body.style.overflowX = "auto";
    if (window.innerWidth < minWidth) {
      const scale = window.innerWidth / minWidth;
      document.body.style.transformOrigin = "top left";
      document.body.style.transform = "scale(" + scale + ")";
      document.body.style.width = minWidth + "px";
      document.documentElement.style.overflowX = "hidden";
    } else {
      document.body.style.transform = "";
      document.body.style.width = "";
      document.documentElement.style.overflowX = "auto";
    }
  }
  window.addEventListener("resize", setMinWidth);
  window.addEventListener("DOMContentLoaded", setMinWidth);
  setMinWidth();
})();

(function() {
  const btnContainer = document.getElementById('back-to-glassy-container');
  const btn = document.getElementById('back-to-glassy');
  if (!btnContainer || !btn) return;

  let scrollContainer = null;
  const pageLife = document.getElementById('page-life');
  if (pageLife) {
    const content = pageLife.querySelector('.content');
    if (content && (content.scrollHeight > content.clientHeight)) {
      scrollContainer = content;
    }
  }
  if (!scrollContainer) scrollContainer = window;

  function toggleBtn() {
    const scrolled = scrollContainer === window
      ? (window.scrollY || document.documentElement.scrollTop)
      : scrollContainer.scrollTop;
    if (scrolled > 0) {
      btnContainer.classList.add('visible');
    } else {
      btnContainer.classList.remove('visible');
    }
  }

  if (scrollContainer === window) {
    window.addEventListener('scroll', toggleBtn);
  } else {
    scrollContainer.addEventListener('scroll', toggleBtn);
  }

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    if (scrollContainer === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  toggleBtn();
})();

(function() {
  const btn = document.getElementById('back-to-top-life');
  const page = document.getElementById('page-life');
  if (!btn || !page) return;

  function toggleBtn() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 200) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBtn);

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// =========== GLOBAL THREE.JS SHADER BACKGROUND =============
// --- FULL SHADER CODE ---
const vertex = `
varying vec3 pos;
uniform float time;

varying float v_noise;
varying vec2 vUv;

void main(){
    pos = position;
    vUv = uv;
    vec3 newPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
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

mat4 rotationMatrix(vec3 axis, float angle){
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1. - c;

    return mat4(oc*axis.x*axis.x+c, oc*axis.x*axis.y-axis.z*s, oc*axis.z*axis.x+axis.y*s, 0.,
                oc*axis.x*axis.y+axis.z*s, oc*axis.y*axis.y+c, oc*axis.y*axis.z-axis.x*s, 0.,
                oc*axis.z*axis.x-axis.y*s, oc*axis.y*axis.z+axis.x*s, oc*axis.z*axis.z+c, 0.,
                0., 0., 0., 1.);
}

vec3 rotate(vec3 v, vec3 axis, float angle){
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.)).xyz;
}

vec2 getmatcap(vec3 eye, vec3 normal){
    vec3 reflected = reflect(eye, normal);
    float m = 2.8284271247461903 * sqrt(reflected.z + 1.);
    return reflected.xy/m + .5;
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}

float smin(float a, float b, float k) {
    float h = clamp(.5 + .5 * (b - a)/k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898,78.233)))*43758.5453);
}

float sdf(vec3 p){
    vec3 p1 = rotate(p, vec3(.1), time/5.);
    float box = smin(sdBox(p1, vec3(.3)), sdSphere(p, .4), .3);
    float final = mix(box, sdSphere(p, .2+progress/4.), progress);

    for(int i = 0; i < int(particleNumber); i++){
        float randOffset = rand(vec2(i, 0.));
        float progr = fract(time/4. + randOffset*5.);
        vec3 rPos = vec3(sin(randOffset*2.*PI)*2., cos(randOffset*2.*PI)*2., 0.);
        float gotoCenter = sdSphere(p - rPos * progr, .12);
        final = smin(final, gotoCenter, .3);
    }

    float mouseSphere = sdSphere(p - vec3(mouse * resolution.zw * 2., 0.), .25);
    return smin(final, mouseSphere, .4);
}

vec3 calcNormal(in vec3 p) {
    const float eps = .0001;
    const vec2 h = vec2(eps, 0);
    return normalize(vec3(
        sdf(p + h.xyy) - sdf(p - h.xyy),
        sdf(p + h.yxy) - sdf(p - h.yxy),
        sdf(p + h.yyx) - sdf(p - h.yyx)
    ));
}

void main(){
    float dist = length(vUv - vec2(.5));
    vec3 bg = vec3(mix(vec3(.1), vec3(0.), dist));
    vec2 newUv = (vUv - vec2(.5)) * resolution.zw + vec2(.5);
    vec3 cameraPos = vec3(0., 0., 2.);
    vec3 ray = normalize(vec3((vUv - vec2(.5))*resolution.zw, -1.));

    vec3 rayPos = cameraPos;
    float t = 0.;
    float tMax = 5.;
    for(int i = 0; i < 256; i++){
        vec3 pos = cameraPos + t * ray;
        float h = sdf(pos);

        if(h < .001 || t > tMax){
            break;
        }

        t += h;
    }

    vec4 color = vec4(bg, 1.);
    if(t < tMax){
        vec3 pos = cameraPos + t * ray;
        vec3 normal = calcNormal(pos);
        float diff = dot(vec3(1.), normal);
        vec2 matCapUv = getmatcap(ray, normal);
        color = texture2D(matCap, matCapUv);

        float fresnel = pow(1. + dot(ray, normal), 3.);
        color = mix(color, vec4(bg, .5), fresnel);
    }

    gl_FragColor = vec4(color);
}
`;
const matCap =
  "https://raw.githubusercontent.com/nidorx/matcaps/master/1024/293534_B2BFC5_738289_8A9AA7.png";
class Sketch {
  constructor(options) {
    this.time = 0;
    this.container = options.dom;
    this.scene = new THREE.Scene();
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    const fumSize = 1;
    this.camera = new THREE.OrthographicCamera(
      fumSize / -2,
      fumSize / 2,
      fumSize / 2,
      fumSize / -2,
      -1000,
      1000
    );
    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
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
    let a1, a2;
    if (this.width / this.height > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (this.width / this.height) * this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;
  }
  mouseEvents() {
    this.mouse = new THREE.Vector2();
    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.pageX / this.width - 0.5;
      this.mouse.y = -e.pageY / this.height + 0.5;
    });
  }
  addObjects() {
    const resolution = 1;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    loader.load(
      matCap,
      (texture) => {
        this.geometry = new THREE.PlaneBufferGeometry(
          1,
          1,
          resolution,
          resolution
        );
        this.material = new THREE.ShaderMaterial({
          extensions: {
            derivatives: "#extension GL_OES_standard_derivatives : enable",
          },
          side: THREE.DoubleSide,
          vertexShader: vertex,
          fragmentShader: fragment,
          transparent: true,
          uniforms: {
            time: {
              value: this.time,
            },
            mouse: {
              value: new THREE.Vector2(0, 0),
            },
            progress: {
              value: 0.0,
            },
            matCap: {
              value: texture,
            },
            resolution: {
              value: new THREE.Vector4(),
            },
            particleNumber: {
              value: 0,
            },
          },
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.resize();
        this.render();
      },
      undefined,
      (err) => {
        console.error("Texture failed to load:", err);
      }
    );
  }
  render() {
    this.time += 0.05;
    if (this.material) {
      this.material.uniforms.time.value = this.time;
      if (this.mouse) {
        this.material.uniforms.mouse.value = this.mouse;
      }
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}
new Sketch({
  dom: document.getElementById("webgl-bg"),
});

// =========== CONNECT PAGE SPANIZE MAST LOGIC ===========
$(function() {
  function spanize($el, delayStep) {
    var text = $el.data('original') || $el.text();
    $el.data('original', text);
    var chars = text.split("");
    var html = '';
    for (var i = 0; i < chars.length; i++) {
      html += '<span style="animation-delay:' + (delayStep * i) + 's">' +
        (chars[i] === ' ' ? ' ' : $('<div/>').text(chars[i]).html()) +
        '</span>';
    }
    $el.html(html);
    return chars.length;
  }

  function showPair(type, showPara) {
    $('.mast__title, .mast__text').removeClass('active');
    let $heading = $('.mast__title[data-type="' + type + '"]').addClass('active');
    let $text = $('.mast__text[data-type="' + type + '"]');
    if (showPara) $text.addClass('active'); else $text.removeClass('active');
    spanize($heading, 0.05);
    if (showPara) spanize($text, 0.02);
  }

  $('.mast__title.js-spanize').each(function() { spanize($(this), 0.05); });
  $('.mast__text.js-spanize').each(function() { spanize($(this), 0.02); });
  $('.mast__title, .mast__text').removeClass('active');

  showPair('reason', true);

  $('.mast__title').on('click', function() {
    let type = $(this).data('type');
    showPair(type, true);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const btnContainer = document.getElementById('back-to-glassy-container');
  if (!btnContainer) return;

  function toggleButton() {
    if (window.scrollY > 64) {
      btnContainer.classList.add('active');
    } else {
      btnContainer.classList.remove('active');
    }
  }

  btnContainer.addEventListener('click', function (e) {
    if (e.target.closest('.back-to-glassy-btn')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();
});

document.addEventListener("DOMContentLoaded", function() {
  const sections = document.querySelectorAll('#page-life .life-section');
  if (!sections.length) return;

  const observer = new window.IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.50
    }
  );

  sections.forEach(section => observer.observe(section));
});

(function() {
  const btnContainer = document.getElementById('back-to-top-life-container');
  const btn = document.getElementById('back-to-top-life');
  const pageLife = document.getElementById('page-life');
  if (!btnContainer || !btn || !pageLife) return;

  const scrollContainer = pageLife.querySelector('.content');
  if (!scrollContainer) return;

  function toggleBtn() {
    if (scrollContainer.scrollTop > 0) {
      btnContainer.classList.add('visible');
    } else {
      btnContainer.classList.remove('visible');
    }
  }

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });

  scrollContainer.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();
})();
