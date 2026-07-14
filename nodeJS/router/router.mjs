import { authRoutes } from './routes/auth.mjs';
import { usersRoutes } from './routes/users.mjs';
import { subjectsRoutes } from './routes/subjects.mjs';
import { practicesRoutes } from './routes/practices.mjs';
import { groupsRoutes } from './routes/groups.mjs';
import { submissionsRoutes } from './routes/submissions.mjs';
import { exportRoutes } from './routes/export.mjs';
export const router = [
  ...authRoutes,
  ...usersRoutes,
  ...subjectsRoutes,
  ...practicesRoutes,
  ...groupsRoutes,
  ...submissionsRoutes,
  ...exportRoutes,
];
