const STORAGE_KEY = "choreograph.studio.v1";
const COLORS = ["#ff6b45", "#66e0ff", "#d5ff5c", "#f2f0e8", "#b48cff"];
const EASINGS = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  spring: [0.34, 1.56, 0.64, 1],
  smooth: [0.65, 0, 0.35, 1]
};
const TRACKS = [
  { key: "x", label: "X", color: "#ff6b45" },
  { key: "y", label: "Y", color: "#ffc65c" },
  { key: "scale", label: "Scale", color: "#66e0ff" },
  { key: "rotate", label: "Rotate", color: "#b48cff" },
  { key: "opacity", label: "Opacity", color: "#d5ff5c" }
];
const PRESETS = {
  "Fade up": [
    { percent: 0, x: 0, y: 28, scale: 0.98, rotate: 0, opacity: 0, easing: "ease-out" },
    { percent: 62, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-in-out" },
    { percent: 100, x: 0, y: -4, scale: 1, rotate: 0, opacity: 1, easing: "ease-out" }
  ],
  "Pop in": [
    { percent: 0, x: 0, y: 0, scale: 0.55, rotate: 0, opacity: 0, easing: "spring" },
    { percent: 58, x: 0, y: 0, scale: 1.12, rotate: 0, opacity: 1, easing: "ease-in-out" },
    { percent: 78, x: 0, y: 0, scale: 0.96, rotate: 0, opacity: 1, easing: "ease-out" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-out" }
  ],
  "Slide in": [
    { percent: 0, x: -190, y: 0, scale: 1, rotate: 0, opacity: 0, easing: "ease-out" },
    { percent: 68, x: 9, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-in-out" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-out" }
  ],
  "Rotate in": [
    { percent: 0, x: 0, y: 0, scale: 0.6, rotate: -110, opacity: 0, easing: "ease-out" },
    { percent: 72, x: 0, y: 0, scale: 1.02, rotate: 8, opacity: 1, easing: "ease-in-out" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-out" }
  ],
  Breathe: [
    { percent: 0, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "smooth" },
    { percent: 45, x: 0, y: -6, scale: 1.1, rotate: 0, opacity: 1, easing: "smooth" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "smooth" }
  ],
  Orbit: [
    { percent: 0, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "smooth" },
    { percent: 25, x: 112, y: -66, scale: 0.88, rotate: 45, opacity: 1, easing: "smooth" },
    { percent: 50, x: 0, y: -132, scale: 0.76, rotate: 90, opacity: 1, easing: "smooth" },
    { percent: 75, x: -112, y: -66, scale: 0.88, rotate: 135, opacity: 1, easing: "smooth" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 180, opacity: 1, easing: "smooth" }
  ],
  Drop: [
    { percent: 0, x: 0, y: -148, scale: 0.9, rotate: -6, opacity: 0, easing: "ease-in" },
    { percent: 52, x: 0, y: 12, scale: 1.04, rotate: 3, opacity: 1, easing: "spring" },
    { percent: 74, x: 0, y: -4, scale: 0.99, rotate: -1, opacity: 1, easing: "ease-in-out" },
    { percent: 100, x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, easing: "ease-out" }
  ]
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const fmt = (value, decimals = 2) => String(Number(Number(value).toFixed(decimals)));
const roundToHalf = (value) => Math.round(value * 2) / 2;
const easeFns = {};

Object.entries(EASINGS).forEach(([name, points]) => {
  easeFns[name] = cubicBezier(...points);
});

function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let guess = t;
    for (let i = 0; i < 8; i += 1) {
      const x = sampleX(guess) - t;
      const slope = slopeX(guess);
      if (Math.abs(x) < 1e-5) break;
      if (Math.abs(slope) < 1e-6) break;
      guess -= x / slope;
    }
    if (guess < 0 || guess > 1 || !Number.isFinite(guess)) {
      let low = 0;
      let high = 1;
      guess = t;
      for (let i = 0; i < 14; i += 1) {
        const x = sampleX(guess);
        if (Math.abs(x - t) < 1e-5) break;
        if (x < t) low = guess;
        else high = guess;
        guess = (low + high) / 2;
      }
    }
    return sampleY(guess);
  };
}

let nextId = 1;
let playing = false;
let rafId = 0;
let playStart = 0;
let startPercent = 0;
let dragState = null;
let currentCSS = "";
let toastTimer = 0;
let playhead = null;

function makeKeyframe(percent, x, y, scale, rotate, opacity, easing) {
  return {
    id: nextId++,
    percent: clamp(Number(percent) || 0, 0, 100),
    x: Number(x) || 0,
    y: Number(y) || 0,
    scale: Number(scale) || 1,
    rotate: Number(rotate) || 0,
    opacity: Number.isFinite(Number(opacity)) ? clamp(Number(opacity), 0, 1) : 1,
    easing: EASINGS[easing] ? easing : "ease"
  };
}

const initial = PRESETS["Fade up"].map((pose) =>
  makeKeyframe(pose.percent, pose.x, pose.y, pose.scale, pose.rotate, pose.opacity, pose.easing)
);

let state = {
  duration: 1.8,
  loop: true,
  shape: "square",
  size: 96,
  colorIndex: 0,
  keyframes: initial,
  selectedId: initial[1].id,
  percent: initial[1].percent
};

function sortedKeys() {
  return [...state.keyframes].sort((a, b) => a.percent - b.percent);
}

function selectedKey() {
  return state.keyframes.find((keyframe) => keyframe.id === state.selectedId) || null;
}

function poseAt(percent) {
  const keys = sortedKeys();
  if (!keys.length) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
  if (percent <= keys[0].percent) return { ...keys[0] };
  if (percent >= keys[keys.length - 1].percent) return { ...keys[keys.length - 1] };
  let from = keys[0];
  let to = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (percent >= keys[i].percent && percent <= keys[i + 1].percent) {
      from = keys[i];
      to = keys[i + 1];
      break;
    }
  }
  const span = to.percent - from.percent;
  const raw = span <= 0 ? 1 : (percent - from.percent) / span;
  const eased = (easeFns[from.easing] || easeFns.ease)(raw);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    scale: from.scale + (to.scale - from.scale) * eased,
    rotate: from.rotate + (to.rotate - from.rotate) * eased,
    opacity: from.opacity + (to.opacity - from.opacity) * eased
  };
}

