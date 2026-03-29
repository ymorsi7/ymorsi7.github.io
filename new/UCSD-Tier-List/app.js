/**
 * Courses you took (transcripts) — titles as on your academic history.
 * Merged with catalog-courses.js (ECE + CSE) and dsc-catalog.js (DSC) by id; transcript wins on duplicates.
 */
const TRANSCRIPT_COURSES = [
  { id: "CSE-194", code: "CSE 194", title: "Race, Gender & Computing" },
  { id: "CSE-190", code: "CSE 190", title: "Top/Computer Sci & Engineering" },
  { id: "CSE-258R", code: "CSE 258R", title: "Recommender Sys&Web Mining" },
  { id: "CSE-272", code: "CSE 272", title: "Advanced Image Synthesis" },
  { id: "ECE-5", code: "ECE 5", title: "Intro to ECE" },
  { id: "ECE-15", code: "ECE 15", title: "Engineering Computation" },
  { id: "ECE-16", code: "ECE 16", title: "Rapid Hardware & Software Dsn" },
  { id: "ECE-17", code: "ECE 17", title: "Object-Oriented Programming" },
  { id: "ECE-25", code: "ECE 25", title: "Introduction to Digital Design" },
  { id: "ECE-30", code: "ECE 30", title: "Intro to Computer Engineering" },
  { id: "ECE-35", code: "ECE 35", title: "Introduction to Analog Design" },
  { id: "ECE-45", code: "ECE 45", title: "Circuits and Systems" },
  { id: "ECE-65", code: "ECE 65", title: "Components & Circuits Lab" },
  { id: "ECE-100", code: "ECE 100", title: "Linear Electronic Systems" },
  { id: "ECE-101", code: "ECE 101", title: "Linear Systems Fundamentals" },
  { id: "ECE-109", code: "ECE 109", title: "Engineering Probability&Stats" },
  { id: "ECE-140A", code: "ECE 140A", title: "The Art of Product Eng I" },
  { id: "ECE-140B", code: "ECE 140B", title: "The Art of Product Eng II" },
  { id: "ECE-143", code: "ECE 143", title: "Programming for Data Analysis" },
  { id: "ECE-148", code: "ECE 148", title: "Intro to Autonomous Vehicles" },
  { id: "ECE-171A", code: "ECE 171A", title: "Linear Control System Theory" },
  { id: "ECE-171B", code: "ECE 171B", title: "Linear Control System Theory" },
  { id: "ECE-172A", code: "ECE 172A", title: "Introductn/Intelligent Systems" },
  { id: "ECE-174", code: "ECE 174", title: "Intro/Linear&Nonlinear Optimiz" },
  { id: "ECE-175A", code: "ECE 175A", title: "Pattrn Recogn and Machine Lrng" },
  { id: "ECE-176", code: "ECE 176", title: "Intro Deep Learning & Apps" },
  { id: "ECE-198", code: "ECE 198", title: "Direct Group Study" },
  { id: "ECE-208", code: "ECE 208", title: "Computational Evolutionary Bio" },
  { id: "ECE-225A", code: "ECE 225A", title: "Prob & Stats for Data Science" },
  { id: "ECE-228", code: "ECE 228", title: "ML for Physical Applications" },
  { id: "ECE-250", code: "ECE 250", title: "Random Processes" },
  { id: "ECE-253", code: "ECE 253", title: "Fundmntls/Digital Image Proces" },
  { id: "ECE-269", code: "ECE 269", title: "Linear Algebra and Application" },
  { id: "ECE-271A", code: "ECE 271A", title: "Statistical Learning I" },
  { id: "ECE-276A", code: "ECE 276A", title: "Sensing & Estimation Robotics" },
  {
    id: "ECE-285",
    code: "ECE 285",
    title: "Spec Topic/Signal&Imag/Robotic",
    subtitle: "Deep Generative Models · Intro to Visual Learning",
  },
];

