import { login, logout, signup } from '../handler/authHandler.mjs';
import {
  getSubject,
  getSubjectPractices,
  getSubjectPracticesGroups,
  getGroup,
  getGroupStudents,
  getSubjectStudents,
  getPractice,
  getPracticeSubmissions,
  getStudentGroups,
  getStudentSubmissions,
  getStudentSubmission,
  getStudentSubmissionFile,
  getSubmission,
  getSubjects,
  getUsers,
} from '../handler/userHandler.mjs';

const getRoutes = [
  {
    method: 'GET',
    regex: /^\/subjects/,
    handler: getSubjects,
  },
  {
    method: 'GET',
    regex: /^\/users/,
    handler: getUsers,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+$/,
    handler: getSubject,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+\/students$/,
    handler: getSubjectStudents,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+\/practices$/,
    handler: getSubjectPractices,
  },
  {
    method: 'GET',
    regex: /^\/practice\/\d+$/,
    handler: getPractice,
  },
  {
    method: 'GET',
    regex: /^\/practice\/\d+\/submissions$/,
    handler: getPracticeSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+\/practice\/\d+\/groups$/,
    handler: getSubjectPracticesGroups,
  },
  {
    method: 'GET',
    regex: /^\/group\/\d+$/,
    handler: getGroup,
  },
  {
    method: 'GET',
    regex: /^\/group\/\d+\/students$/,
    handler: getGroupStudents,
  },
  {
    method: 'GET',
    regex: /^\/student\/\d+\/groups$/,
    handler: getStudentGroups,
  },
  {
    method: 'GET',
    regex: /^\/student\/\d+\/submissions$/,
    handler: getStudentSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/student\/\d+\/submission\/\d+$/,
    handler: getStudentSubmission,
  },
  {
    method: 'GET',
    regex: /^\/student\/\d+\/submission\/\d+\/file$/,
    handler: getStudentSubmissionFile,
  },
  {
    method: 'GET',
    regex: /^\/submission\/\d+$/,
    handler: getSubmission,
  },
];
const postRoutes = [
  {
    method: 'POST',
    regex: /^\/login/,
    handler: login,
  },
  {
    method: 'POST',
    regex: /^\/logout/,
    handler: logout,
  },
  {
    method: 'POST',
    regex: /^\/signup/,
    handler: signup,
  },
];
export const routes = [...getRoutes, ...postRoutes];
