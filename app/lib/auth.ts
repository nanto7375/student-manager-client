import { buildApi } from "./api-builder";
import { tokenManager } from "./token-manger";

export type Admin = {
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

const signinApi = buildApi<{ admin: Admin; accessToken: string }>({ path: '/auth/signin', method: 'POST', credentials: 'include' });
const signoutApi = buildApi({ path: '/auth/signout', method: 'POST', credentials: 'include' });

// TODO: provider로 처리해야 할지 고민
class Auth {
  private readonly MY_INFO_KEY = 'me';
  private myInfo: Admin | null = null;

  signin = async (email: string, password: string) => {
    const result = await signinApi({ body: { email, password } });
    tokenManager.setAccessToken(result.accessToken);
    this.setMyInfo(result.admin);
  }

  signout = async () => {
    await signoutApi();
    tokenManager.clearAccessToken();
    this.setMyInfo(null);
  }

  setMyInfo(admin: Admin | null) {
    sessionStorage.setItem(this.MY_INFO_KEY, JSON.stringify(admin));
    this.myInfo = admin;
  }

  getMyInfo() {
    if (this.myInfo) return this.myInfo;
    const admin = sessionStorage.getItem(this.MY_INFO_KEY);
    this.myInfo = admin ? JSON.parse(admin) : null;
    return this.myInfo;
  }
}

export const auth = new Auth();