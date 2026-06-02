/**
 * UCSD course tier list — works from file:// (no server).
 * Departments load from catalog/depts/*.js on demand.
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

const ZONES = ["unranked", "S", "A", "B", "C", "D", "F"];
const TIER_ZONES = ["S", "A", "B", "C", "D", "F"];
const STORAGE_KEY = "ucsd-tier-list-v2";
const SETTINGS_KEY = "ucsd-tier-list-settings-v1";
const LEGACY_STORAGE_KEY = "ece-cse-tier-list-v1";
const DEFAULT_ENABLED_DEPTS = ["ECE", "CSE", "DSC", "MATH", "COGS"];

/** @type {{ enabledDepts: string[]; deptFilter: string | null }} */
let settings = { enabledDepts: [...DEFAULT_ENABLED_DEPTS], deptFilter: null };

/** @type {typeof TRANSCRIPT_COURSES} */
let COURSES = [];

/** @type {Record<string, typeof TRANSCRIPT_COURSES[0]>} */
let courseById = {};

/** @type {Record<string, string[]>} */
let state = {};

let poolSearchQuery = "";
/** @type {string | null} */
let selectedCardId = null;

const loadedDepts = new Set();
/** @type {Map<string, Promise<void>>} */
const pendingDeptLoads = new Map();

/** In-memory fallback when file:// blocks localStorage */
const memoryStore = new Map();

const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return v;
    } catch {
      /* file:// may block */
    }
    try {
      const v = sessionStorage.getItem(key);
      if (v !== null) return v;
    } catch {
      /* ignore */
    }
    return memoryStore.get(key) ?? null;
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through */
    }
    try {
      sessionStorage.setItem(key, value);
      return;
    } catch {
      /* fall through */
    }
    memoryStore.set(key, value);
  },
};

function setLoadStatus(msg, isError) {
  const el = document.getElementById("load-status");
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("load-status--error", !!isError);
}

/** @param {string} dept */
function getDeptCourses(dept) {
  const key = `CATALOG_DEPT_${dept}`;
  const fromWindow = /** @type {unknown} */ (window[key]);
  if (Array.isArray(fromWindow)) return fromWindow;
  if (typeof CATALOG_BY_DEPT !== "undefined" && Array.isArray(CATALOG_BY_DEPT[dept])) {
    return CATALOG_BY_DEPT[dept];
  }
  return [];
}

/** @param {string} dept */
function deptScriptUrl(dept) {
  return `catalog/depts/${encodeURIComponent(dept)}.js`;
}

/** @param {string} dept */
function loadDeptScript(dept) {
  if (loadedDepts.has(dept) || getDeptCourses(dept).length > 0) {
    loadedDepts.add(dept);
    return Promise.resolve();
  }
  const pending = pendingDeptLoads.get(dept);
  if (pending) return pending;

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = deptScriptUrl(dept);
    script.async = false;
    script.onload = () => {
      loadedDepts.add(dept);
      pendingDeptLoads.delete(dept);
      if (getDeptCourses(dept).length === 0) {
        reject(new Error(`${dept}: empty catalog file`));
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      pendingDeptLoads.delete(dept);
      reject(
        new Error(
          `Missing catalog/depts/${dept}.js — keep index.html in the UCSD-Tier-List folder, or run the catalog fetch script.`
        )
      );
    };
    document.head.appendChild(script);
  });
  pendingDeptLoads.set(dept, promise);
  return promise;
}

/** @param {string[]} depts */
async function loadDepartments(depts) {
  const need = depts.filter((d) => !loadedDepts.has(d) && getDeptCourses(d).length === 0);
  if (!need.length) {
    depts.forEach((d) => loadedDepts.add(d));
    return;
  }
  setLoadStatus(`Loading ${need.length} department${need.length === 1 ? "" : "s"}…`);
  const results = await Promise.allSettled(need.map((d) => loadDeptScript(d)));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length === need.length) {
    throw new Error(/** @type {Error} */ (failed[0].reason).message);
  }
  if (failed.length) {
    setLoadStatus(`Some departments failed to load (${failed.length}). Others are ready.`, true);
  }
}

/** @param {string} code */
function courseDeptFromCode(code) {
  const m = /^([A-Z][A-Z0-9]*)\s/.exec(String(code).trim());
  return m ? m[1] : "OTHER";
}

