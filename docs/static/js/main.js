// Videos: add H.264 .mp4 files under static/videos/ and list them here, e.g.
//   { src: "static/videos/waymo_novel_view.mp4", caption: "Waymo, novel view" },
const VIDEOS = [];

// Qualitative comparison: images live in static/images/qual/<dir>/<METHOD>_<scene>.<ext>
const METHODS = [
  { key: "GT", label: "Ground truth" },
  { key: "STORM", label: "STORM" },
  { key: "DGGT", label: "DGGT" },
  { key: "ours", label: "X-Splatter", ours: true },
];
const depth = { key: "depth", label: "Depth", ext: "png" };
const DATASETS = [
  { dir: "waymo", label: "Waymo",
    scenes: [{ key: "dynamic", label: "Dynamic" }, { key: "crowded", label: "Crowded" }, { key: "static", label: "Static" }, depth] },
  { dir: "nuscenes", label: "nuScenes (zero-shot)",
    scenes: [{ key: "easier", label: "Easier" }, { key: "typical", label: "Typical" }, { key: "harder", label: "Harder" }, depth] },
  { dir: "av2", label: "Argoverse 2 (zero-shot)",
    scenes: [{ key: "dynamic", label: "Dynamic" }, { key: "crowded", label: "Crowded" }, { key: "near-static", label: "Near-static" }, depth] },
];

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c);
  return n;
}

function tabButton(label, selected, onClick) {
  const b = el("button", { type: "button", role: "tab", "aria-selected": String(selected), text: label });
  b.addEventListener("click", onClick);
  return b;
}

function initQual(root) {
  const dsBar = root.querySelector("[data-datasets]");
  const scBar = root.querySelector("[data-scenes]");
  const grid = root.querySelector("[data-grid]");
  let ds = 0, sc = 0;

  function render() {
    const d = DATASETS[ds], s = d.scenes[sc];
    dsBar.replaceChildren(...DATASETS.map((x, i) => tabButton(x.label, i === ds, () => { ds = i; sc = 0; render(); })));
    scBar.replaceChildren(...d.scenes.map((x, i) => tabButton(x.label, i === sc, () => { sc = i; render(); })));
    grid.replaceChildren(...METHODS.map((m) => {
      const src = `static/images/qual/${d.dir}/${m.key}_${s.key}.${s.ext || "jpg"}`;
      const alt = `${m.label}, ${d.label}, ${s.label.toLowerCase()}`;
      return el("figure", { class: m.ours ? "ours" : "" }, [
        el("img", { src, alt, width: "360", height: "224", loading: "lazy" }),
        el("figcaption", { text: m.label }),
      ]);
    }));
  }
  render();
}

function initVideos() {
  const grid = document.getElementById("video-grid");
  const empty = document.getElementById("video-empty");
  if (!VIDEOS.length) { grid.hidden = true; return; }
  empty.hidden = true;
  grid.replaceChildren(...VIDEOS.map((v) => {
    const video = el("video", { src: v.src, controls: "", muted: "", loop: "", playsinline: "", preload: "metadata" });
    video.muted = true;
    return el("figure", {}, [video, el("figcaption", { text: v.caption || "" })]);
  }));
  // Autoplay only while on screen, to keep bandwidth and CPU down.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
  }, { threshold: 0.4 });
  grid.querySelectorAll("video").forEach((v) => io.observe(v));
}

function initCopy() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.querySelector(btn.dataset.copy).innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Select and copy";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  });
}

function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const sync = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    btn.setAttribute("aria-pressed", String(dark));
  };
  sync();
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("xs-theme", next); } catch (e) {}
    sync();
  });
}

document.querySelectorAll("[data-qual]").forEach(initQual);
initVideos();
initCopy();
initTheme();
