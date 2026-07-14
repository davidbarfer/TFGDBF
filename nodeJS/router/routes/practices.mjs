import {
  getPractice,
  getSubjectPractices,
  postPracticeCreate,
} from '../../handlers/practices.mjs';
export const practicesRoutes = [
  {
    method: 'GET',
    regex: /^\/practices\/(\d+)$/,
    handler: getPractice,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/(\d+)\/practices$/,
    handler: getSubjectPractices,
  },
  {
    method: 'POST',
    regex: /^\/subjects\/(\d+)\/create$/,
    handler: postPracticeCreate,
  },
];
