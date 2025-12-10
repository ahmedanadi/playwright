import baseTest from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createPages } from '../pages/PageFactory';
import { createUser, loginGetToken } from '../api/apiHelpers';

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
    // use centralized API helper to create the user
    await createUser(request, { username: creds.username, email: creds.email, password: creds.password });

    // provide creds to the test
    await use(creds);
  },
});

export { expect } from '@playwright/test';

// auto-login fixture that returns pages (signed in)
export const authTest = test.extend<{ pages: ReturnType<typeof createPages> }>({
  pages: async ({ page, request, creds }, use) => {
    // Use centralized helper to obtain a login token
    const token = await loginGetToken(request, creds.email, creds.password);
    if (!token) throw new Error('No token returned from login API; update fixture to match response shape.');

    // Ensure token is set in localStorage before any page navigation
    await page.addInitScript((t) => {
      localStorage.setItem('token', t);
    }, token);

    const pages = createPages(page);
    await use(pages);
  },
});