function renderPreview(percent) {
  const safe = clamp(percent, 0, 100);
  state.percent = safe;
  const pose = poseAt(safe);
  const object = $("motion-object");
  const transform = `translate(-50%, -50%) translate(${fmt(pose.x)}px, ${fmt(pose.y)}px) scale(${fmt(pose.scale, 3)}) rotate(${fmt(pose.rotate, 2)}deg)`;
  object.style.transform = transform;
  object.style.opacity = String(clamp(pose.opacity, 0, 1));
  $("stage-percent").textContent = `${Math.round(safe)}%`;
  $("stage-time").textContent = `${(state.duration * safe / 100).toFixed(2)}s`;
  $("percent-output").textContent = `${Math.round(safe)}%`;
  $("scrubber").value = String(safe);
  $("time-output").textContent = `${(state.duration * safe / 100).toFixed(2)}s`;
  $("frame-output").textContent = `frame ${Math.round(state.duration * 60 * safe / 100)}`;
  $("motion-meta").textContent = transform.replace("translate(-50%, -50%) ", "");
  if (playhead) playhead.style.left = `${safe}%`;
}

function buildRuler() {
  const ruler = $("ruler");
  ruler.innerHTML = "";
  for (let i = 0; i <= 10; i += 1) {
    const span = document.createElement("span");
    span.textContent = `${i * 10}%`;
    span.style.left = `${i * 10}%`;
    ruler.append(span);
  }
}

