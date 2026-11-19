/* Acute coronary syndromes. Based on NICE NG185 (2020) and NICE CG95. Written for learning, not prescribing. */
(window.PATHWAYS = window.PATHWAYS || []).push({
  id: "acs", title: "Acute coronary syndromes", short: "ACS", tag: "Cardio", color: "#c2302b",
  blurb: "STEMI and NSTEMI / unstable angina, from the first ECG to reperfusion and antiplatelets.",
  source: "NICE NG185 Acute coronary syndromes (2020); NICE CG95 Chest pain of recent onset.",
  root: "susp",
  refUrl: "https://www.nice.org.uk/guidance/ng185/chapter/Recommendations",
  refName: "NICE NG185",
  nodes: {
    susp: {ref:"1.1 STEMI · Initial drug therapy; 1.2 NSTEMI · Initial drug therapy", kind:"ac", t:"Suspected ACS", s:"12-lead ECG, aspirin 300 mg, pain relief, O₂ only if SpO₂ <94%",
      ask:{q:"Chest pain, ACS suspected. What's the first drug?", o:["Aspirin 300 mg loading dose","Ticagrelor 180 mg","Fondaparinux 2.5 mg SC","Alteplase"], a:0},
      why:"Aspirin irreversibly blocks platelet COX-1, so no thromboxane A2. Platelets have no nucleus, so they can't make new COX, and the effect lasts their whole 7–10 day life. Pain relief is GTN, plus IV morphine with an antiemetic if MI is suspected. Oxygen isn't routine: hyperoxia constricts coronary arteries, so only give it if SpO₂ is below 94% (88–92% if at risk of hypercapnia).",
      next:"ecg"},
    ecg: {dg:["leads"], ref:"1.1 STEMI · Assessment", kind:"dq", t:"ST elevation on the ECG?", s:"≥1 mm in 2 contiguous limb leads, ≥2 mm in chest leads, or new LBBB",
      why:"Transmural injury leaves the damaged muscle with a less negative resting potential. That makes a current of injury flowing towards the electrode over it, which shows up as ST elevation.",
      flag:"Posterior MI hides as ST depression in V1–V3 with tall R waves. Do posterior leads V7–V9.",
      fork:[{l:"Yes", to:"stemi"}, {l:"No", to:"nste"}]},

    stemi: {dg:["leads","coronary"], kind:"dx", t:"STEMI", s:"full-thickness infarct from a fully blocked artery",
      why:"Territories: II, III, aVF inferior (RCA). V1–V4 anterior (LAD). I, aVL, V5–V6 lateral (circumflex).",
      flag:"Inferior MI with hypotension: think RV infarct and check V4R. Inferior MI with bradycardia: the RCA supplies the AV node in about 90% of people.",
      next:"h12"},
    h12: {ref:"1.1 STEMI · Coronary angiography with follow-on primary PCI", kind:"dq", t:"Presenting within 12 h of symptom onset?",
      why:"After about 12 hours most of the territory has already died, so opening the artery rescues little muscle. The exceptions are ongoing ischaemia or cardiogenic shock, because then there's still muscle to save.",
      fork:[{l:"Yes", to:"pci120"}, {l:"No", to:"late"}]},
    pci120: {ref:"1.1 STEMI · Coronary angiography with follow-on primary PCI", kind:"dq", t:"Primary PCI possible within 120 min?", s:"of when fibrinolysis could have been given",
      why:"Opening the artery with a balloon beats a drug: more arteries open and fewer brain bleeds. But muscle dies by the minute, so if the cath lab is too far away, a drug now beats a balloon later. 120 minutes is roughly where the two break even.",
      fork:[{l:"Yes", to:"ppci"}, {l:"No", to:"lysis"}]},
    ppci: {ref:"1.1 STEMI · Antithrombin therapy during primary PCI", kind:"ac", t:"Angiography with follow-on primary PCI", s:"radial access, UFH with bailout GP IIb/IIIa inhibitor",
      why:"Radial access bleeds less than femoral. UFH is short-acting and reversible, so it suits the cath lab. Don't give fibrinolysis or GP IIb/IIIa inhibitors on the way when PCI is planned.",
      next:"oac"},
    oac: {ref:"1.1 STEMI · Dual antiplatelet therapy for primary PCI", kind:"dq", t:"Already on an oral anticoagulant?",
      why:"An anticoagulant plus aspirin plus a strong P2Y12 inhibitor is a lot of bleeding. Clopidogrel is the weakest P2Y12 inhibitor, so it's the one that gets paired with an anticoagulant.",
      fork:[{l:"No", to:"prasug"}, {l:"Yes", to:"clopi"}]},
    prasug: {ref:"1.1 STEMI · Dual antiplatelet therapy for primary PCI", kind:"en", t:"Prasugrel + aspirin", s:"aged 75+: weigh bleeding, consider ticagrelor or clopidogrel",
      why:"Prasugrel is a prodrug like clopidogrel, but it's activated in one step instead of two CYP steps, so platelet block is stronger and more reliable. Stronger block means more bleeding.",
      flag:"Don't use prasugrel after a previous stroke or TIA."},
    clopi: {ref:"1.1 STEMI · Dual antiplatelet therapy for primary PCI", kind:"en", t:"Clopidogrel + aspirin", s:"keep the anticoagulant; avoid triple therapy with prasugrel or ticagrelor"},

    lysis: {ref:"1.1 STEMI · Fibrinolysis", kind:"ac", t:"Fibrinolysis", s:"give an antithrombin at the same time",
      why:"Fibrinolytics (alteplase, tenecteplase) turn plasminogen into plasmin, which breaks up fibrin. Breaking down clot exposes thrombin, which re-activates clotting, so you give an antithrombin alongside to stop the artery closing again.",
      flag:"Check contraindications first: any previous haemorrhagic stroke, recent ischaemic stroke, active bleeding, recent major surgery or trauma, aortic dissection.",
      next:"ecg90"},
    ecg90: {ref:"1.1 STEMI · Fibrinolysis", kind:"dq", t:"ECG at 60–90 min: residual ST elevation?", s:"ST resolution under 50% means failed reperfusion",
      why:"If the ST segments haven't come down by at least half, the artery probably hasn't opened. A second dose of lysis just adds bleeding risk, so go to the cath lab instead.",
      fork:[{l:"Yes", to:"rescue"}, {l:"No", to:"postlysis"}]},
    rescue: {ref:"1.1 STEMI · Fibrinolysis", kind:"en", t:"Immediate angiography (rescue PCI)", s:"don't repeat fibrinolysis"},
    postlysis: {ref:"1.1 STEMI · Management for people with STEMI not treated with PCI", kind:"en", t:"Ticagrelor + aspirin, angiography this admission", s:"clopidogrel + aspirin, or aspirin alone, if bleeding risk is high",
      flag:"Recurrent ischaemia after lysis: get immediate cardiology advice and consider angiography."},

    late: {ref:"1.1 STEMI · Coronary angiography with follow-on primary PCI", kind:"dq", t:"Continuing ischaemia or cardiogenic shock?",
      fork:[{l:"Yes", to:"lateangio"}, {l:"No", to:"medical"}]},
    lateangio: {ref:"1.1 STEMI · Coronary angiography with follow-on primary PCI", kind:"en", t:"Consider angiography ± PCI", s:"there's still muscle to save"},
    medical: {ref:"1.1 STEMI · Management for people with STEMI not treated with PCI", kind:"en", t:"Medical management", s:"ticagrelor + aspirin unless bleeding risk is high"},

    nste: {ref:"1.2 NSTEMI and unstable angina · Initial drug therapy", kind:"dx", t:"NSTEMI or unstable angina", s:"troponin raised = NSTEMI, normal = unstable angina",
      ask:{q:"No ST elevation, troponin raised. What is it?", o:["NSTEMI","Unstable angina","STEMI","Stable angina"], a:0},
      why:"Why no lysis here: the thrombus is only partly blocking the artery and is platelet-rich. Fibrinolysis gives no benefit and adds bleeding risk. Lysed fibrin can even expose more thrombin and activate platelets.",
      next:"unst"},
    unst: {ref:"1.2 NSTEMI and unstable angina · Coronary angiography with follow-on PCI", kind:"dq", t:"Clinically unstable?", s:"ongoing pain, haemodynamic instability, arrhythmia",
      why:"Ongoing pain, shock or a dangerous rhythm means the muscle is at risk right now, so you don't wait for a risk score.",
      fork:[{l:"Yes", to:"immangio"}, {l:"No", to:"fonda"}]},
    immangio: {ref:"1.2 NSTEMI and unstable angina · Coronary angiography with follow-on PCI", kind:"en", t:"Immediate angiography", s:"UFH in the cath lab; prasugrel or ticagrelor + aspirin if PCI"},
    fonda: {ref:"1.2 NSTEMI and unstable angina · Initial drug therapy", kind:"ac", t:"Fondaparinux", s:"unless bleeding risk is high; UFH instead if creatinine >265 µmol/L",
      ask:{q:"Stable NSTEMI, angiography not planned today. Which antithrombin?", o:["Fondaparinux","Unfractionated heparin","Alteplase","Warfarin"], a:0},
      why:"Fondaparinux is a pentasaccharide that helps antithrombin III switch off factor Xa. It's cleared by the kidneys, so swap to UFH in bad renal failure. UFH is short-acting and reversible, which is why it's also the one used in the cath lab.",
      flag:"Don't start dual antiplatelets until the diagnosis is made.",
      next:"grace"},
    grace: {ref:"1.2 NSTEMI and unstable angina · Risk assessment", kind:"dq", t:"GRACE 6-month mortality above 3%?",
      why:"GRACE uses age, heart rate, systolic BP, creatinine, Killip class, cardiac arrest at admission, ST deviation and troponin. Higher-risk patients gain most from going to angiography early.",
      flag:"Younger patients can have a low GRACE score and still be high risk. Use judgement.",
      fork:[{l:"Yes", to:"angio72"}, {l:"No", to:"cons"}]},
    angio72: {ref:"1.2 NSTEMI and unstable angina · Coronary angiography with follow-on PCI", kind:"en", t:"Angiography within 72 h", s:"if PCI: prasugrel or ticagrelor + aspirin (clopidogrel if anticoagulated)",
      why:"Prasugrel only once the anatomy is known and PCI is definitely happening. Some patients go to CABG instead, and you don't want them loaded with a potent antiplatelet."},
    cons: {ref:"1.2 NSTEMI and unstable angina · Management when PCI is not indicated", kind:"en", t:"Conservative management", s:"ticagrelor + aspirin unless bleeding risk is high; angiography if ischaemia recurs"}
  },

  cases: [
    {id:"inf", v:{who:"58-year-old man", hx:"40 minutes of crushing central chest pain, sweaty and nauseous. Smoker, type 2 diabetes.", obs:"HR 56 · BP 104/68 · RR 20 · SpO₂ 96% air", inv:"ECG: 3 mm ST elevation in II, III and aVF, reciprocal depression in aVL."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      hints:{pci120:"The cath lab is 25 minutes away.", oac:"No regular medicines apart from metformin."},
      twist:{at:"stemi", text:"After sublingual GTN his BP drops to 82/50. JVP raised, chest clear.", q:"What's going on?", o:["Right ventricular infarct","Cardiac tamponade","Anaphylaxis to GTN","Tension pneumothorax"], a:0,
        why:"The RCA often supplies the right ventricle. An infarcted RV depends on preload, and GTN venodilates, so the BP falls. Stop nitrates, give fluid, and do right-sided leads (V4R)."},
      teach:"Inferior STEMI: think RCA, so check for RV infarct (hypotension) and AV block (bradycardia)."},
    {id:"rural", v:{who:"64-year-old woman", hx:"2 hours of central chest pain on a farm in the Highlands. The nearest PCI centre is a 3-hour transfer.", obs:"HR 98 · BP 132/84 · SpO₂ 95% air", inv:"ECG: 4 mm ST elevation V1–V5."},
      route:{ecg:0, h12:0, pci120:1, ecg90:0},
      hints:{pci120:"A 3-hour transfer blows the 120-minute window, so lysis now.", ecg90:"At 75 minutes the ST elevation has come down by about 20%."}},
    {id:"lysisok", v:{who:"49-year-old man", hx:"90 minutes of chest pain, brought to a district hospital with no cath lab. Transfer would take over 2.5 hours.", obs:"HR 88 · BP 140/90 · SpO₂ 97% air", inv:"ECG: 2 mm ST elevation I, aVL, V5–V6."},
      route:{ecg:0, h12:0, pci120:1, ecg90:1},
      hints:{ecg90:"At 70 minutes the pain has gone and the ST elevation has resolved by more than 70%."}},
    {id:"late16", v:{who:"71-year-old woman", hx:"Chest pain since yesterday evening, about 16 hours. Still in pain now and sweating.", obs:"HR 104 · BP 118/76 · SpO₂ 95% air", inv:"ECG: 2 mm ST elevation V2–V4 with Q waves forming."},
      route:{ecg:0, h12:1, late:0},
      hints:{h12:"16 hours is beyond the 12-hour window.", late:"She's still in pain, so there's ongoing ischaemia."}},
    {id:"late30", v:{who:"80-year-old man", hx:"Had a 'bad bout of indigestion' 2 days ago. Pain-free now, came in because he feels tired.", obs:"HR 78 · BP 128/72 · SpO₂ 96% air", inv:"ECG: Q waves and 1 mm ST elevation V1–V3. Troponin very high."},
      route:{ecg:0, h12:1, late:1},
      hints:{h12:"Symptoms started 2 days ago.", late:"No pain and no shock, so the muscle is already lost."}},
    {id:"apix", v:{who:"69-year-old woman", hx:"1 hour of central chest pain. Has atrial fibrillation and takes apixaban.", obs:"HR 112 irregular · BP 136/82 · SpO₂ 96% air", inv:"ECG: AF, 3 mm ST elevation V2–V5."},
      route:{ecg:0, h12:0, pci120:0, oac:1},
      hints:{oac:"Apixaban for AF is an oral anticoagulant."},
      teach:"On an anticoagulant: clopidogrel is the P2Y12 partner, never prasugrel or ticagrelor on top."},
    {id:"post", v:{who:"55-year-old man", hx:"45 minutes of heavy central chest pain going through to his back. Aorta looks normal on bedside echo.", obs:"HR 90 · BP 138/86 · SpO₂ 97% air", inv:"ECG: 2 mm ST depression V1–V3 with tall R waves."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      twist:{at:"susp", text:"The ECG shows horizontal ST depression in V1–V3 with dominant R waves and upright T waves.", q:"What do you do next?", o:["Do posterior leads V7–V9","Treat as NSTEMI","Repeat the ECG in an hour","Start fibrinolysis now"], a:0,
        why:"V1–V3 look at the posterior wall from the front, so posterior ST elevation shows up as a mirror image: ST depression and tall R waves. Posterior leads show 1 mm ST elevation, so this is a STEMI."},
      hints:{ecg:"Posterior leads show ST elevation, so it counts as a STEMI."}},
    {id:"nst5", v:{who:"67-year-old man", hx:"Chest pain at rest this morning, now settled with GTN.", obs:"HR 82 · BP 146/88 · SpO₂ 97% air", inv:"ECG: 1 mm ST depression V4–V6. Troponin raised. GRACE 6-month mortality 5%."},
      route:{ecg:1, unst:1, grace:0},
      hints:{unst:"Pain-free and haemodynamically stable.", grace:"GRACE 5% is above 3%."}},
    {id:"nstlow", v:{who:"52-year-old woman", hx:"Two short episodes of chest tightness, none now.", obs:"HR 70 · BP 124/78 · SpO₂ 99% air", inv:"ECG: T-wave inversion V4–V6. Troponin mildly raised. GRACE 6-month mortality 1.8%."},
      route:{ecg:1, unst:1, grace:1},
      hints:{grace:"1.8% is 3% or less, so low risk."}},
    {id:"nstvt", v:{who:"74-year-old man", hx:"Ongoing chest pain despite GTN and morphine. Runs of VT on the monitor.", obs:"HR 128 · BP 88/56 · SpO₂ 93% air", inv:"ECG: widespread ST depression. Troponin raised."},
      route:{ecg:1, unst:0},
      hints:{unst:"Ongoing pain, hypotension and VT. That's unstable."}},
    {id:"ua", v:{who:"61-year-old woman", hx:"New chest pain on minimal exertion over 3 days, and once at rest.", obs:"HR 76 · BP 150/90 · SpO₂ 98% air", inv:"ECG: 1 mm ST depression V5–V6. High-sensitivity troponin normal at 0 and 3 h. GRACE 6-month mortality 4%."},
      route:{ecg:1, unst:1, grace:0},
      asks:{nste:1}, askq:{nste:"No ST elevation, troponin normal on serial testing. What is it?"},
      hints:{grace:"4% is above 3%."},
      teach:"Unstable angina follows the same early pathway as NSTEMI. The troponin just isn't raised."},
    /* ---------- hard cases ---------- */
    {id:"h-lbbb", hard:true, v:{who:"66-year-old man", hx:"1 hour of crushing chest pain, grey and clammy. ECG from his GP 6 months ago was normal.", obs:"HR 96 · BP 112/70 · SpO₂ 95% air", inv:"ECG: broad QRS with left bundle branch block. No old LBBB."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      twists:[{at:"susp", text:"You can't read ST segments through the LBBB, and his old ECG didn't have it.", q:"How do you treat new LBBB with ongoing ischaemic pain?", o:["As a STEMI: activate primary PCI","As an NSTEMI: wait for troponin","Repeat the ECG in 20 minutes and decide then","Give fibrinolysis regardless of PCI access"], a:0,
        why:"LBBB changes the whole ST segment, so it can hide a STEMI. New LBBB with a story of ongoing ischaemia is treated as a STEMI equivalent."}],
      hints:{ecg:"New LBBB with symptoms counts as STEMI."}},
    {id:"h-arrest", hard:true, v:{who:"54-year-old man", hx:"VF arrest at a football match. Bystander CPR, 2 shocks, ROSC after 12 minutes. Intubated, GCS 3 off sedation.", obs:"HR 102 · BP 108/64 on low-dose noradrenaline", inv:"Post-ROSC ECG: 4 mm ST elevation V1–V4."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      twists:[{at:"stemi", text:"The medical registrar asks whether it's worth taking him to the cath lab when he's still unconscious.", q:"Does his level of consciousness decide eligibility for angiography?", o:["No, don't use it to decide","Yes, only if GCS is above 8","Only once a CT head is normal","Only if he wakes within 24 hours"], a:0,
        why:"NICE is explicit: don't use conscious level after a cardiac arrest caused by suspected STEMI to decide who gets angiography. Plenty of comatose patients do well once the artery is open."}]},
    {id:"h-shock", hard:true, v:{who:"71-year-old woman", hx:"6 hours of chest pain. Confused, cold peripheries, barely passing urine.", obs:"HR 118 · BP 78/50 · lactate 5.2 · SpO₂ 90% on 4 L", inv:"ECG: 3 mm ST elevation V2–V6, I, aVL."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      hints:{h12:"6 hours, inside the window.", pci120:"Cardiogenic shock within 12 h: angiography is offered regardless."},
      twists:[{at:"ppci", text:"The angiogram shows a blocked proximal LAD and tight stenoses in the circumflex and RCA as well.", q:"She's in cardiogenic shock. What does NICE suggest for the other vessels?", o:["Culprit-vessel-only PCI","Complete revascularisation now","Fibrinolysis for the other vessels","Urgent CABG for all three"], a:0,
        why:"In shock, the extra time, contrast and risk of fixing every vessel isn't worth it, so you open the culprit only. Without shock, NICE recommends complete revascularisation."}]},
    {id:"h-lateshock", hard:true, v:{who:"77-year-old man", hx:"Chest pain started yesterday morning, about 20 hours ago. Now breathless, cold and clammy.", obs:"HR 112 · BP 82/54 · crackles to mid-zones", inv:"ECG: Q waves and 2 mm ST elevation II, III, aVF."},
      route:{ecg:0, h12:1, late:0},
      hints:{h12:"20 hours is outside the 12-hour window.", late:"He's developed cardiogenic shock."},
      teach:"Late presenter in shock: consider angiography. Shock means there's still viable muscle failing, and opening the artery can save it."},
    {id:"h-elderly", hard:true, v:{who:"84-year-old woman", hx:"2 hours of chest pain. Lives alone, frail, weighs 52 kg.", obs:"HR 88 · BP 128/70 · SpO₂ 95% air", inv:"ECG: 2 mm ST elevation II, III, aVF. eGFR 48."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      twists:[{at:"oac", text:"She's not on an anticoagulant, so the default would be prasugrel.", q:"What should you think about at her age and weight?", o:["Bleeding risk: consider ticagrelor or clopidogrel instead","Nothing: prasugrel is fine at any age","Give double-dose prasugrel","Skip the second antiplatelet entirely"], a:0,
        why:"Prasugrel bleeds more in people aged 75 and over, and in people under 60 kg. NICE asks you to weigh bleeding risk and consider ticagrelor or clopidogrel instead."}],
      teach:"At 84 and 52 kg, ticagrelor or clopidogrel with aspirin is the sensible choice over prasugrel."},
    {id:"h-stroke", hard:true, v:{who:"63-year-old man", hx:"90 minutes of chest pain. Had an ischaemic stroke 2 years ago, fully recovered.", obs:"HR 80 · BP 150/92 · SpO₂ 97% air", inv:"ECG: 3 mm ST elevation V1–V4."},
      route:{ecg:0, h12:0, pci120:0, oac:0},
      twists:[{at:"oac", text:"His previous ischaemic stroke comes up on the drug chart.", q:"Which P2Y12 inhibitor should he not get?", o:["Prasugrel","Ticagrelor","Clopidogrel","None of them, all are fine"], a:0,
        why:"Prasugrel is contraindicated after a previous stroke or TIA, because of a higher risk of intracranial bleeding. Ticagrelor is the usual swap."}],
      teach:"For him it's ticagrelor + aspirin. The default box says prasugrel, but a previous stroke or TIA overrides it."},
    {id:"h-dissect", hard:true, v:{who:"59-year-old man", hx:"Sudden tearing chest pain going through to his back, 2 hours ago, at a remote cottage. Nearest PCI centre is a 3-hour transfer. Hypertensive.", obs:"HR 94 · BP 186/104 right arm, 160/96 left arm", inv:"ECG: 2 mm ST elevation II, III, aVF."},
      route:{ecg:0, h12:0, pci120:1, ecg90:1},
      twists:[{at:"susp", text:"Tearing pain to the back, a 26 mmHg arm BP difference, and an inferior STEMI.", q:"Before any antithrombotic or lysis, what must you exclude?", o:["Aortic dissection","Pericarditis","Pulmonary embolism","Oesophageal spasm"], a:0,
        why:"A dissection can tear into the RCA ostium and cause an inferior STEMI. Lysis or heavy antithrombotics would be catastrophic. Here the CT aorta is normal, so you carry on down the STEMI pathway."}],
      hints:{pci120:"3-hour transfer, so lysis.", ecg90:"At 80 minutes the ST elevation has resolved by 75% and the pain has gone."}},
    {id:"h-failed", hard:true, v:{who:"47-year-old woman", hx:"Chest pain for 2 hours on a ferry to the islands. Lysed at the local hospital; the PCI centre is 3 hours away.", obs:"HR 104 · BP 118/76 · SpO₂ 96% air", inv:"ECG: 4 mm ST elevation V2–V5."},
      route:{ecg:0, h12:0, pci120:1, ecg90:0},
      twists:[{at:"ecg90", text:"At 70 minutes the ST elevation has only fallen by a quarter and she's still in pain. A nurse asks whether to draw up a second dose of tenecteplase.", q:"What do you say?", o:["No, don't repeat lysis; arrange immediate angiography","Yes, give a second full dose","Give half a dose","Wait another hour and repeat the ECG"], a:0,
        why:"Failed lysis means rescue PCI. A second dose adds bleeding risk without good evidence it works, so NICE says don't repeat it."}]},
    {id:"h-reinfarct", hard:true, v:{who:"58-year-old man", hx:"Lysed for an anterior STEMI 6 hours ago at a district hospital. ST resolved well at 90 minutes.", obs:"HR 86 · BP 132/80 · SpO₂ 97% air", inv:"ECG at 90 min: >70% ST resolution."},
      route:{ecg:0, h12:0, pci120:1, ecg90:1},
      hints:{pci120:"He was a long way from PCI, which is why he was lysed."},
      twists:[{at:"postlysis", text:"6 hours later his pain comes back and the ST elevation returns in V2–V4.", q:"What next?", o:["Urgent cardiology advice and consider immediate angiography","Repeat the fibrinolysis","Increase the GTN infusion and wait","Discharge with a 12-month DAPT plan"], a:0,
        why:"Recurrent ischaemia after lysis means the artery has closed again. NICE says get immediate specialist advice and consider angiography, not more lysis."}]},
    {id:"h-warfarin", hard:true, v:{who:"72-year-old man", hx:"Chest pain at rest last night, settled now. Mechanical mitral valve on warfarin.", obs:"HR 76 · BP 138/84 · SpO₂ 96% air", inv:"ECG: 1 mm ST depression V4–V6. Troponin raised. INR 2.8. GRACE 6-month mortality 7%."},
      route:{ecg:1, unst:1, grace:0},
      twists:[{at:"angio72", text:"Angiography shows a tight circumflex stenosis, and he has PCI with a drug-eluting stent.", q:"Which antiplatelet goes with his warfarin?", o:["Clopidogrel","Prasugrel","Ticagrelor","None, warfarin is enough"], a:0,
        why:"With an ongoing reason to be anticoagulated, clopidogrel is the P2Y12 partner. Prasugrel or ticagrelor on top of an anticoagulant bleeds too much."}],
      hints:{grace:"GRACE 7% is high risk."}},
    {id:"h-renal", hard:true, v:{who:"68-year-old woman", hx:"Chest pain this morning, now pain-free. On haemodialysis three times a week.", obs:"HR 82 · BP 154/90 · SpO₂ 97% air", inv:"ECG: T-wave inversion V4–V6. Troponin raised. Creatinine 610 µmol/L. GRACE 6-month mortality 9%."},
      route:{ecg:1, unst:1, grace:0},
      twists:[{at:"fonda", text:"Her creatinine is 610 µmol/L.", q:"Which antithrombin?", o:["Unfractionated heparin with monitoring","Fondaparinux 2.5 mg as usual","Enoxaparin at full treatment dose","No antithrombin"], a:0,
        why:"Fondaparinux is cleared by the kidneys and builds up in renal failure. Above a creatinine of 265 µmol/L, NICE suggests UFH, which you can monitor and switch off."}],
      hints:{grace:"9% is high risk. Troponin is often raised in dialysis patients, but the history and ECG change make this real."}},
    {id:"h-young", hard:true, v:{who:"39-year-old man", hx:"Two episodes of chest pain at rest today. Father had an MI at 44. Smoker, LDL 6.1.", obs:"HR 74 · BP 128/80 · SpO₂ 99% air", inv:"ECG: dynamic T-wave inversion V2–V4. Troponin rising. GRACE 6-month mortality 1.2%."},
      route:{ecg:1, unst:1, grace:1},
      twists:[{at:"grace", text:"His GRACE score is only 1.2%, mostly because he's young.", q:"Does a low GRACE score settle it?", o:["No: young patients can score low and still be high risk, so use clinical judgement","Yes: under 3% always means no angiography","Yes: discharge with ticagrelor","Recalculate until it's over 3%"], a:0,
        why:"Age carries a lot of weight in GRACE, so young people can score low even with high-risk features. NICE flags this. On the numbers it's the low-risk branch, but discussing early angiography with cardiology is very reasonable."}]},
    {id:"h-wellens", hard:true, v:{who:"52-year-old woman", hx:"Central chest pain yesterday, lasting 30 minutes. Pain-free now.", obs:"HR 68 · BP 132/82 · SpO₂ 99% air", inv:"ECG: deep symmetrical T-wave inversion V2–V3. High-sensitivity troponin normal at 0 and 3 h. GRACE 6-month mortality 3.5%."},
      route:{ecg:1, unst:1, grace:0},
      asks:{nste:1}, askq:{nste:"No ST elevation, troponin normal on serial testing. What is it?"},
      twists:[{at:"nste", text:"The deep T-wave inversion in V2–V3 is still there now she's pain-free.", q:"What does this pattern suggest?", o:["Critical proximal LAD stenosis (Wellens' syndrome)","Benign early repolarisation","Right ventricular strain from PE","Hypokalaemia"], a:0,
        why:"Wellens' pattern is a warning of a tight proximal LAD that's about to close. Never exercise-test these patients. They need angiography."}],
      hints:{grace:"3.5% is above 3%."}},
    {id:"h-vf", hard:true, v:{who:"69-year-old man", hx:"Admitted with an NSTEMI yesterday. On the ward, chest pain returns and he loses consciousness with VF. One shock, ROSC.", obs:"HR 110 · BP 96/60 · SpO₂ 94% on 2 L", inv:"ECG after ROSC: widespread ST depression, no ST elevation. Troponin rising."},
      route:{ecg:1, unst:0},
      twists:[{at:"immangio", text:"He's on fondaparinux from yesterday.", q:"Which antithrombin is used during the PCI?", o:["Unfractionated heparin in the cath lab","More fondaparinux","Bivalirudin infusion for 72 h","Alteplase"], a:0,
        why:"Fondaparinux on its own raises the risk of catheter thrombus, so UFH is given in the cath lab whether or not they've had fondaparinux."}],
      hints:{unst:"Recurrent pain plus VF arrest: as unstable as it gets."}},
    {id:"h-silent", hard:true, v:{who:"79-year-old woman", hx:"3 days of increasing breathlessness and tiredness. No chest pain at all. Type 2 diabetes for 25 years.", obs:"HR 98 · BP 142/88 · SpO₂ 93% air · bibasal crackles", inv:"ECG: 2 mm ST depression V4–V6. Troponin raised. GRACE 6-month mortality 11%."},
      route:{ecg:1, unst:1, grace:0},
      twists:[{at:"susp", text:"She's adamant she's had no chest pain.", q:"Why might an MI be painless in her?", o:["Diabetic autonomic neuropathy blunts ischaemic pain","Women never get chest pain in MI","Old age switches off pain fibres","Breathlessness masks pain"], a:0,
        why:"Long-standing diabetes damages the autonomic nerves that carry cardiac pain, so MI can present as breathlessness, fatigue or collapse. Elderly people and women also often present atypically."}],
      hints:{unst:"Breathless but stable, no ongoing pain or arrhythmia.", grace:"11% is the highest risk band."}}

  ],
  diagrams: [
    {id:"leads", t:"ECG leads and their territories", svg:`<svg viewBox="0 0 340 236" width="100%" role="img" aria-label="12-lead ECG layout coloured by coronary territory">
      <g font-size="15" font-weight="700" text-anchor="middle">
      ${[["I","lat"],["aVR",""],["V1","sep"],["V4","ant"],["II","inf"],["aVL","lat"],["V2","sep"],["V5","lat"],["III","inf"],["aVF","inf"],["V3","ant"],["V6","lat"]].map(([l,c],k)=>{const x=6+(k%4)*82,y=6+Math.floor(k/4)*52,col={lat:"#E07A5F",inf:"#4F8FE0",sep:"#9B8BE6",ant:"#7F6AD6","":"var(--soft)"}[c];return `<rect x="${x}" y="${y}" width="78" height="46" rx="9" fill="${col}" fill-opacity="${c?.9:1}"/><text x="${x+39}" y="${y+29}" fill="${c?"#fff":"var(--mut)"}">${l}</text>`}).join("")}
      </g>
      <g font-size="12">
        <rect x="6" y="170" width="12" height="12" rx="3" fill="#4F8FE0"/><text x="24" y="180" fill="var(--ink)">Inferior · II, III, aVF · RCA (sometimes Cx)</text>
        <rect x="6" y="188" width="12" height="12" rx="3" fill="#E07A5F"/><text x="24" y="198" fill="var(--ink)">Lateral · I, aVL, V5–V6 · circumflex</text>
        <rect x="6" y="206" width="12" height="12" rx="3" fill="#7F6AD6"/><text x="24" y="216" fill="var(--ink)">Septal V1–V2, anterior V3–V4 · LAD</text>
        <text x="6" y="232" fill="var(--mut)">Posterior: mirror image in V1–V3, so do V7–V9</text>
      </g></svg>`},
    {id:"coronary", t:"Coronary arteries (front view)", svg:`<svg viewBox="0 0 380 330" width="100%" role="img" aria-label="Schematic of the coronary arteries">
      <path d="M118 78 C58 92 42 170 92 236 C130 284 196 296 246 254 C302 206 312 128 262 88 C222 60 164 64 118 78Z" fill="var(--soft)" stroke="var(--mut)" stroke-width="1.5"/>
      <path d="M160 82 C156 50 160 26 176 14 M198 82 C200 52 206 32 220 20" fill="none" stroke="var(--mut)" stroke-width="1.5"/>
      <text x="236" y="22" font-size="11" fill="var(--mut)">aorta</text>
      <g fill="none" stroke-linecap="round">
        <path d="M164 84 C130 88 100 104 86 140 C76 172 86 214 112 240 C134 260 160 266 182 262" stroke="#4F8FE0" stroke-width="5"/>
        <path d="M182 262 C196 236 204 214 206 196" stroke="#4F8FE0" stroke-width="3.5" stroke-dasharray="5 4"/>
        <path d="M122 92 C112 72 112 58 120 46" stroke="#4F8FE0" stroke-width="2.5"/>
        <path d="M96 214 C112 216 132 210 146 196" stroke="#4F8FE0" stroke-width="2.5"/>
        <path d="M198 84 L218 98" stroke="#7F6AD6" stroke-width="6"/>
        <path d="M218 98 C214 140 210 190 230 252" stroke="#7F6AD6" stroke-width="5"/>
        <path d="M216 132 C236 138 254 150 262 166 M214 176 C234 184 250 198 256 214" stroke="#7F6AD6" stroke-width="2.5"/>
        <path d="M218 98 C248 96 276 108 292 132" stroke="#E07A5F" stroke-width="5"/>
        <path d="M292 132 C298 150 298 166 294 180" stroke="#E07A5F" stroke-width="3.5" stroke-dasharray="5 4"/>
        <path d="M276 112 C284 136 286 160 282 184" stroke="#E07A5F" stroke-width="2.5"/>
      </g>
      <g font-size="11" fill="var(--ink)">
        <text x="6" y="40">SA nodal branch</text><text x="6" y="53" fill="var(--mut)">~60% from the RCA</text>
        <text x="6" y="132" font-weight="700" fill="#4F8FE0">RCA</text><text x="6" y="146">right AV groove</text>
        <text x="6" y="226">right marginal</text>
        <text x="40" y="314">PDA + AV nodal branch (dashed = back of heart)</text>
        <text x="226" y="78" font-weight="700" fill="#7F6AD6">LMS</text>
        <text x="244" y="270" font-weight="700" fill="#7F6AD6">LAD</text><text x="244" y="283">+ diagonals, septals</text>
        <text x="300" y="112" font-weight="700" fill="#E07A5F">LCx</text><text x="292" y="198">obtuse</text><text x="292" y="211">marginal</text>
      </g></svg>`, cap:"The RCA usually gives the posterior descending artery (right dominant, about 80–85%) and the AV nodal branch (about 90%). That's why inferior MIs cause heart block, and why an RCA blocked high up can take out the RV too."}
  ],
  mnemonics: [
    {t:"MONA", sub:"Immediate management of suspected ACS",
      items:[["M","Morphine (IV, with an antiemetic)"],["O","Oxygen, only if SpO₂ is below 94%"],["N","Nitrates (GTN)"],["A","Aspirin 300 mg"]],
      note:"The order is just to make it say something. In practice aspirin goes first, and oxygen isn't routine any more."},
    {t:"BATMAN", sub:"NSTEMI / unstable angina",
      items:[["B","Beta-blocker (unless heart failure, shock or bradycardia)"],["A","Aspirin 300 mg"],["T","Ticagrelor (if no PCI planned and bleeding risk isn't high)"],["M","Morphine"],["A","Anticoagulant: fondaparinux"],["N","Nitrates"]],
      note:"Then GRACE decides whether they go to angiography."},
    {t:"The 6 As", sub:"Secondary prevention after an MI (NG185 section 1.4)",
      items:[["A","Aspirin, lifelong"],["A","Another antiplatelet (ticagrelor, prasugrel or clopidogrel) for 12 months"],["A","Atorvastatin 80 mg"],["A","ACE inhibitor"],["A","Atenolol, or in practice bisoprolol (beta-blocker)"],["A","Aldosterone antagonist if heart failure with reduced ejection fraction"]],
      note:"Plus cardiac rehab and lifestyle changes."}
  ]

});
