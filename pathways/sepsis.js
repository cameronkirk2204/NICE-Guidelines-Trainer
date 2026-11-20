/* Suspected sepsis in adults. NICE NG253 / NG51 (2024–25 updates, NEWS2-based) and the UK Sepsis Trust Sepsis 6. For learning, not prescribing. */
(function(){
const URL = "https://www.nice.org.uk/guidance/NG253/chapter/managing-suspected-sepsis";
const NEWS = [
  ["RR 8 or less",3],["RR 9–11",1],["RR 21–24",2],["RR 25 or more",3],
  ["SpO₂ 91% or less",3],["SpO₂ 92–93%",2],["SpO₂ 94–95%",1],["On supplemental oxygen",2],
  ["Systolic BP 90 or less",3],["Systolic BP 91–100",2],["Systolic BP 101–110",1],
  ["HR 40 or less",3],["HR 41–50",1],["HR 91–110",1],["HR 111–130",2],["HR 131 or more",3],
  ["New confusion, or responds only to voice or pain, or unresponsive",3],
  ["Temp 35.0 or less",3],["Temp 35.1–36.0",1],["Temp 38.1–39.0",1],["Temp 39.1 or more",2]
];
(window.PATHWAYS = window.PATHWAYS || []).push({
  id:"sepsis", title:"Sepsis", short:"Sepsis", tag:"Infection", color:"#b7791f",
  blurb:"Calculate NEWS2 yourself, grade the risk, and know what has to happen within 1, 3 and 6 hours, plus the Sepsis 6.",
  source:"NICE NG253 Suspected sepsis in over 16s (NEWS2-based, 2024–25) and the UK Sepsis Trust Sepsis 6.",
  refUrl:URL, refName:"NICE NG253", root:"inf",
  nodes:{
    inf:{ref:"Recognising and assessing suspected sepsis", kind:"ac", t:"Suspected infection and unwell", s:"full set of obs and calculate NEWS2",
      why:"Sepsis is a dysregulated host response to infection that causes organ dysfunction. The infection triggers a cytokine storm, and the damage comes from the body's response more than from the bug.",
      next:"n7"},
    n7:{ref:"Evaluating risk using NEWS2", kind:"dq", t:"NEWS2 7 or more?", dg:["news"],
      score:{name:"NEWS2", rule:"Tick the band each observation falls in. 7 or more = high risk. 5–6 = moderate. 1–4 = low. SpO₂ uses scale 1 here (no hypercapnic respiratory failure).", items:NEWS},
      why:"NEWS2 picks up physiology going wrong before the patient looks dramatic. Each vital sign scores 0–3 depending on how far it is from normal.",
      fork:[{l:"Yes", to:"high"}, {l:"No", to:"n56"}]},
    high:{ref:"Managing suspected sepsis · High risk", kind:"dx", t:"High risk: Sepsis 6 within 1 hour", s:"senior review; cultures, IV antibiotics, lactate, IV fluid bolus, O₂ to target, urine output", dg:["bp"],
      ask:{q:"NEWS2 9 with suspected pneumonia. When should IV antibiotics be in?", o:["Within 1 hour","Within 3 hours","Within 6 hours","Once the cultures are back"], a:0},
      why:"Every hour's delay in antibiotics in septic shock raises mortality. Cultures first if it won't delay the antibiotics, because once they're in, the chance of growing the bug drops.",
      next:"shk"},
    shk:{ref:"Managing suspected sepsis · Fluids and escalation", kind:"dq", t:"Still hypotensive or lactate high after fluid?", s:"no response within an hour of treatment",
      why:"Lactate rises when tissues aren't getting enough oxygen and switch to anaerobic metabolism. Adrenaline-driven glycolysis and poor liver clearance push it up too. A falling lactate means you're winning.",
      fork:[{l:"Yes", to:"crit"}, {l:"No", to:"ward"}]},
    crit:{ref:"Managing suspected sepsis · Fluids and escalation", kind:"en", t:"Critical care: vasopressors", s:"senior in person; noradrenaline (can start peripherally if needed); arterial line",
      why:"Once the vessels are dilated and leaky, more fluid just ends up in the lungs and tissues. Noradrenaline's α₁ effect tightens the vessels back up and restores perfusion pressure."},
    ward:{ref:"Managing suspected sepsis · High risk", kind:"en", t:"Recheck NEWS2 every 30 minutes", s:"find and control the source; review antibiotics when cultures come back"},
    n56:{ref:"Evaluating risk using NEWS2", kind:"dq", t:"NEWS2 5 or 6?",
      fork:[{l:"Yes", to:"red"}, {l:"No", to:"low"}]},
    red:{ref:"Managing suspected sepsis · Moderate risk", kind:"dq", t:"A single parameter scoring 3, or lactate over 2 / AKI?",
      why:"One very abnormal sign (like new confusion or a systolic of 88) can be more worrying than several mild ones. Lactate over 2 or an AKI means organs are already struggling. Either way, treat as high risk.",
      fork:[{l:"Yes", to:"high"}, {l:"No", to:"mod"}]},
    mod:{ref:"Managing suspected sepsis · Moderate risk", kind:"en", t:"Moderate risk", s:"review and lactate within 1 hour; antibiotics within 3 hours; NEWS2 every hour",
      why:"The 3-hour window lets you make a proper diagnosis and pick the right antibiotic, rather than blasting everyone with broad-spectrum drugs."},
    low:{ref:"Managing suspected sepsis · Low risk", kind:"en", t:"Low risk (NEWS2 1–4)", s:"clinical judgement; find the source; antibiotics can wait up to 6 hours while you clarify; NEWS2 every 4–6 h"}
  },
  cases:[
    {id:"pneum", v:{who:"74-year-old man", hx:"3 days of productive cough and fever. Now confused according to his wife.", obs:"RR 28 · SpO₂ 90% on air · BP 96/58 · HR 118 · new confusion · T 38.9"},
      find:{shk:"After a litre of fluid: BP 112/70, lactate 2.4 from 4.1, more alert."},
      score:{n7:[3,4,9,14,16,19]}, route:{n7:0, shk:1}},
    {id:"uti", v:{who:"82-year-old woman", hx:"Dysuria and offensive urine for 2 days. Feeling shivery.", obs:"RR 22 · SpO₂ 95% on air · BP 128/74 · HR 104 · alert · T 38.4"},
      find:{red:"Venous lactate 1.4. Creatinine at her baseline."},
      score:{n7:[2,6,13,19]}, route:{n7:1, n56:0, red:1}},
    {id:"cell", v:{who:"45-year-old man", hx:"Red, hot, swollen lower leg spreading over 2 days.", obs:"RR 18 · SpO₂ 98% on air · BP 132/80 · HR 96 · alert · T 38.3"},
      score:{n7:[13,19]}, route:{n7:1, n56:1}},
    {id:"shock", v:{who:"58-year-old woman", hx:"Abdominal pain and rigors. Had an ERCP last week.", obs:"RR 26 · SpO₂ 94% on air · BP 84/50 · HR 132 · alert · T 39.4"},
      find:{shk:"After 2 L of fluid: BP 82/46, lactate 5.8 and rising."},
      score:{n7:[3,6,8,15,20]}, route:{n7:0, shk:0}},
    {id:"red3", v:{who:"67-year-old man", hx:"Feverish with a cough. Daughter says he's 'not himself'.", obs:"RR 18 · SpO₂ 96% on air · BP 138/82 · HR 88 · new confusion · T 37.9"},
      score:{n7:[16]}, route:{n7:1, n56:1},
      teach:"NEWS2 is only 3, so he's in the low-risk band on the numbers. But new confusion scores 3 on its own, and many trusts escalate any single red score. Don't let a low total talk you out of a proper look."},
    /* hard */
    {id:"h-o2", hard:true, v:{who:"70-year-old woman", hx:"Productive cough. The nurse has put her on 2 L of oxygen.", obs:"RR 22 · SpO₂ 95% on 2 L O₂ · BP 108/66 · HR 112 · alert · T 38.6"},
      score:{n7:[2,6,7,10,14,19]}, route:{n7:0, shk:1},
      twists:[{at:"n7", text:"She's on 2 L of oxygen.", q:"How does oxygen change her NEWS2?", o:["It adds 2 points on its own, on top of the SpO₂ score","Nothing: only the sats count","It removes the SpO₂ points","It adds 3 points"], a:0,
        why:"Needing supplemental oxygen scores 2 by itself. Otherwise oxygen would hide how sick someone is, because their sats look fine."}],
      hints:{shk:"After fluids and antibiotics, BP 120/72 and lactate 1.8."}},
    {id:"h-single", hard:true, v:{who:"39-year-old man", hx:"Fever and a sore throat for 3 days. Fainted at home.", obs:"RR 18 · SpO₂ 98% on air · BP 88/54 · HR 104 · alert · T 38.2"},
      find:{red:"Lactate 2.6.", shk:"After fluid: BP 114/70, lactate 1.6."},
      score:{n7:[8,13,19]}, route:{n7:1, n56:0, red:0, shk:1},
      twists:[{at:"red", text:"Only NEWS2 5, but his systolic is 88.", q:"Why treat him as high risk?", o:["A single parameter scoring 3 (and lactate over 2) needs high-risk management","He's young, so he's fine","Only the total matters","Because his temperature is high"], a:0,
        why:"NICE: a NEWS2 of 5–6 with a single red-flag parameter scoring 3, or lactate over 2 or AKI, is managed as high risk. Young people compensate well until they suddenly don't."}]},
    {id:"h-bb", hard:true, v:{who:"76-year-old man on bisoprolol", hx:"Dysuria and rigors. Looks grey.", obs:"RR 24 · SpO₂ 95% on air · BP 92/58 · HR 84 · alert · T 38.7"},
      find:{red:"Lactate 4.2.", shk:"After fluids and antibiotics: BP 96/60, lactate 4.0."},
      score:{n7:[2,6,9,19]}, route:{n7:1, n56:0, red:0, shk:0},
      twists:[{at:"n7", text:"His heart rate is only 84, despite looking septic.", q:"Why might his HR be falsely reassuring?", o:["The beta-blocker stops him mounting a tachycardia","He isn't really septic","Fever lowers heart rate","His HR is the most reliable sign"], a:0,
        why:"Beta-blockers blunt the tachycardia that normally shouts 'shock'. Older people and those on rate-controlling drugs can look deceptively calm on the obs. Lactate and the bigger picture matter more."}]}
  ],
  diagrams:[
    {id:"news", t:"NEWS2 at a glance (scale 1)", svg:`<table class="wt news"><tr><td><b>Score</b></td><td>3</td><td>2</td><td>1</td><td>0</td><td>1</td><td>2</td><td>3</td></tr>
      <tr><td>RR</td><td>≤8</td><td></td><td>9–11</td><td>12–20</td><td></td><td>21–24</td><td>≥25</td></tr>
      <tr><td>SpO₂</td><td>≤91</td><td>92–93</td><td>94–95</td><td>≥96</td><td></td><td></td><td></td></tr>
      <tr><td>Air/O₂</td><td></td><td>O₂</td><td></td><td>air</td><td></td><td></td><td></td></tr>
      <tr><td>SBP</td><td>≤90</td><td>91–100</td><td>101–110</td><td>111–219</td><td></td><td></td><td>≥220</td></tr>
      <tr><td>HR</td><td>≤40</td><td></td><td>41–50</td><td>51–90</td><td>91–110</td><td>111–130</td><td>≥131</td></tr>
      <tr><td>AVPU</td><td></td><td></td><td></td><td>Alert</td><td></td><td></td><td>new C/V/P/U</td></tr>
      <tr><td>Temp</td><td>≤35.0</td><td></td><td>35.1–36</td><td>36.1–38</td><td>38.1–39</td><td>≥39.1</td><td></td></tr></table>
      <div class="wtf">Scale 2 is used for SpO₂ in people with hypercapnic respiratory failure (target 88–92%). A systolic of 220 or more also scores 3.</div>`},
    {id:"bp", t:"Why BP falls in sepsis", svg:`<div class="signs">
      <div><b>Vessels dilate</b>Nitric oxide and cytokines relax arterial smooth muscle, so resistance falls. Warm, flushed peripheries early on.</div>
      <div><b>Capillaries leak</b>The endothelium gets leaky, so fluid moves into the tissues. That's why you see oedema even while they're dry in the vessels.</div>
      <div><b>The heart struggles</b>Septic cardiomyopathy reduces contractility, so later on the peripheries turn cold.</div>
      <div><b>So treat each part</b>Fluid fills the tank, noradrenaline tightens the vessels, and antibiotics plus source control switch off the drive.</div></div>`}
  ],
  mnemonics:[
    {t:"BUFALO: the Sepsis 6", sub:"Within 1 hour for high risk (UK Sepsis Trust)",
      items:[["B","Blood cultures"],["U","Urine output: start measuring"],["F","Fluids: IV crystalloid bolus"],["A","Antibiotics: IV, broad-spectrum"],["L","Lactate (and FBC)"],["O","Oxygen to target sats"]],
      note:"Three in (fluids, antibiotics, oxygen) and three out (cultures, lactate, urine)."}
  ]
});
})();