function buildLane(track, keys) {
  const lane = document.createElement("div");
  lane.className = "track-lane";
  lane.dataset.track = track.key;
  lane.style.setProperty("--c", track.color);
  keys.forEach((keyframe) => {
    const diamond = document.createElement("button");
    diamond.type = "button";
    diamond.className = "diamond";
    diamond.dataset.key = String(keyframe.id);
    diamond.dataset.track = track.key;
    diamond.style.left = `${keyframe.percent}%`;
    diamond.style.setProperty("--c", track.color);
    diamond.classList.toggle("selected", keyframe.id === state.selectedId);
    diamond.setAttribute("aria-label", `${track.label} keyframe at ${fmt(keyframe.percent, 1)} percent`);
    diamond.title = `${fmt(keyframe.percent, 1)}% · ${fmt(keyframe[track.key], 2)}`;
    diamond.addEventListener("pointerdown", (event) => beginDrag(event, keyframe.id));
    diamond.addEventListener("click", (event) => {
      event.stopPropagation();
      selectKeyframe(keyframe.id, true);
    });
    lane.append(diamond);
  });
  lane.addEventListener("click", (event) => {
    if (event.target.closest(".diamond")) return;
    const bounds = lane.getBoundingClientRect();
    const percent = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100);
    pause();
    addKeyframeAt(roundToHalf(percent));
  });
  return lane;
}

function renderTimeline() {
  buildRuler();
  const keys = sortedKeys();
  const labelWrap = $("track-labels");
  const laneWrap = $("track-lanes");
  labelWrap.innerHTML = "";
  laneWrap.innerHTML = "";

  TRACKS.forEach((track) => {
    const label = document.createElement("div");
    label.className = "track-label";
    label.style.setProperty("--c", track.color);
    label.innerHTML = `<i></i>${track.label}`;
    labelWrap.append(label);
    laneWrap.append(buildLane(track, keys));
  });

  playhead = document.createElement("div");
  playhead.className = "playhead";
  playhead.id = "playhead";
  playhead.innerHTML = "<span></span>";
  laneWrap.append(playhead);
  playhead.style.left = `${state.percent}%`;
  playhead.style.setProperty("--c", "#66e0ff");

  $("keyframe-id").textContent = selectedKey() ? String(keys.findIndex((key) => key.id === state.selectedId) + 1).padStart(2, "0") : "--";
}

function bindRange(id, property, outputFormatter) {
  const input = $(id);
  if (!input) return;
  input.addEventListener("input", () => {
    const keyframe = selectedKey();
    if (!keyframe) return;
    keyframe[property] = Number(input.value);
    const output = $(`${id}-out`);
    if (output) output.textContent = outputFormatter(keyframe[property]);
    renderPreview(state.percent);
    renderCode();
    saveState();
  });
}

