import { link } from "node:fs";

const PROJECT_NAME = 'Doctus Lite';
const PROJECT_AUTHOR = 'David Barrero Fernandez';
const PROJECT_FRAMEWORKS = {
  FRONTEND : {name: 'ASTRO', link: 'https://astro.build/'},
  BACKEND  : {name: 'NODE JS', link: 'https://nodejs.org/'},
  DATABASE : {name: 'MYSQL', link: 'https://www.mysql.com/'},
  FILESYSTEM : {name: 'NODE JS', link: 'https://nodejs.org/'},
}
const PROJECT_DESCRIPTION = 'Este proyecto consiste en una aplicación de gestión de grupos de práctica cuyas entregas se evalúan a través de un evaluador diseñado en MATLAB';
export { PROJECT_NAME, PROJECT_AUTHOR, PROJECT_FRAMEWORKS, PROJECT_DESCRIPTION};