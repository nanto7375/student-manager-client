import { BASE_URL } from '~/constants';

const refreshPath = '/auth/refresh';

class TokenManager {
  private readonly TOKEN_KEY = 'acc';
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    this.accessToken = token;
    return token;
  }

  clearAccessToken() {
    this.accessToken = null;
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  async refreshAccessToken(): Promise<void> {
    const response = await fetch(new URL(BASE_URL + refreshPath), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Refresh failed');

    const result = await response.json();
    const accessToken = result.message;
    this.setAccessToken(accessToken);
  }
}

export const tokenManager = new TokenManager();