function renderInspector() {
  const body = $("keyframe-body");
  const keyframe = selectedKey();
  const keys = sortedKeys();
  if (!keyframe) {
    body.innerHTML = `<p class="key-empty">Select a diamond on the timeline to edit its pose.</p>`;
    $("keyframe-id").textContent = "--";
    updateCurve(null);
    return;
  }

  const index = keys.findIndex((key) => key.id === keyframe.id);
  $("keyframe-id").textContent = String(index + 1).padStart(2, "0");
  const easingOptions = Object.keys(EASINGS)
    .map((name) => `<option value="${name}"${name === keyframe.easing ? " selected" : ""}>${name.replace("-", " ")}</option>`)
    .join("");

  body.innerHTML = `
    <p class="key-title">Pose ${String(index + 1).padStart(2, "0")}</p>
    <p class="key-sub">${(state.duration * keyframe.percent / 100).toFixed(2)}s · ${keyframe.easing.replace("-", " ")}</p>
    <label class="field">Position <output id="in-percent-out">${fmt(keyframe.percent, 1)}%</output>
      <input type="range" id="in-percent" min="0" max="100" step="0.5" value="${keyframe.percent}">
    </label>
    <div class="field-row">
      <label class="field">X <output id="in-x-out">${fmt(keyframe.x)}</output>
        <input type="range" id="in-x" min="-240" max="240" step="1" value="${keyframe.x}">
      </label>
      <label class="field">Y <output id="in-y-out">${fmt(keyframe.y)}</output>
        <input type="range" id="in-y" min="-200" max="200" step="1" value="${keyframe.y}">
      </label>
    </div>
    <div class="field-row">
      <label class="field">Scale <output id="in-scale-out">${fmt(keyframe.scale, 3)}</output>
        <input type="range" id="in-scale" min="0.2" max="2" step="0.01" value="${keyframe.scale}">
      </label>
      <label class="field">Rotate <output id="in-rotate-out">${fmt(keyframe.rotate)}°</output>
        <input type="range" id="in-rotate" min="-360" max="360" step="1" value="${keyframe.rotate}">
      </label>
    </div>
    <label class="field">Opacity <output id="in-opacity-out">${fmt(keyframe.opacity, 2)}</output>
      <input type="range" id="in-opacity" min="0" max="1" step="0.01" value="${keyframe.opacity}">
    </label>
    <label class="field">Easing <select id="in-easing">${easingOptions}</select></label>
    <div class="key-actions">
      <button type="button" id="in-add">Add after</button>
      <button type="button" id="in-delete">Delete</button>
    </div>
  `;

  bindRange("in-x", "x", (value) => fmt(value));
  bindRange("in-y", "y", (value) => fmt(value));
  bindRange("in-scale", "scale", (value) => fmt(value, 3));
  bindRange("in-rotate", "rotate", (value) => `${fmt(value)}°`);
  bindRange("in-opacity", "opacity", (value) => fmt(value, 2));

  const position = $("in-percent");
  position.addEventListener("input", () => {
    const active = selectedKey();
    if (!active) return;
    active.percent = clamp(Number(position.value), 0, 100);
    $("in-percent-out").textContent = `${fmt(active.percent, 1)}%`;
    moveDiamonds(active.id, active.percent);
    state.percent = active.percent;
    renderPreview(active.percent);
    updateKeySub();
    renderCode();
  });
  position.addEventListener("change", () => {
    state.keyframes.sort((a, b) => a.percent - b.percent);
    renderTimeline();
    renderInspector();
    renderPreview(state.percent);
    renderCode();
    saveState();
  });

  $("in-easing").addEventListener("change", (event) => {
    const active = selectedKey();
    if (!active) return;
    active.easing = event.target.value;
    $("easing").value = active.easing;
    updateCurve(active);
    updateKeySub();
    renderPreview(state.percent);
    renderCode();
    saveState();
  });

  $("in-add").addEventListener("click", () => {
    const active = selectedKey();
    if (!active) return;
    addKeyframeAt(clamp(active.percent + 10, 0, 100));
  });

  $("in-delete").addEventListener("click", deleteSelected);

  updateCurve(keyframe);
  $("easing").value = keyframe.easing;
}

function updateKeySub() {
  const keyframe = selectedKey();
  const sub = document.querySelector(".key-sub");
  if (!keyframe || !sub) return;
  sub.textContent = `${(state.duration * keyframe.percent / 100).toFixed(2)}s · ${keyframe.easing.replace("-", " ")}`;
}

function moveDiamonds(id, percent) {
  document.querySelectorAll(`.diamond[data-key="${id}"]`).forEach((diamond) => {
    diamond.style.left = `${percent}%`;
  });
}

function selectKeyframe(id, seek = true) {
  const keyframe = state.keyframes.find((key) => key.id === id);
  if (!keyframe) return;
  state.selectedId = id;
  document.querySelectorAll(".diamond").forEach((diamond) => {
    diamond.classList.toggle("selected", Number(diamond.dataset.key) === id);
  });
  if (seek) {
    pause();
    state.percent = keyframe.percent;
  }
  renderInspector();
  renderPreview(state.percent);
  const title = $("keyframe-id");
  const index = sortedKeys().findIndex((key) => key.id === id);
  if (title) title.textContent = String(index + 1).padStart(2, "0");
}

