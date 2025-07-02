class Navigation {
    constructor(t, e, i = 54, s = 82) {
        (this.nav = document.querySelector(t)), (this.links = this.nav ? this.nav.querySelectorAll("a") : []), (this.navLight = document.querySelector(e)), (this.NAV_Y = i), (this.NAV_Z = s), this.init();
    }
    centerX(t) {
        const e = this.nav.getBoundingClientRect(),
            i = t.getBoundingClientRect();
        return i.left - e.left + i.width / 2;
    }
    moveNavLight(t, e = !1) {
        this.navLight && (this.navLight.setAttribute("x", t), this.navLight.setAttribute("y", this.NAV_Y), this.navLight.setAttribute("z", this.NAV_Z));
    }
    setActivePage(t) {
        document.querySelectorAll(".page").forEach((t) => t.classList.remove("active"));
        const e = document.getElementById(t);
        e && e.classList.add("active"),
            (document.body.className = document.body.className
                .split(" ")
                .filter((t) => !t.endsWith("-active"))
                .join(" ")),
            document.body.classList.add(`${t.replace("page-", "")}-active`);
    }
    attachEvents(t) {
        this.links.forEach((e) => {
            e.addEventListener("click", (i) => {
                i.preventDefault(),
                    this.links.forEach((t) => t.removeAttribute("data-active")),
                    e.setAttribute("data-active", "true"),
                    this.setActivePage(`page-${e.dataset.page}`),
                    this.moveNavLight(this.centerX(e)),
                    "function" == typeof t && t();
            });
        });
        const e = (t) => {
            this.moveNavLight(t.clientX - this.nav.getBoundingClientRect().left);
        };
        this.nav.addEventListener("pointerenter", () => {
            this.nav.addEventListener("pointermove", e);
        }),
            this.nav.addEventListener("pointerleave", () => {
                this.nav.removeEventListener("pointermove", e), this.moveNavLight(this.centerX(this.nav.querySelector("[data-active='true']")));
            });
    }
    resizeLogoCenter(t) {
        let e;
        window.addEventListener("resize", () => {
            clearTimeout(e),
                (e = setTimeout(() => {
                    this.moveNavLight(this.centerX(this.nav.querySelector("[data-active='true']")), !0), "function" == typeof t && t();
                }, 50));
        });
    }
    init() {
        this.nav && this.moveNavLight(this.centerX(this.nav.querySelector("[data-active='true']")), !0);
    }
}
class LogoSpotlight {
    constructor(t, e) {
        (this.logoWrap = document.querySelector(t)), (this.logoLight = document.getElementById(e)), this.centreLogo(), this.attachEvents();
    }
    centreLogo = () => {
        if (!this.logoWrap || !this.logoLight) return;
        const t = this.logoWrap.getBoundingClientRect();
        this.logoLight.setAttribute("x", t.width / 2), this.logoLight.setAttribute("y", t.height / 2);
    };
    trackLogo = (t) => {
        if (!this.logoWrap || !this.logoLight) return;
        const e = this.logoWrap.getBoundingClientRect();
        this.logoLight.setAttribute("x", t.clientX - e.left), this.logoLight.setAttribute("y", t.clientY - e.top);
    };
    attachEvents() {
        this.logoWrap && (this.logoWrap.addEventListener("pointerenter", this.trackLogo), this.logoWrap.addEventListener("pointermove", this.trackLogo, { passive: !0 }), this.logoWrap.addEventListener("pointerleave", this.centreLogo));
    }
}
class GooeyCursor {
    constructor(t, e = 16) {
        (this.cursor = document.getElementById(t)),
            (this.TAIL = e),
            (this.cx = window.innerWidth / 2),
            (this.cy = window.innerHeight / 2),
            (this.history = Array.from({ length: this.TAIL }, () => ({ x: this.cx, y: this.cy }))),
            (this.gooLoopStarted = !1),
            this.init();
    }
    init() {
        if (this.cursor) {
            if (this.cursor.children.length < this.TAIL)
                for (let t = 0; t < this.TAIL; t++) {
                    const t = document.createElement("div");
                    (t.className = "cursor-circle"), (t.style.willChange = "transform"), this.cursor.appendChild(t);
                }
            (this.dots = [...this.cursor.children]),
                window.addEventListener(
                    "pointermove",
                    (t) => {
                        (this.cx = t.clientX), (this.cy = t.clientY);
                    },
                    { passive: !0 }
                ),
                window.addEventListener(
                    "touchmove",
                    (t) => {
                        const e = t.touches[0];
                        (this.cx = e.clientX), (this.cy = e.clientY);
                    },
                    { passive: !0 }
                ),
                this.gooLoopStarted || ((this.gooLoopStarted = !0), this.gooLoop());
        }
    }
    gooLoop = () => {
        (this.history[0].x += 0.5 * (this.cx - this.history[0].x)), (this.history[0].y += 0.5 * (this.cy - this.history[0].y));
        for (let t = 1; t < this.TAIL; t++) (this.history[t].x += 0.3 * (this.history[t - 1].x - this.history[t].x)), (this.history[t].y += 0.3 * (this.history[t - 1].y - this.history[t].y));
        for (let t = 0; t < this.TAIL; t++) {
            const e = 0.7 * (1 - t / this.TAIL) + 0.1;
            (this.dots[t].style.transform = `translate3d(${this.history[t].x}px,${this.history[t].y}px,0) scale(${e})`), (this.dots[t].style.opacity = 1 - t / this.TAIL);
        }
        requestAnimationFrame(this.gooLoop);
    };
}
class HomeGallery {
    constructor({ items: t, imageUrls: e, settings: i, containerSelector: s, canvasSelector: n }) {
        // Shuffle the arrays so the gallery images display in a random order each time
        this.items = this.shuffleArray(t),
            this.imageUrls = this.shuffleArray(e),
            (this.settings = i),
            (this.container = document.querySelector(s)),
            (this.canvas = document.getElementById(n)),
            (this.visibleItems = new Set()),
            (this.isDragging = !1),
            (this.startX = 0),
            (this.startY = 0),
            (this.targetX = 0),
            (this.targetY = 0),
            (this.currentX = 0),
            (this.currentY = 0),
            (this.dragVelocityX = 0),
            (this.dragVelocityY = 0),
            (this.lastDragTime = 0),
            (this.mouseHasMoved = !1),
            (this.columns = 4),
            (this.itemCount = this.items.length),
            (this.cellWidth = this.settings.baseWidth + this.settings.itemGap),
            (this.cellHeight = Math.max(this.settings.smallHeight, this.settings.largeHeight) + this.settings.itemGap),
            this.init();
    }
    // Simple shuffle function using the Fisher-Yates algorithm
    shuffleArray(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    getItemId(t, e) {
        return `${t},${e}`;
    }
    getItemSize(t, e) {
        const i = [
            { width: this.settings.baseWidth, height: this.settings.smallHeight },
            { width: this.settings.baseWidth, height: this.settings.largeHeight }
        ];
        return i[Math.abs((t * this.columns + e) % i.length)];
    }
    getItemPosition(t, e) {
        return { x: t * this.cellWidth, y: e * this.cellHeight };
    }
    updateVisibleItems() {
        const bufferZone = this.settings.bufferZone,
            widthBuffer = window.innerWidth * (1 + bufferZone),
            heightBuffer = window.innerHeight * (1 + bufferZone),
            startCol = Math.floor((-this.currentX - widthBuffer / 2) / this.cellWidth),
            endCol = Math.ceil((-this.currentX + 1.5 * widthBuffer) / this.cellWidth),
            startRow = Math.floor((-this.currentY - heightBuffer / 2) / this.cellHeight),
            endRow = Math.ceil((-this.currentY + 1.5 * heightBuffer) / this.cellHeight),
            newVisible = new Set();
        
        // Array to store processed cell data : {col, row, candidate}
        let processedCells = [];
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const id = this.getItemId(col, row);
                newVisible.add(id);
                if (this.visibleItems.has(id)) continue;
                const size = this.getItemSize(row, col);
                const pos = this.getItemPosition(col, row);
                let baseIndex = Math.abs((row * this.columns + col) % this.itemCount);
                let candidate = baseIndex % this.imageUrls.length;
                // For each processed cell, if it's within a 4-cell Euclidean distance, adjust candidate if needed.
                processedCells.forEach(cell => {
                    const dx = col - cell.col;
                    const dy = row - cell.row;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= 4 && candidate === cell.candidate) {
                        candidate = (candidate + 1) % this.imageUrls.length;
                    }
                });
                // Save this cell's candidate assignment to our processed list.
                processedCells.push({ col, row, candidate });
                
                const itemDiv = document.createElement("div");
                itemDiv.className = "item";
                itemDiv.id = id;
                itemDiv.style.width = `${size.width}px`;
                itemDiv.style.height = `${size.height}px`;
                itemDiv.style.left = `${pos.x}px`;
                itemDiv.style.top = `${pos.y}px`;
                itemDiv.style.position = "absolute";
                itemDiv.style.willChange = "transform";
                itemDiv.dataset.col = col;
                itemDiv.dataset.row = row;
                
                const containerDiv = document.createElement("div");
                containerDiv.className = "item-image-container";
                const imgElem = document.createElement("img");
                imgElem.src = this.imageUrls[candidate];
                imgElem.alt = `Image ${candidate + 1}`;
                imgElem.loading = "lazy";
                containerDiv.appendChild(imgElem);
                itemDiv.appendChild(containerDiv);
                
                const captionDiv = document.createElement("div");
                captionDiv.className = "item-caption";
                const nameDiv = document.createElement("div");
                nameDiv.className = "item-name";
                nameDiv.textContent = this.items[candidate];
                captionDiv.appendChild(nameDiv);
                const numberDiv = document.createElement("div");
                numberDiv.className = "item-number";
                numberDiv.textContent = `#${(candidate + 1).toString().padStart(5, "0")}`;
                captionDiv.appendChild(numberDiv);
                itemDiv.appendChild(captionDiv);
                this.canvas.appendChild(itemDiv);
                this.visibleItems.add(id);
            }
        }
        this.visibleItems.forEach((id) => {
            if (!newVisible.has(id)) {
                const elem = document.getElementById(id);
                if (elem && elem.parentNode === this.canvas) this.canvas.removeChild(elem);
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
        if (this.container) {
            this.container.addEventListener("mousedown", (event) => {
                this.isDragging = true;
                this.mouseHasMoved = false;
                this.startX = event.clientX;
                this.startY = event.clientY;
                this.container.style.cursor = "grabbing";
            });
            window.addEventListener("mousemove", (event) => {
                if (!this.isDragging) return;
                const dx = event.clientX - this.startX;
                const dy = event.clientY - this.startY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.mouseHasMoved = true;
                const now = Date.now();
                const deltaTime = Math.max(10, now - this.lastDragTime);
                this.lastDragTime = now;
                this.dragVelocityX = dx / deltaTime;
                this.dragVelocityY = dy / deltaTime;
                this.targetX += dx;
                this.targetY += dy;
                this.startX = event.clientX;
                this.startY = event.clientY;
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
            this.container.addEventListener("touchstart", (event) => {
                this.isDragging = true;
                this.mouseHasMoved = false;
                this.startX = event.touches[0].clientX;
                this.startY = event.touches[0].clientY;
            });
            window.addEventListener("touchmove", (event) => {
                if (!this.isDragging) return;
                const dx = event.touches[0].clientX - this.startX;
                const dy = event.touches[0].clientY - this.startY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.mouseHasMoved = true;
                this.targetX += dx;
                this.targetY += dy;
                this.startX = event.touches[0].clientX;
                this.startY = event.touches[0].clientY;
            }, { passive: false });
            window.addEventListener("touchend", () => {
                this.isDragging = false;
            });
        }
    }
    init() {
        if (this.container && this.canvas) {
            this.updateVisibleItems();
            this.attachDragEvents();
            this.animate();
        }
    }
}
function initBlur() {
    const t = document.documentElement;
    document.querySelectorAll(".blur").forEach((e) => {
        const i = parseInt(getComputedStyle(t).getPropertyValue("--layers")) || 5;
        e.innerHTML = Array.from({ length: i }, (t, e) => `<div style="--i:${e}"></div>`).join("");
    });
}
const projects = [
    { id: 1, title: "Phenom", year: "2024", image: "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg" },
    { id: 2, title: "Independent", year: "2023", image: "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg" },
    { id: 3, title: "Publicis Sapient", year: "2022", image: "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg" },
    { id: 4, title: "Elva Design Group", year: "2021", image: "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg" },
    { id: 5, title: "Huge", year: "2021", image: "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg" },
    { id: 6, title: "LiveArea", year: "2020-21", image: "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg" },
    { id: 7, title: "PHI to NYC", year: "2019-20", image: "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg" },
    { id: 8, title: "Workarea", year: "2018-19", image: "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg" },
    { id: 9, title: "O3 World", year: "2017-18", image: "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg" },
    { id: 10, title: "One Sixty Over Ninety", year: "2014-16", image: "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg" },
];
function renderProjects(t) {
    if (t) {
        t.innerHTML = "";
        projects.forEach((e) => {
            const i = document.createElement("div");
            i.classList.add("project-item");
            i.dataset.id = e.id;
            i.dataset.image = e.image;
            i.innerHTML = `\n      <div class="project-title">${e.title}</div>\n      <div class="project-year">${e.year}</div>\n    `;
            t.appendChild(i);
        });
    }
}
function initialAnimation() {
    document.querySelectorAll(".project-item").forEach((t, e) => {
        t.style.opacity = "0";
        t.style.transform = "translateY(20px)";
        setTimeout(() => {
            t.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            t.style.opacity = "1";
            t.style.transform = "translateY(0)";
        }, 60 * e);
    });
}
function setupHoverEvents(t, e) {
    projects.forEach((t) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = t.image;
    });
    if (t) {
        e.querySelectorAll(".project-item").forEach((item) => {
            item.addEventListener("mouseenter", () => {
                t.style.transition = "none";
                t.style.transform = "scale(1.2)";
                t.src = item.dataset.image;
                t.style.opacity = "1";
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        t.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                        t.style.transform = "scale(1.0)";
                    });
                });
            });
        });
        e.addEventListener("mouseleave", () => {
            t.style.opacity = "0";
        });
    }
}
function preloadImages() {
    projects.forEach((t) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = t.image;
    });
}
function onNavigateToHome() {
    document.body.classList.add("homepage");
    document.querySelectorAll(".blur,.vignette-bottom,.page-vignette-container,.page-vignette,.page-vignette-strong,.page-vignette-extreme").forEach((t) => {
        t.style.display = "none";
        t.offsetHeight;
        t.style.display = "";
    });
}
function onNavigateAwayFromHome() {
    document.body.classList.remove("homepage");
}
document.addEventListener("DOMContentLoaded", () => {
    const nav = new Navigation("nav", "#spotlight fePointLight");
    const logoSpot = new LogoSpotlight(".logo-wrapper", "logoLight");
    function initLife() {
        const lifePage = document.getElementById("page-life");
        if (lifePage && lifePage.classList.contains("active")) initLifeScrollProgress();
    }
    nav.attachEvents(initLife);
    nav.resizeLogoCenter(logoSpot.centreLogo);
    nav.setActivePage("page-home");
    const homeLink = document.querySelector('nav a[data-page="home"]');
    if (homeLink) {
        document.querySelectorAll("nav a").forEach((a) => a.removeAttribute("data-active"));
        homeLink.setAttribute("data-active", "true");
        nav.moveNavLight(nav.centerX(homeLink));
    }
    const logoWrapper = document.querySelector(".logo-wrapper");
    if (logoWrapper) {
        logoWrapper.addEventListener("click", (event) => {
            event.preventDefault();
            const homeLink = document.querySelector('nav a[data-page="home"]');
            if (homeLink) {
                document.querySelectorAll("nav a").forEach((a) => a.removeAttribute("data-active"));
                homeLink.setAttribute("data-active", "true");
            }
            nav.setActivePage("page-home");
            nav.moveNavLight(nav.centerX(homeLink));
            initLife();
        });
        logoWrapper.style.cursor = "pointer";
    }
    initLife();
    new GooeyCursor("cursor", 16);
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
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
            "Gallery Image 14",
            "Gallery Image 15",
            "Gallery Image 16",
            "Gallery Image 17",
            "Gallery Image 18"
        ],
        imageUrls: [
            "https://i.ibb.co/Q82WBds/2299765761344742582-5144774570.jpg",
            "https://i.ibb.co/nDNfQPD/2302763344874937579-5144774570.jpg",
            "https://i.ibb.co/mSR1GDc/2309287483437628607-5144774570.jpg",
            "https://i.ibb.co/SBBFq8g/2321694150817073052-5144774570.jpg",
            "https://i.ibb.co/BjZQ8KG/2322060064540385797-5144774570.jpg",
            "https://i.ibb.co/Jxbs7jg/2344081181031306274-5144774570.jpg",
            "https://i.ibb.co/zsxNHK7/2448148266170177557-5144774570.jpg",
            "https://i.ibb.co/XbnBHmg/2886095297461903371-5144774570.jpg",
            "https://i.ibb.co/3yjTzkp/2448137532291865865-5144774570.jpg",
            "https://i.ibb.co/RcN0rLM/2302765161788654866-5144774570.jpg",
            "https://i.ibb.co/dr55NKK/2288089293770285108-5144774570.jpg",
            "https://i.ibb.co/WP03r4g/2285335292767225477-5144774570.jpg",
            "https://i.ibb.co/3rh0JJT/2280253723450838291-5144774570.jpg",
            "https://i.ibb.co/jJTKpGZ/2282470733853463286-5144774570.jpg",
            "https://i.ibb.co/L5LMqCn/2300677912070660005-5144774570.jpg",
            "https://i.ibb.co/vv5PM3t/2302790243734907282-5144774570.jpg",
            "https://i.ibb.co/9vFZk6n/2327892796382234206-5144774570.jpg",
            "https://i.ibb.co/nQLGwrN/2270020016525965844-5144774570.jpg",
            "https://i.ibb.co/jJTKpGZ/2282470733853463286-5144774570.jpg"
        ],
        settings: isMobile
            ? {
                  baseWidth: 280,
                  smallHeight: 280,
                  largeHeight: 280,
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
              }
            : {
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
    const projContainer = document.querySelector("#page-work .projects-container");
    const bgImage = document.getElementById("background-image");
    renderProjects(projContainer);
    initialAnimation();
    preloadImages();
    setupHoverEvents(bgImage, projContainer);
});
const button = document.querySelector(".spotlight-button");
const ellipse = button ? button.querySelector(".spotlight-ellipse") : null;
if (button && ellipse) {
    button.addEventListener("pointermove", (t) => {
        const e = button.getBoundingClientRect();
        const i = ((t.clientX - e.left) / e.width) * 100;
        const s = ((t.clientY - e.top) / e.height) * 70 + 20;
        ellipse.setAttribute("cx", `${i}%`);
        ellipse.setAttribute("cy", `${s}`);
    });
    button.addEventListener("pointerleave", () => {
        ellipse.setAttribute("cx", "50%");
        ellipse.setAttribute("cy", "54");
    });
}
(function () {
    const t = document.getElementById("back-to-top-life");
    const e = document.getElementById("page-life");
    if (t && e) {
        window.addEventListener("scroll", function () {
            const i = window.scrollY || document.documentElement.scrollTop;
            e.getBoundingClientRect();
            i > e.offsetTop + 200 ? t.classList.add("visible") : t.classList.remove("visible");
        });
        t.addEventListener("click", function (t) {
            t.preventDefault();
            window.scrollTo({ top: e.offsetTop, behavior: "smooth" });
        });
    }
})();
(function (t = 375) {
    function e() {
        document.documentElement.style.minWidth = t + "px";
        document.body.style.minWidth = t + "px";
        document.documentElement.style.overflowX = "auto";
        document.body.style.overflowX = "auto";
        if (window.innerWidth < t) {
            const e = window.innerWidth / t;
            document.body.style.transformOrigin = "top left";
            document.body.style.transform = "scale(" + e + ")";
            document.body.style.width = t + "px";
            document.documentElement.style.overflowX = "hidden";
        } else {
            document.body.style.transform = "";
            document.body.style.width = "";
            document.documentElement.style.overflowX = "auto";
        }
    }
    window.addEventListener("resize", e);
    window.addEventListener("DOMContentLoaded", e);
    e();
})(375);
(function () {
    const t = document.getElementById("back-to-glassy-container");
    const e = document.getElementById("back-to-glassy");
    if (!t || !e) return;
    let i = null;
    const s = document.getElementById("page-life");
    if (s) {
        const t = s.querySelector(".content");
        if (t && t.scrollHeight > t.clientHeight) i = t;
    }
    function n() {
        (i === window ? window.scrollY || document.documentElement.scrollTop : i.scrollTop) > 0 ? t.classList.add("visible") : t.classList.remove("visible");
    }
    if (!i) i = window;
    if (i === window) window.addEventListener("scroll", n);
    else i.addEventListener("scroll", n);
    e.addEventListener("click", function (t) {
        t.preventDefault();
        if (i === window) window.scrollTo({ top: 0, behavior: "smooth" });
        else i.scrollTo({ top: 0, behavior: "smooth" });
    });
    n();
})();
(function () {
    const t = document.getElementById("back-to-top-life");
    const e = document.getElementById("page-life");
    if (t && e) {
        window.addEventListener("scroll", function () {
            (window.scrollY || document.documentElement.scrollTop) > 200 ? t.classList.add("visible") : t.classList.remove("visible");
        });
        t.addEventListener("click", function (t) {
            t.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();
const vertex =
    "\nvarying vec3 pos;\nuniform float time;\n\nvarying float v_noise;\nvarying vec2 vUv;\n\nvoid main(){\n    pos=position;\n    vUv=uv;\n    vec3 newPosition=position;\n\n    gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);\n}\n";
const fragment =
    "\nvarying vec3 pos;\nvarying vec2 vUv;\nvarying float v_noise;\n\nuniform float time;\nuniform sampler2D matCap;\nuniform vec4 resolution;\nuniform vec2 mouse;\nuniform float progress;\nuniform float particleNumber;\n\n#define PI 3.14159265359\n\nmat4 rotationMatrix(vec3 axis,float angle){\n    axis=normalize(axis);\n    float s=sin(angle);\n    float c=cos(angle);\n    float oc=1.-c;\n\n    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,\n        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,\n        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,\n    0.,0.,0.,1.);\n}\n\nvec3 rotate(vec3 v,vec3 axis,float angle){\n    mat4 m=rotationMatrix(axis,angle);\n    return(m*vec4(v,1.)).xyz;\n}\n\nvec2 getmatcap(vec3 eye,vec3 normal){\n    vec3 reflected=reflect(eye,normal);\n    float m=2.8284271247461903*sqrt(reflected.z+1.);\n    return reflected.xy/m+.5;\n}\n\nfloat sdSphere(vec3 p,float s){\n    return length(p)-s;\n}\n\nfloat sdBox(vec3 p,vec3 b){\n    vec3 q=abs(p)-b;\n    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);\n}\n\nfloat smin(float a,float b,float k){\n    float h=clamp(.5+.5*(b-a)/k,0.,1.);\n    return mix(b,a,h)-k*h*(1.-h);\n}\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453);\n}\n\nfloat sdf(vec3 p){\n    vec3 p1=rotate(p,vec3(.1),time/5.);\n    float box=smin(sdBox(p1,vec3(.3)),sdSphere(p,.4),.3);\n    float final=mix(box,sdSphere(p,.2+progress/4.),progress);\n\n    for(int i=0;i<int(particleNumber);i++){\n        float randOffset=rand(vec2(i,0.));\n        float progr=fract(time/4.+randOffset*5.);\n        vec3 rPos=vec3(sin(randOffset*2.*PI)*2.,cos(randOffset*2.*PI)*2.,0.);\n        float gotoCenter=sdSphere(p-rPos*progr,.12);\n        final=smin(final,gotoCenter,.3);\n    }\n\n    float mouseSphere=sdSphere(p-vec3(mouse*resolution.zw*2.,0.),.25);\n    return smin(final,mouseSphere,.4);\n}\n\nvec3 calcNormal(in vec3 p){\n    const float eps=.0001;\n    const vec2 h=vec2(eps,0);\n    return normalize(\n        vec3(\n            sdf(p+h.xyy)-sdf(p-h.xyy),\n            sdf(p+h.yxy)-sdf(p-h.yxy),\n            sdf(p+h.yyx)-sdf(p-h.yyx)\n        )\n    );\n}\n\nvoid main(){\n    float dist=length(vUv-vec2(.5));\n    vec3 bg=vec3(mix(vec3(.1),vec3(0.),dist));\n    vec2 newUv=(vUv-vec2(.5))*resolution.zw+vec2(.5);\n    vec3 cameraPos=vec3(0.,0.,2.);\n    vec3 ray=normalize(vec3((vUv-vec2(.5))*resolution.zw,-1.));\n\n    vec3 rayPos=cameraPos;\n    float t=0.;\n    float tMax=5.;\n    for(int i=0;i<256;i++){\n        vec3 pos=cameraPos+t*ray;\n        float h=sdf(pos);\n        if(h<.001||t>tMax){\n            break;\n        }\n        t+=h;\n    }\n\n    vec4 color=vec4(bg,1.);\n    if(t<tMax){\n        vec3 pos=cameraPos+t*ray;\n        vec3 normal=calcNormal(pos);\n        float diff=dot(vec3(1.),normal);\n        vec2 matCapUv=getmatcap(ray,normal);\n        color=texture2D(matCap,matCapUv);\n        float fresnel=pow(1.+dot(ray,normal),3.);\n        color=mix(color,vec4(bg,.5),fresnel);\n    }\n    gl_FragColor=vec4(color);\n}\n";
const matCap = "https://raw.githubusercontent.com/nidorx/matcaps/master/1024/293534_B2BFC5_738289_8A9AA7.png";
class Sketch {
    constructor(t) {
        (this.time = 0), (this.container = t.dom), (this.scene = new THREE.Scene()), (this.width = this.container.offsetWidth), (this.height = this.container.offsetHeight);
        (this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1e3, 1e3)),
            (this.camera.position.z = 1),
            (this.renderer = new THREE.WebGLRenderer({ antialias: !0, alpha: !0 })),
            this.container.appendChild(this.renderer.domElement),
            this.resizeSetup(),
            this.mouseEvents(),
            this.addObjects();
    }
    resizeSetup() {
        window.addEventListener("resize", this.resize.bind(this));
    }
    resize() {
        if (!this.material) return;
        let t, e;
        (this.width = this.container.offsetWidth),
            (this.height = this.container.offsetHeight),
            this.renderer.setSize(this.width, this.height),
            (this.camera.aspect = this.width / this.height),
            this.camera.updateProjectionMatrix(),
            (this.imageAspect = 1),
            this.width / this.height > this.imageAspect ? ((t = (this.width / this.height) * this.imageAspect), (e = 1)) : ((t = 1), (e = (this.width / this.height) * this.imageAspect)),
            (this.material.uniforms.resolution.value.x = this.width),
            (this.material.uniforms.resolution.value.y = this.height),
            (this.material.uniforms.resolution.value.z = t),
            (this.material.uniforms.resolution.value.w = e);
    }
    mouseEvents() {
        (this.mouse = new THREE.Vector2()),
            document.addEventListener("mousemove", (t) => {
                (this.mouse.x = t.pageX / this.width - 0.5), (this.mouse.y = -t.pageY / this.height + 0.5);
            });
    }
    addObjects() {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load(
            matCap,
            (texture) => {
                (this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1)),
                    (this.material = new THREE.ShaderMaterial({
                        extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
                        side: THREE.DoubleSide,
                        vertexShader: vertex,
                        fragmentShader: fragment,
                        transparent: !0,
                        uniforms: { time: { value: this.time }, mouse: { value: new THREE.Vector2(0, 0) }, progress: { value: 0 }, matCap: { value: texture }, resolution: { value: new THREE.Vector4() }, particleNumber: { value: 0 } },
                    })),
                    (this.mesh = new THREE.Mesh(this.geometry, this.material)),
                    this.scene.add(this.mesh),
                    this.resize(),
                    this.render();
            },
            undefined,
            (err) => {
                console.error("Texture failed to load:", err);
            }
        );
    }
    render() {
        (this.time += 0.05),
            this.material && ((this.material.uniforms.time.value = this.time), this.mouse && (this.material.uniforms.mouse.value = this.mouse)),
            this.renderer.render(this.scene, this.camera),
            requestAnimationFrame(this.render.bind(this));
    }
}
new Sketch({ dom: document.getElementById("webgl-bg") });
$(function () {
    function t(t, e) {
        var i = t.data("original") || t.text();
        t.data("original", i);
        for (var s = i.split(""), n = "", o = 0; o < s.length; o++)
            n += '<span style="animation-delay:' + e * o + 's">' + (" " === s[o] ? " " : $("<div/>").text(s[o]).html()) + "</span>";
        t.html(n);
        return s.length;
    }
    function e(e, i) {
        $(".mast__title, .mast__text").removeClass("active");
        let s = $('.mast__title[data-type="' + e + '"]').addClass("active"),
            n = $('.mast__text[data-type="' + e + '"]');
        i ? n.addClass("active") : n.removeClass("active"), t(s, 0.05), i && t(n, 0.02);
    }
    $(".mast__title.js-spanize").each(function () {
        t($(this), 0.05);
    });
    $(".mast__text.js-spanize").each(function () {
        t($(this), 0.02);
    });
    $(".mast__title, .mast__text").removeClass("active");
    e("reason", !0);
    $(".mast__title").on("click", function () {
        e($(this).data("type"), !0);
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const t = document.getElementById("back-to-glassy-container");
    function e() {
        window.scrollY > 64 ? t.classList.add("active") : t.classList.remove("active");
    }
    if (t) {
        t.addEventListener("click", function (t) {
            if (t.target.closest(".back-to-glassy-btn")) window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", e, { passive: !0 });
        e();
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const t = document.querySelectorAll("#page-life .life-section");
    if (!t.length) return;
    const e = new window.IntersectionObserver(
        (t, e) => {
            t.forEach((t) => {
                if (t.isIntersecting) {
                    t.target.classList.add("visible");
                    e.unobserve(t.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    t.forEach((t) => e.observe(t));
});
(function () {
    const t = document.getElementById("back-to-top-life-container");
    const e = document.getElementById("back-to-top-life");
    const i = document.getElementById("page-life");
    if (!t || !e || !i) return;
    const s = i.querySelector(".content");
    function n() {
        s.scrollTop > 0 ? t.classList.add("visible") : t.classList.remove("visible");
    }
    if (s) {
        e.addEventListener("click", function (t) {
            t.preventDefault();
            s.scrollTo({ top: 0, behavior: "smooth" });
        });
        s.addEventListener("scroll", n, { passive: !0 });
        n();
    }
})();
(function () {
    const t = document.getElementById("back-to-top-life");
    const e = document.getElementById("page-life");
    if (t && e) {
        window.addEventListener("scroll", function () {
            (window.scrollY || document.documentElement.scrollTop) > 200 ? t.classList.add("visible") : t.classList.remove("visible");
        });
        t.addEventListener("click", function (t) {
            t.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();