/* Why each branch of each fork goes the way it does. Keyed by pathway, then fork node, in the same order as the fork options. */
window.FORK_WHY = {
  acs: {
    ecg: ["ST elevation (or new LBBB) means a fully blocked artery and a full-thickness infarct. From here, everything is about reopening it fast.",
          "No ST elevation means the artery is narrowed or blocking on and off, not fully shut. So it's NSTEMI or unstable angina: you risk-stratify instead of rushing to reperfuse."],
    h12: ["Within 12 hours there's still muscle that can be saved, so reperfusion is worth its risks.",
          "After 12 hours most of the territory has already died, so routine reperfusion saves little and still carries the bleeding risk."],
    pci120: ["If you can get to the cath lab in time, a balloon opens the artery more reliably than a drug, with fewer brain bleeds.",
             "Waiting more than 2 hours for a balloon loses more muscle than lysis would save. Give the drug now."],
    oac: ["No anticoagulant on board, so you can use the strongest P2Y12 inhibitor.",
          "They're already anticoagulated. A strong P2Y12 inhibitor on top would pile up the bleeding risk, so you use the weakest one, clopidogrel."],
    ecg90: ["ST elevation that hasn't come down means the artery is still shut and lysis has failed. More drug won't help; a balloon will.",
            "ST resolution of 50% or more means the artery has opened. Now the job is stopping it closing again."],
    late: ["Ongoing pain or shock means there's muscle that's still alive but dying, so opening the artery can still help.",
           "Pain-free and stable means the infarct is complete. There's nothing left to save by reopening the artery."],
    unst: ["Ongoing pain, shock or a dangerous rhythm means the myocardium is at risk right now, so they go straight to the cath lab.",
           "Stable: there's time to start an antithrombin and let GRACE decide how quickly they need angiography."],
    grace: ["Above 3% six-month mortality, early angiography does more good than the procedure's own risks.",
            "At 3% or less, going invasive adds risk for little gain, so treat medically and look for ischaemia later."]
  },
  pe: {
    stab: ["Haemodynamic instability means the RV is failing. The BP has dropped because the RV can't push blood through the blocked lungs. That's obstructive shock, and mortality is over 15%.",
           "Instability is about the circulation, not the oxygen. Low sats come from V/Q mismatch in the lungs. As long as the BP holds (systolic 90 or more) and they're perfusing (warm, alert, passing urine), the RV is coping. Judge it on BP and perfusion, not sats."],
    ci: ["Nothing to make you fear a bleed, so the fastest way to clear the clot is a thrombolytic.",
         "Thrombolysis could cause a catastrophic bleed here, so the clot has to come out mechanically instead."],
    wells: ["With a high pre-test probability, a negative D-dimer couldn't reassure you, so go straight to imaging.",
            "With a low pre-test probability, a negative D-dimer is enough to rule PE out. That saves a lot of CT scans."],
    ddres: ["Positive means there's clot somewhere, or one of the many other things that raise D-dimer. You need imaging to find out which.",
            "Low probability plus a negative D-dimer puts the chance of PE at around 1–2%, low enough to stop."],
    ctpares: ["Clot seen in the pulmonary arteries: diagnosis made.",
              "CTPA misses very little in the main and segmental arteries, so PE is effectively excluded. The question now is whether there's still a leg clot."],
    dvtq: ["A DVT needs the same anticoagulation as a PE, so scan the leg.",
           "No leg clot suspected and a clear CTPA: there's no reason to anticoagulate."],
    rv: ["The RV is stretched and its muscle is being damaged (that's the troponin). This patient could crash, so they're intermediate-high risk.",
         "Without both RV strain and a raised troponin, the RV is coping. That's intermediate-low or low risk."],
    low: ["sPESI 0 means a 30-day mortality of around 1%, so treatment at home is safe if they have support.",
          "One or more sPESI points means a higher chance of deteriorating or dying, so they start treatment in hospital."]
  },
  dvt: {
    wells: ["High pre-test probability, so go straight to the scan. A negative D-dimer couldn't reassure you.",
            "Low pre-test probability, so a negative D-dimer can rule DVT out without a scan."],
    ddres: ["Positive D-dimer, so go and look for the clot with ultrasound.",
            "Low probability and a negative D-dimer: DVT is ruled out."],
    usres: ["Proximal clot seen: treat it.",
            "No proximal clot, but a calf clot could still be there and creep upwards. The D-dimer decides whether you look again."],
    dd2: ["Something is making fibrin. If it's a calf clot heading upwards, a rescan in a week will catch it.",
          "Negative scan and negative D-dimer: DVT is ruled out."]
  },
  vte: {
    haem: ["An unstable PE needs UFH (short-acting and reversible) and probably thrombolysis, not a tablet.",
           "Stable, so pick the anticoagulant based on kidneys, cancer and antiphospholipid syndrome."],
    renal: ["DOACs build up when CrCl is below 15, so use a heparin or warfarin.",
            "The kidneys are good enough for a DOAC. Between 15 and 50, check the dose."],
    cancer: ["Cancer patients clot more and bleed more. Since 2023, DOACs are first line here too.",
             "No active cancer, so move on to the next check."],
    aps: ["DOACs fail in triple-positive APS, with more strokes and MIs, so it's warfarin.",
          "Nothing special about this patient: apixaban or rivaroxaban."],
    prov: ["The trigger has gone, so after 3 months the risk of another clot is low.",
           "Whatever caused it is still there, so clots often come back when you stop. Weigh that against bleeding risk."]
  }
};

