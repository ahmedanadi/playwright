import baseTest from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

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