function addKeyframeAt(percent, pose = null, easing = null) {
  pause();
  const safePercent = roundToHalf(clamp(percent, 0, 100));
  const existing = state.keyframes.find((key) => Math.abs(key.percent - safePercent) < 0.24);
  if (existing) {
    state.selectedId = existing.id;
    state.percent = existing.percent;
    renderTimeline();
    renderInspector();
    renderPreview(state.percent);
    showToast("Keyframe already exists here");
    return;
  }
  const keys = sortedKeys();
  const previous = [...keys].reverse().find((key) => key.percent < safePercent);
  const source = pose || poseAt(safePercent);
  const keyframe = makeKeyframe(
    safePercent,
    Math.round(source.x),
    Math.round(source.y),
    Number(fmt(source.scale, 3)),
    Math.round(source.rotate),
    Number(fmt(source.opacity, 2)),
    easing || (previous ? previous.easing : "ease-out")
  );
  state.keyframes.push(keyframe);
  state.keyframes.sort((a, b) => a.percent - b.percent);
  state.selectedId = keyframe.id;
  state.percent = keyframe.percent;
  renderTimeline();
  renderInspector();
  renderPreview(state.percent);
  renderCode();
  updateMeta();
  saveState();
}

function deleteSelected() {
  const keyframe = selectedKey();
  if (!keyframe) return;
  if (state.keyframes.length <= 2) {
    showToast("Keep at least two keyframes");
    return;
  }
  const keys = sortedKeys();
  const index = keys.findIndex((key) => key.id === keyframe.id);
  state.keyframes = state.keyframes.filter((key) => key.id !== keyframe.id);
  const nextKeys = sortedKeys();
  const fallback = nextKeys[Math.min(index, nextKeys.length - 1)];
  state.selectedId = fallback.id;
  state.percent = fallback.percent;
  pause();
  renderTimeline();
  renderInspector();
  renderPreview(state.percent);
  renderCode();
  updateMeta();
  saveState();
}

function applyPreset(name) {
  const poses = PRESETS[name];
  if (!poses) return;
  pause();
  state.keyframes = poses.map((pose) =>
    makeKeyframe(pose.percent, pose.x, pose.y, pose.scale, pose.rotate, pose.opacity, pose.easing)
  );
  state.selectedId = state.keyframes[0].id;
  state.percent = state.keyframes[0].percent;
  renderTimeline();
  renderInspector();
  renderPreview(state.percent);
  renderCode();
  updateMeta();
  saveState();
  showToast(`${name} applied`);
}

function updateCurve(keyframe) {
  const active = keyframe || selectedKey();
  const name = active ? active.easing : "ease";
  const points = EASINGS[name] || EASINGS.ease;
  const x1 = 8 + points[0] * 104;
  const y1 = clamp(72 - points[1] * 64, -4, 76);
  const x2 = 8 + points[2] * 104;
  const y2 = clamp(72 - points[3] * 64, -4, 76);
  const path = document.querySelector("#curve path");
  if (path) path.setAttribute("d", `M8 72 C ${fmt(x1)} ${fmt(y1)}, ${fmt(x2)} ${fmt(y2)}, 112 8`);
  const label = $("curve-label");
  if (label) label.textContent = `cubic-bezier(${points.map((point) => fmt(point)).join(", ")})`;
}

function easingString(name) {
  return `cubic-bezier(${(EASINGS[name] || EASINGS.ease).map((point) => fmt(point)).join(", ")})`;
}

function renderCode() {
  const keys = sortedKeys();
  const lines = ["@keyframes motion {"];
  keys.forEach((key) => {
    lines.push(`  ${fmt(key.percent, 1)}% {`);
    lines.push(`    transform: translate(${fmt(key.x)}px, ${fmt(key.y)}px) scale(${fmt(key.scale, 3)}) rotate(${fmt(key.rotate)}deg);`);
    lines.push(`    opacity: ${fmt(key.opacity, 2)};`);
    lines.push(`    animation-timing-function: ${easingString(key.easing)};`);
    lines.push("  }");
  });
  lines.push("}");
  lines.push("");
  lines.push(".motion-object {");
  lines.push(`  animation: motion ${fmt(state.duration, 1)}s linear 0s ${state.loop ? "infinite" : "both"};`);
  lines.push("  will-change: transform, opacity;");
  lines.push("}");
  currentCSS = lines.join("\n");
  $("code-block").textContent = currentCSS;
}

