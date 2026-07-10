import {
  exportGroupStudents,
  exportPracticeGrades,
  exportSubjectGrades,
} from '../../handlers/export.mjs';
export const exportRoutes = [
  {
    method: 'GET',
    regex: /^\/practices\/\d+\/export$/,
    handler: exportPracticeGrades,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/\d+\/export$/,
    handler: exportSubjectGrades,
  },
  {
    method: 'GET',
    regex: /^\/groups\/\d+\/export$/,
    handler: exportGroupStudents,
  },
];
