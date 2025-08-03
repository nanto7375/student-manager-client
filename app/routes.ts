import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'), //
  route('signin', './routes/signin.tsx'),
  route('schedule', './routes/schedule/index.tsx', [route(':scheduleId', './routes/schedule/id.tsx')]),
  route('consult', './routes/consult.tsx'),
  route('payment', './routes/payment.tsx'),
  route('admin', './routes/admin.tsx'),
] satisfies RouteConfig;
