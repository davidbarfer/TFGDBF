import {
  getSubject,
  getSubjects,
  getSubjectsUser,
  postSubjectCreate,
  postUserSubject,
  deleteSubject,
} from '../../handlers/subjects.mjs';
export const subjectsRoutes = [
  {
    method: 'GET',
    regex: /^\/subject\/(\d+)$/,
    handler: getSubject,
  },
  {
    method: 'GET',
    regex: /^\/subjects$/,
    handler: getSubjects,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/user$/,
    handler: getSubjectsUser,
  },
  {
    method: 'POST',
    regex: /^\/subject\/create$/,
    handler: postSubjectCreate,
  },
  {
    method: 'POST',
    regex: /^\/user\/(\d+)\/subject\/(\d+)$/,
    handler: postUserSubject,
  },
  {
    method: 'DELETE',
    regex: /^\/subjects\/(\d+)$/,
    handler: deleteSubject,
  },
];
