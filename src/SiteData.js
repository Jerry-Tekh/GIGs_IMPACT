// src/siteData.js
export const siteData = {
  hero: {
    title: ["Activating Talents", "Building Independent Minds", "Creating Global Impact"],
    subtitle: "We are building a generation of independent thinkers and creators who do not wait for opportunities but create them..",
    cta: "Learn More"
  },
  
  // MAKE SURE THIS IS NAMED "whatWeDo"
  whatWeDo: [
    { 
      label: 'WE HAVE THE INSIGHTS', 
      title: 'Research For Solutions', 
      color: '#FFB400', 
      name: 'Alyce, Hawaii' 
    },
    { 
      label: 'WE HAVE THE RELATIONSHIPS', 
      title: 'Local Roots, National Impact', 
      color: '#A0CED9', 
      name: 'Loretta, New York' 
    },
    { 
      label: 'WE HAVE THE SCALE', 
      title: 'Nationwide Distribution', 
      color: '#4A5D23', 
      name: 'Mike, Arizona' 
    },
    { 
      label: 'WE HAVE THE VISION', 
      title: 'Nutrition for Every Plate', 
      color: '#FFD100', 
      name: 'Kaycee, Washington' 
    }
  ],

  actions: [
    { title: 'Join the Community', text: 'Become part of a movement that is redefining success.', color: '#3d4a25', textColor: '#fff', icon: '🤝' },
    { title: 'Partner With Us', text: 'Collaborate to create opportunities beyond limitations.', color: '#FFD100', textColor: '#000', icon: '🤝' },
    { title: 'Explore Programs', text: 'Discover our structured development system.', color: '#B87E1B', textColor: '#000', icon: '📚' },
    { title: 'Read Our Blog', text: 'Share knowledge, inspiration, and practical insights.', color: '#FFB400', textColor: '#000', icon: '📖' }
  ],


  stats: [
    { value: '0 Billion', label: 'Meals', sub: 'distributed' },
    { value: '0 Billion', label: 'Pounds', sub: 'of food rescued' },
    { value: '0+ Programs', label: 'distributing food', sub: '' },
    { value: '0+ Food Banks', label: 'in the network', sub: '' }
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