function loadSettings() {
  try {
    const raw = storage.get(SETTINGS_KEY);
    if (!raw) return { enabledDepts: [...DEFAULT_ENABLED_DEPTS], deptFilter: null };
    const parsed = JSON.parse(raw);
    const enabled = Array.isArray(parsed.enabledDepts)
      ? parsed.enabledDepts.filter((d) => typeof d === "string")
      : [...DEFAULT_ENABLED_DEPTS];
    return {
      enabledDepts: enabled.length ? enabled : [...DEFAULT_ENABLED_DEPTS],
      deptFilter: typeof parsed.deptFilter === "string" ? parsed.deptFilter : null,
    };
  } catch {
    return { enabledDepts: [...DEFAULT_ENABLED_DEPTS], deptFilter: null };
  }
}

function saveSettings() {
  storage.set(SETTINGS_KEY, JSON.stringify(settings));
}

function legacyCatalogExtras() {
  return [
    ...(typeof CATALOG_EXTRA !== "undefined" ? CATALOG_EXTRA : []),
    ...(typeof DSC_EXTRA !== "undefined" ? DSC_EXTRA : []),
  ];
}

function coursesFromEnabledDepts() {
  const out = [];
  for (const dept of settings.enabledDepts) {
    out.push(...getDeptCourses(dept));
  }
  return out;
}

