// Default/seed content. On first run (when a collection is empty), the signed-in first
// admin's browser writes these into Firestore so there's real content to edit right away
// instead of blank pages — see src/lib/seed.js.

export const DEFAULT_LEADERS = [
  { id: 'lead-1', name: 'J. Boateng', position: 'President', level: 'Level 400 · Geological Engineering', bg: '#155232', photoUrl: null, photoPath: null, order: 0 },
  { id: 'lead-2', name: 'A. Sarpong', position: 'Vice President', level: 'Level 300 · Drilling Engineering', bg: '#227A48', photoUrl: null, photoPath: null, order: 1 },
  { id: 'lead-3', name: 'M. Owusu', position: 'General Secretary', level: 'Level 300 · Geological Engineering', bg: '#E8B923', photoUrl: null, photoPath: null, order: 2 },
  { id: 'lead-4', name: 'F. Darko', position: 'Financial Secretary', level: 'Level 200 · Drilling Engineering', bg: '#103F29', photoUrl: null, photoPath: null, order: 3 },
  { id: 'lead-5', name: 'S. Kim', position: 'Treasurer', level: 'Level 300 · Geological Engineering', bg: '#227A48', photoUrl: null, photoPath: null, order: 4 },
  { id: 'lead-6', name: 'R. Adjei', position: 'Organizing Secretary', level: 'Level 200 · Drilling Engineering', bg: '#155232', photoUrl: null, photoPath: null, order: 5 },
  { id: 'lead-7', name: 'L. Fernandez', position: 'Public Relations Officer', level: 'Level 300 · Geological Engineering', bg: '#E8B923', photoUrl: null, photoPath: null, order: 6 },
  { id: 'lead-8', name: 'D. Nkrumah', position: 'Welfare Officer', level: 'Level 200 · Drilling Engineering', bg: '#103F29', photoUrl: null, photoPath: null, order: 7 }
];

export const DEFAULT_GALLERY = [
  { cat: 'Hackathons', title: 'Build Weekend 2025 — opening night', photoUrl: null, photoPath: null, order: 0 },
  { cat: 'Hackathons', title: 'Team judging, final round', photoUrl: null, photoPath: null, order: 1 },
  { cat: 'Labs', title: 'Systems & Networks Lab session', photoUrl: null, photoPath: null, order: 2 },
  { cat: 'Labs', title: 'Field equipment training', photoUrl: null, photoPath: null, order: 3 },
  { cat: 'Graduation', title: 'Class of 2025 — graduation day', photoUrl: null, photoPath: null, order: 4 },
  { cat: 'Graduation', title: 'Association award ceremony', photoUrl: null, photoPath: null, order: 5 },
  { cat: 'Workshops', title: 'Intro to core logging workshop', photoUrl: null, photoPath: null, order: 6 },
  { cat: 'Workshops', title: 'Career fair prep session', photoUrl: null, photoPath: null, order: 7 },
  { cat: 'Hackathons', title: 'Late-night project work, hour 30', photoUrl: null, photoPath: null, order: 8 },
  { cat: 'Labs', title: 'Geology lab sample review', photoUrl: null, photoPath: null, order: 9 },
  { cat: 'Graduation', title: 'Faculty & graduates group photo', photoUrl: null, photoPath: null, order: 10 },
  { cat: 'Workshops', title: 'Open field-trip planning day', photoUrl: null, photoPath: null, order: 11 }
];

export const DEFAULT_PROJECTS = [
  { cat: 'Drilling Engineering', icon: 'chip', title: 'Low-cost drill string vibration monitor', team: 'A. Dovi, K. Asante, M. Owusu', desc: 'A sensor rig that clips onto a drill string and flags harmful vibration patterns in real time, built from off-the-shelf accelerometers and an open firmware stack.', tags: ['Embedded C', 'Sensors', 'Signal processing'], year: '2026', photoUrl: null, photoPath: null, order: 0 },
  { cat: 'Geological Engineering', icon: 'cloud', title: 'Core sample digital logging tool', team: 'S. Kim, T. Boateng', desc: 'A tablet app that replaces paper core logs with a structured digital form, syncing directly to a shared department dataset used across three field sites.', tags: ['Field data', 'Offline-first', 'GIS'], year: '2026', photoUrl: null, photoPath: null, order: 1 },
  { cat: 'Mineral Exploration', icon: 'robot', title: 'Ore-grade estimation model', team: 'D. Nkrumah, P. Sarpong, E. Owusu', desc: 'A statistical model estimating ore grade between sparse borehole samples, validated against a historic dataset from a partner mine site.', tags: ['Python', 'Geostatistics'], year: '2025', photoUrl: null, photoPath: null, order: 2 },
  { cat: 'Safety & Environment', icon: 'lock', title: 'Borehole water quality tracker', team: 'R. Adjei', desc: 'A simple dashboard tracking water quality readings across monitored boreholes near a drilling site, flagging readings outside safe thresholds.', tags: ['Data viz', 'Environmental monitoring'], year: '2025', photoUrl: null, photoPath: null, order: 3 },
  { cat: 'Mobile', icon: 'mobile', title: 'Field safety checklist app', team: 'F. Owusu, L. Mensah', desc: 'A mobile checklist app used by student field teams before site visits, with offline support and a shared completion log for supervisors.', tags: ['Flutter', 'Offline sync'], year: '2025', photoUrl: null, photoPath: null, order: 4 },
  { cat: 'Geological Engineering', icon: 'book', title: 'Rock classification reference guide', team: 'B. Amoah, C. Quaye', desc: 'An illustrated digital field guide for common rock and mineral identification, built collaboratively by students during field school.', tags: ['Field guide', 'Documentation'], year: '2024', photoUrl: null, photoPath: null, order: 5 }
];

