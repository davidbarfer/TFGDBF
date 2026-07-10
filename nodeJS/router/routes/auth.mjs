import { login, logout, signup } from '../../handlers/auth.mjs';
export const authRoutes = [
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
