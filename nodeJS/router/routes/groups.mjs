import {
  getGroup,
  getStudentGroups,
  getSubjectPracticesGroups,
  postGroupStudent,
  createGroups,
  updateGroup,
  deleteGroup,
  deleteStudentGroup,
} from '../../handlers/groups.mjs';
export const groupsRoutes = [
  {
    method: 'GET',
    regex: /^\/group\/\d+$/,
    handler: getGroup,
  },
  {
    method: 'GET',
    regex: /^\/student\/\d+\/groups$/,
    handler: getStudentGroups,
  },
  {
    method: 'GET',
    regex: /^\/subject\/\d+\/practice\/\d+\/groups$/,
    handler: getSubjectPracticesGroups,
  },
  {
    method: 'POST',
    regex: /^\/group\/\d+\/student\/\d+$/,
    handler: postGroupStudent,
  },
  {
    method: 'POST',
    regex: /^\/groups\/create$/,
    handler: createGroups,
  },
  {
    method: 'PUT',
    regex: /^\/groups\/\d+$/,
    handler: updateGroup,
  },
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
