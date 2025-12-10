import baseTest from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createPages } from '../pages/PageFactory';

type Creds = { email: string; username: string; password: string };

export const test = baseTest.extend<{ creds: Creds }>({
  creds: async ({ request, baseURL }, use) => {
    // create unique user via API
    const id = uuidv4().slice(0, 8);
    const creds: Creds = {
      username: `testuser_${id}`,
      email: `test+${id}@example.com`,
      password: 'Password12!',
    };

    const payload = {
      user: {
        email: creds.email,
        password: creds.password,
        username: creds.username,
      },
    };

    // determine API base URL
    const apiBase = (process.env.API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    const url = `${apiBase}/api/users`;

    // POST to API base + /api/users with JSON payload
    const res = await request.post(url, {
      data: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status() >= 400) {
      throw new Error(`Failed to create test user: ${await res.text()}`);
    }

    // provide creds to the test
    await use(creds);
  },
});

export { expect } from '@playwright/test';

// auto-login fixture that returns pages (signed in)
export const authTest = test.extend<{ pages: ReturnType<typeof createPages> }>({
  pages: async ({ page, request, creds }, use) => {
    const apiBase = (process.env.API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
    // Log in via API (adjust endpoint/body to your backend)
    const res = await request.post(`${apiBase}/api/users/login`, {
      data: { user: { email: creds.email, password: creds.password } },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() >= 400) {
      throw new Error(`Login failed in authTest fixture: ${await res.text()}`);
    }
    const body = await res.json();
    const token = body.user?.token ?? body.token;
    if (!token) throw new Error('No token returned from login API; update fixture to match response shape.');

    // Ensure token is set in localStorage before any page navigation
    await page.addInitScript((t) => {
      localStorage.setItem('token', t);
    }, token);

    const pages = createPages(page);
    await use(pages);
  },
});