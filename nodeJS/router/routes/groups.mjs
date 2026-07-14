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
    regex: /^\/groups\/(\d+)$/,
    handler: getGroup,
  },
  {
    method: 'GET',
    regex: /^\/users\/(\d+)\/groups$/,
    handler: getStudentGroups,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/(\d+)\/practices\/(\d+)\/groups$/,
    handler: getSubjectPracticesGroups,
  },
  {
    method: 'POST',
    regex: /^\/groups\/(\d+)\/users\/(\d+)$/,
    handler: postGroupStudent,
  },
  {
    method: 'POST',
    regex: /^\/groups\/create$/,
    handler: createGroups,
  },
  {
    method: 'PUT',
    regex: /^\/groups\/(\d+)$/,
    handler: updateGroup,
  },
  {
    method: 'DELETE',
    regex: /^\/groups\/(\d+)$/,
    handler: deleteGroup,
  },
  {
    method: 'DELETE',
    regex: /^\/groups\/(\d+)\/users\/(\d+)$/,
    handler: deleteStudentGroup,
  },
];
