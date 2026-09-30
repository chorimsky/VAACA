import type { Locale } from "./locale";

/**
 * The translation registry.
 *
 * English is the source of truth: `Dictionary` is `typeof en`, so every other
 * locale must supply exactly the same keys and TypeScript fails the build if
 * one is missed or misspelled. There is no silent fallback to English — a
 * missing key is a type error, not a surprise in production.
 */

export const en = {
  nav: {
    primary: {
      institution: "Institution",
      standards: "Standards",
      ecosystem: "Ecosystem",
      membership: "Membership",
      governance: "Governance",
      region: "Region",
    },
    resources: "Resources",
    login: "Login",
    join: "Join the Association",
    toggleMenu: "Toggle menu",
    primaryLabel: "Primary",
    closeMenu: "Close menu",
    currentPage: "current page",
    skipToContent: "Skip to content",
    backToVaaca: "Back to VAACA",
    backToTop: "Back to top",
  },
  language: {
    label: "Language",
    switchTo: "Switch to {language}",
    current: "Current language: {language}",
  },
  footer: {
    blurb:
      "Virtual Assets Association of Central Africa — a regional institution, in formation, headquartered from its Cameroon founding chapter.",
    tagline:
      "VAACA · Virtual Assets Association of Central Africa · In Formation",
    coalition:
      "Founding coalition: Info Pro Solutions · Ejara · Blockchain Association of Cameroon · IAFN — rattached to CFIA during the founding phase",
    headings: {
      institution: "Institution",
      programs: "Programs",
      access: "Access",
    },
    links: {
      theInstitution: "The Institution",
      founders: "Founders",
      governance: "Governance",
      secretariat: "Secretariat",
      standards: "Standards",
      ecosystem: "Ecosystem",
      membership: "Membership",
      region: "Region",
      register: "Join / Register",
      memberLogin: "Member Login",
      resources: "Resources",
      staffLogin: "Secretariat sign-in",
    },
  },
  standards: {
    title: "VAACA Framework 01 — PSAN Regulatory Readiness",
    lede: "Three perimeter gates decide whether an activity is in scope. Eight readiness domains, scored on a 24-point scale, decide whether it can be presented to a regulator today.",
    scoreMeaning: "What a score means",
    assessed:
      "Class A and B members are assessed against all eight domains, out of {max} points, and can follow their own score on the",
    assessedLink: "member dashboard",
    capNote:
      "Where a regulatory instruction does not yet exist, the framework caps the affected domain rather than scoring it optimistically.",
    readFramework: "Read the framework",
    applyForMembership: "Apply for membership",
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "What VAACA is building next.",
    brands: {
      standards: "Frameworks, guidelines and readiness certification.",
      policy: "Regulatory intelligence and consultation responses.",
      intelligence: "Market research and country-level data.",
      academy: "Professional training and certification.",
    },
    inDevelopment: "In development",
    planned: "Planned",
  },
  governance: {
    title: "Nine founding seats. No single interest holds a majority.",
    recruiting:
      "The Council is being recruited: none of the nine seats are filled yet. Seats are published here as they are taken.",
    filled: "{filled} of {total} seats filled.",
    majorityHeld:
      "{bloc} holds {count} of {total} seats — a majority, which the Council's composition rule does not allow to stand.",
    noMajority:
      "No interest can hold a majority: the largest bloc is defined {largest} seats wide, of {total}.",
    seatLabel: "Seat",
    publishNote:
      "Seat holders are named in the Founding Coalition & Alliance Architecture once appointed. Candidates under consideration are not published.",
    blocs: {
      industry: "Industry",
      professional: "Professional",
      independent: "Independent",
    },
    seatStatus: {
      vacant: "Vacant — recruiting",
      candidate: "Candidate identified",
      filled: "Filled",
    },
    seats: {
      s1: {
        name: "Legal — CEMAC financial markets",
        why: "Interprets PSAN and requalification exposure across the bloc.",
      },
      s2: {
        name: "Regulated financial institution",
        why: "Brings a bank/PSP view of custody and settlement risk.",
      },
      s3: {
        name: "Payments / PSP",
        why: "Represents the mobile-money and payments corridor VAACA must not disrupt.",
      },
      s4: {
        name: "VASP / exchange operator",
        why: "The regulated subject the Association exists to prepare.",
      },
      s5: {
        name: "Compliance / AML professional",
        why: "Owns AML/CFT domain credibility with regulators.",
      },
      s6: {
        name: "Cybersecurity / infrastructure",
        why: "Owns custody and operational-resilience domain credibility.",
      },
      s7: {
        name: "Academic / research",
        why: "Independent evidence base, distinct from industry lobbying.",
      },
      s8: {
        name: "Consumer / market integrity",
        why: "Counterweight to seats 2–4; keeps client protection real.",
      },
      s9: {
        name: "Convenor",
        why: "Independent chair — no seat is president by default.",
      },
    },
  },
  region: {
    title: "One region. Multiple markets. A shared institutional architecture.",
    mapTitle:
      "The six CEMAC member states, with Cameroon as the founding chapter",
    coverage: "CEMAC coverage",
    coverageNote:
      "All six member states sit under the same regional regulators — COBAC, COSUMAF, BEAC and GABAC — so the Readiness Framework travels between them largely unchanged. Only local PSAN transposition and secretariat staffing are chapter-specific.",
    applications: "{count} application(s)",
    memberAccounts: "{count} member account(s)",
  },
  resources: {
    title: "Documents & Library",
    lede: "Founding documents, standards drafts and briefings. Draft-status items are circulated for comment, not final positions.",
    footnote:
      "Documents marked “Not yet published” are drafted but not circulated. Contact the secretariat for access.",
    generatedOnRequest: "generated on request",
    documents: {
      "institutional-charter": {
        title: "Founding Charter",
        description: "Governance, membership classes, and mandate.",
      },
      "psan-readiness-framework": {
        title: "PSAN Regulatory Readiness Framework",
        description: "3 gates, 8 domains, 24-point scoring scale.",
      },
      "founding-coalition-architecture": {
        title: "Founding Coalition & Alliance Architecture",
        description: "9 seats and priority institutional relationships.",
      },
      "instruction-gap-register": {
        title: "Instruction Gap Register",
        description: "Ten regulatory gaps blocking full readiness scoring.",
      },
      "cemac-federation-roadmap": {
        title: "CEMAC Federation Roadmap",
        description: "Sequenced path from Cameroon chapter to full federation.",
      },
      "founding-declaration-brief": {
        title: "Founding Declaration Brief",
        description: "For the Yaoundé conference — not yet public.",
      },
    },
    unavailable: {
      drafting: "Drafting in progress.",
      internal: "Internal — not circulated outside the founding coalition.",
      missing: "File missing from the document store.",
    },
  },
  membership: {
    title: "Open and non-exclusive. Five classes, no discretionary refusal.",
    lede: "Any applicant that meets a class's criteria is admitted. Membership status is never a substitute for regulatory authorization.",
    table: { class: "Class", who: "Who", voting: "Voting" },
    voting: { full: "Full", limited: "Limited", observer: "Observer" },
    stepLabel: "Step {n}",
    steps: {
      s1: "Identify your class",
      s2: "Submit accession request to the secretariat",
      s3: "Classes A/B complete the Readiness self-assessment",
    },
    startApplication: "Start an Application",
    questionsEyebrow: "Questions",
    questionsTitle: "Common questions.",
    faqs: {
      regulator: {
        q: "Is VAACA a regulator?",
        a: "No. VAACA does not license, supervise or enforce. It builds standards and evidence that regulators can rely on.",
      },
      whoCanJoin: {
        q: "Who can join?",
        a: "Any organization or individual meeting one of the five accession classes — membership is open and non-exclusive.",
      },
      whyCameroon: {
        q: "Why start with Cameroon?",
        a: "One working chapter is easier to get right than six at once. Cameroon's Charter and Readiness Framework are built to be adopted as-is by the other CEMAC states.",
      },
      funding: {
        q: "How is VAACA funded?",
        a: "Not yet defined publicly — funding model will be published once the secretariat is appointed and the Charter is ratified.",
      },
    },
  },
  ecosystem: {
    title: "One ecosystem, connected around shared standards.",
    groups: {
      banks: "Banks",
      vasps: "VASPs & Exchanges",
      fintechs: "Fintechs & PSPs",
      regulators: "Regulators",
      investors: "Investors",
      academia: "Academia",
      legal: "Legal & Compliance",
      consumers: "Consumers",
    },
    priorityInstitutions: "Priority institutions",
    priorityNote:
      "Derived from the engagement posture below, so the two can no longer disagree about who is a priority.",
    engagementEyebrow: "Policy & Regulatory Engagement",
    engagementTitle: "Engagement posture, not lobbying.",
    postures: {
      "Engage first": "Engage first",
      "Engage early": "Engage early",
      Monitor: "Monitor",
      Inform: "Inform",
    },
  },
  institution: {
    title:
      "VAACA exists to organize, professionalize, standardize and connect Central Africa's virtual-asset ecosystem — not to run it.",
    pillars: {
      trust: {
        title: "Trust",
        body: "Governance, transparency and conflict-of-interest rules built into the Charter from the first draft.",
      },
      standards: {
        title: "Standards",
        body: "The PSAN Regulatory Readiness Framework — gates, domains and evidence thresholds regulators can rely on.",
      },
      connectivity: {
        title: "Connectivity",
        body: "One chapter model, built to replicate across all six CEMAC states under a single institutional architecture.",
      },
    },
    foundersEyebrow: "Founders",
    foundersTitle:
      "Constituted by four organizations. Anchored, not improvised.",
    foundersNote:
      "During its founding phase, VAACA is rattached as an auxiliary organ to the Cameroon Fintech Association (CFIA) — an established national anchor rather than institutional legitimacy built from nothing. VAACA commits to an autonomous regional constitution once national chapters exist in at least three CEMAC member states.",
    founders: {
      infoPro: "RegTech — compliance and reporting infrastructure",
      ejara: "Licensed operator — regulated digital asset access",
      bac: "National industry association",
      iafn: "Technical secretariat and evidence base",
    },
    secretariatEyebrow: "Secretariat",
    secretariatTitle:
      "The operating capacity every founding document assumes is already running.",
    appointed: "Appointed",
    vacant: "Vacant",
    posts: {
      secretaryGeneral: {
        vacant:
          "Not yet appointed — required before the Charter can be ratified.",
        filled: "Appointed. The Charter can proceed to ratification.",
      },
      standardsOfficer: {
        vacant:
          "Not yet appointed — owns Readiness Framework scoring once domains are live.",
        filled: "Appointed. Owns Readiness Framework scoring.",
      },
    },
    eventsEyebrow: "Events",
    eventsTitle: "The launch seminar is the first VAACA convening.",
    seminarName: "Institutional Launch Seminar — under ministerial patronage",
    seminarDates: "September 29–30, 2026",
    seminarBody:
      "Day one convenes CEMAC regulators on convergence and standards; VAACA's mandate, founding members and CFIA affiliation are presented on day two.",
    seminarState: {
      confirmed: "Confirmed",
      inSession: "In session",
      held: "Held",
    },
  },
  institutions: {
    COSUMAF: {
      desc: "CEMAC regional capital-markets regulator.",
      posture:
        "Primary Gate 3 target — the most plausible eventual PSAN licensing authority.",
    },
    CNEF: {
      desc: "National Economic and Financial Committee — regulates the relationship between financial consumers and credit, payment, microfinance and insurance institutions.",
      posture:
        "Relevant to consumer protection (D5) and any payment-institution requalification under Gate 2.",
    },
    MINFI: {
      desc: "Cameroon's Ministry of Finance.",
      posture:
        "Courtesy briefing once the Charter is ratified; not a licensing body.",
    },
    ANIF: {
      desc: "Cameroon's financial-intelligence unit (AML/CFT reporting).",
      posture:
        "Needed to close Gap G3 (travel-rule guidance) — early technical contact.",
    },
    COBAC: {
      desc: "CEMAC regional banking-supervision commission.",
      posture:
        "Relevant only if an applicant is requalified as a bank/PSP under Gate 2.",
    },
    BEAC: {
      desc: "Central Bank of Central African States — monetary authority.",
      posture:
        "Monetary-policy interest only if a stablecoin or CBDC angle emerges.",
    },
    GABAC: {
      desc: "CEMAC regional AML/CFT body.",
      posture: "Standards-setting counterpart for the AML/CFT domain (D2).",
    },
    MINPOSTEL: {
      desc: "Cameroon's telecom, cybersecurity and postal regulators.",
      posture: "Relevant to custody/tech-resilience domain (D3, D7) only.",
    },
    DGI: {
      desc: "Cameroon's Directorate General of Taxation.",
      posture:
        "Needed to close Gap G9 (tax treatment) before any applicant files.",
    },
  },
  chapters: {
    labels: {
      fiu: "National FIU",
      language: "Working language",
      regulators: "Shared regulators",
      accession: "Accession status",
      federationModel: "Federation Model",
      definesFounding:
        "What this chapter defines, and what each other chapter keeps local.",
      definesPending:
        "What replicates from the Cameroon chapter, and what stays local.",
      mapTitle: "{name} within the six CEMAC member states",
      replicates: "Replicates to every chapter",
      carriesOver: "Carries over unchanged",
      chapterStatus: "Chapter Status",
      marketContext: "Market Context",
      sequence: "Sequence to Ratification",
      pathToAccession: "Path to Accession",
      allChapters: "All Chapters",
    },
    carriesOver: {
      charter: "Charter & governance architecture",
      framework: "PSAN Regulatory Readiness Framework (8 domains)",
      gates: "Perimeter, requalification & regulator gates",
      regulators: "Regional regulators: COBAC, COSUMAF, BEAC, GABAC",
    },
    eyebrowFounding: "CEMAC Founding Chapter",
    eyebrowChapter: "CEMAC Chapter",
    gridPending: "Pending",
    pendingAccession: "Pending accession",
    accessionSteps: {
      convenor: {
        title: "Identify a local convenor",
        body: "A founding contact from industry, academia or government to lead accession locally.",
      },
      charter: { title: "Adopt the Charter" },
      intake: {
        title: "Open Readiness intake",
        body: "Begin scoring local applicants against the same 8-domain framework.",
      },
    },
    stepsHeadingPending: "Three steps before {name} becomes an active chapter.",
    ctaHeading: "Want to convene the {name} chapter?",
    ctaBody:
      "Contact the secretariat to register interest as a founding local convenor.",
    ctaLabel: "Register Interest",
    names: {
      cameroon: { short: "Cameroon", full: "Cameroon" },
      gabon: { short: "Gabon", full: "Gabon" },
      congo: { short: "Congo", full: "Republic of the Congo" },
      chad: { short: "Chad", full: "Chad" },
      car: { short: "C.A.R.", full: "Central African Republic" },
      "equatorial-guinea": { short: "Eq. Guinea", full: "Equatorial Guinea" },
    },
    languages: {
      cameroon: "French / English",
      gabon: "French",
      congo: "French",
      chad: "French / Arabic",
      car: "French",
      "equatorial-guinea": "Spanish / French",
    },
    cameroon: {
      badge: "Founding chapter · active",
      gridStatus: "Founding chapter",
      lede: "The first working chapter of VAACA. Cameroon's Charter, Readiness Framework and founding coalition are drafted here, and packaged so the other five CEMAC states can adopt them as-is.",
      localScope:
        "The two-role secretariat called for in Charter Part 6 (Secretary General, Standards & Assessment Officer), the nine-seat Coordination Council, and affiliation to the Cameroon Fintech Association (CFIA) during the founding phase.",
      contextHeading:
        "Everything the other five chapters will inherit is being built here first.",
      points: {
        p1: "Charter, Readiness Framework and Coalition Architecture drafted",
        p2: "Nine founding seats defined — recruitment not yet started",
        p3: "Secretariat not yet appointed; required before the Charter can be ratified",
      },
      stepsHeading: "Three steps before the Charter can be ratified.",
      steps: {
        s1: {
          title: "Appoint the secretariat",
          body: "Secretary General and Standards & Assessment Officer — the operating capacity every founding document assumes is already running.",
        },
        s2: {
          title: "Fill the nine founding seats",
          body: "No single interest may hold a majority; the Convenor chairs but carries no additional vote.",
        },
        s3: {
          title: "Sign the founding declaration",
          body: "At the CBA Institutional Conference in Yaoundé, October 2026, followed by registration as a Cameroonian association.",
        },
      },
      ctaHeading: "Join the Cameroon founding chapter",
      ctaBody:
        "Membership is open and non-exclusive across five accession classes. Any applicant meeting a class's criteria is admitted.",
      ctaLabel: "Apply for membership",
    },
    gabon: {
      badge: "Priority replication target",
      lede: "CEMAC's financial hub, with existing capital-markets activity and the region's deepest banking sector — the most plausible second chapter after Cameroon.",
      localScope:
        "Local FIU contact (ANIF-Gabon), transposition of the Readiness Framework into Gabonese instruments, and a local convenor from Libreville's financial-services community.",
      contextHeading:
        "Gabon already hosts CEMAC's largest capital markets — virtual-asset activity likely exists ahead of any framework.",
      points: {
        p1: "Home to COSUMAF's primary listed-market activity",
        p2: "Established banking and insurance sector with cross-border reach",
        p3: "No chapter contact identified yet",
      },
      charterStep:
        "Ratify the founding Charter as drafted for Cameroon, with Gabon-specific institutional references.",
    },
    congo: {
      badge: "Pending accession",
      lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
      localScope:
        "Local FIU contact (ANIF-Congo) and a founding convenor from Brazzaville or Pointe-Noire's business community.",
      contextHeading:
        "An oil-dependent economy exploring diversification — virtual-asset interest is nascent but regulatory contacts are unestablished.",
      points: {
        p1: "No known VASP activity publicly reported",
        p2: "Regional regulators identical to Cameroon's",
        p3: "Convenor search not yet started",
      },
      charterStep:
        "Ratify the founding Charter as drafted for Cameroon, with Congo-specific institutional references.",
    },
    chad: {
      badge: "Pending accession",
      lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
      localScope:
        "Local FIU contact (ANIF-Tchad), and consideration of Arabic-language materials alongside French for northern regions.",
      contextHeading:
        "The most nascent digital-finance market of the six CEMAC states — infrastructure and connectivity gaps precede any regulatory question.",
      points: {
        p1: "Lowest financial-inclusion baseline in CEMAC",
        p2: "No known VASP activity publicly reported",
        p3: "Convenor search not yet started",
      },
      charterStep:
        "Ratify the founding Charter as drafted for Cameroon, with Chad-specific institutional references.",
    },
    car: {
      badge: "Pending accession",
      lede: "Shares COBAC, COSUMAF, BEAC and GABAC oversight with Cameroon; no chapter contact has been identified yet.",
      localScope:
        "Local FIU contact (ANIF-RCA) and a founding convenor — complicated by the only CEMAC state with an existing sovereign crypto initiative to account for.",
      contextHeading:
        "The one CEMAC state with prior national crypto legislation — any chapter here must reconcile with that existing framework, not start from zero.",
      points: {
        p1: "Prior national digital-currency legislation exists",
        p2: "Framework alignment work needed before Charter adoption",
        p3: "Convenor search not yet started",
      },
      charterStep:
        "Ratify the founding Charter with an added reconciliation annex for existing national digital-currency law.",
    },
    "equatorial-guinea": {
      badge: "Pending accession · translation required",
      lede: "The only CEMAC state with Spanish as a working language — the Charter and Readiness Framework require translation before accession can proceed.",
      localScope:
        "Spanish translation of the Charter and Readiness Framework, a confirmed FIU contact, and a founding convenor from Malabo or Bata.",
      contextHeading:
        "Language is the binding constraint here, not market readiness — no regulatory or convenor work can start until materials exist in Spanish.",
      points: {
        p1: "Spanish translation not yet commissioned",
        p2: "FIU contact not yet confirmed",
        p3: "Convenor search not yet started",
      },
      charterStep:
        "Ratify the founding Charter once translated into Spanish alongside the French original.",
    },
  },
  auth: {
    login: {
      alreadyPrompt: "Not a member yet?",
      alreadyLink: "Apply",
      title: "Member login",
      lede: "Log in to manage your accession status and profile.",
      email: "Email",
      password: "Password",
      submit: "Log in",
      forgot: "Forgot password?",
      forgotHelp:
        "Members cannot reset their own password yet. Ask the secretariat to issue a single-use reset link.",
      failed: "Those credentials were not recognised.",
      portal: "Member Portal",
      signingIn: "Signing in…",
      unreachable: "Could not reach the server. Try again.",
      accountsNote: "Accounts are created when you",
      accountsLink: "submit an accession request",
      staffNote: "Secretariat staff sign in",
      staffLink: "here",
    },
    reset: {
      title: "Set a new password",
      lede: "Reset links are issued by the secretariat and can be used once.",
      missingToken:
        "This link is missing its reset token. Ask the secretariat to issue a new one.",
      newPassword: "New password",
      submit: "Set password",
      done: "Password updated. You can now log in.",
      backToLogin: "Log in",
      prompt: "Already know your password?",
      updatedTitle: "Password updated",
      updatedBody: "That reset link has now been used and cannot be reused.",
      goToSignIn: "Go to sign-in",
      confirm: "Confirm password",
      minChars: "At least 8 characters",
      repeat: "Repeat it",
      saving: "Saving…",
      needLink: "Need a link?",
      contactSecretariat: "Contact the secretariat",
    },
    register: {
      prompt: "Already a member?",
      link: "Log in",
      lede: "Membership is open and non-exclusive — every applicant meeting a class's criteria is admitted.",
      steps: { class: "Class", details: "Details", review: "Review" },
      chooseClass: "Choose your membership class",
      classLegend: "Membership class",
      reviewTitle: "Review your application",
      reviewLede:
        "Membership status is never a substitute for regulatory authorization.",
      name: "Full name / Organization name",
      namePlaceholder: "e.g. Kamdem Fintech Ltd.",
      email: "Email",
      country: "Country",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmLabel:
        "I confirm this information is accurate and understand VAACA membership is not a substitute for regulatory authorization.",
      submit: "Submit Application",
      submitting: "Submitting…",
      continueLabel: "Continue",
      back: "Back",
      reviewAction: "Review",
      received: "Application received",
      receivedBody:
        "The secretariat will review your Class {class} application and follow up at {email}.",
      tellUs: "Tell us about you",
      applyingAs: "Applying as",
      rowName: "Name",
      goToDashboard: "Log in to your dashboard",
      failed: "We couldn't submit that application. Try again.",
    },
    staff: {
      prompt: "Not secretariat staff?",
      link: "member login",
      title: "Secretariat sign-in",
      lede: "The applications queue and Operating System are restricted to secretariat and Council staff.",
      workEmail: "Work email",
      internal: "Internal",
      noAccountsBefore: "No staff accounts exist yet. Provision one with",
      noAccountsAfter: "before signing in.",
      signingIn: "Signing in…",
      submit: "Sign in",
    },
    footer:
      "VAACA · Virtual Assets Association of Central Africa · In Formation",
  },
  framework: {
    domains: {
      D1: {
        name: "Governance",
        tests:
          "Board/management structure, fit-and-proper controls, documented decision rights.",
      },
      D2: {
        name: "AML/CFT",
        tests:
          "Customer due diligence, transaction monitoring, suspicious-activity reporting to ANIF.",
      },
      D3: {
        name: "Custody & Security",
        tests:
          "Key management, cold/hot wallet segregation, incident response.",
      },
      D4: {
        name: "Capital & Solvency",
        tests:
          "Minimum capital, client-asset segregation, insolvency-remote custody.",
      },
      D5: {
        name: "Consumer Protection",
        tests: "Disclosures, complaint handling, redress mechanisms.",
      },
      D6: {
        name: "Market Integrity",
        tests: "Market-abuse controls, conflicts-of-interest management.",
      },
      D7: {
        name: "Technology & Ops Resilience",
        tests:
          "Change management, uptime, disaster recovery, third-party dependencies.",
      },
      D8: {
        name: "Reporting & Disclosure",
        tests: "Regulatory reporting cadence, audit trail, public disclosures.",
      },
    },
    gates: {
      g1: {
        title: "Perimeter Test",
        body: "Does the applicant's activity fall inside the virtual-asset perimeter at all, or is it already licensed under banking, payments, or securities law?",
      },
      g2: {
        title: "Requalification Test",
        body: "Could the activity be requalified as a security, e-money, or payment service under existing law — bypassing the PSAN category entirely?",
      },
      g3: {
        title: "Regulator Test",
        body: "Which body has actual jurisdiction today — COBAC, COSUMAF, or a future CEMAC-level virtual-asset authority — and is that body currently equipped to receive an application?",
      },
    },
    gateLabel: "Gate",
    thresholds: {
      T0: { label: "T0 — Not ready", meaning: "gaps unaddressed" },
      T1: {
        label: "T1 — Conditionally ready",
        meaning: "viable with regulator sign-off",
      },
      T2: {
        label: "T2 — Regulator-ready",
        meaning: "dossier submittable as-is",
      },
    },
    scoreStatus: {
      not_started: "Not started",
      in_review: "In review",
      scored: "Scored",
      capped: "Capped",
      blocked: "Blocked",
    },
    memberStatus: {
      applicant: "Applicant",
      active: "Active member",
      suspended: "Suspended",
    },
    applicationStatus: {
      submitted: "Submitted",
      in_review: "In review",
      approved: "Approved",
      rejected: "Rejected",
    },
    classes: {
      A: { letter: "A — Operating", who: "VASPs / exchanges" },
      B: { letter: "B — Adjacent", who: "Banks, PSPs, telcos" },
      C: {
        letter: "C — Professional",
        who: "Individuals (legal, compliance, security)",
      },
      D: { letter: "D — Academic", who: "Researchers, universities" },
      E: {
        letter: "E — Institutional",
        who: "Regulators, ministries, partners",
      },
    },
  },
  home: {
    badge: "In Formation · Cameroon Founding Chapter",
    kicker: "Building Trust. Setting Standards. Connecting Central Africa.",
    title:
      "The regional institution organizing Central Africa's virtual-asset economy.",
    lede: "VAACA connects industry, regulators, researchers and innovators around shared standards and trusted market infrastructure across the six CEMAC states.",
    disclaimer:
      "VAACA is not a regulator. It does not replace BEAC, COBAC, COSUMAF, GABAC or national governments — it is an independent institution that builds standards, evidence and dialogue alongside them.",
    exploreInstitution: "Explore the Institution",
    stats: {
      states: "CEMAC states",
      domains: "Readiness domains",
      seats: "Founding seats",
    },
    heroGraphic:
      "The six CEMAC member states, connected to Cameroon's founding chapter",
    exploreEyebrow: "Explore VAACA",
    learnMore: "Learn more",
    sections: {
      institution:
        "Why VAACA exists, its founders, secretariat and first convening.",
      standards:
        "The PSAN Regulatory Readiness Framework — gates, domains, roadmap.",
      ecosystem: "Who VAACA connects, and its regulatory engagement posture.",
      membership:
        "Accession classes, the application process, and common questions.",
      governance: "Nine founding seats — no single interest holds a majority.",
      region:
        "Cameroon's founding chapter and the five CEMAC states next in line.",
    },
  },
  common: {
    loading: "Loading…",
    signOut: "Sign out",
    signingOut: "Signing out…",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    search: "Search",
    filter: "Filter",
    status: "Status",
    updated: "Updated",
    notPublished: "Not yet published",
    publicSite: "Public site",
    couldNotReachServer: "Could not reach the server.",
    couldNotSave: "That change could not be saved.",
  },
} as const;

