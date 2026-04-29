import { login, logout, signup } from '../handler/authHandler.mjs';
import {
  deleteGroup,
  deleteStudentGroup,
} from '../handler/userDeleteHandler.mjs';
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
} from '../handler/userGetHandler.mjs';
import {
  postPracticeCreate,
  postPracticeGroupsCreate,
  postGroupStudent,
  postStudentSubmissionFile,
  postPracticeSubmissions,
  postPracticeGroupSubmissions,
  postPracticeSubmissionEdit,
  postPracticeEvaluatorCreate,
  postStudentSubmissionEvaluate,
} from '../handler/userPostHandler.mjs';
import {
  putPracticeSubmissionsGrade,
  putStudentSubmissionGrade,
} from '../handler/userPutHandler.mjs';

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
  {
    method: 'POST',
    regex: /^\/subject\/\d+\/create$/,
    handler: postPracticeCreate,
  },
  {
    method: 'POST',
    regex: /^\/subject\/\d+\/practice\/\d+\/groups\/create$/,
    handler: postPracticeGroupsCreate,
  },
  {
    method: 'POST',
    regex: /^\/group\/\d+\/student\/\d+$/,
    handler: postGroupStudent,
  },
  {
    method: 'POST',
    regex: /^\/student\/\d+\/submission\/\d+\/file$/,
    handler: postStudentSubmissionFile,
  },
  {
    method: 'POST',
    regex: /^\/practice\/\d+\/submissions$/,
    handler: postPracticeSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practice\/\d+\/group\/\d+\/submissions$/,
    handler: postPracticeGroupSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practice\/\d+\/submission\/\d+\/edit$/,
    handler: postPracticeSubmissionEdit,
  },
  {
    method: 'POST',
    regex: /^\/practice\/\d+\/evaluator\/create$/,
    handler: postPracticeEvaluatorCreate,
  },
  {
    method: 'POST',
    regex: /^\/student\/\d+\/submission\/\d+\/evaluate$/,
    handler: postStudentSubmissionEvaluate,
  },
];
const putRoutes = [
  {
    method: 'PUT',
    regex: /^\/practice\/\d+\/submissions\/grade$/,
    handler: putPracticeSubmissionsGrade,
  },
  {
    method: 'PUT',
    regex: /^\/student\/\d+\/submission\/\d+\/grade$/,
    handler: putStudentSubmissionGrade,
  },
];
const deleteRoutes = [
  {
    method: 'DELETE',
    regex: /^\/group\/\d+$/,
    handler: deleteGroup,
  },
  {
    method: 'DELETE',
    regex: /^\/group\/\d+\/student\/\d+$/,
    handler: deleteStudentGroup,
  },
];
export const routes = [
  ...getRoutes,
  ...postRoutes,
  ...putRoutes,
  ...deleteRoutes,
];
