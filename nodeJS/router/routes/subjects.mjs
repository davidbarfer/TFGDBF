import {
  getSubject,
  getSubjects,
  getSubjectsUser,
  postSubjectCreate,
  postUserSubject,
  deleteUserSubject,
  deleteSubject,
} from '../../handlers/subjects.mjs';
export const subjectsRoutes = [
  {
    method: 'GET',
    regex: /^\/subjects\/(\d+)$/,
    handler: getSubject,
  },
  {
    method: 'GET',
    regex: /^\/subjects$/,
    handler: getSubjects,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/users\/current$/,
    handler: getSubjectsUser,
  },
  {
    method: 'POST',
    regex: /^\/subjects\/create$/,
    handler: postSubjectCreate,
  },
  {
    method: 'POST',
    regex: /^\/users\/(\d+)\/subjects\/(\d+)$/,
    handler: postUserSubject,
  },
  {
    method: 'DELETE',
    regex: /^\/users\/(\d+)\/subjects\/(\d+)$/,
    handler: deleteUserSubject,
  },
  {
    method: 'DELETE',
    regex: /^\/subjects\/(\d+)$/,
    handler: deleteSubject,
  },
];