function buildCourseList() {
  /** @type {Map<string, typeof TRANSCRIPT_COURSES[0]>} */
  const byId = new Map();
  const add = (c) => {
    if (!c?.id || !c.code) return;
    const dept = c.dept || courseDeptFromCode(c.code);
    const row = { id: c.id, code: c.code, title: c.title, dept };
    if (c.subtitle) row.subtitle = c.subtitle;
    const prev = byId.get(c.id);
    if (!prev) byId.set(c.id, row);
    else if (TRANSCRIPT_COURSES.some((t) => t.id === c.id)) byId.set(c.id, { ...row, ...prev, ...c });
  };

  for (const c of TRANSCRIPT_COURSES) add(c);
  const enabled = new Set(settings.enabledDepts);
  for (const c of legacyCatalogExtras()) {
    if (enabled.has(courseDeptFromCode(c.code))) add(c);
  }
  for (const c of coursesFromEnabledDepts()) add(c);

  return [...byId.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}

function rebuildCourses() {
  COURSES = buildCourseList();
  courseById = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const ids = new Set(COURSES.map((c) => c.id));
  const seen = new Set();
  for (const z of ZONES) {
    state[z] = (state[z] || []).filter((id) => {
      if (!ids.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  for (const c of COURSES) {
    if (!seen.has(c.id)) {
      state.unranked.push(c.id);
      seen.add(c.id);
    }
  }
}

function defaultState() {
  /** @type {Record<string, string[]>} */
  const s = {};
  for (const z of ZONES) s[z] = [];
  s.unranked = COURSES.map((c) => c.id);
  return s;
}

function migrateLegacyState() {
  try {
    const raw = storage.get(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadState() {
  const allIds = () => new Set(COURSES.map((c) => c.id));

  try {
    let parsed = null;
    const raw = storage.get(STORAGE_KEY);
    if (raw) parsed = JSON.parse(raw);
    else parsed = migrateLegacyState();

    if (typeof parsed !== "object" || parsed === null) return defaultState();

    /** @type {Record<string, string[]>} */
    const s = defaultState();
    const ids = allIds();
    const seen = new Set();
    for (const z of ZONES) {
      const arr = parsed[z];
      if (!Array.isArray(arr)) continue;
      s[z] = [];
      for (const id of arr) {
        if (typeof id !== "string" || !ids.has(id) || seen.has(id)) continue;
        seen.add(id);
        s[z].push(id);
      }
    }
    for (const id of ids) {
      if (!seen.has(id)) s.unranked.push(id);
    }
    return s;
  } catch {
    return defaultState();
  }
}

function saveState() {
  storage.set(STORAGE_KEY, JSON.stringify(state));
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

function insertAtUnranked(id, index) {
  removeIdFromAll(id);
  const list = state.unranked;
  const i = Math.max(0, Math.min(index, list.length));
  list.splice(i, 0, id);
}

/** @param {string | null} id */
function setSelectedCard(id) {
  selectedCardId = id;
  document.querySelectorAll(".course-card--selected").forEach((el) => el.classList.remove("course-card--selected"));
  if (id) {
    document.querySelector(`.course-card[data-id="${CSS.escape(id)}"]`)?.classList.add("course-card--selected");
  }
}

/** @param {string} id @param {string} zone */
function moveCourseToTier(id, zone) {
  if (!courseById[id] || !ZONES.includes(zone)) return;
  if (zone === "unranked") {
    insertAtUnranked(id, state.unranked.length);
  } else {
    insertAt(zone, id, state[zone].length);
  }
  saveState();
  setSelectedCard(null);
  render();
}

function matchesPoolFilters(id) {
  const c = courseById[id];
  if (!c) return false;
  if (settings.deptFilter && c.dept !== settings.deptFilter) return false;
  if (!poolSearchQuery) return true;
  const hay = `${c.code} ${c.title} ${c.subtitle || ""}`.toLowerCase();
  return hay.includes(poolSearchQuery);
}

function unrankedIdsForRender() {
  return state.unranked.filter(matchesPoolFilters);
}

function updatePoolMeta() {
  const el = document.getElementById("pool-meta");
  if (!el) return;
  const total = state.unranked.length;
  const shown = unrankedIdsForRender().length;
  if (poolSearchQuery || settings.deptFilter) {
    el.textContent = `${shown} shown · ${total} in pool`;
  } else {
    el.textContent = `${total} in pool · ${settings.enabledDepts.length} departments`;
  }
}

function renderDeptFilterRow() {
  const row = document.getElementById("dept-filter-row");
  if (!row) return;
  row.innerHTML = "";

  const mkChip = (label, value, active) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dept-chip" + (active ? " dept-chip--active" : "");
    b.textContent = label;
    b.dataset.dept = value;
    b.addEventListener("click", () => {
      settings.deptFilter = value || null;
      saveSettings();
      renderDeptFilterRow();
      renderUnranked();
      updatePoolMeta();
    });
    return b;
  };

  row.appendChild(mkChip("All", "", !settings.deptFilter));
  for (const dept of settings.enabledDepts) {
    row.appendChild(mkChip(dept, dept, settings.deptFilter === dept));
  }
}

function renderDeptDialog() {
  const list = document.getElementById("dept-checklist");
  if (!list || typeof CATALOG_INDEX === "undefined") return;

  const q = (document.getElementById("dept-search")?.value || "").trim().toLowerCase();
  list.innerHTML = "";

  const index = [...CATALOG_INDEX].sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));

  for (const entry of index) {
    const code = entry.code || entry.slug.toUpperCase();
    const label = `${code} — ${entry.name || code}`;
    if (q && !label.toLowerCase().includes(q) && !code.toLowerCase().includes(q)) continue;

    const count =
      entry.courseCount ||
      getDeptCourses(code).length ||
      (typeof CATALOG_BY_DEPT !== "undefined" && CATALOG_BY_DEPT[code] ? CATALOG_BY_DEPT[code].length : 0);

    const labelEl = document.createElement("label");
    labelEl.className = "dept-check";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = code;
    cb.checked = settings.enabledDepts.includes(code);
    labelEl.appendChild(cb);
    const span = document.createElement("span");
    span.textContent = `${entry.name || code} (${count || "?"})`;
    labelEl.appendChild(span);
    list.appendChild(labelEl);
  }
}

/**
 * @param {{ code: string; title: string; subtitle?: string; dept?: string }} c
 * @param {string} id
 * @param {{ compact?: boolean }} [opts]
 */
function createCourseCard(c, id, opts = {}) {
  const { compact = false } = opts;
  const card = document.createElement("div");
  card.className = "course-card" + (compact ? " course-card--compact" : "");
  card.dataset.id = id;
  if (c.dept) card.dataset.dept = c.dept;
  card.setAttribute("role", "button");
  card.tabIndex = 0;
  card.title = `${c.code}: ${c.title}`;

  const titleHtml = compact
    ? ""
    : `<span class="course-title">${escapeHtml(c.title)}</span>${c.subtitle ? `<span class="course-sub">${escapeHtml(c.subtitle)}</span>` : ""}`;

  card.innerHTML = `<span class="course-code">${escapeHtml(c.code)}</span>${titleHtml}`;

  const quick = document.createElement("div");
  quick.className = "course-quick-tiers";
  quick.setAttribute("role", "group");
  quick.setAttribute("aria-label", "Move to tier");
  for (const t of TIER_ZONES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `tier-quick-btn tier-quick-${t.toLowerCase()}`;
    b.textContent = t;
    b.title = `Move to ${t}`;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      moveCourseToTier(id, t);
    });
    b.addEventListener("pointerdown", (e) => e.stopPropagation());
    quick.appendChild(b);
  }
  const poolBtn = document.createElement("button");
  poolBtn.type = "button";
  poolBtn.className = "tier-quick-btn tier-quick-pool";
  poolBtn.textContent = "↓";
  poolBtn.title = "Move to pool";
  poolBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    moveCourseToTier(id, "unranked");
  });
  poolBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
  quick.appendChild(poolBtn);
  card.appendChild(quick);

  card.addEventListener("click", (e) => {
    if (/** @type {HTMLElement} */ (e.target).closest(".course-quick-tiers")) return;
    setSelectedCard(selectedCardId === id ? null : id);
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedCard(selectedCardId === id ? null : id);
    }
  });

  card.addEventListener("pointerdown", onCardPointerDown);
  return card;
}

function renderUnranked() {
  const strip = document.getElementById("unranked-pool");
  if (!strip) return;
  strip.innerHTML = "";
  for (const id of unrankedIdsForRender()) {
    const c = courseById[id];
    if (!c) continue;
    strip.appendChild(createCourseCard(c, id));
  }
  updatePoolMeta();
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
      const card = createCourseCard(c, id, { compact: true });
      if (id === selectedCardId) card.classList.add("course-card--selected");
      strip.appendChild(card);
    }
  }
}

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

