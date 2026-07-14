import {
  getGroupStudents,
  getSubjectStudents,
  getUserCurrent,
  getUsers,
  getUsersByRole,
  updateUserStatus,
} from '../../handlers/users.mjs';
export const usersRoutes = [
  {
    method: 'GET',
    regex: /^\/users$/,
    handler: getUsers,
  },
  {
    method: 'GET',
    regex: /^\/groups\/(\d+)\/users$/,
    handler: getGroupStudents,
  },
  {
    method: 'GET',
    regex: /^\/subjects\/(\d+)\/users$/,
    handler: getSubjectStudents,
  },
  {
    method: 'GET',
    regex: /^\/users\/current$/,
    handler: getUserCurrent,
  },
  {
    method: 'GET',
    regex: /^\/users\/(professor|student|admin)$/,
    handler: getUsersByRole,
  },
  {
    method: 'PUT',
    regex: /^\/users\/(\d+)\/status$/,
    handler: updateUserStatus,
  },
];