function renderObject() {
  const object = $("motion-object");
  object.className = `motion-object ${state.shape}`;
  object.style.setProperty("--size", `${state.size}px`);
  object.style.setProperty("--object-color", COLORS[state.colorIndex]);
  object.style.opacity = "1";
  $("object-content").textContent = state.shape === "card" ? "Aa" : state.shape === "circle" ? "●" : "01";
  $("stage-title").textContent = `${state.shape[0].toUpperCase()}${state.shape.slice(1)} / sequence 01`;
}

function updateMeta() {
  $("duration-meta").textContent = `${fmt(state.duration, 1)}s sequence`;
  $("keycount-meta").textContent = `${state.keyframes.length} keyframe${state.keyframes.length === 1 ? "" : "s"}`;
  $("duration-output").textContent = `${fmt(state.duration, 1)}s`;
  $("size-output").textContent = `${state.size}px`;
  $("duration").value = String(state.duration);
  $("size").value = String(state.size);
  $("loop").checked = state.loop;
}

function renderControls() {
  updateMeta();
  document.querySelectorAll("[data-shape]").forEach((button) => {
    button.classList.toggle("active", button.dataset.shape === state.shape);
  });
  document.querySelectorAll("[data-color]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.color) === state.colorIndex);
  });
}

function renderAll() {
  renderControls();
  renderObject();
  renderTimeline();
  renderInspector();
  renderPreview(state.percent);
  renderCode();
}

function updatePlayUI() {
  $("play-icon").textContent = playing ? "❚❚" : "▶";
  $("play-label").textContent = playing ? "Pause" : "Play";
  $("play").classList.toggle("playing", playing);
  $("play-state").textContent = playing ? "Playing" : "Paused";
  document.querySelector(".status-dot").classList.toggle("live", playing);
}

function tick(now) {
  if (!playing) return;
  const elapsed = (now - playStart) / 1000;
  let next = startPercent + (elapsed / state.duration) * 100;
  if (next >= 100 && !state.loop) {
    renderPreview(100);
    pause();
    return;
  }
  if (next >= 100) next %= 100;
  renderPreview(next);
  rafId = requestAnimationFrame(tick);
}

function play() {
  if (playing) return;
  if (state.percent >= 99.95) state.percent = 0;
  startPercent = state.percent;
  playStart = performance.now();
  playing = true;
  updatePlayUI();
  rafId = requestAnimationFrame(tick);
}

function pause() {
  if (!playing) return;
  playing = false;
  cancelAnimationFrame(rafId);
  updatePlayUI();
}

function togglePlay() {
  if (playing) pause();
  else play();
}

function beginDrag(event, id) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const lane = event.currentTarget.closest(".track-lane");
  if (!lane) return;
  const bounds = lane.getBoundingClientRect();
  dragState = { id, bounds };
  selectKeyframe(id, true);
  document.addEventListener("pointermove", onDragMove);
  document.addEventListener("pointerup", endDrag, { once: true });
  document.addEventListener("pointercancel", endDrag, { once: true });
}

function onDragMove(event) {
  if (!dragState) return;
  const keyframe = state.keyframes.find((key) => key.id === dragState.id);
  if (!keyframe) return;
  const percent = roundToHalf(clamp((event.clientX - dragState.bounds.left) / dragState.bounds.width * 100, 0, 100));
  keyframe.percent = percent;
  moveDiamonds(keyframe.id, percent);
  state.percent = percent;
  renderPreview(percent);
  updateKeySub();
  renderCode();
}

function endDrag() {
  document.removeEventListener("pointermove", onDragMove);
  document.removeEventListener("pointercancel", endDrag);
  if (!dragState) return;
  const active = dragState.id;
  dragState = null;
  state.keyframes.sort((a, b) => a.percent - b.percent);
  state.selectedId = active;
  renderTimeline();
  renderInspector();
  renderPreview(state.percent);
  renderCode();
  updateMeta();
  saveState();
}

