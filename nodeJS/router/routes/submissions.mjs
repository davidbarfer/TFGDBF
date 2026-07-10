import {
  getGroupSubmissions,
  getPracticeSubmissions,
  getStudentSubmission,
  getStudentSubmissionFile,
  getStudentSubmissions,
  getSubmission,
  postPracticeEvaluatorCreate,
  postPracticeGroupSubmissions,
  postPracticeSubmissionEdit,
  postPracticeSubmissions,
  postStudentSubmissionEvaluate,
  postStudentSubmissionFile,
  putPracticeSubmissionsGrade,
  putStudentSubmissionGrade,
} from '../../handlers/submissions.mjs';
export const submissionsRoutes = [
  {
    method: 'GET',
    regex: /^\/practice\/(\d+)\/submissions$/,
    handler: getPracticeSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/groups\/(\d+)\/submissions$/,
    handler: getGroupSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/student\/(\d+)\/submissions$/,
    handler: getStudentSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/student\/(\d+)\/submission\/(\d+)$/,
    handler: getStudentSubmission,
  },
  {
    method: 'GET',
    regex: /^\/student\/(\d+)\/submission\/(\d+)\/file$/,
    handler: getStudentSubmissionFile,
  },
  {
    method: 'GET',
    regex: /^\/submission\/(\d+)$/,
    handler: getSubmission,
  },
  {
    method: 'POST',
    regex: /^\/student\/(\d+)\/submission\/(\d+)\/file$/,
    handler: postStudentSubmissionFile,
  },
  {
    method: 'POST',
    regex: /^\/practice\/(\d+)\/submissions$/,
    handler: postPracticeSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practice\/(\d+)\/group\/(\d+)\/submissions$/,
    handler: postPracticeGroupSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practice\/(\d+)\/submission\/(\d+)\/edit$/,
    handler: postPracticeSubmissionEdit,
  },
  {
    method: 'POST',
    regex: /^\/practice\/(\d+)\/evaluator\/create$/,
    handler: postPracticeEvaluatorCreate,
  },
  {
    method: 'POST',
    regex: /^\/student\/(\d+)\/submission\/(\d+)\/evaluate$/,
    handler: postStudentSubmissionEvaluate,
  },
  {
    method: 'PUT',
    regex: /^\/practice\/(\d+)\/submissions\/grade$/,
    handler: putPracticeSubmissionsGrade,
  },
  {
    method: 'PUT',
    regex: /^\/student\/(\d+)\/submission\/(\d+)\/grade$/,
    handler: putStudentSubmissionGrade,
  },
];
