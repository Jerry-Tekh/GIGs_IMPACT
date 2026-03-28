// src/siteData.js

import explore from './assets/ACTIONCARDS/explore.png';
import readblog from './assets/ACTIONCARDS/readblog.png';
import joinCommunity from './assets/ACTIONCARDS/joincommunity.png';
import partner from './assets/ACTIONCARDS/partner.png';







export const siteData = {
  hero: {
    title: ["Activating Talents", "Building Independent Minds", "Creating Global Impact"],
    subtitle: "We are building a generation of independent thinkers and creators who do not wait for opportunities but create them..",
    cta: "About Us"
  },
  
  // MAKE SURE THIS IS NAMED "whatWeDo"
 programs: {
    stages: [
      { stage: 1, title: "FOUNDATION — SELF AWARENESS & PERSONAL MASTERY", focus: ["Emotional Intelligence", "Growth Mindset", "Time Management"] },
      { stage: 2, title: "ESSENTIAL SOFT SKILLS", focus: ["Critical Thinking", "Communication", "Collaboration"] },
      { stage: 3, title: "CORE HARD SKILLS", focus: ["Digital Literacy", "Data Analysis", "Project Management"] },
      { stage: 4, title: "MARKETING & SALES COMPETENCE", focus: ["Sales & Persuasion", "Marketing", "Digital Marketing"] },
      { stage: 5, title: "ADVANCED COMPETENCE — LEADERSHIP & MANAGEMENT", focus: ["Strategic Thinking", "Leadership", "Decision Making"] },
      { stage: 6, title: "EXECUTIVE & GLOBAL COMPETENCE", focus: ["Systems Thinking", "Ethical Leadership", "Change Management"] },
      { stage: 7, title: "LIFELONG GROWTH & IMPACT", focus: ["Continuous Development", "Mentorship", "Legacy Building"] }
    ]
  },

  whatWeDo: [
    { color: '#6fa8dc' },
    { color: '#e06666' },
    { color: '#f6b26b' },
    { color: '#70ad47' }
  ],

  actions: [
    { title: 'Join the Community', text: 'Become part of a movement that is redefining success.', image: joinCommunity, icon: 'FaUsers' },
    { title: 'Partner With Us', text: 'Collaborate to create opportunities beyond limitations.', image: partner, icon: 'FaHandshake' },
    { title: 'Explore Programs', text: 'Discover our structured development system.', image: explore, icon: 'FaGraduationCap' },
    { title: 'Read Our Blog', text: 'Share knowledge, inspiration, and practical insights.', image: readblog, icon: 'FaBook' }
  ],


 stats: [
    { value: '1 Billion', label: 'Youth', sub: 'across Africa in 20 years' },
    { value: 'Multiple', label: 'Industries', sub: 'talent-driven enterprises' },
    { value: 'Reduce', label: 'Unemployment', sub: 'through skill activation' },
    { value: 'Generation', label: 'Independent', sub: 'value-driven individuals' }
  ],

  // New About Section Data
  about: {
    storyTitle: "OUR STORY",
    storyText: "Since our founding, Feeding America has been on a relentless journey. What began as a local grassroots initiative in Phoenix, Arizona, has evolved into the nation’s largest domestic hunger-relief organization. \n\nOur story is defined not by how we began, but by the neighbors we serve and the communities we unite. We empower individuals facing hunger, advocate for policies that address root causes, and distribute billions of pounds of nourishing food. We believe that when we work together, we are stronger than hunger.",
    
    // MVV content (matching the image text)
    mvvCircles: [
      { id: 'mission', title: 'MISSION', color: 'red' },
      { id: 'values', title: 'VALUES', color: 'green' },
      { id: 'vision', title: 'VISION', color: 'orange' }
    ],
    mvvText: {
      mission: {
        title: "OUR MISSION",
        text: "Lorem ipsum dolor sit amet consectetuer odio non tellus natoque accumsan. Sed hac enim Lorem tempus tortor justo eget scelerisque sed morbi. Senectus urna Vestibulum tincidunt turpis sem magna Nam hendrerit vitae nibh."
      },
      values: {
        title: "OUR VALUES",
        text: "Senectus urna Vestibulum tincidunt turpis sem magna Nam hendrerit vitae nibh. Auctor Sed urna dignissim malesuada eleifend ultrices justo Curabitur Maecenas orci."
      },
      vision: {
        title: "OUR VISION",
        text: "Senectus urna Vestibulum tincidunt turpis sem magna Nam hendrerit vitae nibh. Auctor Sed urna dignissim malesuada eleifend ultrices justo Curabitur Maecenas orci. Tincidunt adipiscing elit et et ac tincidunt elit nulla mauris eleifend. Urna."
      }
    }
  },
  

};