/* Anaphylaxis. Resuscitation Council UK, Emergency treatment of anaphylaxis (2021). For learning, not prescribing. */
(function(){
const URL = "https://resus.org.uk/media/337/download";
const ABC = [["Hoarse voice or stridor",1],["Swelling of the tongue or throat",1],["Wheeze or bronchospasm",1],["SpO₂ below 94% or cyanosis",1],["Hypotension, shock or collapse",1],["Confusion or reduced consciousness",1],["Urticaria (hives)",0],["Flushing or itch",0],["Lip or eyelid swelling only",0],["Vomiting or abdominal pain",0]];
(window.PATHWAYS = window.PATHWAYS || []).push({
  id:"anaph", title:"Anaphylaxis", short:"Anaphylaxis", tag:"Resus", color:"#8b6fd6",
  blurb:"Spot the airway, breathing or circulation problem, give IM adrenaline early, repeat at 5 minutes, and know refractory anaphylaxis.",
  source:"Resuscitation Council UK, Emergency treatment of anaphylaxis: guidelines for healthcare providers (2021).",
  refUrl:URL, refName:"RCUK anaphylaxis 2021", root:"react",
  nodes:{
    react:{ref:"Anaphylaxis algorithm", kind:"ac", t:"Suspected allergic reaction", s:"ABCDE, call for help, remove the trigger if you can",
      why:"Anaphylaxis is sudden and progresses fast. Mast cells release histamine, tryptase and leukotrienes, which dilate vessels, make capillaries leak, and constrict the airways. You can lose a third of the circulating volume into the tissues in minutes.",
      next:"abc"},
    abc:{ref:"Anaphylaxis algorithm · Recognition", kind:"dq", t:"Airway, breathing or circulation problem?",
      score:{name:"Features", rule:"Any A, B or C feature (the ones worth a point) = anaphylaxis. Skin or gut features alone aren't.", items:ABC},
      why:"Skin changes are common but they don't define it, and about 1 in 5 people with anaphylaxis have no skin signs at all. It's the A, B or C problem that makes it anaphylaxis, and that's what kills.",
      fork:[{l:"Yes", to:"im"}, {l:"No", to:"skin"}]},
    skin:{ref:"Anaphylaxis algorithm", kind:"en", t:"Allergic reaction, not anaphylaxis", s:"non-sedating oral antihistamine (e.g. cetirizine); watch for ABC problems",
      why:"Antihistamines help itch and hives but do nothing for airway swelling or shock, so they're for the skin, after the dangerous stuff is excluded. Sedating ones like chlorphenamine can drop the BP and cloud the picture."},
    im:{ref:"Anaphylaxis algorithm · Adrenaline", kind:"ac", t:"IM adrenaline into the anterolateral thigh", s:"adult/over 12: 500 micrograms (0.5 mL of 1 mg/mL)", dg:["doses"],
      ask:{q:"Adult with anaphylaxis. Adrenaline dose and route?", o:["500 micrograms IM (0.5 mL of 1 mg/mL)","1 mg IV bolus","50 micrograms IM","500 micrograms subcutaneously"], a:0},
      why:"Adrenaline hits every problem: α₁ vasoconstriction reverses the vasodilation and leak, β₁ supports the heart, and β₂ opens the airways and stops mast cells releasing more. IM into the thigh is absorbed quickly and safely. IV boluses outside cardiac arrest cause arrhythmias and dangerous hypertension.",
      next:"plus"},
    plus:{ref:"Anaphylaxis algorithm", kind:"ac", t:"Lie flat, high-flow O₂, IV fluid bolus", s:"legs raised (sit up if breathing is hard); adult 500–1000 mL crystalloid, child 10 mL/kg",
      why:"Sitting or standing someone up during anaphylactic shock can cause sudden arrest: the leaky, dilated circulation pools blood in the legs and the heart empties ('empty ventricle'). Lying flat with the legs up keeps blood going back to the heart.",
      next:"five"},
    five:{ref:"Anaphylaxis algorithm · Repeat adrenaline", kind:"dq", t:"Still ABC problems 5 minutes later?",
      fork:[{l:"Yes", to:"im2"}, {l:"No", to:"obs1"}]},
    im2:{ref:"Anaphylaxis algorithm · Repeat adrenaline", kind:"ac", t:"Repeat IM adrenaline", s:"and another fluid bolus",
      why:"The first dose wears off quickly and many reactions need more than one. Repeating at 5 minutes is the single biggest change in the 2021 guideline.",
      next:"ref"},
    ref:{ref:"Refractory anaphylaxis algorithm", kind:"dq", t:"Still no better after 2 IM doses?",
      fork:[{l:"Yes", to:"refr"}, {l:"No", to:"obs2"}]},
    refr:{ref:"Refractory anaphylaxis algorithm", kind:"en", t:"Refractory anaphylaxis", s:"expert help now: low-dose IV adrenaline infusion; keep giving IM every 5 min until it's running; more fluid",
      why:"An infusion gives a steady, titratable level instead of peaks and troughs. Large volumes of fluid may be needed, 3–5 L in an adult.",
      flag:"On a beta-blocker and not responding to adrenaline? Consider glucagon, which raises cAMP without going through the β-receptor."},
    obs1:{ref:"Anaphylaxis algorithm · Observation and discharge", kind:"en", t:"Observe at least 6 hours", s:"mast cell tryptase; 2 adrenaline auto-injectors, training and allergy referral before discharge",
      why:"Tryptase is released by degranulating mast cells and confirms the diagnosis later. Take one as soon as resuscitation allows, another ideally within 2 hours of onset, and a baseline after 24 hours."},
    obs2:{ref:"Anaphylaxis algorithm · Observation and discharge", kind:"en", t:"Observe at least 12 hours", s:"needed 2 doses; tryptase; auto-injectors and allergy referral",
      why:"Needing more than one dose, severe reactions, and a history of biphasic reactions all raise the risk of symptoms coming back hours later."}
  },
  cases:[
    {id:"peanut", v:{who:"22-year-old man", hx:"Ate a dessert at a restaurant 15 minutes ago. Known peanut allergy. Now says his throat feels tight.", obs:"RR 26 · HR 118 · BP 108/64 · SpO₂ 95% air"},
      find:{abc:"Hoarse voice, tongue looks swollen. Widespread hives. Wheeze on both sides.", five:"5 minutes after adrenaline: voice clearer, BP 118/74, wheeze settling."},
      score:{abc:[0,1,2,6]}, route:{abc:0, five:1}},
    {id:"hives", v:{who:"34-year-old woman", hx:"Itchy rash 30 minutes after starting a course of amoxicillin.", obs:"RR 16 · HR 88 · BP 128/80 · SpO₂ 99% air"},
      find:{abc:"Widespread urticaria and itch. Voice normal, no swelling of the tongue, chest clear."},
      score:{abc:[6,7]}, route:{abc:1}},
    {id:"wasp", v:{who:"58-year-old man", hx:"Stung by a wasp in the garden. Collapsed shortly afterwards.", obs:"RR 24 · HR 128 · BP 72/40 · SpO₂ 94% air"},
      find:{abc:"Pale, clammy, confused. Flushed skin. Chest clear.", five:"5 minutes after adrenaline and fluid: BP 80/48, still confused.", ref:"After the second IM dose: BP 112/70, alert."},
      score:{abc:[4,5,7]}, route:{abc:0, five:0, ref:1}},
    {id:"refr", v:{who:"45-year-old woman", hx:"Reaction to IV co-amoxiclav on the ward. Rapidly worsening.", obs:"RR 30 · HR 140 · BP 68/30 · SpO₂ 90% on 15 L"},
      find:{abc:"Stridor, widespread wheeze, hives, unrecordable BP at times.", five:"No better 5 minutes after the first dose.", ref:"Still BP 70/35 and wheezy after two IM doses and 2 L of fluid."},
      score:{abc:[0,2,3,4,6]}, route:{abc:0, five:0, ref:0}},
    /* hard */
    {id:"h-noskin", hard:true, v:{who:"30-year-old woman", hx:"Ten minutes after an IV contrast CT she feels faint and breathless.", obs:"RR 28 · HR 124 · BP 78/44 · SpO₂ 92% air"},
      find:{abc:"No rash, no flushing, no swelling. Wheeze on both sides.", five:"5 minutes after adrenaline: BP 110/68, wheeze better."},
      score:{abc:[2,3,4]}, route:{abc:0, five:1},
      twists:[{at:"abc", text:"There's no rash at all.", q:"Does the lack of skin signs make anaphylaxis less likely here?", o:["No: up to 1 in 5 have no skin signs; ABC problems after a trigger is enough","Yes: no rash means it can't be anaphylaxis","Only if tryptase is normal","Only if she has had it before"], a:0,
        why:"Skin features are absent in a good chunk of cases, especially when it presents as shock. A sudden B or C problem after a likely trigger is anaphylaxis until proven otherwise."}]},
    {id:"h-bb", hard:true, v:{who:"67-year-old man on bisoprolol", hx:"Anaphylaxis to a bee sting. Two IM doses of adrenaline given by the paramedics.", obs:"RR 26 · HR 58 · BP 70/40 · SpO₂ 93% on 15 L"},
      find:{abc:"Wheezy, flushed, hives, pale and clammy.", five:"No better 5 minutes after the paramedics' doses.", ref:"Still BP 70/40 and bradycardic after a further IM dose and 2 L of fluid."},
      score:{abc:[2,3,4,6,7]}, route:{abc:0, five:0, ref:0},
      twists:[{at:"refr", text:"He's on bisoprolol and isn't responding to adrenaline.", q:"What extra drug can help?", o:["IV glucagon","IV atropine only","More bisoprolol","IV chlorphenamine 10 mg"], a:0,
        why:"Beta-blockers stop adrenaline working at the β-receptor. Glucagon raises cAMP in heart muscle through its own receptor, so it gets round the block."}]},
    {id:"h-child", hard:true, v:{who:"8-year-old boy", hx:"Eating cashews at a party, now coughing and wheezy with a swollen face.", obs:"RR 38 · HR 150 · SpO₂ 91% air"},
      find:{abc:"Wheeze, hoarse cry, facial swelling and hives.", five:"5 minutes after adrenaline: talking normally, sats 97%."},
      score:{abc:[0,2,3,6,8]}, route:{abc:0, five:1},
      twists:[{at:"im", text:"He's 8 years old.", q:"What's his IM adrenaline dose?", o:["300 micrograms (0.3 mL of 1 mg/mL)","500 micrograms","150 micrograms","1 mg"], a:0,
        why:"RCUK: 6 months to 6 years 150 micrograms, 6–12 years 300 micrograms, over 12 years 500 micrograms (300 if small or prepubertal)."}]}
  ],
  diagrams:[
    {id:"doses", t:"IM adrenaline doses (1 mg/mL, i.e. 1:1000)", svg:`<table class="wt"><tr><td>Adult and child over 12</td><td>500 mcg · 0.5 mL</td></tr><tr><td>Child 6–12 years</td><td>300 mcg · 0.3 mL</td></tr><tr><td>Child 6 months – 6 years</td><td>150 mcg · 0.15 mL</td></tr><tr><td>Under 6 months</td><td>100–150 mcg · 0.1–0.15 mL</td></tr></table><div class="wtf">Anterolateral thigh. Repeat after 5 minutes if ABC problems persist. Over 12 but small or prepubertal: 300 mcg.</div>`}
  ],
  mnemonics:[
    {t:"500 · 300 · 150", sub:"IM adrenaline by age",
      items:[["500","Over 12 and adults"],["300","6 to 12 years"],["150","6 months to 6 years"]],
      note:"All micrograms of the 1 mg/mL (1:1000) solution, into the outer thigh."}
  ]
});
})();
