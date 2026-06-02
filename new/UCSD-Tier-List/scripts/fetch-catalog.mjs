#!/usr/bin/env node
/**
 * Fetches all UCSD General Catalog course listings from catalog.ucsd.edu
 * and writes catalog-all.js for the tier list app.
 *
 * Usage: node scripts/fetch-catalog.mjs
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const INDEX_URL = "https://catalog.ucsd.edu/front/courses.html";
const COURSE_PAGE = (code) => `https://catalog.ucsd.edu/courses/${code}.html`;
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "catalog-all.js");
const DEPT_DIR = join(ROOT, "catalog", "depts");

const COURSE_NAME_RE =
  /^([A-Z][A-Z0-9]*)\s+([\d][\dA-Z]*(?:-[A-Z]+(?:-[A-Z]+)?)?)\.\s+(.+?)\s*\(/;

function parseCourseName(html) {
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const m = COURSE_NAME_RE.exec(text);
  if (!m) return null;
  const [, dept, num, title] = m;
  const code = `${dept} ${num}`;
  return {
    id: `${dept}-${num}`,
    code,
    title: title.trim(),
    dept,
  };
}

function extractDeptLinks(html) {
  const codes = new Set();
  const re = /courses\/([A-Z0-9]+)\.html/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    codes.add(m[1].toUpperCase());
  }
  return [...codes].sort();
}

function extractCoursesFromPage(html, expectedDept) {
  const courses = [];
  const re = /<p class="course-name">([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const c = parseCourseName(m[1]);
    if (!c) continue;
    if (expectedDept && c.dept !== expectedDept) continue;
    courses.push(c);
  }
  return courses;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "UCSD-Tier-List/1.0 (personal portfolio)" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function main() {
  console.log("Fetching catalog index…");
  const indexHtml = await fetchText(INDEX_URL);
  const deptCodes = extractDeptLinks(indexHtml);
  console.log(`Found ${deptCodes.length} department pages`);

  /** @type {Record<string, Array<{id:string,code:string,title:string,dept:string}>>} */
  const byDept = {};
  /** @type {Map<string, object>} */
  const byId = new Map();
  let failures = 0;

  for (let i = 0; i < deptCodes.length; i++) {
    const code = deptCodes[i];
    const url = COURSE_PAGE(code);
    process.stdout.write(`\r[${i + 1}/${deptCodes.length}] ${code}   `);
    try {
      const html = await fetchText(url);
      const list = extractCoursesFromPage(html, code);
      if (list.length === 0) {
        const loose = extractCoursesFromPage(html, null);
        byDept[code] = loose;
        for (const c of loose) {
          if (!byId.has(c.id)) byId.set(c.id, c);
        }
      } else {
        byDept[code] = list;
        for (const c of list) {
          if (!byId.has(c.id)) byId.set(c.id, c);
        }
      }
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      failures++;
      console.error(`\n  skip ${code}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${byId.size} courses, ${failures} failed pages.`);

  const all = [...byId.values()].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );

  const body = `/** UCSD General Catalog — auto-generated. Run: node scripts/fetch-catalog.mjs */
var CATALOG_DEPTS = ${JSON.stringify(Object.keys(byDept).sort())};
var CATALOG_BY_DEPT = ${JSON.stringify(byDept)};
var CATALOG_ALL = ${JSON.stringify(all)};
`;

  writeFileSync(OUT, body, "utf8");
  console.log(`Wrote ${OUT} (${(body.length / 1024 / 1024).toFixed(2)} MB)`);

  mkdirSync(DEPT_DIR, { recursive: true });
  for (const [dept, list] of Object.entries(byDept)) {
    if (!list.length) continue;
    writeFileSync(
      join(DEPT_DIR, `${dept}.js`),
      `/** ${dept} — UCSD catalog */\nvar CATALOG_DEPT_${dept} = ${JSON.stringify(list)};\n`,
      "utf8"
    );
  }
  console.log(`Wrote ${Object.keys(byDept).filter((d) => byDept[d].length).length} files to catalog/depts/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