function mergeTranscriptAndCatalog() {
  /** @type {Map<string, typeof TRANSCRIPT_COURSES[0]>} */
  const byId = new Map(TRANSCRIPT_COURSES.map((c) => [c.id, c]));
  const extras = [
    ...(typeof CATALOG_EXTRA !== "undefined" ? CATALOG_EXTRA : []),
    ...(typeof DSC_EXTRA !== "undefined" ? DSC_EXTRA : []),
  ];
  for (const c of extras) {
    if (!c?.id || byId.has(c.id)) continue;
    byId.set(c.id, c);
  }
  return [...byId.values()];
}

const COURSES = mergeTranscriptAndCatalog();

const ZONES = ["unranked", "S", "A", "B", "C", "D", "F"];
const STORAGE_KEY = "ece-cse-tier-list-v1";

(function assertUniqueIds() {
  const ids = COURSES.map((c) => c.id);
  const set = new Set(ids);
  if (set.size !== ids.length) throw new Error("Duplicate course ids");
})();

const courseById = Object.fromEntries(COURSES.map((c) => [c.id, c]));

/** @param {string} code */
function courseDeptFromCode(code) {
  const m = /^([A-Z]+)\s/.exec(code.trim());
  const p = m ? m[1] : "";
  if (p === "ECE" || p === "CSE" || p === "DSC") return p;
  return "ECE";
}

/** @param {string[]} ids */
function partitionUnrankedIds(ids) {
  const ece = [],
    cse = [],
    dsc = [];
  for (const id of ids) {
    const c = courseById[id];
    if (!c) continue;
    const d = courseDeptFromCode(c.code);
    if (d === "CSE") cse.push(id);
    else if (d === "DSC") dsc.push(id);
    else ece.push(id);
  }
  return { ECE: ece, CSE: cse, DSC: dsc };
}

/** @param {{ ECE: string[]; CSE: string[]; DSC: string[] }} parts */
function rebuildUnrankedFromParts(parts) {
  return [...parts.ECE, ...parts.CSE, ...parts.DSC];
}

/** @param {string[]} ids */
function canonicalizeUnranked(ids) {
  return rebuildUnrankedFromParts(partitionUnrankedIds(ids));
}

/** @type {Record<string, string[]>} */
let state = {};