/**
 * French. Five of the six CEMAC member states are francophone — Gabon, Congo,
 * the Central African Republic and Chad, with Cameroon bilingual — so this is
 * a primary language for the Association, not a courtesy translation.
 */
export const fr: Dictionary = {
  nav: {
    primary: {
      institution: "L'institution",
      standards: "Normes",
      ecosystem: "Écosystème",
      membership: "Adhésion",
      governance: "Gouvernance",
      region: "Région",
    },
    resources: "Ressources",
    login: "Connexion",
    join: "Adhérer à l'Association",
    toggleMenu: "Afficher le menu",
    primaryLabel: "Principal",
    closeMenu: "Fermer le menu",
    currentPage: "page actuelle",
    skipToContent: "Aller au contenu",
    backToVaaca: "Retour à VAACA",
    backToTop: "Haut de page",
  },
  language: {
    label: "Langue",
    switchTo: "Passer en {language}",
    current: "Langue actuelle : {language}",
  },
  footer: {
    blurb:
      "Virtual Assets Association of Central Africa — une institution régionale, en formation, dont le siège est porté par son chapitre fondateur camerounais.",
    tagline:
      "VAACA · Virtual Assets Association of Central Africa · En formation",
    coalition:
      "Coalition fondatrice : Info Pro Solutions · Ejara · Blockchain Association of Cameroon · IAFN — rattachée à la CFIA pendant la phase de fondation",
    headings: {
      institution: "Institution",
      programs: "Programmes",
      access: "Accès",
    },
    links: {
      theInstitution: "L'institution",
      founders: "Fondateurs",
      governance: "Gouvernance",
      secretariat: "Secrétariat",
      standards: "Normes",
      ecosystem: "Écosystème",
      membership: "Adhésion",
      region: "Région",
      register: "Adhérer / S'inscrire",
      memberLogin: "Espace membre",
      resources: "Ressources",
      staffLogin: "Connexion secrétariat",
    },
  },
  standards: {
    title: "Cadre VAACA 01 — Maturité réglementaire PSAN",
    lede: "Trois portes de périmètre déterminent si une activité entre dans le champ. Huit domaines de maturité, notés sur 24 points, déterminent si elle peut être présentée à un régulateur aujourd'hui.",
    scoreMeaning: "Ce que signifie une note",
    assessed:
      "Les membres des classes A et B sont évalués sur les huit domaines, sur {max} points, et suivent leur propre note depuis leur",
    assessedLink: "espace membre",
    capNote:
      "Lorsqu'une instruction réglementaire n'existe pas encore, le cadre plafonne le domaine concerné plutôt que de le noter de façon optimiste.",
    readFramework: "Lire le cadre",
    applyForMembership: "Déposer une candidature",
    roadmapEyebrow: "Feuille de route",
    roadmapTitle: "Ce que VAACA construit ensuite.",
    brands: {
      standards: "Cadres, lignes directrices et certification de maturité.",
      policy: "Veille réglementaire et réponses aux consultations.",
      intelligence: "Études de marché et données par pays.",
      academy: "Formation et certification professionnelles.",
    },
    inDevelopment: "En développement",
    planned: "Prévu",
  },
  governance: {
    title: "Neuf sièges fondateurs. Aucun intérêt ne détient la majorité.",
    recruiting:
      "Le Conseil est en cours de constitution : aucun des neuf sièges n'est encore pourvu. Les sièges sont publiés ici au fur et à mesure.",
    filled: "{filled} sièges pourvus sur {total}.",
    majorityHeld:
      "{bloc} détient {count} sièges sur {total} — une majorité, que la règle de composition du Conseil ne permet pas de maintenir.",
    noMajority:
      "Aucun intérêt ne peut détenir la majorité : le bloc le plus large compte {largest} sièges sur {total}.",
    seatLabel: "Siège",
    publishNote:
      "Les titulaires de sièges sont nommés dans l'Architecture de la coalition fondatrice une fois désignés. Les candidatures à l'étude ne sont pas publiées.",
    blocs: {
      industry: "Secteur",
      professional: "Professionnel",
      independent: "Indépendant",
    },
    seatStatus: {
      vacant: "Vacant — en recrutement",
      candidate: "Candidature identifiée",
      filled: "Pourvu",
    },
    seats: {
      s1: {
        name: "Juridique — marchés financiers CEMAC",
        why: "Interprète le régime PSAN et le risque de requalification dans la zone.",
      },
      s2: {
        name: "Établissement financier réglementé",
        why: "Apporte le regard d'une banque ou d'un PSP sur les risques de conservation et de règlement.",
      },
      s3: {
        name: "Paiements / PSP",
        why: "Représente le corridor du mobile money et des paiements que VAACA ne doit pas perturber.",
      },
      s4: {
        name: "PSAN / plateforme d'échange",
        why: "Le sujet réglementé que l'Association existe pour préparer.",
      },
      s5: {
        name: "Conformité / LBC-FT",
        why: "Porte la crédibilité du domaine LBC/FT auprès des régulateurs.",
      },
      s6: {
        name: "Cybersécurité / infrastructure",
        why: "Porte la crédibilité des domaines conservation et résilience opérationnelle.",
      },
      s7: {
        name: "Académique / recherche",
        why: "Base de données probantes indépendante, distincte du lobbying sectoriel.",
      },
      s8: {
        name: "Consommateurs / intégrité du marché",
        why: "Contrepoids aux sièges 2 à 4 ; maintient une protection réelle des clients.",
      },
      s9: {
        name: "Facilitateur",
        why: "Présidence indépendante — aucun siège n'est président par défaut.",
      },
    },
  },
  region: {
    title:
      "Une région. Plusieurs marchés. Une architecture institutionnelle commune.",
    mapTitle:
      "Les six États membres de la CEMAC, le Cameroun étant le chapitre fondateur",
    coverage: "Couverture CEMAC",
    coverageNote:
      "Les six États membres relèvent des mêmes régulateurs régionaux — COBAC, COSUMAF, BEAC et GABAC — si bien que le Cadre de maturité se transpose d'un État à l'autre presque sans changement. Seules la transposition PSAN locale et la dotation du secrétariat sont propres à chaque chapitre.",
    applications: "{count} candidature(s)",
    memberAccounts: "{count} compte(s) membre",
  },
  resources: {
    title: "Documents et bibliothèque",
    lede: "Documents fondateurs, projets de normes et notes. Les éléments au statut de projet sont diffusés pour commentaires et ne constituent pas des positions définitives.",
    footnote:
      "Les documents marqués « Pas encore publié » sont rédigés mais non diffusés. Contactez le secrétariat pour y accéder.",
    generatedOnRequest: "généré à la demande",
    documents: {
      "institutional-charter": {
        title: "Charte fondatrice",
        description: "Gouvernance, classes d'adhésion et mandat.",
      },
      "psan-readiness-framework": {
        title: "Cadre de maturité réglementaire PSAN",
        description: "3 portes, 8 domaines, barème de 24 points.",
      },
      "founding-coalition-architecture": {
        title: "Architecture de la coalition fondatrice",
        description: "9 sièges et relations institutionnelles prioritaires.",
      },
      "instruction-gap-register": {
        title: "Registre des lacunes d'instruction",
        description:
          "Dix lacunes réglementaires qui bloquent la notation complète.",
      },
      "cemac-federation-roadmap": {
        title: "Feuille de route de la fédération CEMAC",
        description:
          "Trajectoire séquencée du chapitre camerounais à la fédération complète.",
      },
      "founding-declaration-brief": {
        title: "Note de déclaration fondatrice",
        description: "Pour la conférence de Yaoundé — pas encore publique.",
      },
    },
    unavailable: {
      drafting: "Rédaction en cours.",
      internal: "Interne — non diffusé hors de la coalition fondatrice.",
      missing: "Fichier absent du dépôt documentaire.",
    },
  },
  membership: {
    title:
      "Ouverte et non exclusive. Cinq classes, aucun refus discrétionnaire.",
    lede: "Tout candidat qui remplit les critères d'une classe est admis. Le statut de membre ne remplace jamais une autorisation réglementaire.",
    table: { class: "Classe", who: "Qui", voting: "Vote" },
    voting: { full: "Plein", limited: "Limité", observer: "Observateur" },
    stepLabel: "Étape {n}",
    steps: {
      s1: "Identifier votre classe",
      s2: "Déposer la demande d'adhésion auprès du secrétariat",
      s3: "Les classes A et B réalisent l'auto-évaluation de maturité",
    },
    startApplication: "Déposer une candidature",
    questionsEyebrow: "Questions",
    questionsTitle: "Questions fréquentes.",
    faqs: {
      regulator: {
        q: "VAACA est-elle un régulateur ?",
        a: "Non. VAACA ne délivre pas d'agrément, ne supervise pas et ne sanctionne pas. Elle produit des normes et des données probantes sur lesquelles les régulateurs peuvent s'appuyer.",
      },
      whoCanJoin: {
        q: "Qui peut adhérer ?",
        a: "Toute organisation ou personne relevant de l'une des cinq classes d'adhésion — l'adhésion est ouverte et non exclusive.",
      },
      whyCameroon: {
        q: "Pourquoi commencer par le Cameroun ?",
        a: "Un chapitre qui fonctionne est plus facile à réussir que six à la fois. La Charte et le Cadre de maturité camerounais sont conçus pour être repris tels quels par les autres États de la CEMAC.",
      },
      funding: {
        q: "Comment VAACA est-elle financée ?",
        a: "Pas encore défini publiquement — le modèle de financement sera publié une fois le secrétariat nommé et la Charte ratifiée.",
      },
    },
  },
  ecosystem: {
    title: "Un écosystème, relié autour de normes communes.",
    groups: {
      banks: "Banques",
      vasps: "PSAN et plateformes d'échange",
      fintechs: "Fintechs et PSP",
      regulators: "Régulateurs",
      investors: "Investisseurs",
      academia: "Monde académique",
      legal: "Juridique et conformité",
      consumers: "Consommateurs",
    },
    priorityInstitutions: "Institutions prioritaires",
    priorityNote:
      "Déduites de la posture d'engagement ci-dessous, afin que les deux ne puissent plus diverger sur qui est prioritaire.",
    engagementEyebrow: "Engagement politique et réglementaire",
    engagementTitle: "Une posture d'engagement, pas du lobbying.",
    postures: {
      "Engage first": "Engager en priorité",
      "Engage early": "Engager tôt",
      Monitor: "Suivre",
      Inform: "Informer",
    },
  },
  institution: {
    title:
      "VAACA existe pour organiser, professionnaliser, normaliser et relier l'écosystème des actifs virtuels d'Afrique centrale — pas pour le diriger.",
    pillars: {
      trust: {
        title: "Confiance",
        body: "Gouvernance, transparence et règles de conflits d'intérêts inscrites dans la Charte dès le premier projet.",
      },
      standards: {
        title: "Normes",
        body: "Le Cadre de maturité réglementaire PSAN — portes, domaines et seuils de preuve sur lesquels les régulateurs peuvent s'appuyer.",
      },
      connectivity: {
        title: "Connectivité",
        body: "Un modèle de chapitre conçu pour se répliquer dans les six États de la CEMAC sous une architecture institutionnelle unique.",
      },
    },
    foundersEyebrow: "Fondateurs",
    foundersTitle:
      "Constituée par quatre organisations. Ancrée, et non improvisée.",
    foundersNote:
      "Pendant sa phase de fondation, VAACA est rattachée comme organe auxiliaire à la Cameroon Fintech Association (CFIA) — un ancrage national établi plutôt qu'une légitimité institutionnelle construite à partir de rien. VAACA s'engage à adopter une constitution régionale autonome dès lors que des chapitres nationaux existeront dans au moins trois États membres de la CEMAC.",
    founders: {
      infoPro: "RegTech — infrastructure de conformité et de reporting",
      ejara: "Opérateur agréé — accès réglementé aux actifs numériques",
      bac: "Association professionnelle nationale",
      iafn: "Secrétariat technique et base de données probantes",
    },
    secretariatEyebrow: "Secrétariat",
    secretariatTitle:
      "La capacité opérationnelle que chaque document fondateur suppose déjà en place.",
    appointed: "Nommé",
    vacant: "Vacant",
    posts: {
      secretaryGeneral: {
        vacant:
          "Pas encore nommé — requis avant que la Charte puisse être ratifiée.",
        filled: "Nommé. La Charte peut être soumise à ratification.",
      },
      standardsOfficer: {
        vacant:
          "Pas encore nommé — responsable de la notation du Cadre de maturité dès l'activation des domaines.",
        filled: "Nommé. Responsable de la notation du Cadre de maturité.",
      },
    },
    eventsEyebrow: "Événements",
    eventsTitle:
      "Le séminaire de lancement est la première rencontre de VAACA.",
    seminarName:
      "Séminaire institutionnel de lancement — sous patronage ministériel",
    seminarDates: "29–30 septembre 2026",
    seminarBody:
      "La première journée réunit les régulateurs de la CEMAC autour de la convergence et des normes ; le mandat de VAACA, ses membres fondateurs et son affiliation à la CFIA sont présentés le deuxième jour.",
    seminarState: {
      confirmed: "Confirmé",
      inSession: "En cours",
      held: "Tenu",
    },
  },
  institutions: {
    COSUMAF: {
      desc: "Régulateur régional des marchés financiers de la CEMAC.",
      posture:
        "Cible prioritaire de la porte 3 — l'autorité d'agrément PSAN la plus plausible à terme.",
    },
    CNEF: {
      desc: "Comité National Économique et Financier — encadre la relation entre les consommateurs financiers et les établissements de crédit, de paiement, de microfinance et d'assurance.",
      posture:
        "Pertinent pour la protection des consommateurs (D5) et toute requalification en établissement de paiement au titre de la porte 2.",
    },
    MINFI: {
      desc: "Ministère des Finances du Cameroun.",
      posture:
        "Information de courtoisie une fois la Charte ratifiée ; ce n'est pas une autorité d'agrément.",
    },
    ANIF: {
      desc: "Cellule de renseignement financier du Cameroun (déclarations LBC/FT).",
      posture:
        "Nécessaire pour combler la lacune G3 (règle du voyage) — contact technique précoce.",
    },
    COBAC: {
      desc: "Commission régionale de supervision bancaire de la CEMAC.",
      posture:
        "Pertinent uniquement si un candidat est requalifié en banque ou PSP au titre de la porte 2.",
    },
    BEAC: {
      desc: "Banque des États de l'Afrique Centrale — autorité monétaire.",
      posture:
        "Intérêt de politique monétaire seulement si une dimension stablecoin ou MNBC émerge.",
    },
    GABAC: {
      desc: "Organe régional LBC/FT de la CEMAC.",
      posture: "Interlocuteur normatif pour le domaine LBC/FT (D2).",
    },
    MINPOSTEL: {
      desc: "Régulateurs camerounais des télécommunications, de la cybersécurité et des postes.",
      posture:
        "Pertinent uniquement pour les domaines conservation et résilience technique (D3, D7).",
    },
    DGI: {
      desc: "Direction Générale des Impôts du Cameroun.",
      posture:
        "Nécessaire pour combler la lacune G9 (traitement fiscal) avant tout dépôt de dossier.",
    },
  },
  chapters: {
    labels: {
      fiu: "CRF nationale",
      language: "Langue de travail",
      regulators: "Régulateurs communs",
      accession: "Statut d'adhésion",
      federationModel: "Modèle de fédération",
      definesFounding:
        "Ce que ce chapitre définit, et ce que chaque autre chapitre conserve en propre.",
      definesPending:
        "Ce qui se réplique depuis le chapitre camerounais, et ce qui reste local.",
      mapTitle: "{name} parmi les six États membres de la CEMAC",
      replicates: "Se réplique dans chaque chapitre",
      carriesOver: "Repris à l'identique",
      chapterStatus: "Statut du chapitre",
      marketContext: "Contexte de marché",
      sequence: "Séquence vers la ratification",
      pathToAccession: "Chemin vers l'adhésion",
      allChapters: "Tous les chapitres",
    },
    carriesOver: {
      charter: "Charte et architecture de gouvernance",
      framework: "Cadre de maturité réglementaire PSAN (8 domaines)",
      gates: "Portes de périmètre, de requalification et de régulateur",
      regulators: "Régulateurs régionaux : COBAC, COSUMAF, BEAC, GABAC",
    },
    eyebrowFounding: "Chapitre fondateur CEMAC",
    eyebrowChapter: "Chapitre CEMAC",
    gridPending: "En attente",
    pendingAccession: "Adhésion en attente",
    accessionSteps: {
      convenor: {
        title: "Identifier un facilitateur local",
        body: "Un contact fondateur issu du secteur, du monde académique ou public pour porter l'adhésion localement.",
      },
      charter: { title: "Adopter la Charte" },
      intake: {
        title: "Ouvrir l'évaluation de maturité",
        body: "Commencer à évaluer les candidats locaux sur le même cadre à 8 domaines.",
      },
    },
    stepsHeadingPending:
      "Trois étapes avant que {name} ne devienne un chapitre actif.",
    ctaHeading: "Vous souhaitez animer le chapitre {name} ?",
    ctaBody:
      "Contactez le secrétariat pour manifester votre intérêt comme facilitateur local fondateur.",
    ctaLabel: "Manifester son intérêt",
    names: {
      cameroon: { short: "Cameroun", full: "Cameroun" },
      gabon: { short: "Gabon", full: "Gabon" },
      congo: { short: "Congo", full: "République du Congo" },
      chad: { short: "Tchad", full: "Tchad" },
      car: { short: "RCA", full: "République centrafricaine" },
      "equatorial-guinea": { short: "Guinée éq.", full: "Guinée équatoriale" },
    },
    languages: {
      cameroon: "Français / Anglais",
      gabon: "Français",
      congo: "Français",
      chad: "Français / Arabe",
      car: "Français",
      "equatorial-guinea": "Espagnol / Français",
    },
    cameroon: {
      badge: "Chapitre fondateur · actif",
      gridStatus: "Chapitre fondateur",
      lede: "Le premier chapitre opérationnel de VAACA. La Charte, le Cadre de maturité et la coalition fondatrice du Cameroun y sont rédigés, puis packagés pour que les cinq autres États de la CEMAC puissent les adopter tels quels.",
      localScope:
        "Le secrétariat à deux postes prévu par la partie 6 de la Charte (Secrétaire général, Responsable des normes et de l'évaluation), le Conseil de coordination à neuf sièges, et l'affiliation à la Cameroon Fintech Association (CFIA) pendant la phase de fondation.",
      contextHeading:
        "Tout ce dont hériteront les cinq autres chapitres se construit d'abord ici.",
      points: {
        p1: "Charte, Cadre de maturité et Architecture de coalition rédigés",
        p2: "Neuf sièges fondateurs définis — recrutement non encore engagé",
        p3: "Secrétariat non encore nommé ; requis avant la ratification de la Charte",
      },
      stepsHeading: "Trois étapes avant que la Charte puisse être ratifiée.",
      steps: {
        s1: {
          title: "Nommer le secrétariat",
          body: "Secrétaire général et Responsable des normes et de l'évaluation — la capacité opérationnelle que chaque document fondateur suppose déjà en place.",
        },
        s2: {
          title: "Pourvoir les neuf sièges fondateurs",
          body: "Aucun intérêt ne peut détenir la majorité ; le facilitateur préside mais ne dispose d'aucune voix supplémentaire.",
        },
        s3: {
          title: "Signer la déclaration fondatrice",
          body: "Lors de la Conférence institutionnelle de la CBA à Yaoundé, en octobre 2026, suivie de l'enregistrement comme association camerounaise.",
        },
      },
      ctaHeading: "Rejoindre le chapitre fondateur camerounais",
      ctaBody:
        "L'adhésion est ouverte et non exclusive dans cinq classes. Tout candidat remplissant les critères d'une classe est admis.",
      ctaLabel: "Déposer une candidature",
    },
    gabon: {
      badge: "Cible prioritaire de réplication",
      lede: "Le pôle financier de la CEMAC, avec une activité de marchés de capitaux existante et le secteur bancaire le plus développé de la région — le deuxième chapitre le plus plausible après le Cameroun.",
      localScope:
        "Contact avec la CRF locale (ANIF-Gabon), transposition du Cadre de maturité dans les instruments gabonais, et un facilitateur local issu du secteur financier de Libreville.",
      contextHeading:
        "Le Gabon accueille déjà les plus grands marchés de capitaux de la CEMAC — une activité en actifs virtuels existe probablement avant tout cadre.",
      points: {
        p1: "Siège de l'essentiel de l'activité de marché coté de la COSUMAF",
        p2: "Secteur bancaire et assurantiel établi, à portée transfrontalière",
        p3: "Aucun contact de chapitre identifié à ce jour",
      },
      charterStep:
        "Ratifier la Charte fondatrice telle que rédigée pour le Cameroun, avec les références institutionnelles propres au Gabon.",
    },
    congo: {
      badge: "Adhésion en attente",
      lede: "Partage avec le Cameroun la supervision de la COBAC, de la COSUMAF, de la BEAC et du GABAC ; aucun contact de chapitre n'a encore été identifié.",
      localScope:
        "Contact avec la CRF locale (ANIF-Congo) et un facilitateur fondateur issu du milieu économique de Brazzaville ou de Pointe-Noire.",
      contextHeading:
        "Une économie dépendante du pétrole en quête de diversification — l'intérêt pour les actifs virtuels est naissant mais les contacts réglementaires ne sont pas établis.",
      points: {
        p1: "Aucune activité PSAN connue rapportée publiquement",
        p2: "Régulateurs régionaux identiques à ceux du Cameroun",
        p3: "Recherche de facilitateur non engagée",
      },
      charterStep:
        "Ratifier la Charte fondatrice telle que rédigée pour le Cameroun, avec les références institutionnelles propres au Congo.",
    },
    chad: {
      badge: "Adhésion en attente",
      lede: "Partage avec le Cameroun la supervision de la COBAC, de la COSUMAF, de la BEAC et du GABAC ; aucun contact de chapitre n'a encore été identifié.",
      localScope:
        "Contact avec la CRF locale (ANIF-Tchad), et prise en compte de supports en arabe aux côtés du français pour les régions du nord.",
      contextHeading:
        "Le marché de la finance numérique le plus naissant des six États de la CEMAC — les lacunes d'infrastructure et de connectivité précèdent toute question réglementaire.",
      points: {
        p1: "Le plus faible niveau d'inclusion financière de la CEMAC",
        p2: "Aucune activité PSAN connue rapportée publiquement",
        p3: "Recherche de facilitateur non engagée",
      },
      charterStep:
        "Ratifier la Charte fondatrice telle que rédigée pour le Cameroun, avec les références institutionnelles propres au Tchad.",
    },
    car: {
      badge: "Adhésion en attente",
      lede: "Partage avec le Cameroun la supervision de la COBAC, de la COSUMAF, de la BEAC et du GABAC ; aucun contact de chapitre n'a encore été identifié.",
      localScope:
        "Contact avec la CRF locale (ANIF-RCA) et un facilitateur fondateur — une démarche compliquée par le fait qu'il s'agit du seul État de la CEMAC doté d'une initiative crypto souveraine existante.",
      contextHeading:
        "Le seul État de la CEMAC doté d'une législation crypto nationale antérieure — tout chapitre devra s'articuler avec ce cadre existant plutôt que de partir de zéro.",
      points: {
        p1: "Une législation nationale sur la monnaie numérique existe déjà",
        p2: "Travail d'alignement du cadre nécessaire avant l'adoption de la Charte",
        p3: "Recherche de facilitateur non engagée",
      },
      charterStep:
        "Ratifier la Charte fondatrice avec une annexe de mise en cohérence avec la législation nationale existante sur la monnaie numérique.",
    },
    "equatorial-guinea": {
      badge: "Adhésion en attente · traduction requise",
      lede: "Le seul État de la CEMAC dont l'espagnol est langue de travail — la Charte et le Cadre de maturité doivent être traduits avant que l'adhésion puisse avancer.",
      localScope:
        "Traduction en espagnol de la Charte et du Cadre de maturité, un contact CRF confirmé, et un facilitateur fondateur de Malabo ou de Bata.",
      contextHeading:
        "La langue est ici la contrainte déterminante, et non la maturité du marché — aucun travail réglementaire ni de facilitation ne peut commencer avant que les supports existent en espagnol.",
      points: {
        p1: "Traduction espagnole non encore commandée",
        p2: "Contact CRF non encore confirmé",
        p3: "Recherche de facilitateur non engagée",
      },
      charterStep:
        "Ratifier la Charte fondatrice une fois traduite en espagnol aux côtés de l'original français.",
    },
  },
  auth: {
    login: {
      alreadyPrompt: "Pas encore membre ?",
      alreadyLink: "Candidater",
      title: "Espace membre",
      lede: "Connectez-vous pour suivre votre adhésion et gérer votre profil.",
      email: "Adresse e-mail",
      password: "Mot de passe",
      submit: "Se connecter",
      forgot: "Mot de passe oublié ?",
      forgotHelp:
        "Les membres ne peuvent pas encore réinitialiser eux-mêmes leur mot de passe. Demandez au secrétariat un lien à usage unique.",
      failed: "Ces identifiants n'ont pas été reconnus.",
      portal: "Espace membre",
      signingIn: "Connexion…",
      unreachable: "Impossible de joindre le serveur. Réessayez.",
      accountsNote: "Les comptes sont créés lorsque vous",
      accountsLink: "déposez une demande d'adhésion",
      staffNote: "Le secrétariat se connecte",
      staffLink: "ici",
    },
    reset: {
      title: "Définir un nouveau mot de passe",
      lede: "Les liens de réinitialisation sont émis par le secrétariat et ne servent qu'une fois.",
      missingToken:
        "Ce lien ne comporte pas de jeton de réinitialisation. Demandez-en un nouveau au secrétariat.",
      newPassword: "Nouveau mot de passe",
      submit: "Définir le mot de passe",
      done: "Mot de passe mis à jour. Vous pouvez maintenant vous connecter.",
      backToLogin: "Se connecter",
      prompt: "Vous connaissez déjà votre mot de passe ?",
      updatedTitle: "Mot de passe mis à jour",
      updatedBody:
        "Ce lien de réinitialisation a été utilisé et ne peut plus servir.",
      goToSignIn: "Aller à la connexion",
      confirm: "Confirmer le mot de passe",
      minChars: "Au moins 8 caractères",
      repeat: "Ressaisissez-le",
      saving: "Enregistrement…",
      needLink: "Besoin d'un lien ?",
      contactSecretariat: "Contacter le secrétariat",
    },
    register: {
      prompt: "Déjà membre ?",
      link: "Se connecter",
      lede: "L'adhésion est ouverte et non exclusive — tout candidat remplissant les critères d'une classe est admis.",
      steps: {
        class: "Classe",
        details: "Informations",
        review: "Vérification",
      },
      chooseClass: "Choisissez votre classe d'adhésion",
      classLegend: "Classe d'adhésion",
      reviewTitle: "Vérifiez votre candidature",
      reviewLede:
        "Le statut de membre ne remplace jamais une autorisation réglementaire.",
      name: "Nom complet / Raison sociale",
      namePlaceholder: "ex. Kamdem Fintech Ltd.",
      email: "Adresse e-mail",
      country: "Pays",
      password: "Mot de passe",
      passwordPlaceholder: "Au moins 8 caractères",
      confirmLabel:
        "Je confirme l'exactitude de ces informations et je comprends que l'adhésion à VAACA ne remplace pas une autorisation réglementaire.",
      submit: "Envoyer la candidature",
      submitting: "Envoi…",
      continueLabel: "Continuer",
      back: "Retour",
      reviewAction: "Vérifier",
      received: "Candidature reçue",
      receivedBody:
        "Le secrétariat examinera votre candidature de classe {class} et vous recontactera à {email}.",
      tellUs: "Parlez-nous de vous",
      applyingAs: "Candidature au titre de",
      rowName: "Nom",
      goToDashboard: "Accéder à votre espace",
      failed: "Nous n'avons pas pu envoyer cette candidature. Réessayez.",
    },
    staff: {
      prompt: "Vous n'êtes pas du secrétariat ?",
      link: "espace membre",
      title: "Connexion secrétariat",
      lede: "La file des candidatures et l'Operating System sont réservés au secrétariat et aux membres du Conseil.",
      workEmail: "Adresse e-mail professionnelle",
      internal: "Interne",
      noAccountsBefore:
        "Aucun compte du secrétariat n'existe encore. Créez-en un avec",
      noAccountsAfter: "avant de vous connecter.",
      signingIn: "Connexion…",
      submit: "Se connecter",
    },
    footer:
      "VAACA · Virtual Assets Association of Central Africa · En formation",
  },
  framework: {
    domains: {
      D1: {
        name: "Gouvernance",
        tests:
          "Structure de direction, contrôles d'honorabilité et de compétence, droits de décision documentés.",
      },
      D2: {
        name: "LBC/FT",
        tests:
          "Vigilance à l'égard de la clientèle, surveillance des transactions, déclarations de soupçon à l'ANIF.",
      },
      D3: {
        name: "Conservation et sécurité",
        tests:
          "Gestion des clés, séparation des portefeuilles froids et chauds, réponse aux incidents.",
      },
      D4: {
        name: "Fonds propres et solvabilité",
        tests:
          "Capital minimum, ségrégation des actifs clients, conservation à l'abri de l'insolvabilité.",
      },
      D5: {
        name: "Protection des consommateurs",
        tests: "Information, traitement des réclamations, voies de recours.",
      },
      D6: {
        name: "Intégrité du marché",
        tests:
          "Dispositifs contre les abus de marché, gestion des conflits d'intérêts.",
      },
      D7: {
        name: "Résilience technique et opérationnelle",
        tests:
          "Gestion du changement, disponibilité, reprise après sinistre, dépendances aux tiers.",
      },
      D8: {
        name: "Reporting et transparence",
        tests:
          "Fréquence du reporting réglementaire, piste d'audit, publications.",
      },
    },
    gates: {
      g1: {
        title: "Test du périmètre",
        body: "L'activité du candidat entre-t-elle dans le périmètre des actifs virtuels, ou relève-t-elle déjà d'un agrément bancaire, de paiement ou de marchés financiers ?",
      },
      g2: {
        title: "Test de requalification",
        body: "L'activité pourrait-elle être requalifiée en titre financier, monnaie électronique ou service de paiement au regard du droit existant — contournant entièrement la catégorie PSAN ?",
      },
      g3: {
        title: "Test du régulateur",
        body: "Quelle autorité est aujourd'hui compétente — COBAC, COSUMAF, ou une future autorité CEMAC dédiée aux actifs virtuels — et cette autorité est-elle en mesure de recevoir un dossier ?",
      },
    },
    gateLabel: "Porte",
    thresholds: {
      T0: { label: "T0 — Non prêt", meaning: "lacunes non traitées" },
      T1: {
        label: "T1 — Prêt sous conditions",
        meaning: "viable avec l'accord du régulateur",
      },
      T2: {
        label: "T2 — Prêt pour le régulateur",
        meaning: "dossier déposable en l'état",
      },
    },
    scoreStatus: {
      not_started: "Non commencé",
      in_review: "En cours d'examen",
      scored: "Évalué",
      capped: "Plafonné",
      blocked: "Bloqué",
    },
    memberStatus: {
      applicant: "Candidat",
      active: "Membre actif",
      suspended: "Suspendu",
    },
    applicationStatus: {
      submitted: "Déposée",
      in_review: "En cours d'examen",
      approved: "Approuvée",
      rejected: "Rejetée",
    },
    classes: {
      A: { letter: "A — Opérateur", who: "PSAN / plateformes d'échange" },
      B: { letter: "B — Connexe", who: "Banques, PSP, opérateurs télécoms" },
      C: {
        letter: "C — Professionnel",
        who: "Personnes physiques (juridique, conformité, sécurité)",
      },
      D: { letter: "D — Académique", who: "Chercheurs, universités" },
      E: {
        letter: "E — Institutionnel",
        who: "Régulateurs, ministères, partenaires",
      },
    },
  },
  home: {
    badge: "En formation · Chapitre fondateur camerounais",
    kicker:
      "Bâtir la confiance. Définir les normes. Connecter l'Afrique centrale.",
    title:
      "L'institution régionale qui structure l'économie des actifs virtuels en Afrique centrale.",
    lede: "VAACA rassemble les acteurs du secteur, les régulateurs, les chercheurs et les innovateurs autour de normes communes et d'infrastructures de marché fiables, dans les six États de la CEMAC.",
    disclaimer:
      "VAACA n'est pas un régulateur. Elle ne se substitue ni à la BEAC, ni à la COBAC, ni à la COSUMAF, ni au GABAC, ni aux gouvernements nationaux — c'est une institution indépendante qui construit des normes, des données probantes et le dialogue à leurs côtés.",
    exploreInstitution: "Découvrir l'institution",
    stats: {
      states: "États de la CEMAC",
      domains: "Domaines de maturité",
      seats: "Sièges fondateurs",
    },
    heroGraphic:
      "Les six États membres de la CEMAC, reliés au chapitre fondateur camerounais",
    exploreEyebrow: "Découvrir VAACA",
    learnMore: "En savoir plus",
    sections: {
      institution:
        "Pourquoi VAACA existe, ses fondateurs, son secrétariat et sa première rencontre.",
      standards:
        "Le Cadre de maturité réglementaire PSAN — portes, domaines, feuille de route.",
      ecosystem: "Qui VAACA relie, et sa posture d'engagement réglementaire.",
      membership:
        "Les classes d'adhésion, la procédure de candidature et les questions fréquentes.",
      governance:
        "Neuf sièges fondateurs — aucun intérêt ne détient la majorité.",
      region:
        "Le chapitre fondateur camerounais et les cinq États de la CEMAC qui suivent.",
    },
  },
  common: {
    loading: "Chargement…",
    signOut: "Se déconnecter",
    signingOut: "Déconnexion…",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    edit: "Modifier",
    search: "Rechercher",
    filter: "Filtrer",
    status: "Statut",
    updated: "Mis à jour",
    notPublished: "Pas encore publié",
    publicSite: "Site public",
    couldNotReachServer: "Impossible de joindre le serveur.",
    couldNotSave: "Cette modification n'a pas pu être enregistrée.",
  },
};

/**
 * English is the shape every locale must match, to any depth. Because `fr` is
 * annotated `Dictionary`, a missing, extra or misspelled key is a compile
 * error — there is no runtime fallback that would quietly ship English text on
 * a French page.
 */
type DeepStrings<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]>;
};

export type Dictionary = DeepStrings<typeof en>;

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

export const dictionary = (locale: Locale): Dictionary => DICTIONARIES[locale];

/** `t("Switch to {language}", { language: "Français" })` */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
