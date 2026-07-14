import { login, logout, signup } from '../../handlers/auth.mjs';
export const authRoutes = [
  {
    method: 'POST',
    regex: /^\/auth\/login/,
    handler: login,
  },
  {
    method: 'POST',
    regex: /^\/auth\/logout/,
    handler: logout,
  },
  {
    method: 'POST',
    regex: /^\/auth\/signup/,
    handler: signup,
  },
];
