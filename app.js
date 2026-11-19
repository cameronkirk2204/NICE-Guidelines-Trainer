/* Pathways trainer: home, walk-a-case, map, quick-fire, progress. Offline, no dependencies. */
(function(){
const PW = window.PATHWAYS || [];
const PWMAP = {}; PW.forEach(p => PWMAP[p.id] = p);
const SOON = [
  {n:"Pulmonary embolism",c:"#e07a5f"},{n:"DVT",c:"#e07a5f"},{n:"Advanced life support",c:"#c2302b"},
  {n:"Acute asthma",c:"#4f8fe0"},{n:"Anaphylaxis",c:"#8b6fd6"},{n:"Sepsis 6",c:"#b7791f"}];

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
function refHTML(n, pw){ pw = pw || CURPW; return (n.ref && pw && pw.refUrl) ? `<a class="ref" href="${pw.refUrl}" target="_blank" rel="noopener">${pw.refName} · ${n.ref} ↗</a>` : ""; }
function dgHTML(n, pw){ pw = pw || CURPW; if (!n.dg || !pw || !pw.diagrams) return ""; return n.dg.map(id => { const d = pw.diagrams.find(x => x.id === id); return d ? `<div class="dg"><div class="lbl">${d.t}</div>${d.svg}</div>` : ""; }).join(""); }
function notesHTML(n){
  let h = "";
  if (n.why) h += `<b>Why?</b>${n.why}`;
  if (n.flag) h += `<b>Red flag</b>${n.flag}`;
  h += dgHTML(n) + refHTML(n);
  return h ? `<div class="notes">${h}</div>` : "";
}
function nodeBox(n, extra){
  const has = n.why || n.flag || n.dg || n.ref;
  const b = el(`<div class="n ${n.kind} ${extra||""}">${has?'<span class="i">ⓘ</span>':""}${n.t}${n.s?`<small>${n.s}</small>`:""}${notesHTML(n)}</div>`);
  if (has) b.onclick = e => { if (e.target.closest("a")) return; b.classList.toggle("open"); };
  return b;
}

/* ---------- shell ---------- */
const bar = document.getElementById("bar"), main = document.getElementById("main");
function setBar(title, back, meta){
  bar.innerHTML = `${back?'<button class="back" aria-label="Back">‹</button>':""}<h1>${title}</h1>${meta?`<span class="meta">${meta}</span>`:""}`;
  if (back) bar.querySelector(".back").onclick = () => { location.hash = back; };
}
function scrollEnd(){ requestAnimationFrame(() => window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"})); }
function route(){
  const h = location.hash.replace(/^#/, "");
  const parts = h.split("-");
  window.scrollTo(0, 0);
  if (!h || h === "home") return home();
  if (h === "today") return quick(null);
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

/* ---------- home ---------- */
function home(){
  const s = streak();
  setBar("Pathways", null, s ? `🔥 ${s} day${s>1?"s":""}` : "");
  const due = PW.reduce((a, p) => a + dueCount(p), 0);
  let abx = ""; try { const a = JSON.parse(localStorage.getItem("abx-trainer")||"null"); if (a && a.total) abx = `${Math.round(100*a.right/a.total)}% right · ${a.total} answered`; } catch(e){}
  main.innerHTML = "";
  main.appendChild(el(`<div class="card"><div class="lbl">Today</div>
    <div class="big">${due ? due+" step"+(due>1?"s":"")+" due" : "Nothing due"}</div>
    <div class="note">${due ? "Quick-fire through the steps you're due to see again." : "Walk a case to put new steps into rotation."}</div>
    ${due ? '<a class="btn" href="#today" style="margin-top:12px">Start quick-fire</a>' : ""}</div>`));
  const tiles = el(`<div class="tiles"></div>`);
  PW.forEach(p => {
    const m = mastery(p);
    tiles.appendChild(el(`<a class="tile" href="#${p.id}"><span class="ring">${ring(m, p.color)}</span><span class="tag" style="background:${p.color}">${p.tag}</span><span class="tn">${p.title}</span><span class="ts">${endsSeen(p)}/${endsOf(p).length} routes seen</span></a>`));
  });
  tiles.appendChild(el(`<a class="tile" href="abx.html"><span class="tag" style="background:#4fae73">Micro</span><span class="tn">Antibiotics</span><span class="ts">${abx || "Coverage, classes, mechanisms"}</span></a>`));
  SOON.forEach(x => tiles.appendChild(el(`<div class="tile soon"><span class="tag" style="background:${x.c}">Soon</span><span class="tn">${x.n}</span><span class="ts">Coming next</span></div>`)));
  main.appendChild(tiles);
  main.appendChild(el(`<div style="margin-top:18px"><a class="btn alt" href="#backup">Back up or restore progress</a></div>`));
  main.appendChild(el(`<p class="note" style="margin-top:14px">For learning, not prescribing. Based on NICE and Resuscitation Council UK guidance; always check your local guidelines.</p>`));
}

/* ---------- pathway hub ---------- */
function pathway(pw){
  setBar(pw.title, "home");
  const m = mastery(pw), due = dueCount(pw), its = items(pw);
  const seen = its.filter(it => P.items[it.key]).length;
  main.innerHTML = "";
  main.appendChild(el(`<div class="card" style="display:flex;gap:14px;align-items:center">${ring(m, pw.color, 64)}<div><div class="big" style="font-size:18px">${pw.title}</div><div class="note">${pw.blurb}</div></div></div>`));
  main.appendChild(el(`<div class="stat"><div><b>${endsSeen(pw)}/${endsOf(pw).length}</b><span>routes seen</span></div><div><b>${seen}/${its.length}</b><span>steps tried</span></div><div><b>${due}</b><span>due now</span></div></div>`));
  const nh = pw.cases.filter(c => c.hard).length, nn = pw.cases.length - nh;
  main.appendChild(el(`<a class="btn" href="#${pw.id}-walk">Walk a case <span style="opacity:.6;font-weight:400">· ${nn}</span></a>`));
  if (nh) main.appendChild(el(`<a class="btn" href="#${pw.id}-hard" style="margin-top:8px;background:#c2302b;color:#fff">Hard cases <span style="opacity:.75;font-weight:400">· ${nh}</span></a>`));
  const r = el(`<div class="row" style="margin-top:8px"><a class="btn alt" href="#${pw.id}-learn">Learn</a><a class="btn alt" href="#${pw.id}-quick">Quick-fire</a><a class="btn alt" href="#${pw.id}-map">Map</a></div>`);
  main.appendChild(r);
  main.appendChild(el(`<p class="note" style="margin-top:14px"><b>Walk a case</b> starts from a patient and builds the tree as you go. <b>Learn</b> lets you explore any branch with no marking. <b>Quick-fire</b> drills single steps out of order. <b>Map</b> shows the whole tree, coloured by how well you know each step.</p>`));
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
  const twists = cs ? (cs.twists || (cs.twist ? [cs.twist] : [])) : []; const twDone = {};
  main.innerHTML = "";
  let right = 0, total = 0, steps = 0, cur = pw.root;
  if (cs){
    const v = cs.v;
    main.appendChild(el(`<div class="case"><div class="lbl">Patient</div><div class="who">${v.who}</div><div class="hx">${v.hx}</div>${v.obs?`<div class="obs">${v.obs}</div>`:""}${v.inv?`<div class="inv">${v.inv}</div>`:""}</div>`));
  } else {
    main.appendChild(el(`<div class="card"><div class="lbl">Learn mode</div><div class="note">No marking. Tap to reveal each step, pick any branch at a fork, and tap a box with ⓘ for the why. Go back and take the other branch whenever you like.</div></div>`));
  }
  const tree = el(`<div></div>`); main.appendChild(tree);
  const btn = el(`<button class="btn reveal">Tap to reveal ↓</button>`); main.appendChild(btn);
  const meta = () => { bar.querySelector(".meta") ? bar.querySelector(".meta").textContent = learn ? `${steps} steps` : `${right}/${total}` : bar.appendChild(el(`<span class="meta">${learn?steps+" steps":right+"/"+total}</span>`)); };
  meta();
  const line = () => { if (tree.children.length) tree.appendChild(el(`<div class="ln"></div>`)); };

  function afterNode(n, box){
    meta();
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
      afterNode(n, box); scrollEnd();
    }; wrap.appendChild(b); });
    scrollEnd();
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
        if (!ok){ f.children[correct].classList.add("ok"); f.classList.add("shake"); go = correct;
          const hint = (cs.hints && cs.hints[forkId]) || "";
          tree.appendChild(el(`<div class="fb">For this patient it's <b>${n.fork[correct].l}</b>.${hint?" "+hint:""}</div>`)); }
        else if (cs.hints && cs.hints[forkId]) tree.appendChild(el(`<div class="note" style="text-align:center;margin-top:6px">${cs.hints[forkId]}</div>`));
      } else b.classList.add("ok");
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
    line();
    const ph = el(`<div class="n hid">?</div>`); tree.appendChild(ph);
    const card = el(`<div class="ask"><div class="q">${(cs && cs.askq && cs.askq[cur]) || a.q}</div></div>`); tree.appendChild(card);
    btn.style.display = "none";
    const opts = shuffle(a.o.map((o, i) => ({o, i}))); let done = false; const id = cur;
    opts.forEach(({o, i}) => { const b = el(`<button class="opt">${o}</button>`); b.onclick = () => {
      if (done) return; done = true; const ok = i === ans; total++; if (ok) right++;
      grade(`${pw.id}:${id}?`, ok);
      b.classList.add(ok ? "ok" : "bad"); if (!ok) card.children[1 + opts.findIndex(x => x.i === ans)].classList.add("ok");
      setTimeout(() => { card.remove(); const box = nodeBox(n); ph.replaceWith(box); steps++; afterNode(n, box); scrollEnd(); }, ok ? 450 : 1300);
    }; card.appendChild(b); });
    scrollEnd();
  }
  function reveal(){
    const n = pw.nodes[cur];
    if (n.ask && !learn) return ask(n);
    line(); const box = nodeBox(n); tree.appendChild(box); steps++;
    afterNode(n, box); scrollEnd();
  }
  function finish(n){
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
  function render(id){
    const n = pw.nodes[id];
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
    det.innerHTML = ""; det.appendChild(el(`<div class="card" style="animation:pop .25s"><div class="lbl">${word}</div><div style="font-weight:700;font-size:16px">${n.t}</div>${n.s?`<div class="note" style="margin-top:2px">${n.s}</div>`:""}${n.why?`<div class="fb"><b>Why?</b> ${n.why}</div>`:""}${n.flag?`<div class="fb" style="background:var(--flbg);color:var(--fl)"><b>Red flag</b> ${n.flag}</div>`:""}${dgHTML(n, pw)}${n.ref?`<div style="margin-top:10px">${refHTML(n, pw)}</div>`:""}</div>`));
  };
  main.appendChild(el(`<p class="note">Tap any box for its notes. Pinch or use − / + to zoom, and scroll sideways on a small screen.</p>`));
}

/* ---------- quick-fire ---------- */
function crumbs(pw, id){
  return pathTo(pw, id).map(x => `<span>${pw.nodes[x.id].t}${x.l ? "" : ""}</span>${x.l ? " → <b>" + x.l + "</b>" : ""}`).join(" → ");
}
function buildQ(it){
  const pw = it.pw, n = pw.nodes[it.node];
  if (it.type === "ask"){
    return {it, ctx: crumbs(pw, it.node), q: n.ask.q, opts: n.ask.o, a: n.ask.a, after: n};
  }
  const to = pw.nodes[n.fork[it.i].to];
  const pool = [...new Set(Object.values(pw.nodes).filter(x => (x.kind === "ac" || x.kind === "en") && x.t !== to.t).map(x => x.t))];
  const opts = [to.t].concat(shuffle(pool).slice(0, 3));
  return {it, ctx: crumbs(pw, it.node), q: `${n.t} <b>${n.fork[it.i].l}</b>. What next?`, opts, a: 0, after: to};
}
function quick(pw){
  const pws = pw ? [pw] : PW;
  setBar(pw ? "Quick-fire · " + pw.short : "Today", pw ? pw.id : "home");
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
      card.appendChild(el(`<div class="fb"><b>${n.t}</b>${n.s?` · ${n.s}`:""}${n.why?`<div style="margin-top:6px">${n.why}</div>`:""}</div>`));
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
  setBar("Back up progress", "home");
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
