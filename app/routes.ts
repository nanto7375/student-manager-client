import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'), //
  route('signin', './routes/signin.tsx'),
  route('schedule', './routes/schedule/page.tsx', [route(':scheduleId', './routes/schedule/id.tsx')]),
  route('student', './routes/student/page.tsx'),
  route('admin', './routes/admin/page.tsx'),
] satisfies RouteConfig;