export const DEFAULT_RESOURCES = [
  { category: 'Course Materials', code: 'DE-201', title: 'Drilling Fluids & Well Control — full lecture notes', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Course Materials', code: 'GE-310', title: 'Structural Geology — slide deck bundle', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Course Materials', code: 'GE-405', title: 'Mineral Exploration — lab notebooks', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Past Exam Papers', code: 'DE-201', title: 'Drilling Fluids — 2025 end-of-semester exam', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Past Exam Papers', code: 'GE-150', title: 'Intro to Geology — 2024 & 2025 exams', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Field & Safety', code: 'FLD-01', title: 'Field trip safety and equipment guide', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'Field & Safety', code: 'FLD-02', title: 'Approved PPE and site checklist', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'E-Books & References', code: 'REF-11', title: 'Recommended reading list — all tracks', meta: 'No file attached', fileUrl: null, filePath: null },
  { category: 'E-Books & References', code: 'REF-22', title: 'Research writing & citation guide', meta: 'No file attached', fileUrl: null, filePath: null }
];

export const DEFAULT_STORE = [
  { icon: 'shirt', title: 'ADGES Hoodie', priceNum: 32, bg: '#155232', photoUrl: null, photoPath: null, order: 0 },
  { icon: 'shirt', title: 'Classic Logo T-Shirt', priceNum: 18, bg: '#227A48', photoUrl: null, photoPath: null, order: 1 },
  { icon: 'cap', title: 'Embroidered Cap', priceNum: 15, bg: '#103F29', photoUrl: null, photoPath: null, order: 2 },
  { icon: 'bag', title: 'Canvas Tote Bag', priceNum: 12, bg: '#E8B923', photoUrl: null, photoPath: null, order: 3 },
  { icon: 'mug', title: 'ADGES Mug', priceNum: 10, bg: '#227A48', photoUrl: null, photoPath: null, order: 4 },
  { icon: 'card', title: 'Laminated ID Holder', priceNum: 6, bg: '#155232', photoUrl: null, photoPath: null, order: 5 },
  { icon: 'sticker', title: 'Sticker Pack (x8)', priceNum: 5, bg: '#103F29', photoUrl: null, photoPath: null, order: 6 },
  { icon: 'trophy', title: 'Field Season Edition Pin', priceNum: 8, bg: '#E8B923', photoUrl: null, photoPath: null, order: 7 }
];

export const DEFAULT_FACULTY = [
  {
    id: 'fac-1',
    name: 'Prof. K. Addai-Mensah',
    position: 'Dean of SRID & Association Patron',
    role: 'head',
    category: 'Leadership',
    department: 'School of Railway and Infrastructure Development',
    qualification: 'PhD, MSc, BSc (Hons), FGhIG',
    specialization: 'Applied Geochemistry, Mineral Processing & Field Exploration',
    bio: 'Oversees the academic and infrastructural growth of SRID. Serves as senior patron to ADGES, mentoring students in industry-standard field engineering and research.',
    email: 'kaddai-mensah@umat.edu.gh',
    office: 'SRID Executive Suite 301, Essikado Campus',
    bg: '#0B2E1E',
    photoUrl: null,
    photoPath: null,
    order: 0
  },
  {
    id: 'fac-2',
    name: 'Dr. Patricia E. Asamoah',
    position: 'Head of Department (Drilling Engineering)',
    role: 'head',
    category: 'Drilling',
    department: 'Department of Drilling Engineering',
    qualification: 'PhD (Drilling & Petroleum Engineering), MSc',
    specialization: 'Directional Drilling, Wellbore Hydraulics & Deep Offshore Tech',
    bio: 'Coordinates the undergraduate drilling curriculum, industry partnerships, and advanced drilling simulation labs. Active consultant in West African energy basins.',
    email: 'pasamoah@umat.edu.gh',
    office: 'SRID Block B, Room 204',
    bg: '#103F29',
    photoUrl: null,
    photoPath: null,
    order: 1
  },
  {
    id: 'fac-3',
    name: 'Dr. Ebenezer K. Nyarko',
    position: 'Head of Department (Geological Engineering)',
    role: 'head',
    category: 'Geology',
    department: 'Department of Geological Engineering',
    qualification: 'PhD (Structural Geology & Geotechnics), MSc',
    specialization: 'Structural Geology, Rock Mechanics & Geotechnical Hazards',
    bio: 'Leads geological research and the annual field mapping schools across Ghana. Specializes in structural integrity and ground stability for mining infrastructure.',
    email: 'enyarko@umat.edu.gh',
    office: 'SRID Block B, Room 208',
    bg: '#155232',
    photoUrl: null,
    photoPath: null,
    order: 2
  },
  {
    id: 'fac-4',
    name: 'Ing. Dr. Michael O. Kwakye',
    position: 'Senior Lecturer in Drilling Engineering',
    role: 'lecturer',
    category: 'Drilling',
    department: 'Department of Drilling Engineering',
    qualification: 'PhD, MSc, BSc, MGhIE',
    specialization: 'Drill String Dynamics, Casing Design & Well Integrity',
    bio: 'Teaches advanced well design and casing engineering. Passionate about computer modeling of drill pipe stresses and real-time sensor integration.',
    email: 'mkwakye@umat.edu.gh',
    office: 'Drilling Rig Simulator Lab 102',
    bg: '#227A48',
    photoUrl: null,
    photoPath: null,
    order: 3
  },
  {
    id: 'fac-5',
    name: 'Dr. Grace A. Mensah',
    position: 'Senior Lecturer in Geological Engineering',
    role: 'lecturer',
    category: 'Geology',
    department: 'Department of Geological Engineering',
    qualification: 'PhD (Hydrogeology & Environmental Geology), MSc',
    specialization: 'Groundwater Hydrology, Contaminant Transport & Mine Reclamation',
    bio: 'Senior researcher in groundwater aquifer mapping and acid mine drainage remediation. Supervises ADGES environmental and community water projects.',
    email: 'gmensah@umat.edu.gh',
    office: 'Geosciences Analytical Lab 115',
    bg: '#103F29',
    photoUrl: null,
    photoPath: null,
    order: 4
  },
  {
    id: 'fac-6',
    name: 'Engr. Bright K. Tetteh',
    position: 'Lecturer in Drilling Fluids & Rig Operations',
    role: 'lecturer',
    category: 'Drilling',
    department: 'Department of Drilling Engineering',
    qualification: 'MSc, BSc, MGhIE',
    specialization: 'Rheology of Drilling Mud, High-Pressure Well Control & Safety',
    bio: 'Brings 12 years of field and rig-site drilling experience to the classroom. Leads the ADGES student well-control training seminars and safety guild.',
    email: 'btetteh@umat.edu.gh',
    office: 'SRID Block A, Room 110',
    bg: '#155232',
    photoUrl: null,
    photoPath: null,
    order: 5
  },
  {
    id: 'fac-7',
    name: 'Dr. Samuel B. Ofori',
    position: 'Lecturer in Applied Geophysics & Exploration',
    role: 'lecturer',
    category: 'Geology',
    department: 'Department of Geological Engineering',
    qualification: 'PhD (Applied Geophysics), MSc, BSc',
    specialization: 'Seismic Reflection, Electrical Resistivity & Subsurface Mapping',
    bio: 'Guides students through geophysical field exploration techniques, borehole geophysics, and digital 3D ore-deposit visualization.',
    email: 'sofori@umat.edu.gh',
    office: 'Geophysics Computing Lab 202',
    bg: '#227A48',
    photoUrl: null,
    photoPath: null,
    order: 6
  },
  {
    id: 'fac-8',
    name: 'Mrs. Abigail D. Boakye',
    position: 'Lecturer & Petrology Lab Coordinator',
    role: 'lecturer',
    category: 'Geology',
    department: 'Department of Geological Engineering',
    qualification: 'MSc (Mineralogy & Petrology), BSc',
    specialization: 'Igneous & Metamorphic Petrology, Microscopic Core Analysis',
    bio: 'Oversees the thin-section mineralogy lab and field sample repositories. Mentors student research papers for international student geological congresses.',
    email: 'aboakye@umat.edu.gh',
    office: 'Core Logging & Thin Section Lab 105',
    bg: '#103F29',
    photoUrl: null,
    photoPath: null,
    order: 7
  }
];

export const DEFAULT_SITE_SETTINGS = {
  theme: {
    primaryColor: '#0B2E1E',
    secondaryColor: '#155232',
    accentColor: '#E8B923',
    accentGoldLight: '#F7D34D',
    bgColor: '#FFFFFF',
    paperDim: '#F2F8F4',
    darkColor: '#0B2E1E',
    inkColor: '#16241C',
    cardRadius: '4px',
    fontDisplay: 'Fraunces',
    fontBody: 'Inter'
  },
  header: {
    brandTitle: 'ADGES-SRID',
    brandSubtitle: 'Drilling & Geological Engineering • UMaT',
    customLogoUrl: '',
    logoShape: 'circle',
    logoSize: 42,
    announcementActive: false,
    announcementText: '📢 2026 Annual Drilling Week Registration is now open! Join us at the SRID Auditorium.',
    announcementLink: '#events',
    navLabels: {
      home: 'Home',
      about: 'About',
      leadership: 'Leadership',
      gallery: 'Gallery',
      resources: 'Resources',
      projects: 'Projects',
      store: 'Store'
    }
  },
  footer: {
    brandName: 'ADGES — SRID, UMaT',
    aboutText: 'Official student association for Drilling & Geological Engineering at the School of Railway & Infrastructure Development (SRID), University of Mines and Technology (UMaT), Essikado.',
    addressLine1: 'SRID Campus, Essikado',
    addressLine2: 'Sekondi-Takoradi, Western Region, Ghana',
    email: 'info@adges-srid.umat.edu.gh',
    secEmail: 'adges.srid.exec@gmail.com',
    phone: '+233 (0) 312 000 000',
    copyright: '© 2026 ADGES — Association of Drilling and Geological Engineering Students, SRID, UMaT.',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      whatsapp: 'https://wa.me/233000000000'
    }
  },
  cards: {
    heroStats: [
      { id: 'stat1', num: '1,240', label: 'Undergraduate & graduate students' },
      { id: 'stat2', num: '42', label: 'Full-time faculty members' },
      { id: 'stat3', num: '6', label: 'Research & specialization tracks' },
      { id: 'stat4', num: '180+', label: 'Student projects shipped last year' }
    ],
    features: [
      {
        id: 'feat1',
        num: '01',
        title: 'Rigorous academics',
        desc: 'A curriculum that moves from geology and drilling fundamentals to specialized tracks in exploration, safety, and field engineering, taught by faculty active in research.'
      },
      {
        id: 'feat2',
        num: '02',
        title: 'Applied fieldwork',
        desc: 'Undergraduate researchers work alongside graduate students and faculty across active labs and field sites spanning drilling, geology, and mineral exploration.'
      },
      {
        id: 'feat3',
        num: '03',
        title: 'A student-run community',
        desc: 'Field trips, workshops, an equipment-training guild and a peer mentorship program — organized by students, for students, with faculty support behind the scenes.'
      }
    ],
    events: [
      { id: 'ev1', date: 'OCT 03', title: 'Field Season Kickoff Weekend', desc: 'Two days of equipment training and site prep.' },
      { id: 'ev2', date: 'OCT 14', title: 'Industry Talk: Drilling at Scale', desc: 'Alumni panel on careers in field engineering.' },
      { id: 'ev3', date: 'NOV 02', title: 'Research Symposium — Poster Day', desc: 'Undergraduate research projects on public display.' },
      { id: 'ev4', date: 'NOV 20', title: 'Alumni & Career Fair', desc: 'Twenty-two companies recruiting on campus.' }
    ],
    milestones: [
      { id: 'ms1', year: '1998', title: 'Association founded', desc: 'Established within the School of Petroleum and Mineral Resources Engineering with a founding class of 12 students.' },
      { id: 'ms2', year: '2006', title: 'First field lab opens', desc: 'The Drilling & Geology Field Lab becomes ADGES’s first dedicated training facility.' },
      { id: 'ms3', year: '2014', title: 'Student association chartered', desc: 'ADGES is formally chartered to run field trips, workshops and mentorship for members.' },
      { id: 'ms4', year: '2021', title: 'New building & exploration track launched', desc: 'The association moves into a dedicated space and introduces a specialization in mineral exploration.' },
      { id: 'ms5', year: '2026', title: '1,200+ students, six specialization tracks', desc: 'Today ADGES is one of the university’s most active associations, with programs across six specializations.' }
    ],
    values: [
      { id: 'v1', title: 'Rigor', desc: 'We hold a high bar in coursework and fieldwork and expect students to meet it, with support to get there.' },
      { id: 'v2', title: 'Field-ready, not just book-smart', desc: 'Every track includes hands-on fieldwork — not only exams and papers.' },
      { id: 'v3', title: 'Open community', desc: 'Resources, equipment training and mentorship are shared across cohorts rather than hoarded.' },
      { id: 'v4', title: 'Research with purpose', desc: 'Projects pursue problems with real applications, from safety to sustainable exploration.' }
    ],
    patron: {
      title: 'FACULTY ADVISOR',
      name: 'Prof. K. Addai-Mensah',
      desc: 'Patron of ADGES and senior lecturer. Oversees the association’s academic and field activities.',
      bg: '#103F29',
      photoUrl: ''
    }
  }
};

