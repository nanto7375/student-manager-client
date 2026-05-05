import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'), //

  route('signin', './routes/signin.tsx'),

  route('schedule', './routes/schedule/page.tsx', [route(':scheduleId', './routes/schedule/activity-records.tsx')]),

  ...prefix('student', [
    index('./routes/student/page.tsx'),
    route(':studentId', './routes/student/student-detail.tsx'),
  ]),
  
  route('admin', './routes/admin/page.tsx'),
] satisfies RouteConfig;
