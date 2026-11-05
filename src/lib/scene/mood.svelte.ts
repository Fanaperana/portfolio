// Day / night for every pixel scene on the site, picked from the visitor's
// clock and toggled from the hero.
const hour = new Date().getHours();
export const mood = $state({ night: hour < 6 || hour >= 19 });