let dragGhost = null;
let dragId = null;
let dragOffsetX = 0;
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

function onCardPointerDown(e) {
  if (e.button !== 0) return;
  if (/** @type {HTMLElement} */ (e.target).closest(".course-quick-tiers")) return;

  const card = /** @type {HTMLElement} */ (e.currentTarget);
  const id = card.dataset.id;
  if (!id || !courseById[id]) return;

  e.preventDefault();
  dragId = id;
  setSelectedCard(id);
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

function onCardPointerMove(e) {
  if (!dragId || !dragGhost) return;
  e.preventDefault();
  dragGhost.style.left = `${e.clientX - dragOffsetX}px`;
  dragGhost.style.top = `${e.clientY - dragOffsetY}px`;
  document.querySelectorAll(".drop-strip.drop-hover").forEach((el) => el.classList.remove("drop-hover"));
  const strip = findDropStrip(e.clientX, e.clientY);
  if (strip) strip.classList.add("drop-hover");
}

function onCardPointerUp(e) {
  const card = /** @type {HTMLElement} */ (e.currentTarget);
  card.removeEventListener("pointermove", onCardPointerMove);
  card.removeEventListener("pointerup", onCardPointerUp);
  card.removeEventListener("pointercancel", onCardPointerUp);
  card.releasePointerCapture(e.pointerId);
  card.classList.remove("dragging-source");

  const id = dragId;
  clearDragVisual();

  if (!id) return;

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
    const visible = unrankedIdsForRender();
    const idx = getInsertionIndexInStrip(e.clientX, e.clientY, strip, id, null);
    const targetId = visible[idx];
    const fullIdx = targetId ? state.unranked.indexOf(targetId) : state.unranked.length;
    insertAtUnranked(id, fullIdx);
  } else {
    const idx = getInsertionIndexInStrip(e.clientX, e.clientY, strip, id, null);
    insertAt(zone, id, idx);
  }
  saveState();
  setSelectedCard(null);
  render();
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function openDeptDialog() {
  const dlg = /** @type {HTMLDialogElement | null} */ (document.getElementById("dept-dialog"));
  if (!dlg) return;
  renderDeptDialog();
  if (typeof dlg.showModal === "function") dlg.showModal();
}

async function applyDeptDialog() {
  const list = document.getElementById("dept-checklist");
  if (!list) return;
  const selected = [...list.querySelectorAll('input[type="checkbox"]:checked')].map(
    (el) => /** @type {HTMLInputElement} */ (el).value
  );
  if (!selected.length) {
    alert("Pick at least one department.");
    return;
  }

  const prev = new Set(settings.enabledDepts);
  settings.enabledDepts = selected.sort();
  if (settings.deptFilter && !settings.enabledDepts.includes(settings.deptFilter)) {
    settings.deptFilter = null;
  }
  saveSettings();

  const newOnes = settings.enabledDepts.filter((d) => !prev.has(d));
  if (newOnes.length) {
    setLoadStatus(`Loading ${newOnes.length} new department${newOnes.length === 1 ? "" : "s"}…`);
    await loadDepartments(newOnes);
  }

  rebuildCourses();
  saveState();
  renderDeptFilterRow();
  render();
  updateDeptButtonLabel();
  setLoadStatus(`${COURSES.length} courses ready · ${settings.enabledDepts.length} departments`);
}

function updateDeptButtonLabel() {
  const btn = document.getElementById("btn-depts");
  if (btn) btn.textContent = `Departments (${settings.enabledDepts.length})`;
}

function wireTierLabelClicks() {
  document.querySelectorAll(".tier-drop-target").forEach((el) => {
    el.addEventListener("click", () => {
      if (!selectedCardId) return;
      const tier = /** @type {HTMLElement} */ (el).dataset.tier;
      if (tier) moveCourseToTier(selectedCardId, tier);
    });
  });
}

function wireControls() {
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Reset all courses to the pool? Tier placements will be cleared.")) {
      state = defaultState();
      saveState();
      setSelectedCard(null);
      render();
    }
  });

  document.getElementById("btn-depts")?.addEventListener("click", openDeptDialog);
  document.getElementById("dept-dialog-close")?.addEventListener("click", () => {
    document.getElementById("dept-dialog")?.close();
  });

  document.getElementById("dept-search")?.addEventListener("input", renderDeptDialog);

  document.getElementById("dept-select-defaults")?.addEventListener("click", () => {
    const list = document.getElementById("dept-checklist");
    if (!list) return;
    list.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      /** @type {HTMLInputElement} */ (el).checked = DEFAULT_ENABLED_DEPTS.includes(/** @type {HTMLInputElement} */ (el).value);
    });
  });

  document.getElementById("dept-preset-stem")?.addEventListener("click", () => {
    const list = document.getElementById("dept-checklist");
    if (!list) return;
    const stem = new Set([...DEFAULT_ENABLED_DEPTS, "MATH", "MAE"]);
    list.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      /** @type {HTMLInputElement} */ (el).checked = stem.has(/** @type {HTMLInputElement} */ (el).value);
    });
  });

  document.getElementById("dept-select-all")?.addEventListener("click", () => {
    document.getElementById("dept-checklist")?.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      /** @type {HTMLInputElement} */ (el).checked = true;
    });
  });

  document.getElementById("dept-select-none")?.addEventListener("click", () => {
    document.getElementById("dept-checklist")?.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      /** @type {HTMLInputElement} */ (el).checked = false;
    });
  });

  document.querySelector("#dept-dialog form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await applyDeptDialog();
    document.getElementById("dept-dialog")?.close();
  });

  document.getElementById("pool-search")?.addEventListener("input", (e) => {
    poolSearchQuery = /** @type {HTMLInputElement} */ (e.target).value.trim().toLowerCase();
    renderUnranked();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSelectedCard(null);
  });

  wireTierLabelClicks();
}

async function init() {
  if (typeof CATALOG_INDEX === "undefined") {
    setLoadStatus("Missing catalog-index.js — open index.html from the UCSD-Tier-List folder.", true);
    return;
  }

  settings = loadSettings();
  wireControls();

  try {
    await loadDepartments(settings.enabledDepts);
  } catch (err) {
    setLoadStatus(err instanceof Error ? err.message : "Failed to load catalog.", true);
    return;
  }

  COURSES = buildCourseList();
  if (!COURSES.length) {
    setLoadStatus("No courses loaded. Open Departments and select at least one.", true);
    return;
  }

  courseById = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  state = loadState();
  renderDeptFilterRow();
  updateDeptButtonLabel();
  render();
  setLoadStatus(`${COURSES.length} courses · drag or tap S–F on cards · tiers stay pinned while you scroll the pool`);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init().catch((e) => setLoadStatus(String(e), true));
  });
} else {
  init().catch((e) => setLoadStatus(String(e), true));
}