function saveState() {
  try {
    const payload = {
      duration: state.duration,
      loop: state.loop,
      shape: state.shape,
      size: state.size,
      colorIndex: state.colorIndex,
      keyframes: state.keyframes.map(({ id, ...keyframe }) => keyframe)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    return;
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.keyframes) || data.keyframes.length < 2) return;
    const numeric = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
    const restored = data.keyframes.map((key) =>
      makeKeyframe(
        numeric(key.percent, 0),
        numeric(key.x, 0),
        numeric(key.y, 0),
        numeric(key.scale, 1),
        numeric(key.rotate, 0),
        numeric(key.opacity, 1),
        key.easing
      )
    );
    if (restored.length < 2) return;
    state.duration = clamp(numeric(data.duration, 1.8), 0.4, 4);
    state.loop = Boolean(data.loop);
    state.shape = ["square", "circle", "card"].includes(data.shape) ? data.shape : "square";
    state.size = clamp(numeric(data.size, 96), 48, 160);
    state.colorIndex = clamp(Math.round(numeric(data.colorIndex, 0)), 0, COLORS.length - 1);
    state.keyframes = restored.sort((a, b) => a.percent - b.percent);
    const previewKey = state.keyframes[Math.min(1, state.keyframes.length - 1)];
    state.selectedId = previewKey.id;
    state.percent = previewKey.percent;
  } catch (error) {
    return;
  }
}

function buildPresetOptions() {
  const select = $("preset");
  Object.keys(PRESETS).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.append(option);
  });
  select.value = "Fade up";
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("CSS copied to clipboard");
  } catch (error) {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    try {
      document.execCommand("copy");
      showToast("CSS copied to clipboard");
    } catch (fallbackError) {
      showToast("Copy failed — select the code manually");
    }
    field.remove();
  }
}

function downloadCSS() {
  const blob = new Blob([currentCSS], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "choreograph.css";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("choreograph.css downloaded");
}

function bindEvents() {
  $("play").addEventListener("click", togglePlay);
  $("restart").addEventListener("click", () => {
    pause();
    renderPreview(0);
  });
  $("scrubber").addEventListener("input", (event) => {
    pause();
    renderPreview(Number(event.target.value));
  });
  $("duration").addEventListener("input", (event) => {
    state.duration = Number(event.target.value);
    $("duration-output").textContent = `${fmt(state.duration, 1)}s`;
    $("duration-meta").textContent = `${fmt(state.duration, 1)}s sequence`;
    renderPreview(state.percent);
    updateKeySub();
    renderCode();
    saveState();
  });
  $("loop").addEventListener("change", (event) => {
    state.loop = event.target.checked;
    renderCode();
    saveState();
  });
  $("size").addEventListener("input", (event) => {
    state.size = Number(event.target.value);
    $("size-output").textContent = `${state.size}px`;
    $("motion-object").style.setProperty("--size", `${state.size}px`);
    saveState();
  });

  document.querySelectorAll("[data-shape]").forEach((button) => {
    button.addEventListener("click", () => {
      state.shape = button.dataset.shape;
      renderControls();
      renderObject();
      renderPreview(state.percent);
      saveState();
    });
  });

  document.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      state.colorIndex = Number(button.dataset.color);
      renderControls();
      $("motion-object").style.setProperty("--object-color", COLORS[state.colorIndex]);
      saveState();
    });
  });

  $("preset").addEventListener("change", (event) => applyPreset(event.target.value));
  $("add-keyframe").addEventListener("click", () => addKeyframeAt(roundToHalf(state.percent)));
  $("delete-keyframe").addEventListener("click", deleteSelected);
  $("copy-css").addEventListener("click", () => copyText(currentCSS));
  $("download-css").addEventListener("click", downloadCSS);

  $("easing").addEventListener("change", (event) => {
    const keyframe = selectedKey();
    if (!keyframe) return;
    keyframe.easing = event.target.value;
    updateCurve(keyframe);
    updateKeySub();
    renderPreview(state.percent);
    renderCode();
    saveState();
  });

  $("ruler").addEventListener("click", (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const percent = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100);
    pause();
    renderPreview(percent);
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement ? document.activeElement.tagName : "";
    if (event.code === "Space" && !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) {
      event.preventDefault();
      togglePlay();
    }
    if (event.key === "Escape") {
      pause();
    }
  });

  $("year").textContent = `${new Date().getFullYear()} — built in the browser`;
}

buildPresetOptions();
loadState();
bindEvents();
renderAll();
updatePlayUI();
