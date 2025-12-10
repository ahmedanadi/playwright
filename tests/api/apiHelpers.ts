import { APIRequestContext } from '@playwright/test';

const getApiBase = () => (process.env.API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export type NewUser = { username: string; email: string; password: string };

export async function createUser(request: APIRequestContext, user: NewUser) {
  const apiBase = getApiBase();
  const payload = { user: { username: user.username, email: user.email, password: user.password } };
  const res = await request.post(`${apiBase}/api/users`, {
    data: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status() >= 400) {
    throw new Error(`createUser failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body.user ?? body;
}

export async function loginGetToken(request: APIRequestContext, email: string, password: string) {
  const apiBase = getApiBase();
  const payload = { user: { email, password } };
  const res = await request.post(`${apiBase}/api/users/login`, {
    data: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status() >= 400) {
    throw new Error(`login failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body.user?.token ?? body.token;
}

export async function createArticle(request: APIRequestContext, token: string, article: { title: string; description: string; body: string; tagList?: string[] }) {
  const apiBase = getApiBase();
  const payload = { article: { title: article.title, description: article.description, body: article.body, tagList: article.tagList ?? [] } };
  const res = await request.post(`${apiBase}/api/articles`, {
    data: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
  });
  if (res.status() >= 400) {
    throw new Error(`createArticle failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body.article;
}
