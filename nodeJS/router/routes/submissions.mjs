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
    regex: /^\/practices\/(\d+)\/submissions$/,
    handler: getPracticeSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/groups\/(\d+)\/submissions$/,
    handler: getGroupSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/users\/(\d+)\/submissions$/,
    handler: getStudentSubmissions,
  },
  {
    method: 'GET',
    regex: /^\/users\/(\d+)\/submissions\/(\d+)$/,
    handler: getStudentSubmission,
  },
  {
    method: 'GET',
    regex: /^\/users\/(\d+)\/submissions\/(\d+)\/file$/,
    handler: getStudentSubmissionFile,
  },
  {
    method: 'GET',
    regex: /^\/submissions\/(\d+)$/,
    handler: getSubmission,
  },
  {
    method: 'POST',
    regex: /^\/users\/(\d+)\/submissions\/(\d+)\/file$/,
    handler: postStudentSubmissionFile,
  },
  {
    method: 'POST',
    regex: /^\/practices\/(\d+)\/submissions$/,
    handler: postPracticeSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practices\/(\d+)\/groups\/(\d+)\/submissions$/,
    handler: postPracticeGroupSubmissions,
  },
  {
    method: 'POST',
    regex: /^\/practices\/(\d+)\/submissions\/(\d+)\/edit$/,
    handler: postPracticeSubmissionEdit,
  },
  {
    method: 'POST',
    regex: /^\/practices\/(\d+)\/evaluator\/create$/,
    handler: postPracticeEvaluatorCreate,
  },
  {
    method: 'POST',
    regex: /^\/users\/(\d+)\/submissions\/(\d+)\/evaluate$/,
    handler: postStudentSubmissionEvaluate,
  },
  {
    method: 'PUT',
    regex: /^\/practices\/(\d+)\/submissions\/grade$/,
    handler: putPracticeSubmissionsGrade,
  },
  {
    method: 'PUT',
    regex: /^\/users\/(\d+)\/submissions\/(\d+)\/grade$/,
    handler: putStudentSubmissionGrade,
  },
];
