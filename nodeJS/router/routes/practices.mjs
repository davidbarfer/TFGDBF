import {
  getPractice,
  getSubjectPractices,
  postPracticeCreate,
} from '../../handlers/practices.mjs';
export const practicesRoutes = [
  {
    method: 'GET',
    regex: /^\/practice\/\d+$/,
    handler: getPractice,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+\/practices$/,
    handler: getSubjectPractices,
  },
  {
    method: 'POST',
    regex: /^\/subject\/\d+\/create$/,
    handler: postPracticeCreate,
  },
];
