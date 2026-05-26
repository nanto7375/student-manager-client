import { buildApi } from "~/lib/api-builder";
import type { Admin } from "~/lib/auth";

export const getMeApi = buildApi<Admin>({ path: '/admins/me', method: 'GET' });
export const getAdminListApi = buildApi<{ list: any[]; count: number }>({ path: '/admins', method: 'GET' });
export const registerAdminApi = buildApi({ path: '/admins', method: 'POST' });
export const updateAdminApi = buildApi({ path: '/admins/:id', method: 'PUT' });
export const deleteAdminApi = buildApi({ path: '/admins/:id', method: 'DELETE' });
export const resetPasswordApi = buildApi({ path: '/admins/:id/password', method: 'PATCH' });
