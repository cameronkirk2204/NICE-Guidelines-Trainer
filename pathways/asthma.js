/* Acute asthma in adults. BTS/SIGN British guideline on the management of asthma (SIGN 158, 2019), acute section. For learning, not prescribing. */
(function(){
const URL = "https://rightdecisions.scot.nhs.uk/asthma-pathway-bts-nice-sign-sign-244/managing-acute-asthma/management-of-acute-asthma-in-adults/asthma-management-algorithms-for-adults/management-of-acute-asthma-in-adults-in-the-emergency-department";
const LT = [["PEF below 33% of best or predicted",1],["SpO₂ below 92%",1],["Silent chest",1],["Cyanosis",1],["Poor respiratory effort",1],["Arrhythmia",1],["Hypotension",1],["Exhaustion",1],["Altered consciousness",1],["Wheeze",0],["Using accessory muscles",0]];
const SEV = [["PEF 33–50% of best or predicted",1],["Respiratory rate 25 or more",1],["Heart rate 110 or more",1],["Can't complete sentences in one breath",1],["Wheeze",0],["Anxious",0]];
(window.PATHWAYS = window.PATHWAYS || []).push({
  id:"asthma", title:"Acute asthma (adults)", short:"Asthma", tag:"Resp", color:"#4f8fe0",
  blurb:"Moderate, acute severe or life-threatening: grade it from the bedside, then nebs, steroids, magnesium and when to call ICU.",
  source:"BTS/SIGN British guideline on the management of asthma (SIGN 158, 2019), acute asthma in adults.",
  refUrl:URL, refName:"BTS/SIGN 158", root:"pres",
  nodes:{
    pres:{ref:"Acute asthma in adults · Assessment", kind:"ac", t:"Acute asthma attack", s:"RR, HR, SpO₂, peak flow, and can they finish a sentence?",
      why:"Peak flow is compared with their own best (or predicted if you don't know it). It's effort-dependent, so someone too breathless to blow is already in trouble. Wheeze tells you nothing about severity: the quietest chest is the most dangerous one.",
      next:"lt"},
    lt:{ref:"Acute asthma in adults · Life-threatening features", kind:"dq", t:"Any life-threatening features?", dg:["grades"],
      score:{name:"Life-threatening features", rule:"Any one feature = life-threatening asthma.", items:LT},
      why:"A silent chest means so little air is moving that there's nothing to wheeze. A normal PaCO₂ in someone breathing at 30 a minute means they're tiring: they should be blowing it off.",
      fork:[{l:"Yes", to:"ltx"}, {l:"No", to:"sev"}]},
    ltx:{ref:"Acute asthma in adults · Immediate treatment", kind:"dx", t:"Life-threatening asthma", s:"senior and ICU help now; ABG",
      ask:{q:"Life-threatening asthma. What goes in first?", o:["O₂ to 94–98%, nebulised salbutamol 5 mg + ipratropium 0.5 mg (O₂-driven), steroids","Salbutamol inhaler via spacer and review in an hour","IV aminophylline loading dose","Sedate for comfort"], a:0},
      why:"Salbutamol is a β₂ agonist: it raises cAMP in airway smooth muscle and relaxes it. Ipratropium blocks muscarinic receptors, cutting the vagal tone that squeezes the airways. They work by different routes, so they add together. Steroids take hours to work but stop the inflammation driving the attack. No sedatives of any kind.",
      next:"mg"},
    mg:{ref:"Acute asthma in adults · Subsequent management", kind:"ac", t:"IV magnesium sulphate 1.2–2 g over 20 min", s:"plus back-to-back or continuous salbutamol",
      why:"Magnesium blocks calcium channels in airway smooth muscle, and calcium is what makes the muscle contract. A single dose is safe and works within minutes. Repeated doses risk hypermagnesaemia: weakness and respiratory depression.",
      next:"tire"},
    tire:{ref:"Acute asthma in adults · Referral to intensive care", kind:"dq", t:"Rising PaCO₂, exhaustion or drowsiness despite treatment?",
      fork:[{l:"Yes", to:"icu"}, {l:"No", to:"admitl"}]},
    icu:{ref:"Acute asthma in adults · Referral to intensive care", kind:"en", t:"ICU: likely intubation", s:"by an experienced anaesthetist; watch for breath stacking and pneumothorax",
      why:"Ventilating an asthmatic is risky: air gets in but can't get out, so pressure builds in the chest (breath stacking). That drops venous return and BP. Long expiratory times and low rates help."},
    admitl:{ref:"Acute asthma in adults · Subsequent management", kind:"en", t:"Admit to HDU-level care", s:"nebs every 15–30 min then 4–6 hourly, repeat ABG, check K⁺"},
    sev:{ref:"Acute asthma in adults · Acute severe features", kind:"dq", t:"Any acute severe features?",
      score:{name:"Acute severe features", rule:"Any one feature = acute severe asthma.", items:SEV},
      fork:[{l:"Yes", to:"sevx"}, {l:"No", to:"mod"}]},
    sevx:{ref:"Acute asthma in adults · Immediate treatment", kind:"ac", t:"Acute severe asthma", s:"O₂ to 94–98%, salbutamol 5 mg neb (O₂-driven), ipratropium 0.5 mg, prednisolone 40–50 mg",
      ask:{q:"Acute severe asthma. Which steroid and dose?", o:["Prednisolone 40–50 mg orally (or hydrocortisone 100 mg IV)","Prednisolone 5 mg","Inhaled beclometasone only","Dexamethasone 20 mg IM for everyone"], a:0},
      flag:"Check potassium: repeated salbutamol drives K⁺ into cells and can cause hypokalaemia.",
      next:"pef"},
    mod:{ref:"Acute asthma in adults · Moderate asthma", kind:"ac", t:"Moderate asthma", s:"PEF over 50–75%: salbutamol via spacer or neb, prednisolone 40–50 mg",
      why:"A spacer delivers as well as a nebuliser in moderate attacks. Prednisolone tablets work as well as IV hydrocortisone if they can swallow.",
      next:"pef"},
    pef:{ref:"Acute asthma in adults · Discharge", kind:"dq", t:"PEF over 75% an hour after treatment, and settled?",
      fork:[{l:"Yes", to:"dc"}, {l:"No", to:"admits"}]},
    dc:{ref:"Acute asthma in adults · Discharge", kind:"en", t:"Consider discharge", s:"prednisolone 40–50 mg for at least 5 days, check inhaler technique, action plan, GP review within 2 working days",
      flag:"Keep them in if they've had a previous near-fatal attack, are pregnant, present at night, or have poor social support, even if the numbers look good."},
    admits:{ref:"Acute asthma in adults · Subsequent management", kind:"en", t:"Admit", s:"keep nebulising; senior review and IV magnesium if not improving"}
  },
  cases:[
    {id:"mod", v:{who:"24-year-old woman", hx:"Wheezy and tight after a cold. Used her blue inhaler 6 times today.", obs:"RR 20 · HR 96 · SpO₂ 97% air · speaking in full sentences"},
      find:{lt:"PEF 65% of her best. Chest: widespread wheeze. Alert, colour good.", pef:"After treatment: PEF 85% of best, comfortable, sats 98%."},
      score:{lt:[9], sev:[4]}, route:{lt:1, sev:1, pef:0}},
    {id:"sev", v:{who:"35-year-old man", hx:"Getting worse over 2 days. Can only say a few words at a time.", obs:"RR 28 · HR 118 · SpO₂ 94% air · BP 132/80"},
      find:{lt:"PEF 40% of best. Loud wheeze, using his accessory muscles. Alert, pink.", pef:"An hour later: PEF 55%, still RR 24."},
      score:{lt:[9,10], sev:[0,1,2,3,4]}, route:{lt:1, sev:0, pef:1}},
    {id:"sevgood", v:{who:"29-year-old woman", hx:"Wheezy and breathless after a run in the cold. Short sentences only.", obs:"RR 26 · HR 112 · SpO₂ 95% air"},
      find:{lt:"PEF 45% of best. Wheeze throughout. Alert.", pef:"An hour after nebs and prednisolone: PEF 80%, full sentences, RR 16."},
      score:{lt:[9], sev:[0,1,2,3,4]}, route:{lt:1, sev:0, pef:0}},
    {id:"lt", v:{who:"19-year-old man", hx:"Brought in by friends. Too breathless to speak. Previous ICU admission with asthma.", obs:"RR 34 · HR 128 · SpO₂ 89% air · BP 108/64"},
      find:{lt:"Can't do a peak flow. Very quiet chest on both sides. Drowsy.", tire:"Repeat ABG: PaCO₂ 7.2 kPa and rising. He's getting more drowsy."},
      score:{lt:[1,2,8]}, route:{lt:0, tire:0}},
    {id:"lt2", v:{who:"42-year-old woman", hx:"Asthma attack for 6 hours, nebs from the paramedics haven't helped much.", obs:"RR 30 · HR 122 · SpO₂ 91% on air · BP 126/76"},
      find:{lt:"PEF 30% of best. Wheeze, alert, no cyanosis.", tire:"After magnesium and back-to-back nebs: PaCO₂ 4.8 kPa and falling, PEF 45%, more comfortable."},
      score:{lt:[0,1,9]}, route:{lt:0, tire:1}},
    /* hard */
    {id:"h-co2", hard:true, v:{who:"31-year-old woman", hx:"Asthma attack. She looks tired.", obs:"RR 32 · HR 116 · SpO₂ 93% on air"},
      find:{lt:"PEF 40% of best. ABG on air: PaO₂ 9.1 kPa, PaCO₂ 5.4 kPa. Wheeze. Alert but looks exhausted.", tire:"After magnesium: PaCO₂ 6.3 kPa and she's drowsy."},
      score:{lt:[7,9]}, route:{lt:0, tire:0},
      twists:[{at:"lt", text:"Her PaCO₂ is 5.4 kPa, which is in the normal range.", q:"Why is a normal PaCO₂ worrying here?", o:["She's breathing at 32 a minute, so it should be low; normal means she's tiring","It isn't: normal is reassuring","It means she's hyperventilating","It means the gas was venous"], a:0,
        why:"Someone breathing fast should blow their CO₂ down. A 'normal' PaCO₂ means they can no longer keep up. BTS lists a PaCO₂ of 4.6–6.0 kPa as a life-threatening marker."}]},
    {id:"h-silent", hard:true, v:{who:"16-year-old girl", hx:"Sudden severe attack at school. Teacher gave 10 puffs of salbutamol. Now quieter.", obs:"RR 30 · HR 132 · SpO₂ 90% air"},
      find:{lt:"Breath sounds barely audible on either side. No wheeze. Lips look blue.", tire:"After treatment: SpO₂ 95%, wheeze now loud and widespread, more alert."},
      score:{lt:[1,2,3]}, route:{lt:0, tire:1},
      twists:[{at:"tire", text:"The wheeze is now louder than when she arrived.", q:"What does louder wheeze mean here?", o:["Better: more air is moving","Worse: more spasm","Pneumothorax","Nothing either way"], a:0,
        why:"Wheeze needs airflow. Going from silent to wheezy means the airways are opening up enough for air to move. Always pair it with the obs, though."}],
      teach:"At 16 the adult BTS pathway applies, so adult doses."},
    {id:"h-k", hard:true, v:{who:"38-year-old man", hx:"Acute severe asthma, on his 6th salbutamol neb in 2 hours. Now has cramps and palpitations.", obs:"RR 24 · HR 124 · SpO₂ 95% on O₂"},
      find:{lt:"PEF 42%. Wheeze. Alert, pink.", pef:"Potassium 2.9 mmol/L. PEF 58% after 2 hours."},
      score:{lt:[9], sev:[0,2,4]}, route:{lt:1, sev:0, pef:1},
      twists:[{at:"pef", text:"His potassium is 2.9.", q:"Why is it low?", o:["β₂ agonists drive potassium into cells","He's lost it in his urine from steroids","Dehydration","Lab error, always"], a:0,
        why:"β₂ stimulation switches on the Na⁺/K⁺-ATPase pump, moving potassium into cells. High-dose salbutamol, plus steroids, can make someone properly hypokalaemic. Replace it and keep monitoring."}]}
  ],
  diagrams:[
    {id:"grades", t:"How bad is it? (adults)", svg:`<div class="ladder">
      <div style="background:#5f0f40;color:#fff"><b>Near-fatal</b>Raised PaCO₂, or needing ventilation</div>
      <div style="background:#c2302b;color:#fff"><b>Life-threatening (any one)</b>PEF &lt;33% · SpO₂ &lt;92% · PaO₂ &lt;8 kPa · "normal" PaCO₂ 4.6–6.0 · silent chest · cyanosis · poor effort · arrhythmia · hypotension · exhaustion · altered consciousness</div>
      <div style="background:#e07a5f;color:#fff"><b>Acute severe (any one)</b>PEF 33–50% · RR ≥25 · HR ≥110 · can't finish sentences</div>
      <div style="background:#9fd3b0;color:#0b3a1f"><b>Moderate</b>PEF &gt;50–75%, no severe features</div></div>`,
      cap:"Use their best PEF if you know it, otherwise their predicted value."}
  ],
  mnemonics:[
    {t:"33, 92, CHEST", sub:"Life-threatening asthma",
      items:[["33","PEF below 33%"],["92","SpO₂ below 92%"],["C","Cyanosis"],["H","Hypotension"],["E","Exhaustion"],["S","Silent chest"],["T","Tachyarrhythmia / arrhythmia"]],
      note:"Plus poor respiratory effort, altered consciousness, and a normal PaCO₂ in a tachypnoeic patient."},
    {t:"O SHIT ME", sub:"Treatment of acute severe asthma, in order",
      items:[["O","Oxygen to 94–98%"],["S","Salbutamol 5 mg neb"],["H","Hydrocortisone 100 mg IV (or prednisolone 40–50 mg)"],["I","Ipratropium 0.5 mg neb"],["T","Theophylline (aminophylline): senior decision only"],["M","Magnesium sulphate 1.2–2 g IV over 20 min"],["E","Escalate: ICU, intubation"]],
      note:"Memorable for the obvious reason."}
  ]
});
})();