function defaultState() {
  /** @type {Record<string, string[]>} */
  const s = {};
  for (const z of ZONES) s[z] = [];
  s.unranked = canonicalizeUnranked(COURSES.map((c) => c.id));
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaultState();
    const allIds = new Set(COURSES.map((c) => c.id));
    /** @type {Record<string, string[]>} */
    const s = defaultState();
    const seen = new Set();
    for (const z of ZONES) {
      const arr = parsed[z];
      if (!Array.isArray(arr)) continue;
      s[z] = [];
      for (const id of arr) {
        if (typeof id !== "string" || !allIds.has(id) || seen.has(id)) continue;
        seen.add(id);
        s[z].push(id);
      }
    }
    for (const id of allIds) {
      if (!seen.has(id)) s.unranked.push(id);
    }
    s.unranked = canonicalizeUnranked(s.unranked);
    return s;
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function removeIdFromAll(id) {
  for (const z of ZONES) {
    state[z] = state[z].filter((x) => x !== id);
  }
}

function insertAt(zone, id, index) {
  removeIdFromAll(id);
  const list = state[zone];
  const i = Math.max(0, Math.min(index, list.length));
  list.splice(i, 0, id);
}

/**
 * @param {string} id
 * @param {"ECE"|"CSE"|"DSC"} dept
 * @param {number} indexInDept
 */
function insertAtUnranked(id, dept, indexInDept) {
  removeIdFromAll(id);
  const parts = partitionUnrankedIds(state.unranked);
  const arr = [...parts[dept]];
  const i = Math.max(0, Math.min(indexInDept, arr.length));
  arr.splice(i, 0, id);
  parts[dept] = arr;
  state.unranked = rebuildUnrankedFromParts(parts);
}

/**
 * @param {number} clientX
 * @param {number} clientY
 * @param {HTMLElement} strip
 * @param {string} draggedId
 * @param {HTMLElement | null} ghostEl
 */
function getInsertionIndexInStrip(clientX, clientY, strip, draggedId, ghostEl) {
  if (ghostEl) ghostEl.style.visibility = "hidden";
  const others = [...strip.querySelectorAll(".course-card")].filter((c) => c.dataset.id !== draggedId);
  if (ghostEl) ghostEl.style.visibility = "visible";
  if (others.length === 0) return 0;

  if (ghostEl) ghostEl.style.visibility = "hidden";
  const fromPoint = document.elementFromPoint(clientX, clientY);
  if (ghostEl) ghostEl.style.visibility = "visible";
  const hit = fromPoint?.closest?.(".course-card");
  if (hit && strip.contains(hit) && hit.dataset.id !== draggedId) {
    const pos = others.indexOf(hit);
    if (pos >= 0) {
      const r = hit.getBoundingClientRect();
      const before = clientX < r.left + r.width / 2;
      return before ? pos : pos + 1;
    }
  }

  let insert = 0;
  for (let i = 0; i < others.length; i++) {
    const r = others[i].getBoundingClientRect();
    if (clientY < r.top) return i;
    if (clientY >= r.top && clientY <= r.bottom) {
      if (clientX < r.left + r.width / 2) return i;
      insert = i + 1;
    }
  }
  return insert;
}

/** @param {string} id @param {"ECE"|"CSE"|"DSC"} dept */
function unrankedDeptLengthWithoutId(id, dept) {
  const parts = partitionUnrankedIds(state.unranked.filter((x) => x !== id));
  return parts[dept].length;
}

/** @type {HTMLElement | null} */
let dragGhost = null;
/** @type {string | null} */
let dragId = null;
/** @type {number} */
let dragOffsetX = 0;
/** @type {number} */
let dragOffsetY = 0;

function clearDragVisual() {
  if (dragGhost?.parentNode) dragGhost.parentNode.removeChild(dragGhost);
  dragGhost = null;
  dragId = null;
  document.querySelectorAll(".drop-strip.drop-hover").forEach((el) => el.classList.remove("drop-hover"));
}

function findDropStrip(clientX, clientY) {
  if (dragGhost) dragGhost.style.visibility = "hidden";
  const el = document.elementFromPoint(clientX, clientY);
  if (dragGhost) dragGhost.style.visibility = "visible";
  const strip = el?.closest?.(".drop-strip");
  return strip instanceof HTMLElement ? strip : null;
}

/**
 * @param {{ code: string; title: string; subtitle?: string }} c
 * @param {string} id
 */
function createCourseCard(c, id) {
  const card = document.createElement("div");
  card.className = "course-card";
  card.dataset.id = id;
  card.setAttribute("role", "button");
  card.tabIndex = 0;
  card.innerHTML = `<span class="course-code">${escapeHtml(c.code)}</span><span class="course-title">${escapeHtml(c.title)}</span>${c.subtitle ? `<span class="course-sub">${escapeHtml(c.subtitle)}</span>` : ""}`;
  card.addEventListener("pointerdown", onCardPointerDown);
  return card;
}

function renderUnranked() {
  const parts = partitionUnrankedIds(state.unranked);
  for (const dept of /** @type {const} */ (["ECE", "CSE", "DSC"])) {
    const strip = /** @type {HTMLElement} */ (
      document.querySelector(`[data-zone="unranked"] .unranked-substrip[data-dept="${dept}"]`)
    );
    if (!strip) continue;
    strip.innerHTML = "";
    for (const id of parts[dept]) {
      const c = courseById[id];
      if (!c) continue;
      strip.appendChild(createCourseCard(c, id));
    }
  }
}

function render() {
  for (const zone of ZONES) {
    if (zone === "unranked") {
      renderUnranked();
      continue;
    }
    const strip = /** @type {HTMLElement} */ (document.querySelector(`[data-zone="${zone}"] .tier-strip.drop-strip`));
    if (!strip) continue;
    strip.innerHTML = "";
    for (const id of state[zone]) {
      const c = courseById[id];
      if (!c) continue;
      strip.appendChild(createCourseCard(c, id));
    }
  }
}

/**
 * @param {PointerEvent} e
 */
function onCardPointerDown(e) {
  if (e.button !== 0) return;
  const card = /** @type {HTMLElement} */ (e.currentTarget);
  const id = card.dataset.id;
  if (!id || !courseById[id]) return;

  e.preventDefault();
  dragId = id;
  const r = card.getBoundingClientRect();
  dragOffsetX = e.clientX - r.left;
  dragOffsetY = e.clientY - r.top;

  dragGhost = /** @type {HTMLElement} */ (card.cloneNode(true));
  dragGhost.classList.add("course-card--ghost");
  dragGhost.style.position = "fixed";
  dragGhost.style.left = `${r.left}px`;
  dragGhost.style.top = `${r.top}px`;
  dragGhost.style.width = `${r.width}px`;
  dragGhost.style.zIndex = "10000";
  dragGhost.style.pointerEvents = "none";
  dragGhost.style.margin = "0";
  document.body.appendChild(dragGhost);

  card.classList.add("dragging-source");
  card.setPointerCapture(e.pointerId);

  card.addEventListener("pointermove", onCardPointerMove);
  card.addEventListener("pointerup", onCardPointerUp);
  card.addEventListener("pointercancel", onCardPointerUp);
}

/**
 * @param {PointerEvent} e
 */
function onCardPointerMove(e) {
  if (!dragId || !dragGhost) return;
  e.preventDefault();
  dragGhost.style.left = `${e.clientX - dragOffsetX}px`;
  dragGhost.style.top = `${e.clientY - dragOffsetY}px`;

  document.querySelectorAll(".drop-strip.drop-hover").forEach((el) => el.classList.remove("drop-hover"));
  const strip = findDropStrip(e.clientX, e.clientY);
  if (strip) strip.classList.add("drop-hover");
}

/**
 * @param {PointerEvent} e
 */
function onCardPointerUp(e) {
  const card = /** @type {HTMLElement} */ (e.currentTarget);
  card.removeEventListener("pointermove", onCardPointerMove);
  card.removeEventListener("pointerup", onCardPointerUp);
  card.removeEventListener("pointercancel", onCardPointerUp);
  card.releasePointerCapture(e.pointerId);
  card.classList.remove("dragging-source");

  const id = dragId;
  const ghost = dragGhost;
  clearDragVisual();

  if (!id || !ghost) return;

  const strip = findDropStrip(e.clientX, e.clientY);
  if (!strip) {
    render();
    return;
  }

  const row = strip.closest("[data-zone]");
  const zone = row?.getAttribute("data-zone");
  if (!zone || !ZONES.includes(zone)) {
    render();
    return;
  }

  if (zone === "unranked") {
    const courseDept = /** @type {"ECE"|"CSE"|"DSC"} */ (courseDeptFromCode(courseById[id].code));
    const stripDept = strip.dataset.dept;
    if (stripDept === courseDept) {
      const idx = getInsertionIndexInStrip(e.clientX, e.clientY, strip, id, null);
      insertAtUnranked(id, courseDept, idx);
    } else {
      insertAtUnranked(id, courseDept, unrankedDeptLengthWithoutId(id, courseDept));
    }
  } else {
    const idx = getInsertionIndexInStrip(e.clientX, e.clientY, strip, id, null);
    insertAt(zone, id, idx);
  }
  saveState();
  render();
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function wireControls() {
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Reset all courses to Unranked?")) {
      state = defaultState();
      saveState();
      render();
    }
  });
}

function init() {
  state = loadState();
  wireControls();
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
