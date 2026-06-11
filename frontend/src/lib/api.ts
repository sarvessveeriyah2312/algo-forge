const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
const API_V1 = `${BASE_URL}/api/v1`;
const API_KEY = (import.meta.env.VITE_API_KEY as string) || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  getAccessToken(): string | null {
    return localStorage.getItem('af_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('af_refresh_token');
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('af_access_token', accessToken);
    localStorage.setItem('af_refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('af_access_token');
    localStorage.removeItem('af_refresh_token');
    localStorage.removeItem('af_user');
    localStorage.removeItem('af_is_authenticated');
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_V1}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_KEY ? { 'X-API-Key': API_KEY } : {}) },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) { this.clearTokens(); return false; }
      const data = await res.json();
      this.storeTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (API_KEY) headers['X-API-Key'] = API_KEY;

    let res = await fetch(`${API_V1}${path}`, { ...options, headers });

    if (res.status === 401 && retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, options, false);
      this.clearTokens();
      window.location.reload();
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, err.detail || err.message || 'Request failed');
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json();
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
  }
  del<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }

  openWebSocket(path: string): WebSocket {
    const wsBase = BASE_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
    const token = this.getAccessToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : '';
    return new WebSocket(`${wsBase}${path}${qs}`);
  }

  // Auth helpers
  async login(email: string, password: string) {
    const data = await this.post<{ access_token: string; refresh_token: string; token_type: string }>('/auth/login', { email, password });
    this.storeTokens(data.access_token, data.refresh_token);
    return data;
  }

  async register(email: string, username: string, password: string, full_name?: string) {
    return this.post<{ id: string; email: string; username: string; full_name: string | null; role: string }>('/auth/register', {
      email, username, password, full_name: full_name || null,
    });
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.post('/auth/logout', { refresh_token: refreshToken }).catch(() => {});
    }
    this.clearTokens();
  }

  async getMe() {
    return this.get<{ id: string; email: string; username: string; full_name: string | null; role: string }>('/auth/me');
  }
}

export const api = new ApiClient();
