/* Critical Care Companion: home, walk-a-case, map, quick-fire, progress. Offline, no dependencies. */
(function(){
const PW = window.PATHWAYS || [];
PW.forEach(p => { const fw = (window.FORK_WHY||{})[p.id] || {}, nw = (window.NODE_WHY||{})[p.id] || {};
  const mw = (window.MECH||{})[p.id] || {};
  for (const [id, n] of Object.entries(p.nodes)){ if (mw[id]) n.mech = mw[id]; if (n.fork && fw[id]) n.fork.forEach((f, i) => { if (fw[id][i]) f.w = fw[id][i]; }); if (!n.why && nw[id]) n.why = nw[id]; } });
const PWMAP = {}; PW.forEach(p => PWMAP[p.id] = p);


/* ---------- storage ---------- */
const KEY = "gt-progress-v1";
let P = {items:{}, ends:{}, cases:{}, days:[], v:1};
try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.items) P = Object.assign(P, s); } catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(P)); } catch(e){} }
function today(){ const d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function touch(){ const t = today(); if (P.days[P.days.length-1] !== t){ P.days.push(t); if (P.days.length > 400) P.days = P.days.slice(-400); } }
function streak(){
  let n = 0; const d = new Date();
  for (let i = 0; i < 400; i++){
    const k = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    if (P.days.includes(k)) n++; else if (i > 0) break;
    d.setDate(d.getDate()-1);
  }
  return n;
}
const IV = [0, 10*60e3, 864e5, 3*864e5, 8*864e5, 21*864e5];
function grade(key, ok){
  const it = P.items[key] || {b:0, d:0, n:0, w:0};
  it.n++; it.t = Date.now();
  if (ok){ it.b = Math.min(5, it.b+1); it.d = Date.now() + IV[it.b]; }
  else { it.b = 0; it.w++; it.d = Date.now(); }
  P.items[key] = it; touch(); save();
}

/* ---------- pathway helpers ---------- */
function items(pw){
  const out = [];
  for (const [id, n] of Object.entries(pw.nodes)){
    if (n.ask) out.push({pw, key:`${pw.id}:${id}?`, type:"ask", node:id});
    if (n.fork) n.fork.forEach((f, i) => out.push({pw, key:`${pw.id}:${id}>${i}`, type:"edge", node:id, i}));
    if (n.mech) out.push({pw, key:`${pw.id}:${id}!`, type:"mech", node:id});
  }
  return out;
}
function mastery(pw){ const its = items(pw); if (!its.length) return 0; return its.reduce((a, it) => a + ((P.items[it.key]||{}).b||0), 0) / (its.length*5); }
function endsOf(pw){ return Object.keys(pw.nodes).filter(id => !pw.nodes[id].fork && !pw.nodes[id].next); }
function endsSeen(pw){ return endsOf(pw).filter(id => P.ends[pw.id+":"+id]).length; }
function parentMap(pw){
  const m = {};
  for (const [id, n] of Object.entries(pw.nodes)){
    if (n.next) m[n.next] = {p:id};
    if (n.fork) n.fork.forEach((f, i) => m[f.to] = {p:id, i, l:f.l});
  }
  return m;
}
function pathTo(pw, id){ const m = parentMap(pw), out = []; let c = id; while (m[c]){ out.unshift({id:m[c].p, l:m[c].l}); c = m[c].p; } return out; }
function nodeStatus(pw, id){
  const n = pw.nodes[id]; const keys = [];
  if (n.ask) keys.push(`${pw.id}:${id}?`);
  if (n.mech) keys.push(`${pw.id}:${id}!`);
  if (n.fork) n.fork.forEach((f, i) => keys.push(`${pw.id}:${id}>${i}`));
  if (!keys.length) return P.ends[pw.id+":"+id] ? "good" : "";
  const st = keys.map(k => P.items[k]);
  if (st.every(s => !s)) return "";
  if (st.some(s => s && s.b === 0)) return "weak";
  if (st.every(s => s && s.b >= 3)) return "good";
  return "ok";
}
function dueCount(pw){ const now = Date.now(); return items(pw).filter(it => { const s = P.items[it.key]; return s && s.d <= now; }).length; }
function shuffle(a){ a = a.slice(); for (let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function el(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function ring(frac, col, size){
  size = size || 40; const r = size/2 - 4, c = 2*Math.PI*r, pct = Math.round(frac*100);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-label="${pct}% mastered"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c*frac} ${c}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size/3.6}" font-weight="700" fill="var(--ink)">${pct}</text></svg>`;
}
let CURPW = null;
function refHTML(n, pw){ pw = pw || CURPW; if (!n.ref || !pw) return ""; const r = typeof n.ref === "string" ? {s:n.ref} : n.ref; const url = r.url || pw.refUrl, name = r.name || pw.refName; return url ? `<a class="ref" href="${url}" target="_blank" rel="noopener">${name} · ${r.s} ↗</a>` : ""; }
function dgHTML(n, pw){ pw = pw || CURPW; if (!n.dg || !pw || !pw.diagrams) return ""; return n.dg.map(id => { const d = pw.diagrams.find(x => x.id === id); return d ? `<div class="dg"><div class="lbl">${d.t}</div>${d.svg}</div>` : ""; }).join(""); }
function notesHTML(n){
  let h = "";
  if (n.why) h += `<b>Why?</b>${n.why}`;
  if (n.flag) h += `<b>Red flag</b>${n.flag}`;
  h += dgHTML(n) + refHTML(n);
  return h ? `<div class="notes">${h}</div>` : "";
}
function nodeBox(n, extra, hide){
  if (hide) return el(`<div class="n ${n.kind} ${extra||""}">${n.t}${n.s?`<small class="pend">Answer the twist to see the details</small>`:""}</div>`);
  const has = n.why || n.flag || n.dg || n.ref;
  const b = el(`<div class="n ${n.kind} ${extra||""}">${has?'<span class="i">ⓘ</span>':""}${n.t}${n.s?`<small>${n.s}</small>`:""}${notesHTML(n)}</div>`);
  if (has) b.onclick = e => { if (e.target.closest("a")) return; b.classList.toggle("open"); };
  return b;
}

/* ---------- shell ---------- */
const bar = document.getElementById("bar"), main = document.getElementById("main");
function setBar(title, back, meta, top){
  bar.className = "bar" + (top ? " top" : "");
  bar.innerHTML = `${back?'<button class="back" aria-label="Back">‹</button>':(top?'<span class="logo">'+ico("acs",18)+'</span>':"")}<h1>${title}</h1>${meta?`<span class="meta">${meta}</span>`:""}`;
  if (back) bar.querySelector(".back").onclick = () => { location.hash = back; };
  if (!top && typeof tabbar === "function") tabbar(null);
}
function scrollEnd(){ requestAnimationFrame(() => window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"})); }
function route(){
  const h = location.hash.replace(/^#/, "");
  const parts = h.split("-");
  window.scrollTo(0, 0);
  if (!h || h === "home") return home();
  if (h === "today") return quick(null);
  if (h === "progress") return progress();
  if (h === "backup") return backup();
  const pw = PWMAP[parts[0]];
  if (!pw) return home();
  CURPW = pw;
  if (parts[1] === "walk") return walk(pw, false);
  if (parts[1] === "hard") return walk(pw, false, true);
  if (parts[1] === "learn") return walk(pw, true);
  if (parts[1] === "map") return map(pw);
  if (parts[1] === "quick") return quick(pw);
  return pathway(pw);
}
window.addEventListener("hashchange", route);

const ICON = {
  acs:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M5 12h3l1.5-2.5 2.5 5 1.5-2.5H19"/>',
  pe:'<path d="M12 3v8"/><path d="M12 11c-1.5 0-2.5 1-3.5 2.5S6.5 20 4.5 20 3 14 4 10s3-6 5-6"/><path d="M12 11c1.5 0 2.5 1 3.5 2.5s2 6.5 4 6.5 1.5-6 .5-10-3-6-5-6"/>',
  asthma:'<path d="M12 3v8"/><path d="M12 11c-1.5 0-2.5 1-3.5 2.5S6.5 20 4.5 20 3 14 4 10s3-6 5-6"/><path d="M12 11c1.5 0 2.5 1 3.5 2.5s2 6.5 4 6.5 1.5-6 .5-10-3-6-5-6"/><path d="M8 9l-2 2M16 9l2 2"/>',
  als:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  anaph:'<path d="M18 2l4 4M17 7l3-3M19 9l-9 9-4 1 1-4 9-9zM5 19l-3 3M14 6l4 4"/>',
  sepsis:'<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
  dvt:'<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  vte:'<path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',
  abx:'<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'
};
const ico = (id, size) => `<svg class="ico" width="${size||22}" height="${size||22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[id]||ICON.abx}</svg>`;
const GROUPS = [
  {n:"Resus and the sick patient", ids:["als","anaph","sepsis"]},
  {n:"Cardiac and respiratory", ids:["acs","pe","asthma"]},
  {n:"Clots", ids:["dvt","vte"]},
  {n:"Microbiology", ids:["abx"]}
];
const ECG = `<svg class="ecg" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34h70l8-10 8 10h20l6 4 8-30 9 44 7-18h22l10-8 12 8h60l8-10 8 10h20l6 4 8-30 9 44 7-18h22l10-8 12 8h34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
function abxStats(){ try { const a = JSON.parse(localStorage.getItem("abx-trainer")||"null"); if (a && a.total) return a; } catch(e){} return null; }
function tabbar(active){
  let t = document.getElementById("tabs");
  if (!t){ t = el(`<nav id="tabs" class="tabs"></nav>`); document.body.appendChild(t); }
  const tabs = [["home","Home",'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],["today","Today",'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],["progress","Progress",'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],["backup","Backup",'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>']];
  t.innerHTML = tabs.map(([h, l, p]) => `<a href="#${h}" class="${active === h ? "on" : ""}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg><span>${l}</span></a>`).join("");
  t.style.display = active ? "" : "none";
}

/* ---------- home ---------- */
function home(){
  const s = streak();
  setBar("Critical Care Companion", null, "", true);
  tabbar("home");
  const due = PW.reduce((a, p) => a + dueCount(p), 0);
  const all = PW.reduce((a, p) => a + mastery(p), 0) / (PW.length || 1);
  const hr = new Date().getHours(), greet = hr < 12 ? "Morning" : hr < 18 ? "Afternoon" : "Evening";
  main.innerHTML = "";
  main.appendChild(el(`<div class="hero"><div class="hero-top"><div><div class="hero-k">${greet}</div><div class="hero-t">Ready for the next case?</div></div><div class="hero-ring">${ring(all, "#ffffff", 58)}</div></div>
    <div class="hero-stats"><div><b>${s}</b><span>day streak</span></div><div><b>${due}</b><span>due today</span></div><div><b>${PW.reduce((a,p)=>a+endsSeen(p),0)}/${PW.reduce((a,p)=>a+endsOf(p).length,0)}</b><span>routes seen</span></div></div>
    ${due ? `<a class="hero-btn" href="#today">Start today's quick-fire →</a>` : `<a class="hero-btn" href="#${(PW.slice().sort((a,b)=>mastery(a)-mastery(b))[0]||{}).id}-walk">Walk a case in your weakest topic →</a>`}${ECG}</div>`));
  GROUPS.forEach(g => {
    main.appendChild(el(`<div class="sec">${g.n}</div>`));
    const tiles = el(`<div class="tiles"></div>`);
    g.ids.forEach(id => {
      if (id === "abx"){ const a = abxStats(); tiles.appendChild(el(`<a class="tile" href="abx.html" style="--c:#2f9e6b"><span class="ti">${ico("abx")}</span><span class="tn">Antibiotics</span><span class="ts">${a ? Math.round(100*a.right/a.total)+"% right · "+a.total+" answered" : "Coverage, classes and mechanisms"}</span><span class="tbar"><i style="width:${a?Math.round(100*a.right/a.total):0}%"></i></span></a>`)); return; }
      const p = PWMAP[id]; if (!p) return;
      const m = mastery(p), d = dueCount(p);
      tiles.appendChild(el(`<a class="tile" href="#${p.id}" style="--c:${p.color}"><span class="ti">${ico(p.id)}</span>${d?`<span class="due">${d}</span>`:""}<span class="tn">${p.title}</span><span class="ts">${endsSeen(p)}/${endsOf(p).length} routes · ${p.cases.length} cases</span><span class="tbar"><i style="width:${Math.round(m*100)}%"></i></span></a>`));
    });
    main.appendChild(tiles);
  });
  main.appendChild(el(`<p class="note" style="margin-top:20px;text-align:center">For learning, not prescribing. Built on NICE, RCUK and BTS/SIGN guidance; always check your local guidelines.</p>`));
}

/* ---------- progress ---------- */
function progress(){
  setBar("Progress", null, "", true); tabbar("progress");
  main.innerHTML = "";
  const s = streak(), days = [];
  for (let i = 13; i >= 0; i--){ const d = new Date(); d.setDate(d.getDate() - i); const k = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); days.push([k, P.days.includes(k), "MTWTFSS"[(d.getDay()+6)%7]]); }
  main.appendChild(el(`<div class="card"><div class="lbl">Last two weeks</div><div class="days">${days.map(([k, on, l]) => `<div class="${on?"on":""}"><i></i><span>${l}</span></div>`).join("")}</div><div class="note" style="margin-top:8px">${s ? `${s}-day streak. Keep it going.` : "Do one case today to start a streak."}</div></div>`));
  const c = el(`<div class="card"><div class="lbl">Mastery by topic</div></div>`);
  PW.forEach(p => { const m = mastery(p); c.appendChild(el(`<a class="prow" href="#${p.id}" style="--c:${p.color}"><span class="ti sm">${ico(p.id, 18)}</span><span class="pn">${p.short}</span><span class="pbar"><i style="width:${Math.round(m*100)}%"></i></span><b>${Math.round(m*100)}%</b></a>`)); });
  const a = abxStats(); c.appendChild(el(`<a class="prow" href="abx.html" style="--c:#2f9e6b"><span class="ti sm">${ico("abx", 18)}</span><span class="pn">Antibiotics</span><span class="pbar"><i style="width:${a?Math.round(100*a.right/a.total):0}%"></i></span><b>${a?Math.round(100*a.right/a.total)+"%":"–"}</b></a>`));
  main.appendChild(c);
  const weak = [];
  PW.forEach(p => items(p).forEach(it => { const st = P.items[it.key]; if (st && st.w) weak.push({p, it, st}); }));
  weak.sort((x, y) => (x.st.b - y.st.b) || (y.st.w - x.st.w));
  const w = el(`<div class="card"><div class="lbl">Steps you miss most</div></div>`);
  if (!weak.length) w.appendChild(el(`<div class="note">Nothing yet. Steps you get wrong will show up here.</div>`));
  weak.slice(0, 8).forEach(({p, it, st}) => { const n = p.nodes[it.node]; const lab = it.type === "edge" ? `${n.t} → ${n.fork[it.i].l}` : n.t; w.appendChild(el(`<a class="wrow" href="#${p.id}-quick"><span class="wdot" style="background:${p.color}"></span><span><b>${lab}</b><small>${p.short} · missed ${st.w}×</small></span></a>`)); });
  if (weak.length) w.appendChild(el(`<a class="btn" href="#today" style="margin-top:12px">Drill what's due</a>`));
  main.appendChild(w);
}

/* ---------- pathway hub ---------- */
function pathway(pw){
  setBar(pw.short, "home");
  const m = mastery(pw), due = dueCount(pw), its = items(pw);
  const seen = its.filter(it => P.items[it.key]).length;
  main.innerHTML = "";
  main.appendChild(el(`<div class="phero" style="--c:${pw.color}"><div class="phero-i">${ico(pw.id, 30)}</div><div style="flex:1"><div class="phero-t">${pw.title}</div><div class="phero-b">${pw.blurb}</div></div><div>${ring(m, "#ffffff", 56)}</div></div>`));
  main.appendChild(el(`<div class="stat"><div><b>${endsSeen(pw)}/${endsOf(pw).length}</b><span>routes seen</span></div><div><b>${seen}/${its.length}</b><span>steps tried</span></div><div><b>${due}</b><span>due now</span></div></div>`));
  const nh = pw.cases.filter(c => c.hard).length, nn = pw.cases.length - nh;
  main.appendChild(el(`<a class="btn" href="#${pw.id}-walk">Walk a case <span style="opacity:.6;font-weight:400">· ${nn}</span></a>`));
  if (nh) main.appendChild(el(`<a class="btn hard" href="#${pw.id}-hard">Hard cases <span style="opacity:.75;font-weight:400">· ${nh}</span></a>`));
  const r = el(`<div class="modes"><a href="#${pw.id}-learn"><b>Learn</b><span>explore freely</span></a><a href="#${pw.id}-quick"><b>Quick-fire</b><span>${due ? due + " due" : "single steps"}</span></a><a href="#${pw.id}-map"><b>Map</b><span>whole tree</span></a></div>`);
  main.appendChild(r);
  main.appendChild(el(`<p class="note" style="margin-top:14px;display:none"><b>Walk a case</b> starts from a patient and builds the tree as you go. <b>Learn</b> lets you explore any branch with no marking. <b>Quick-fire</b> drills single steps out of order. <b>Map</b> shows the whole tree, coloured by how well you know each step.</p>`));
  if (pw.diagrams && pw.diagrams.length){
    main.appendChild(el(`<div class="lbl" style="margin:20px 2px 8px">Diagrams</div>`));
    pw.diagrams.forEach(d => main.appendChild(el(`<div class="card dg"><div style="font-weight:700;margin-bottom:8px">${d.t}</div>${d.svg}${d.cap?`<div class="note" style="margin-top:8px">${d.cap}</div>`:""}</div>`)));
  }
  if (pw.mnemonics && pw.mnemonics.length){
    main.appendChild(el(`<div class="lbl" style="margin:20px 2px 8px">Mnemonics</div>`));
    pw.mnemonics.forEach(m => main.appendChild(el(`<div class="card mnem"><div style="font-weight:700;font-size:17px">${m.t}</div><div class="note" style="margin-bottom:8px">${m.sub}</div>${m.items.map(([L, x]) => `<div class="mrow"><span class="ml" style="background:${pw.color}">${L}</span><span>${x}</span></div>`).join("")}${m.note?`<div class="note" style="margin-top:8px">${m.note}</div>`:""}</div>`)));
  }
  if (pw.source) main.appendChild(el(`<p class="note" style="margin-top:16px">Cases are written for this app: invented patients built around the guideline. Every step links to the guideline section it comes from.<br>Source: ${pw.refUrl ? `<a href="${pw.refUrl}" target="_blank" rel="noopener">${pw.source}</a>` : pw.source}</p>`));
}

/* ---------- walk a case / learn ---------- */
function pickCase(pw, hard){
  const cs = pw.cases.filter(c => !!c.hard === !!hard);
  const score = c => (P.cases[pw.id+":"+c.id]||0) * 10 + (P.ends[pw.id+":"+caseEnd(pw, c)] ? 5 : 0) + Math.random()*4;
  return cs.slice().sort((a, b) => score(a) - score(b))[0];
}
function caseEnd(pw, c){ let id = pw.root, g = 0; while (g++ < 60){ const n = pw.nodes[id]; if (n.fork) id = n.fork[c.route[id] || 0].to; else if (n.next) id = n.next; else return id; } return id; }

function walk(pw, learn, hard){
  const cs = learn ? null : pickCase(pw, hard);
  setBar(learn ? "Learn · " + pw.short : pw.short + (hard ? " · hard case" : " · case"), pw.id, "");
  const twists = cs ? (cs.twists || (cs.twist ? [cs.twist] : [])) : []; const twDone = {}; const fdDone = {};
  const twPending = () => twists.some((t, k) => t.at === cur && !twDone[k]);
  function find(id){ if (!cs || !cs.find || !cs.find[id] || fdDone[id]) return; fdDone[id] = 1; tree.appendChild(el(`<div class="res"><div class="lbl">New information</div>${cs.find[id]}</div>`)); }
  main.innerHTML = "";
  let right = 0, total = 0, steps = 0, cur = pw.root;
  if (cs){
    const v = cs.v;
    main.appendChild(el(`<div class="case"><div class="lbl">Patient</div><div class="who">${v.who}</div><div class="hx">${v.hx}</div>${v.obs?`<div class="obs">${v.obs}</div>`:""}${v.inv?`<div class="inv">${v.inv}</div>`:""}<div class="note" style="margin-top:8px">More results appear as you work down the pathway.</div></div>`));
  } else {
    main.appendChild(el(`<div class="card"><div class="lbl">Learn mode</div><div class="note">No marking. Tap to reveal each step, pick any branch at a fork, and tap a box with ⓘ for the why. Go back and take the other branch whenever you like.</div></div>`));
  }
  const tree = el(`<div></div>`); main.appendChild(tree);
  const btn = el(`<button class="btn reveal">Tap to reveal ↓</button>`); main.appendChild(btn);
  const meta = () => { bar.querySelector(".meta") ? bar.querySelector(".meta").textContent = learn ? `${steps} steps` : `${right}/${total}` : bar.appendChild(el(`<span class="meta">${learn?steps+" steps":right+"/"+total}</span>`)); };
  meta();
  const line = () => { if (tree.children.length) tree.appendChild(el(`<div class="ln"></div>`)); };

  const scDone = {};
  function scoreCard(n, done){
    const sc = n.score, truth = new Set(cs.score[cur]), id = cur;
    btn.style.display = "none";
    const card = el(`<div class="ask sc"><div class="q">${sc.name}: tick everything that applies</div><div class="note" style="margin:-4px 0 8px">Use the findings above. ${sc.rule}</div></div>`);
    const picked = new Set();
    sc.items.forEach(([t, pts], k) => { const b = el(`<button class="opt sci"><span>${t}</span><b>${pts > 0 ? "+" : ""}${pts}</b></button>`); b.onclick = () => { if (card.dataset.done) return; picked.has(k) ? picked.delete(k) : picked.add(k); b.classList.toggle("on"); tot.textContent = "Your total: " + fmt(sum(picked)); }; card.appendChild(b); });
    const sum = set => [...set].reduce((a, k) => a + sc.items[k][1], 0);
    const fmt = x => (Math.round(x*10)/10).toString();
    const tot = el(`<div style="font-weight:700;margin:10px 0 2px">Your total: 0</div>`); card.appendChild(tot);
    const go = el(`<button class="btn" style="margin-top:8px">Check my score</button>`); card.appendChild(go);
    go.onclick = () => {
      if (card.dataset.done) return; card.dataset.done = 1; go.remove();
      const ok = picked.size === truth.size && [...picked].every(k => truth.has(k)); total++; if (ok) right++;
      grade(`${pw.id}:${id}#`, ok);
      card.querySelectorAll(".sci").forEach((b, k) => { b.classList.remove("on"); if (truth.has(k) && picked.has(k)) b.classList.add("ok"); else if (truth.has(k)) b.classList.add("miss"); else if (picked.has(k)) b.classList.add("bad"); });
      card.appendChild(el(`<div class="fb">${ok ? "Spot on." : "Not quite."} The score is <b>${fmt(sum(truth))}</b>${ok ? "" : ` (you had ${fmt(sum(picked))})`}. ${sc.rule}<div class="note" style="margin-top:4px">✓ right · + missed · struck = doesn't apply</div></div>`));
      meta(); done(); scrollEnd();
    };
    tree.appendChild(card); scrollEnd();
  }
  function afterNode(n, box){
    meta(); find(cur);
    if (cs && cs.score && cs.score[cur] && n.score && !scDone[cur]){ scDone[cur] = 1; return scoreCard(n, () => afterNode(n, box)); }
    const tw = twists.find((t, k) => t.at === cur && !twDone[k]);
    if (tw){ twDone[twists.indexOf(tw)] = 1; return twist(n, box, tw, twists.indexOf(tw)); }
    if (n.fork) return fork(n, box);
    if (!n.next) return finish(n);
    cur = n.next; btn.style.display = "block"; btn.textContent = "Tap to reveal ↓";
  }
  function twist(n, box, t, ti){
    const card = el(`<div class="twist"><div class="lbl">Twist</div><div style="font-size:15px;line-height:1.45">${t.text}</div></div>`);
    tree.appendChild(card); btn.style.display = "none";
    const opts = shuffle(t.o.map((o, i) => ({o, i})));
    const wrap = el(`<div style="margin-top:6px"></div>`); card.appendChild(el(`<div class="q" style="font-weight:600;margin-top:8px">${t.q}</div>`)); card.appendChild(wrap);
    let done = false;
    opts.forEach(({o, i}) => { const b = el(`<button class="opt">${o}</button>`); b.onclick = () => {
      if (done) return; done = true; const ok = i === t.a; total++; if (ok) right++;
      grade(`${pw.id}:twist:${cs.id}:${ti}`, ok);
      b.classList.add(ok ? "ok" : "bad"); if (!ok) wrap.children[opts.findIndex(x => x.i === t.a)].classList.add("ok");
      card.appendChild(el(`<div class="fb" style="background:transparent;padding:8px 0 0">${t.why}</div>`));
      if (box && box.querySelector(".pend") && !twPending()){ const nb = nodeBox(n); box.replaceWith(nb); box = nb; }
      afterNode(n, box); scrollEnd();
    }; wrap.appendChild(b); });
    scrollEnd();
  }
  function mechCard(n){
    btn.style.display = "none";
    const m = n.mech, id = cur;
    const card = el(`<div class="ask mech"><div class="lbl">Why does it work?</div><div class="q">${m.q}</div></div>`);
    const opts = shuffle(m.o.map((o, i) => ({o, i}))); let done = false;
    opts.forEach(({o, i}) => { const b = el(`<button class="opt">${o}</button>`); b.onclick = () => {
      if (done) return; done = true; const ok = i === m.a; total++; if (ok) right++;
      grade(`${pw.id}:${id}!`, ok); meta();
      b.classList.add(ok ? "ok" : "bad"); if (!ok) card.querySelectorAll(".opt")[opts.findIndex(x => x.i === m.a)].classList.add("ok");
      card.appendChild(el(`<div class="fb">${m.why}</div>`));
      finish(n); scrollEnd();
    }; card.appendChild(b); });
    tree.appendChild(card); scrollEnd();
  }
  function fork(n, box){
    btn.style.display = "none";
    const f = el(`<div class="fork"></div>`); tree.appendChild(f);
    const correct = cs ? (cs.route[cur] ?? 0) : null;
    const forkId = cur; let done = false;
    n.fork.forEach((o, i) => { const b = el(`<button>${o.l}</button>`); b.onclick = () => {
      if (done) return; done = true;
      let go = i;
      if (cs){
        const ok = i === correct; total++; if (ok) right++;
        grade(`${pw.id}:${forkId}>${correct}`, ok);
        b.classList.add(ok ? "ok" : "bad");
        if (!ok){ f.children[correct].classList.add("ok"); f.classList.add("shake"); go = correct; }
        const hint = (cs.hints && cs.hints[forkId]) || "", w = n.fork[correct].w || "";
        tree.appendChild(el(`<div class="fb">${ok ? "" : `For this patient it's <b>${n.fork[correct].l}</b>. `}${hint ? hint + " " : ""}${w ? `<div style="margin-top:${ok&&!hint?0:6}px"><b>Why ${n.fork[correct].l.toLowerCase()}?</b> ${w}</div>` : ""}</div>`));
      } else { b.classList.add("ok"); if (o.w) tree.appendChild(el(`<div class="fb"><b>Why ${o.l.toLowerCase()}?</b> ${o.w}</div>`)); }
      [...f.children].forEach((c, k) => { if (k !== go && k !== i) c.style.opacity = .45; });
      n.fork.forEach((o2, k) => { if (k !== go) tree.appendChild(el(`<div class="ghost">If ${o2.l.toLowerCase()} → ${pw.nodes[o2.to].t}</div>`)); });
      cur = n.fork[go].to; meta();
      btn.style.display = "block"; btn.textContent = "Tap to reveal ↓";
      reveal();
    }; f.appendChild(b); });
    scrollEnd();
  }
  function ask(n){
    const a = n.ask; const ans = (cs && cs.asks && cs.asks[cur] != null) ? cs.asks[cur] : a.a;
    line(); find(cur);
    const ph = el(`<div class="n hid">?</div>`); tree.appendChild(ph);
    const card = el(`<div class="ask"><div class="q">${(cs && cs.askq && cs.askq[cur]) || a.q}</div></div>`); tree.appendChild(card);
    btn.style.display = "none";
    const opts = shuffle(a.o.map((o, i) => ({o, i}))); let done = false; const id = cur;
    opts.forEach(({o, i}) => { const b = el(`<button class="opt">${o}</button>`); b.onclick = () => {
      if (done) return; done = true; const ok = i === ans; total++; if (ok) right++;
      grade(`${pw.id}:${id}?`, ok);
      b.classList.add(ok ? "ok" : "bad"); if (!ok) card.children[1 + opts.findIndex(x => x.i === ans)].classList.add("ok");
      setTimeout(() => { card.remove(); const box = nodeBox(n, "", twPending()); ph.replaceWith(box); steps++; afterNode(n, box); scrollEnd(); }, ok ? 450 : 1300);
    }; card.appendChild(b); });
    scrollEnd();
  }
  function reveal(){
    const n = pw.nodes[cur];
    if (n.ask && !learn) return ask(n);
    line(); const box = nodeBox(n, "", twPending()); tree.appendChild(box); steps++;
    afterNode(n, box); scrollEnd();
  }
  let mechDone = false;
  function finish(n){
    if (n.mech && !mechDone){ mechDone = true; return mechCard(n); }
    P.ends[pw.id+":"+cur] = 1;
    if (cs) P.cases[pw.id+":"+cs.id] = (P.cases[pw.id+":"+cs.id]||0) + 1;
    touch(); save();
    btn.style.display = "none";
    const pct = total ? Math.round(100*right/total) : 100;
    const s = el(`<div class="card" style="margin-top:18px;animation:pop .35s"><div class="lbl">${learn ? "End of this branch" : "Case complete"}</div>
      ${learn ? "" : `<div class="big">${right}/${total} ${pct===100?"· clean run":""}</div>`}
      ${cs && cs.teach ? `<div class="fb">${cs.teach}</div>` : ""}
      <div class="note" style="margin:8px 0 12px">${endsSeen(pw)}/${endsOf(pw).length} routes seen in ${pw.short}.</div>
      <button class="btn" id="again">${learn ? "Start again" : hard ? "Next hard case" : "Next case"}</button>
      <div class="row" style="margin-top:8px"><a class="btn alt" href="#${pw.id}-map">Map</a><a class="btn alt" href="#${pw.id}">Done</a></div></div>`);
    main.appendChild(s);
    s.querySelector("#again").onclick = () => walk(pw, learn, hard);
    scrollEnd();
  }
  btn.onclick = reveal;
}

/* ---------- map ---------- */
function map(pw){
  setBar("Map · " + pw.short, pw.id);
  main.innerHTML = "";
  main.appendChild(el(`<div class="legend"><span><i style="background:var(--ok)"></i>solid</span><span><i style="background:var(--amb)"></i>getting there</span><span><i style="background:var(--bad)"></i>missed last time</span><span><i style="background:var(--line)"></i>not tried</span></div>`));
  const z = el(`<div class="zoom"><button data-z="-">−</button><button data-z="+">+</button><button data-z="0">Fit</button></div>`); main.appendChild(z);
  const wrap = el(`<div class="mapwrap"></div>`);
  const inner = el(`<div style="width:max-content;min-width:100%"></div>`);
  const drawn = {};
  function render(id){
    const n = pw.nodes[id];
    if (drawn[id]) return `<div class="mcol"><div class="mlab" style="border-style:dashed">↪ joins “${n.t}” above</div></div>`;
    drawn[id] = 1;
    let h = `<div class="mcol"><div class="n mn ${n.kind} st-${nodeStatus(pw, id)}" data-id="${id}">${n.t}${n.s?`<small>${n.s}</small>`:""}</div>`;
    if (n.next) h += `<div class="ln"></div>` + render(n.next);
    if (n.fork) h += `<div class="ln"></div><div class="mfork">` + n.fork.map(f => `<div class="mbr"><div class="ln"></div><div class="mlab">${f.l}</div><div class="ln"></div>${render(f.to)}</div>`).join("") + `</div>`;
    return h + `</div>`;
  }
  inner.innerHTML = render(pw.root); wrap.appendChild(inner); main.appendChild(wrap);
  const det = el(`<div class="detail"></div>`); main.appendChild(det);
  let zoom = 1;
  const setZ = v => { zoom = Math.max(.25, Math.min(1.4, v)); inner.style.zoom = zoom; };
  const fit = () => { setZ(1); for (let k = 0; k < 6; k++){ const over = wrap.scrollWidth / wrap.clientWidth; if (over <= 1.01) break; setZ(zoom / over); } wrap.scrollLeft = 0; };
  z.onclick = e => { const b = e.target.closest("button"); if (!b) return; const d = b.dataset.z; if (d === "+") setZ(zoom + .15); else if (d === "-") setZ(zoom - .15); else fit(); };
  setTimeout(() => { setZ(.55); const r = inner.querySelector('[data-id]'); if (r) wrap.scrollLeft = r.offsetLeft * zoom - wrap.clientWidth/2 + r.offsetWidth*zoom/2; }, 30);
  inner.onclick = e => {
    const t = e.target.closest("[data-id]"); if (!t) return;
    const id = t.dataset.id, n = pw.nodes[id];
    inner.querySelectorAll("[data-id]").forEach(x => x.style.outline = "");
    t.style.outline = "2px solid var(--ink)";
    const st = nodeStatus(pw, id);
    const word = {good:"Solid", ok:"Getting there", weak:"Missed last time", "":"Not tried yet"}[st];
    det.innerHTML = ""; det.appendChild(el(`<div class="card" style="animation:pop .25s"><div class="lbl">${word}</div><div style="font-weight:700;font-size:16px">${n.t}</div>${n.s?`<div class="note" style="margin-top:2px">${n.s}</div>`:""}${n.why?`<div class="fb"><b>Why?</b> ${n.why}</div>`:""}${n.fork?n.fork.filter(f=>f.w).map(f=>`<div class="fb"><b>If ${f.l.toLowerCase()}:</b> ${f.w}</div>`).join(""):""}${n.flag?`<div class="fb" style="background:var(--flbg);color:var(--fl)"><b>Red flag</b> ${n.flag}</div>`:""}${dgHTML(n, pw)}${n.ref?`<div style="margin-top:10px">${refHTML(n, pw)}</div>`:""}</div>`));
  };
  main.appendChild(el(`<p class="note">Tap any box for its notes. Pinch or use − / + to zoom, and scroll sideways on a small screen.</p>`));
}

/* ---------- quick-fire ---------- */
function crumbs(pw, id){
  return pathTo(pw, id).map(x => `<span>${pw.nodes[x.id].t}${x.l ? "" : ""}</span>${x.l ? " → <b>" + x.l + "</b>" : ""}`).join(" → ");
}
function buildQ(it){
  const pw = it.pw, n = pw.nodes[it.node];
  if (it.type === "mech") return {it, ctx: crumbs(pw, it.node) + ` → <span>${n.t}</span>`, q: n.mech.q, opts: n.mech.o, a: n.mech.a, after: {t:"Why it works", why: n.mech.why}};
  if (it.type === "ask"){
    return {it, ctx: crumbs(pw, it.node), q: n.ask.q, opts: n.ask.o, a: n.ask.a, after: n};
  }
  const to = pw.nodes[n.fork[it.i].to];
  const pool = [...new Set(Object.values(pw.nodes).filter(x => (x.kind === "ac" || x.kind === "en") && x.t !== to.t).map(x => x.t))];
  const opts = [to.t].concat(shuffle(pool).slice(0, 3));
  return {it, ctx: crumbs(pw, it.node), q: `${n.t} <b>${n.fork[it.i].l}</b>. What next?`, opts, a: 0, after: to, edgeWhy: n.fork[it.i].w};
}
function quick(pw){
  const pws = pw ? [pw] : PW;
  setBar(pw ? "Quick-fire · " + pw.short : "Today", pw ? pw.id : null, "", !pw); if (!pw) tabbar("today");
  const now = Date.now();
  let all = []; pws.forEach(p => all = all.concat(items(p)));
  const due = shuffle(all.filter(it => P.items[it.key] && P.items[it.key].d <= now));
  const unseen = shuffle(all.filter(it => !P.items[it.key]));
  const rest = all.filter(it => P.items[it.key] && P.items[it.key].d > now).sort((a, b) => P.items[a.key].b - P.items[b.key].b);
  let queue = pw ? due.concat(unseen, rest) : due.concat(unseen.slice(0, 4));
  queue = queue.slice(0, 10);
  main.innerHTML = "";
  if (!queue.length){ main.appendChild(el(`<div class="card"><div class="big">All caught up</div><div class="note">Nothing is due. Walk a case to see new steps.</div></div>`)); return; }
  let i = 0, right = 0;
  function show(){
    main.innerHTML = "";
    bar.querySelector(".meta") || bar.appendChild(el(`<span class="meta"></span>`));
    bar.querySelector(".meta").textContent = `${i+1}/${queue.length}`;
    const Q = buildQ(queue[i]);
    const opts = shuffle(Q.opts.map((o, k) => ({o, k})));
    const card = el(`<div class="card"><div class="lbl">${Q.it.pw.short}</div><div class="crumbs">${Q.ctx || "Start of the pathway"}</div><div style="font-size:17px;font-weight:600;line-height:1.35;margin-bottom:6px">${Q.q}</div></div>`);
    main.appendChild(card);
    let done = false;
    opts.forEach(({o, k}) => { const b = el(`<button class="opt">${o}</button>`); b.onclick = () => {
      if (done) return; done = true; const ok = k === Q.a; if (ok) right++;
      grade(Q.it.key, ok);
      b.classList.add(ok ? "ok" : "bad"); if (!ok) card.querySelectorAll(".opt")[opts.findIndex(x => x.k === Q.a)].classList.add("ok");
      const n = Q.after;
      card.appendChild(el(`<div class="fb"><b>${n.t}</b>${n.s?` · ${n.s}`:""}${Q.edgeWhy?`<div style="margin-top:6px">${Q.edgeWhy}</div>`:""}${n.why?`<div style="margin-top:6px">${n.why}</div>`:""}</div>`));
      const nx = el(`<button class="btn" style="margin-top:12px">${i < queue.length-1 ? "Next" : "Finish"}</button>`);
      nx.onclick = () => { i++; if (i < queue.length) show(); else end(); };
      card.appendChild(nx);
    }; card.appendChild(b); });
  }
  function end(){
    main.innerHTML = "";
    main.appendChild(el(`<div class="card"><div class="lbl">Done</div><div class="big">${right}/${queue.length}</div><div class="note">Missed steps come back in about 10 minutes, then spread out as you keep getting them right.</div><a class="btn" style="margin-top:12px" href="#${pw ? pw.id : "home"}">Back</a></div>`));
  }
  show();
}

/* ---------- backup ---------- */
function backup(){
  setBar("Backup", null, "", true); tabbar("backup");
  main.innerHTML = "";
  const data = () => JSON.stringify({gt:P, abx:(function(){ try { return JSON.parse(localStorage.getItem("abx-trainer")||"null"); } catch(e){ return null; } })(), at:new Date().toISOString()});
  const c = el(`<div class="card"><div class="lbl">Why</div><div class="note">Your progress lives on this phone only. If Chrome's site data gets cleared, it goes. Save a backup now and then.</div>
    <button class="btn" id="dl" style="margin-top:12px">Download backup file</button>
    <button class="btn alt" id="cp">Copy backup as text</button>
    <div class="lbl" style="margin-top:18px">Restore</div>
    <label class="btn alt" style="cursor:pointer">Choose backup file<input type="file" id="fi" accept=".json,application/json" style="display:none"></label>
    <textarea id="ta" placeholder="…or paste backup text here" style="width:100%;min-height:90px;margin-top:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);padding:8px;font:12px ui-monospace,monospace"></textarea>
    <button class="btn alt" id="rs">Restore from pasted text</button>
    <div class="note" id="msg" style="margin-top:10px"></div></div>`);
  main.appendChild(c);
  const msg = t => c.querySelector("#msg").textContent = t;
  c.querySelector("#dl").onclick = () => { const b = new Blob([data()], {type:"application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "pathways-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove(); msg("Backup downloaded."); };
  c.querySelector("#cp").onclick = () => { navigator.clipboard.writeText(data()).then(() => msg("Copied. Paste it somewhere safe, like a note to yourself."), () => { c.querySelector("#ta").value = data(); msg("Couldn't copy automatically, so it's in the box above. Select all and copy."); }); };
  const restore = txt => { try { const d = JSON.parse(txt); if (!d.gt || !d.gt.items) throw 0; P = Object.assign({items:{}, ends:{}, cases:{}, days:[], v:1}, d.gt); save(); if (d.abx) localStorage.setItem("abx-trainer", JSON.stringify(d.abx)); msg("Restored."); } catch(e){ msg("That doesn't look like a backup from this app."); } };
  c.querySelector("#fi").onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(restore); };
  c.querySelector("#rs").onclick = () => restore(c.querySelector("#ta").value);
}

route();
})();