export const DEFAULT_TEXT = {
  'hero.eyebrow': 'Est. 1998 · SRID, UMaT',
  'hero.headline': 'Where fieldwork meets rigorous engineering.',
  'hero.lede': 'The Association of Drilling and Geological Engineering Students (ADGES) — SRID, UMaT — brings together drilling and geological engineering students through rigorous coursework, hands-on fieldwork and a student community that ships real projects year-round.',
  'hero.ctaAbout': 'About ADGES',
  'hero.ctaProjects': 'View student projects',
  'hero.panelTitle': 'ASSOCIATION AT A GLANCE',

  'home.facultyKicker': 'FACULTY LEADERSHIP & ACADEMIC LECTURERS',
  'home.facultyHeading': 'Faculty Heads & Distinguished Lecturers',
  'home.facultyDesc': 'Meet the academic directors, department heads, and senior researchers guiding student fieldwork, engineering rigor, and research innovation across Drilling and Geological Engineering at SRID, UMaT.',

  'home.whyKicker': 'WHY ADGES',
  'home.whyHeading': 'Three things we build our program around',
  'home.whyDesc': 'Everything in the curriculum, the fieldwork and the student association ties back to these.',

  'home.eventsKicker': 'THIS SEMESTER',
  'home.eventsHeading': 'Upcoming on the calendar',

  'home.projectsKicker': 'FROM THE FIELD',
  'home.projectsHeading': 'Recent student work',
  'home.projectsCta': 'See all projects',

  'about.kicker': 'ABOUT ADGES',
  'about.headline': 'An association built by fieldwork, sustained by research.',
  'about.intro': "Founded in 1998, the Association of Drilling and Geological Engineering Students (ADGES), SRID, UMaT, has grown from a small student group into one of the university's most active associations — supporting students across drilling engineering, geological engineering and mineral exploration, with a track record in national student competitions.",
  'about.missionTitle': 'Our mission',
  'about.mission': 'To give every student rigorous, hands-on training in drilling and geological engineering — and the practical fieldwork experience to apply it — while supporting research that matters beyond the classroom.',
  'about.visionTitle': 'Our vision',
  'about.vision': "To be recognized as an association where students graduate not just with a degree, but with real fieldwork experience and the judgment to lead in the industry after they leave.",

  'about.historyKicker': 'HISTORY',
  'about.historyHeading': 'How we got here',

  'about.leadershipKicker': 'LEADERSHIP',
  'about.leadershipHeading': 'Led by faculty and students',
  'about.leadershipCta': 'Meet the full team',

  'leadership.kicker': 'LEADERSHIP',
  'leadership.heading': 'Current executive committee',
  'leadership.desc': 'The students and faculty advisor currently leading ADGES.',

  'gallery.kicker': 'ARCHIVE & FIELDWORK',
  'gallery.heading': 'Photos from the field, lab, and campus',
  'gallery.desc': 'Field trips, project builds, workshops, and student milestones.',

  'resources.kicker': 'ACADEMIC RESOURCES',
  'resources.heading': 'Course notes, past papers, and field guides',
  'resources.desc': 'Study materials, past examination papers, and safety checklists.',

  'projects.kicker': 'STUDENT WORK',
  'projects.heading': 'Built by drilling and geological engineering students',
  'projects.desc': 'Applied research, software tools, sensor rigs, and field equipment.',

  'store.kicker': 'ASSOCIATION STORE',
  'store.heading': 'Official ADGES apparel and gear',
  'store.desc': 'Proceeds fund student fieldwork travel, lab equipment, and workshops.'
};
