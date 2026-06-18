// src/siteData.js

export const siteData = {
  hero: {
    title: ['Activating Talents', 'Building Independent Minds', 'Creating Global Impact'],
    subtitle:
      'We are building a generation of independent thinkers and creators who do not wait for opportunities — they create them.',
    cta: 'About Us'
  },

  programs: {
    stages: [
      {
        stage: 1,
        title: 'Foundation — Self-Awareness & Personal Mastery',
        summary:
          'We start on the inside — building self-awareness, discipline, and the mindset every other skill is built on.',
        outcome: 'A grounded, self-aware person ready to grow.',
        focus: ['Emotional Intelligence', 'Growth Mindset', 'Time Management']
      },
      {
        stage: 2,
        title: 'Essential Soft Skills',
        summary:
          'We develop the human skills — thinking, communication, and collaboration — that make talent usable in the real world.',
        outcome: 'Confident communicators and critical thinkers.',
        focus: ['Critical Thinking', 'Communication', 'Collaboration']
      },
      {
        stage: 3,
        title: 'Core Hard Skills',
        summary:
          'We build practical, in-demand technical skills that turn ability into real economic value.',
        outcome: 'Job-ready and venture-ready capabilities.',
        focus: ['Digital Literacy', 'Data Analysis', 'Project Management']
      },
      {
        stage: 4,
        title: 'Marketing & Sales Competence',
        summary:
          'We teach people to position, market, and sell value so skills translate directly into income.',
        outcome: 'The ability to earn from what you can do.',
        focus: ['Sales & Persuasion', 'Marketing', 'Digital Marketing']
      },
      {
        stage: 5,
        title: 'Advanced Competence — Leadership & Management',
        summary:
          'We grow capable leaders who think strategically and can manage people, projects, and outcomes.',
        outcome: 'Capable team and project leaders.',
        focus: ['Strategic Thinking', 'Leadership', 'Decision Making']
      },
      {
        stage: 6,
        title: 'Executive & Global Competence',
        summary:
          'We prepare people to operate at executive level with systems thinking and ethical, globally-relevant leadership.',
        outcome: 'Globally relevant, principled leaders.',
        focus: ['Systems Thinking', 'Ethical Leadership', 'Change Management']
      },
      {
        stage: 7,
        title: 'Lifelong Growth & Impact',
        summary:
          'We sustain growth — equipping people to mentor others and build a lasting legacy of impact.',
        outcome: 'Mentors and changemakers building legacy.',
        focus: ['Continuous Development', 'Mentorship', 'Legacy Building']
      }
    ]
  },

  whatWeDo: [{ color: '#6fa8dc' }, { color: '#e06666' }, { color: '#f6b26b' }, { color: '#70ad47' }],

  actions: [
    { title: 'Join the Community', text: 'Become part of a movement that is redefining success.', icon: 'FaUsers' },
    { title: 'Partner With Us', text: 'Collaborate to create opportunities beyond limitations.', icon: 'FaHandshake' },
    { title: 'Explore Programs', text: 'Discover our structured development system.', icon: 'FaGraduationCap' },
    { title: 'Read Our Blog', text: 'Share knowledge, inspiration, and practical insights.', icon: 'FaBook' }
  ],

  // Honest, structural figures + a clearly-labelled long-term vision (no invented metrics)
  stats: [
    { value: '7', label: 'Stage Framework', sub: 'self-discovery to lifelong impact' },
    { value: '6', label: 'Competence Areas', sub: 'soft skills, hard skills, leadership & more' },
    { value: '1 Billion', label: 'Youth — Our Vision', sub: 'reach across Africa within 20 years' },
    { value: '100%', label: 'Talent-Driven', sub: 'potential → skill → value → income' }
  ],

  testimonials: [
    {
      quote:
        'GIGs Impact helped me see my talent as something I could build a future on. I stopped waiting and started creating.',
      name: 'Community Member',
      role: 'Talent Development Cohort'
    },
    {
      quote:
        'The framework is practical. It took me from confusion about my skills to actually earning from them.',
      name: 'Programme Participant',
      role: 'Skills to Income Track'
    },
    {
      quote:
        'This is more than training — it is a movement that believes in people before they believe in themselves.',
      name: 'Volunteer Mentor',
      role: 'GIGs Impact Community'
    }
  ],

  about: {
    storyTitle: 'OUR STORY',
    storyText:
      'GIGs Impact Community was born from a deep personal journey. Our founder grew up in Agric Quarters, Coal Camp, Enugu State, where opportunity was scarce and survival often shaped what felt possible.\n\nInstead of accepting that as the final story, a clear vision took shape: build systems that identify talent, provide structure, and connect people to real opportunities that create value, income, and influence. We are not waiting for change — we are building it.',

    mvvCircles: [
      { id: 'mission', title: 'MISSION', color: 'red' },
      { id: 'values', title: 'VALUES', color: 'green' },
      { id: 'vision', title: 'VISION', color: 'orange' }
    ],
    mvvText: {
      mission: {
        title: 'OUR MISSION',
        text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.'
      },
      vision: {
        title: 'OUR VISION',
        text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.'
      },
      values: {
        title: 'OUR VALUES',
        text: 'Integrity, Growth, Independence, Impact, and Community — guiding every action as we transform talent into economic value and sustainable opportunity.'
      }
    }
  },

  org: {
    name: 'GIGs Impact Community',
    tagline: 'Talent. Growth. Impact.',
    email: 'gigsimpact@gmail.com',
    phone: '08146163211',
    location: 'Enugu State, Nigeria',
    foundedNote: 'A youth empowerment & human-capacity development community'
  }
};
