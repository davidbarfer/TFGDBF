import { login, logout, signup } from '../handler/authHandler.mjs';
import {
  exportGroupStudents,
  exportPracticeGrades,
  exportSubjectGrades,
} from '../handler/exportHandler.mjs';
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
  getSubjectsUser,
  getUsersByRole,
  getUserCurrent,
  getGroupSubmissions,
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
  postSubjectCreate,
  postUserSubject,
} from '../handler/userPostHandler.mjs';
import {
  putPracticeSubmissionsGrade,
  putStudentSubmissionGrade,
  updateGroup,
  updateUserStatus,
} from '../handler/userPutHandler.mjs';

const getRoutes = [
  {
    method: 'GET',
    regex: /^\/subjects$/,
    handler: getSubjects,
  },
  {
    method: 'GET',
    regex: /^\/users$/,
    handler: getUsers,
  },
  {
    method: 'GET',
    regex: /^\/users\/(professor|student|admin)$/,
    handler: getUsersByRole,
  },
  {
    method: 'GET',
    regex: /^\/users\/current$/,
    handler: getUserCurrent,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/user$/,
    handler: getSubjectsUser,
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
    regex: /^\/groups\/\d+\/submissions$/,
    handler: getGroupSubmissions,
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
    regex: /^\/subject\/create$/,
    handler: postSubjectCreate,
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
  {
    method: 'POST',
    regex: /^\/user\/\d+\/subject\/\d+$/,
    handler: postUserSubject,
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
  {
    method: 'PUT',
    regex: /^\/groups\/\d+$/,
    handler: updateGroup,
  },
  {
    method: 'PUT',
    regex: /^\/users\/\d+\/status$/,
    handler: updateUserStatus,
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
