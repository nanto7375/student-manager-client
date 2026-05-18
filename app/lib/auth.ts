import { buildApi } from "./api-builder";
import { tokenManager } from "./token-manger";
import { hashPassword } from "./utils/crypto.util";

export enum AdminRoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const getAdminRoleLevel = (role: AdminRoleType) => {
  switch (role) {
    case AdminRoleType.SUPER_ADMIN:
      return 4;
    case AdminRoleType.ADMIN:
      return 3;
    case AdminRoleType.MANAGER:
      return 2;
    case AdminRoleType.STAFF:
      return 1;
    default:
      return 0;
  }
};

export type Admin = {
  email: string;
  name: string;
  role: AdminRoleType;
  isActive: boolean;
};

type MyInfo = Admin & {level: number};

const signinApi = buildApi<{ admin: Admin; accessToken: string }>({ path: '/auth/signin', method: 'POST', credentials: 'include' });
const signoutApi = buildApi({ path: '/auth/signout', method: 'POST', credentials: 'include' });

// TODO: provider로 처리해야 할지 고민
class Auth {
  private myInfo: MyInfo | null = null;

  signin = async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password);
    const result = await signinApi({ body: { email, password: hashedPassword } });
    tokenManager.setAccessToken(result.accessToken);
    this.setMyInfo(result.admin);
  }

  signout = async () => {
    await signoutApi();
    tokenManager.clearAccessToken();
    this.myInfo = null;
  }

  setMyInfo(admin: Admin | null) {
    this.myInfo = admin ? { ...admin, level: getAdminRoleLevel(admin.role) } : null;
  }

  getMyInfo() {
    return this.myInfo;
  }

  clearMyInfo() {
    this.myInfo = null;
  }
}

export const auth = new Auth();