Object.assign(window.FORK_WHY, {
  als: {
    rhythm: ["VF and pulseless VT are chaotic or very fast electrical activity with no output. A shock can reset them, so defibrillation is the treatment.",
             "PEA and asystole have nothing to shock: either no electrical activity, or organised activity with no output. Shocking won't help, so it's CPR, adrenaline and finding the cause."],
    rosc: ["Signs of life, a pulse and a jump in ETCO₂: the heart is pumping again. Now protect the brain and treat the cause.",
           "Still no output, so carry on with 2-minute loops, adrenaline every 3–5 minutes, and keep working through the reversible causes."],
    stq: ["ST elevation after ROSC points to a blocked coronary, and opening it treats the cause of the arrest.",
          "No ST elevation, so the cause may be elsewhere: PE, a bleed in the head, an electrolyte problem, a toxin. Look before assuming it's cardiac."]
  },
  asthma: {
    lt: ["Any one life-threatening feature means the attack could kill. Senior and ICU help now, and an ABG.",
         "No life-threatening features, so now look for acute severe ones."],
    tire: ["A rising PaCO₂, exhaustion or drowsiness means they can't keep up the work of breathing. They need ventilating before they stop.",
           "Improving gases and an alert patient: keep treating and watch closely."],
    sev: ["Any one acute severe feature means a big attack: nebulised treatment and close review.",
          "No severe features, so it's a moderate attack."],
    pef: ["Back above 75% and settled after an hour: the attack has turned, and home with steroids and a plan is reasonable.",
          "Not back to 75%, or still struggling: keep treating in hospital."]
  },
  anaph: {
    abc: ["An airway, breathing or circulation problem after a trigger is anaphylaxis. Adrenaline now, without waiting for skin signs.",
          "Skin or gut symptoms alone aren't anaphylaxis. Treat the symptoms and keep watching for ABC problems."],
    five: ["The first dose hasn't worked enough, so repeat it. Adrenaline is short-acting and many reactions need a second dose.",
           "Responded to one dose: observe, because symptoms can come back."],
    ref: ["Two doses haven't worked, which makes it refractory anaphylaxis. Bolus doses alone won't hold it, so it's an infusion and expert help.",
          "The second dose has worked, but needing two means a longer observation period."]
  },
  sepsis: {
    n7: ["NEWS2 7 or more is high risk: senior review and the Sepsis 6 within the hour.",
         "Under 7, so look at which band they're in."],
    shk: ["No response to fluid means septic shock: the vessels are too dilated and leaky for fluid alone. Get critical care involved for vasopressors.",
          "Responding to fluid and antibiotics: keep a close eye, and find and control the source."],
    n56: ["NEWS2 5 or 6 is moderate risk, but check for anything that would make it high risk.",
          "NEWS2 1–4 is low risk on the numbers. Use judgement."],
    red: ["A single parameter scoring 3, or lactate over 2 or an AKI, means organs are already struggling. Manage as high risk.",
          "No red flags, so moderate risk: you have up to 3 hours to give antibiotics while you pin down the diagnosis."]
  }
});
/* Extra notes for steps that didn't have one */
window.NODE_WHY = {
  acs: {
    postlysis:"Lysis has opened the artery but the plaque underneath is still there, so they need dual antiplatelets and usually an angiogram before discharge.",
    rescue:"Rescue PCI is still worth doing hours after failed lysis, because some of the territory is usually still alive.",
    clopi:"Triple therapy (anticoagulant plus two antiplatelets) is kept as short as possible, sometimes only during the hospital stay, because the bleeding risk climbs fast.",
    lateangio:"Shock or ongoing pain after 12 hours tells you there's viable muscle still at risk, so the 12-hour rule doesn't apply.",
    medical:"Medical management still means dual antiplatelets, a statin, an ACE inhibitor and a beta-blocker. You're just not reopening the artery.",
    immangio:"In the cath lab they get UFH, then prasugrel or ticagrelor once the anatomy is known and PCI is happening.",
    cons:"Conservative doesn't mean nothing. They still get dual antiplatelets and secondary prevention, and an ischaemia test or angiography if symptoms come back."
  },
  pe: {
    susp:"PE is a great mimic: it can look like a chest infection, an ACS, a panic attack or a collapse. A CXR helps you find other causes, and is often normal in PE.",
    stop:"A negative D-dimer with a low Wells score is safe to stop on. Now find what is actually causing the symptoms.",
    stop2:"Stop the interim anticoagulant and find the real diagnosis: pneumonia, pericarditis, musculoskeletal pain, anxiety.",
    legus:"If the leg scan shows a proximal DVT, treat exactly as you would a PE. Same drugs, same duration.",
    opd:"Outpatient treatment works because DOACs need no injections or blood monitoring. Arrange follow-up and tell them which symptoms mean they should come back.",
    inpt:"Admitting gives you time to watch for deterioration, especially in the first 48 hours, which is when most early deaths happen.",
    conf:"Stable patients are graded by how the RV is coping, because RV failure is what kills in PE."
  },
  dvt: {
    susp:"Common mimics: cellulitis (red, hot, febrile), ruptured Baker's cyst (sudden calf pain, ankle bruising), muscle tear, and lymphoedema or chronic venous insufficiency.",
    diag:"A proximal DVT gets the same anticoagulation as a PE, because the two are the same disease.",
    stop:"Ruled out. Look for the real cause of the swollen leg."
  },
  vte: {
    start:"Baseline bloods tell you about bleeding risk and dosing: platelets for heparin, renal function for DOACs, LFTs, and a clotting screen.",
    ufh:"UFH and thrombolysis are covered in the PE pathway.",
    lmwhR:"LMWH is cleared by the kidneys too, so it's dose-adjusted or monitored with anti-Xa levels. UFH and warfarin don't depend on the kidneys.",
    unprov:"With no trigger, the drive to clot is probably still there, so stopping at 3 months risks a repeat clot. Bleeding risk is what limits how long you carry on.",
    stop3:"Provoked clots: 3 months is enough once the trigger has gone."
  }
};
