/* Pulmonary embolism. Diagnosis: NICE NG158 (2020, updated 2023). Risk stratification and reperfusion: ESC 2019. For learning, not prescribing. */
(function(){
const NICE = "https://www.nice.org.uk/guidance/ng158/chapter/Recommendations";
const ESC = {name:"ESC 2019 PE", url:"https://www.acc.org/Latest-in-Cardiology/Articles/2020/07/10/08/44/2019-ESC-Guidelines-for-the-Diagnosis-and-Management-of-Acute-PE"};
const tbl = (rows, foot) => `<table class="wt">${rows.map(([a,b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</table>${foot ? `<div class="wtf">${foot}</div>` : ""}`;

window.VTE_DIAGRAMS = {
  wellspe: {id:"wellspe", t:"2-level PE Wells score", svg: tbl([
    ["Clinical signs and symptoms of DVT","3"],["An alternative diagnosis is less likely than PE","3"],["Heart rate over 100","1.5"],
    ["Immobilised 3+ days or surgery in the last 4 weeks","1.5"],["Previous DVT or PE","1.5"],["Haemoptysis","1"],["Malignancy (treated in last 6 months, or palliative)","1"]],
    "<b>More than 4</b>: PE likely → CTPA. <b>4 or less</b>: PE unlikely → D-dimer first.")},
  wellsdvt: {id:"wellsdvt", t:"2-level DVT Wells score", svg: tbl([
    ["Active cancer (treatment ongoing, within 6 months, or palliative)","1"],["Paralysis, paresis or recent leg plaster","1"],["Bedridden 3+ days, or major surgery within 12 weeks","1"],
    ["Tender along the deep venous system","1"],["Entire leg swollen","1"],["Calf 3 cm+ bigger than the other side","1"],["Pitting oedema in the symptomatic leg","1"],
    ["Collateral superficial (non-varicose) veins","1"],["Previous DVT","1"],["Alternative diagnosis at least as likely","−2"]],
    "<b>2 or more</b>: DVT likely → scan. <b>1 or less</b>: DVT unlikely → D-dimer first.")}
};

(window.PATHWAYS = window.PATHWAYS || []).push({
  id:"pe", title:"Pulmonary embolism", short:"PE", tag:"Resp", color:"#e07a5f",
  blurb:"Wells, D-dimer and CTPA, then how sick is it: massive PE, thrombolysis, embolectomy, or home with a DOAC.",
  source:"NICE NG158 Venous thromboembolic diseases (2020, updated 2023); ESC 2019 acute PE guideline for risk stratification and reperfusion.",
  refUrl:NICE, refName:"NICE NG158",
  root:"susp",
  nodes:{
    susp:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"ac", t:"Suspected PE", s:"history, exam and CXR to look for other causes; check obs",
      flag:"Pregnant or up to 6 weeks postpartum: Wells isn't validated, so follow RCOG guidance instead.", next:"stab"},
    stab:{ref:{s:"High-risk PE definition", ...ESC}, kind:"dq", t:"Haemodynamically unstable?", s:"cardiac arrest, obstructive shock, or SBP <90 for 15+ min",
      why:"Unstable patients skip the Wells and D-dimer route. There's no time, and pre-test probability is already high.",
      fork:[{l:"Yes", to:"udx"}, {l:"No", to:"wells"}]},
    udx:{ref:{s:"Diagnosis in suspected high-risk PE", ...ESC}, kind:"ac", t:"Immediate CTPA if safe to move; bedside echo if not", s:"RV dilatation on echo is enough to treat as PE",
      why:"A normal RV on echo essentially rules out PE as the cause of the shock, so look elsewhere. A big, struggling RV in a shocked patient means treat now.", dg:["signs"], next:"massive"},
    massive:{ref:"Anticoagulation treatment · PE with haemodynamic instability", kind:"dx", t:"High-risk (massive) PE", s:"early mortality over 15%",
      ask:{q:"Massive PE. Which anticoagulant?", o:["Unfractionated heparin infusion","Apixaban","Treatment-dose LMWH","Warfarin"], a:0},
      why:"UFH has a short half-life, you can switch it off, and protamine reverses it. That matters when you're about to give thrombolysis, or might need surgery. It also doesn't depend on the kidneys, which are often failing in shock.",
      dg:["spiral"], next:"ci"},
    ci:{ref:{s:"Reperfusion in high-risk PE", ...ESC}, kind:"dq", t:"Contraindication to thrombolysis?", s:"recent bleed or haemorrhagic stroke, recent major surgery or trauma, active bleeding",
      fork:[{l:"No", to:"lysis"}, {l:"Yes", to:"embol"}]},
    lysis:{ref:"Anticoagulation treatment · PE with haemodynamic instability", kind:"en", t:"Systemic thrombolysis", s:"alteplase; in cardiac arrest give it and keep CPR going 60–90 min",
      why:"Alteplase turns plasminogen into plasmin, which chews up the clot and drops the pulmonary resistance the RV is pushing against. It works within hours, which anticoagulation alone can't. Anticoagulation only stops the clot growing; your own fibrinolysis does the clearing over days.",
      flag:"If thrombolysis fails: catheter-directed therapy or surgical embolectomy."},
    embol:{ref:{s:"Reperfusion in high-risk PE", ...ESC}, kind:"en", t:"Surgical embolectomy or catheter-directed therapy", s:"also if thrombolysis has failed",
      why:"Pulmonary embolectomy (or endarterectomy) is the acute operation to pull out fresh clot. Don't mix it up with pulmonary thromboendarterectomy (PTE), the planned operation for chronic thromboembolic pulmonary hypertension (CTEPH), months after the PE."},
    wells:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"dq", t:"2-level PE Wells score above 4?", dg:["wellspe"],
      fork:[{l:"Yes", to:"ctpa"}, {l:"No", to:"dd"}]},
    dd:{ref:"Diagnosis and initial management · D-dimer testing", kind:"ac", t:"Quantitative D-dimer, result within 4 h", s:"interim anticoagulation if it'll take longer; consider an age-adjusted cut-off over 50",
      ask:{q:"PE Wells score 3. Next test?", o:["Quantitative D-dimer","Immediate CTPA","V/Q scan","Leg ultrasound"], a:0},
      why:"D-dimer is a breakdown product of cross-linked fibrin. It's very sensitive but not specific: infection, cancer, surgery, pregnancy and old age all raise it. So a negative result rules PE out when probability is low, but a positive result proves nothing on its own.",
      next:"ddres"},
    ddres:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"dq", t:"D-dimer positive?",
      fork:[{l:"Yes", to:"ctpa"}, {l:"No", to:"stop"}]},
    stop:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"en", t:"PE ruled out: stop anticoagulation", s:"think about other diagnoses"},
    ctpa:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"ac", t:"Immediate CTPA", s:"interim therapeutic anticoagulation if it can't be done straight away",
      flag:"CTPA unsuitable (contrast allergy, CrCl below 30, high radiation risk)? Use a V/Q SPECT or V/Q planar scan.",
      why:"Interim anticoagulation: start before results come back, ideally with a drug you could carry on if PE is confirmed. Take baseline FBC, U&E, LFTs, PT and APTT first, but don't wait for them.",
      next:"ctpares"},
    ctpares:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"dq", t:"CTPA positive?",
      fork:[{l:"Yes", to:"conf"}, {l:"No", to:"dvtq"}]},
    dvtq:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"dq", t:"DVT still suspected?",
      fork:[{l:"Yes", to:"legus"}, {l:"No", to:"stop2"}]},
    legus:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"en", t:"Proximal leg vein ultrasound", s:"a DVT found here is treated the same as a PE"},
    stop2:{ref:"Diagnosis and initial management · Pulmonary embolism", kind:"en", t:"Stop interim anticoagulation", s:"think about other diagnoses"},
    conf:{ref:{s:"Prognostic assessment", ...ESC}, kind:"dx", t:"PE confirmed, haemodynamically stable", s:"now work out how risky it is", dg:["risk"], next:"rv"},
    rv:{ref:{s:"Intermediate-risk PE", ...ESC}, kind:"dq", t:"RV dysfunction and raised troponin?", s:"RV:LV ratio ≥1 on CT or echo, plus troponin",
      why:"RV strain plus troponin means the RV is struggling and its muscle is being damaged, even though the BP is holding. These are the patients who can suddenly decompensate.",
      fork:[{l:"Yes", to:"imh"}, {l:"No", to:"low"}]},
    imh:{ref:{s:"Intermediate-risk PE", ...ESC}, kind:"en", t:"Intermediate-high risk: anticoagulate and monitor", s:"HDU-level monitoring; rescue thrombolysis if they become unstable",
      why:"Routine thrombolysis while BP is normal prevents some collapses but causes more major and intracranial bleeds. On balance it isn't routine: you watch closely and lyse if they tip into instability."},
    low:{ref:"Outpatient treatment for low-risk PE", kind:"dq", t:"Low risk on a validated tool?", s:"for example sPESI 0 or Hestia negative, with support at home",
      fork:[{l:"Yes", to:"opd"}, {l:"No", to:"inpt"}]},
    opd:{ref:"Outpatient treatment for low-risk PE", kind:"en", t:"Outpatient treatment", s:"apixaban or rivaroxaban, with follow-up arranged"},
    inpt:{ref:"Anticoagulation treatment", kind:"en", t:"Admit and anticoagulate", s:"apixaban or rivaroxaban first line (see the anticoagulation pathway)"}
  },
  cases:[
    {id:"classic", v:{who:"34-year-old woman", hx:"Sudden pleuritic chest pain and breathlessness 2 days after a long-haul flight. Takes the combined pill. Right calf swollen and tender.", obs:"HR 112 · BP 124/78 · RR 24 · SpO₂ 93% air", inv:"CXR clear. Wells: DVT signs 3 + PE most likely 3 + HR 1.5 = 7.5"},
      route:{stab:1, wells:0, ctpares:0, rv:1, low:0},
      hints:{wells:"7.5 is above 4, so straight to CTPA.", rv:"Echo shows a normal RV and troponin is negative.", low:"sPESI 0 and she has support at home."}},
    {id:"ddneg", v:{who:"28-year-old man", hx:"Sharp left chest pain on deep breaths after a cold. No leg symptoms.", obs:"HR 88 · BP 128/80 · SpO₂ 98% air", inv:"Wells: PE most likely 3 = 3"},
      route:{stab:1, wells:1, ddres:1},
      hints:{wells:"3 is 4 or less.", ddres:"D-dimer comes back negative."}},
    {id:"ddpos", v:{who:"72-year-old man", hx:"3 days of breathlessness. Had a hip replacement 3 weeks ago.", obs:"HR 96 · BP 134/82 · SpO₂ 94% air", inv:"Wells: surgery 1.5 = 1.5 (alternative diagnosis, a chest infection, seems as likely)"},
      route:{stab:1, wells:1, ddres:0, ctpares:0, rv:1, low:1},
      hints:{ddres:"D-dimer is raised.", rv:"RV normal on CT, troponin normal.", low:"He has COPD, so sPESI is 1. Not low risk, so admit."}},
    {id:"ctneg", v:{who:"45-year-old woman", hx:"Pleuritic pain and a swollen left leg. Recent plaster cast for an ankle fracture.", obs:"HR 104 · BP 130/84 · SpO₂ 96% air", inv:"Wells: DVT signs 3 + PE most likely 3 + HR 1.5 + immobilised 1.5 = 9"},
      route:{stab:1, wells:0, ctpares:1, dvtq:0},
      hints:{ctpares:"CTPA shows no PE.", dvtq:"Her leg is still swollen and tender."}},
    {id:"massive", v:{who:"61-year-old man", hx:"Collapsed at home 5 days after bowel surgery. Clammy, confused, distended neck veins.", obs:"HR 132 · BP 74/46 · RR 32 · SpO₂ 84% on 15 L", inv:"ECG: sinus tachycardia, S1Q3T3, T-wave inversion V1–V4."},
      route:{stab:0, ci:1},
      hints:{stab:"BP 74 systolic with shock.", ci:"Bowel surgery 5 days ago is a contraindication to thrombolysis."},
      teach:"Massive PE plus recent major surgery: surgical embolectomy or catheter-directed therapy."},
    {id:"massive2", v:{who:"52-year-old woman", hx:"Breathless for a week, now syncopal. No recent surgery, no bleeding history.", obs:"HR 128 · BP 82/50 for 20 minutes despite fluid · SpO₂ 86% on 15 L", inv:"Bedside echo: dilated RV, D-shaped LV, McConnell's sign."},
      route:{stab:0, ci:0},
      hints:{ci:"No contraindications."}},
    {id:"imh", v:{who:"66-year-old man", hx:"Breathless for 2 days, presyncope on the stairs.", obs:"HR 108 · BP 112/70 · SpO₂ 91% air", inv:"Wells 6. CTPA: saddle embolus, RV:LV 1.3. Troponin raised. BNP raised."},
      route:{stab:1, wells:0, ctpares:0, rv:0},
      hints:{rv:"RV:LV 1.3 and raised troponin.", stab:"BP is holding at 112 systolic."}},
    {id:"ctclear", v:{who:"39-year-old man", hx:"Pleuritic chest pain and a fast heart rate after a week of flu-like illness. Legs normal.", obs:"HR 108 · BP 122/76 · SpO₂ 96% air", inv:"Wells: PE most likely 3 + HR 1.5 = 4.5"},
      route:{stab:1, wells:0, ctpares:1, dvtq:1},
      hints:{wells:"4.5 is just above 4.", ctpares:"CTPA clear, but there's a small pericardial effusion.", dvtq:"No leg symptoms or signs."},
      teach:"CTPA negative and no DVT suspected: stop the interim anticoagulation. Here the diagnosis is probably viral pericarditis."},
    /* hard */
    {id:"h-arrest", hard:true, v:{who:"48-year-old woman", hx:"Breathless for 3 days after a long drive. Collapses in the ED, PEA arrest.", obs:"No output · on CPR", inv:"Bedside echo during the rhythm check: massive RV, empty LV."},
      route:{stab:0, ci:0},
      twists:[{at:"lysis", text:"You give alteplase during the arrest.", q:"How long should you continue CPR afterwards before stopping?", o:["60–90 minutes","5 minutes","Until the next rhythm check only","20 minutes, as for any arrest"], a:0,
        why:"Thrombolysis needs time to work. RCUK and ESC advise continuing CPR for 60–90 minutes after giving a thrombolytic in suspected PE."}]},
    {id:"h-preg", hard:true, v:{who:"31-year-old woman, 30 weeks pregnant", hx:"Sudden breathlessness and pleuritic pain. Left calf swollen.", obs:"HR 110 · BP 118/72 · SpO₂ 94% air", inv:"Wells would be 7.5."},
      route:{stab:1, wells:0, ctpares:0, rv:1, low:1},
      twists:[{at:"susp", text:"She's 30 weeks pregnant.", q:"How does pregnancy change the pathway?", o:["Wells and D-dimer aren't validated: follow RCOG, start LMWH and image","Use Wells as normal","Rule out with a negative D-dimer","Avoid all imaging until delivery"], a:0,
        why:"D-dimer rises through normal pregnancy, and Wells was never validated in pregnancy. RCOG says start LMWH, do a leg Doppler if there are leg symptoms, then CTPA or V/Q. DOACs and warfarin are avoided in pregnancy."}],
      hints:{rv:"RV normal, troponin normal.", low:"Pregnant patients with PE are managed as inpatients at first."},
      teach:"In pregnancy the anticoagulant is LMWH throughout, not a DOAC."},
    {id:"h-renal", hard:true, v:{who:"70-year-old man", hx:"Breathless and tachycardic after a long hospital stay. CKD stage 4, CrCl 22.", obs:"HR 106 · BP 138/86 · SpO₂ 93% air", inv:"Wells 6."},
      route:{stab:1, wells:0, ctpares:0, rv:1, low:1},
      twists:[{at:"ctpa", text:"His CrCl is 22 ml/min and he's worried about his kidneys.", q:"What imaging fits better?", o:["V/Q SPECT or planar scan","CTPA with double contrast","MRI pulmonary angiogram as first line","No imaging, treat empirically"], a:0,
        why:"NICE lists severe renal impairment (CrCl below 30) as a reason to consider V/Q instead of CTPA, because of the contrast load."}],
      hints:{ctpares:"The V/Q scan is high probability.", rv:"No RV strain.", low:"Not suitable for home: frail, CKD, recently in hospital."}},
    {id:"h-stableRV", hard:true, v:{who:"58-year-old man", hx:"Breathless for a day. A junior suggests thrombolysis because the CT report says 'right heart strain'.", obs:"HR 102 · BP 126/80 · SpO₂ 94% on 2 L", inv:"CTPA: bilateral PE, RV:LV 1.2. Troponin raised."},
      route:{stab:1, wells:0, ctpares:0, rv:0},
      twists:[{at:"imh", text:"The junior asks again whether to give alteplase now.", q:"What do you say?", o:["Not routinely: anticoagulate, monitor closely, lyse only if he becomes unstable","Yes, give full-dose alteplase now","Give half-dose alteplase now","Insert an IVC filter instead"], a:0,
        why:"Thrombolysis in normotensive intermediate-high risk PE cuts collapses but causes more major and intracranial bleeds. So it's kept as rescue therapy if they deteriorate."}]},
    {id:"h-age", hard:true, v:{who:"81-year-old woman", hx:"Mild breathlessness for a week. Lives independently.", obs:"HR 90 · BP 142/80 · SpO₂ 95% air", inv:"Wells 1.5. D-dimer 640 ng/ml (standard cut-off 500)."},
      route:{stab:1, wells:1, ddres:1},
      twists:[{at:"dd", text:"Her D-dimer is 640. The standard cut-off is 500.", q:"What could you use instead for an 81-year-old?", o:["Age-adjusted cut-off: age × 10, so 810","Double the cut-off to 1000","No cut-off: any D-dimer is positive","Ignore it at her age"], a:0,
        why:"D-dimer creeps up with age, so a fixed cut-off gives lots of false positives in older people. NICE suggests considering an age-adjusted cut-off over 50 (age × 10 ng/ml for most assays). 640 is under 810."}],
      hints:{ddres:"Using the age-adjusted cut-off, her D-dimer is negative."}},
    {id:"h-cancer", hard:true, v:{who:"63-year-old man", hx:"On chemotherapy for pancreatic cancer. Breathless for 2 days.", obs:"HR 98 · BP 130/78 · SpO₂ 95% air", inv:"Wells: malignancy 1 + HR 0 + PE most likely 3 = 4."},
      route:{stab:1, wells:1, ddres:0, ctpares:0, rv:1, low:1},
      twists:[{at:"wells", text:"His Wells score is exactly 4.", q:"Which side of the line is 4?", o:["PE unlikely: D-dimer first","PE likely: straight to CTPA"], a:0,
        why:"The PE Wells cut-off is 'more than 4' for likely. 4 itself is unlikely. For DVT it's '2 or more' for likely."}],
      hints:{ddres:"D-dimer positive, as you'd expect with cancer.", rv:"No RV strain.", low:"Active cancer: sPESI 1, so not low risk."},
      teach:"Active cancer: still a DOAC (apixaban or rivaroxaban) under the 2023 NICE update, unless a DOAC is unsuitable."}
  ],
  diagrams:[
    window.VTE_DIAGRAMS.wellspe,
    {id:"risk", t:"How risky is this PE? (ESC 2019)", svg:`<div class="ladder">
      <div style="background:#c2302b;color:#fff"><b>High risk (massive)</b>Shock, arrest or SBP &lt;90 for 15+ min → thrombolysis</div>
      <div style="background:#e07a5f;color:#fff"><b>Intermediate-high</b>Stable, but RV dysfunction <i>and</i> raised troponin → anticoagulate, monitor, rescue lysis</div>
      <div style="background:#f2b97a;color:#3a2405"><b>Intermediate-low</b>Stable, sPESI ≥1, one or neither of RV strain / troponin → admit and anticoagulate</div>
      <div style="background:#9fd3b0;color:#0b3a1f"><b>Low risk</b>Stable, sPESI 0 → consider home on a DOAC</div></div>`,
      cap:"sPESI (one point each): age over 80, cancer, chronic heart or lung disease, HR 110+, SBP below 100, SpO₂ below 90%."},
    {id:"signs", t:"What makes you think it's massive", svg:`<div class="signs">
      <div><b>At the bedside</b>SBP &lt;90 or needing pressors · syncope · raised JVP · cold, clammy, confused · hypoxia despite high-flow O₂</div>
      <div><b>ECG</b>Sinus tachycardia (the commonest finding) · RV strain: T inversion V1–V4 · new RBBB · right axis · S1Q3T3 (classic, not common)</div>
      <div><b>Echo</b>Dilated RV · septum flattened into a D-shaped LV · McConnell's sign (RV free wall akinetic, apex spared) · tricuspid regurgitation</div>
      <div><b>CT and bloods</b>RV:LV ratio ≥1 · septal bowing · contrast refluxing into the IVC · raised troponin and BNP</div></div>
      <svg viewBox="0 0 320 120" width="100%" style="max-width:360px;display:block;margin:10px auto 0" role="img" aria-label="Short-axis view: normal round LV versus D-shaped LV with a dilated RV">
        <text x="80" y="14" font-size="12" text-anchor="middle" fill="var(--ink)" font-weight="700">Normal</text>
        <path d="M30 70 C30 30 55 22 70 30 L70 98 C55 106 30 104 30 70Z" fill="#7fb3e6" opacity=".7"/><circle cx="100" cy="64" r="34" fill="#e07a5f" opacity=".85"/>
        <text x="47" y="70" font-size="11" fill="#0c447c">RV</text><text x="100" y="68" font-size="11" fill="#fff" text-anchor="middle">LV</text>
        <text x="240" y="14" font-size="12" text-anchor="middle" fill="var(--ink)" font-weight="700">Massive PE</text>
        <path d="M168 66 C168 22 212 18 236 30 C224 50 224 82 236 102 C212 114 168 110 168 66Z" fill="#7fb3e6" opacity=".85"/>
        <path d="M236 30 C262 28 290 44 290 66 C290 90 262 106 236 102 C226 84 226 50 236 30Z" fill="#e07a5f" opacity=".85"/>
        <text x="196" y="70" font-size="11" fill="#0c447c">RV</text><text x="262" y="70" font-size="11" fill="#fff" text-anchor="middle">LV</text>
        <text x="240" y="118" font-size="10" text-anchor="middle" fill="var(--mut)">septum pushed flat: the "D sign"</text></svg>`},
    {id:"spiral", t:"Why a massive PE kills: the RV spiral", svg:`<svg viewBox="0 0 360 310" width="100%" role="img" aria-label="Cycle: clot raises pulmonary resistance, RV dilates, septum bows, LV underfills, BP falls, RV ischaemia, RV fails">
      <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--mut)"/></marker></defs>
      ${[[["Clot blocks the","pulmonary arteries"],"RV afterload ↑",180,34],[["RV dilates"],"thin wall, built for ~25 mmHg",288,108],[["Septum bows"," into the LV"],"LV can't fill",270,206],[["Cardiac output","and BP fall"],"",180,270],[["Stretched RV gets","less coronary flow"],"tension ↑, O₂ supply ↓",90,206],[["RV ischaemia,","RV fails more"],"troponin rises",72,108]].map(([L,sub,x,y])=>`<g><rect x="${x-66}" y="${y-24}" width="132" height="48" rx="10" fill="var(--dqbg)" stroke="var(--dqln)"/>${L.map((l,k)=>`<text x="${x}" y="${y-(L.length===2?8:2)+k*13}" font-size="11" text-anchor="middle" fill="var(--dq)" font-weight="700">${l.trim()}</text>`).join("")}${sub?`<text x="${x}" y="${y+(L.length===2?17:12)}" font-size="9.5" text-anchor="middle" fill="var(--dq)">${sub}</text>`:""}</g>`).join("")}
      <g fill="none" stroke="var(--mut)" stroke-width="1.6" marker-end="url(#ar)">
        <path d="M246 40 Q282 52 290 82"/><path d="M290 134 Q290 160 278 180"/><path d="M262 232 Q262 262 250 268"/><path d="M112 270 Q94 262 90 234"/><path d="M80 182 Q64 158 66 134"/><path d="M76 84 Q92 48 114 38"/>
      </g>
      <text x="180" y="150" font-size="12" text-anchor="middle" fill="var(--ink)" font-weight="700">a vicious circle</text>
      <text x="180" y="166" font-size="10.5" text-anchor="middle" fill="var(--mut)">thrombolysis breaks it at the top</text></svg>`,
      cap:"The RV is built as a volume pump, not a pressure pump. Think of a thin balloon versus a thick bike tyre: pump against a blocked outlet and the balloon just stretches. That's why fluids help a little but a big bolus can over-stretch the RV and make things worse."}
  ],
  mnemonics:[
    {t:"Virchow's triad", sub:"Why clots form",
      items:[["S","Stasis: immobility, long flights, AF, heart failure"],["E","Endothelial injury: surgery, trauma, previous DVT"],["H","Hypercoagulability: cancer, pregnancy, oestrogen, thrombophilia"]],
      note:"Every Wells risk factor fits into one of these three."},
    {t:"PERC rule: HAD CLOTS", sub:"Used in UK EDs to rule out PE without a D-dimer, only when your gut says low risk",
      items:[["H","Hormones (oestrogen use)"],["A","Age 50 or over"],["D","DVT or PE in the past"],["C","Coughing blood (haemoptysis)"],["L","Leg swelling, one-sided"],["O","O₂ sats below 95%"],["T","Tachycardia, HR 100 or more"],["S","Surgery or trauma in the last 4 weeks"]],
      note:"Any one present means PERC can't rule it out, so go to Wells and D-dimer. PERC isn't part of the NICE pathway, but RCEM supports it for low-risk ED patients."}
  ]
});
})();
