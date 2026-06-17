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
const ROLES_FUNCTIONS = {
  PROFESSOR: [
    'Pestaña Asignaturas: Acceder a tus asignaturas',
    'Pestaña Asignaturas: Crear y eliminar asignaturas del sistema',
    'Pestaña Asignaturas: Asignar asignaturas a profesore y alumnos',
    'Pestaña Entregas: Acceder y gestionar a todas las entregas de tus prácticas',
    'Pestaña Panel Administrador: Activar usuarios de otros profesores',
  ],
  STUDENT: [
    'Pestaña Asignaturas: Acceder a tus asignaturas',
    'Pestaña Entregas: Acceder a todas las entregas de tus prácticas',
  ],
}
export { PROJECT_NAME, PROJECT_AUTHOR, PROJECT_FRAMEWORKS, PROJECT_DESCRIPTION, ROLES_FUNCTIONS};