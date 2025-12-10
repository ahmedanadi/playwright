import { test, expect } from './fixtures/test-fixtures';
import { v4 as uuidv4 } from 'uuid';
import { createPages } from './pages/PageFactory';

test('user can sign up', async ({ page }) => {
  const pages = createPages(page);
  const { signUp, nav } = pages;

  // Go to sign up page
  await signUp.goto();

  // generate unique credentials so the test can be re-run safely
  const id = uuidv4().slice(0, 8);
  const username = `testuser_${id}`;
  const email = `test+${id}@example.com`;
  const password = 'Password12!';

  // Register new user
  await signUp.register({ username, email, password });

  // Check success message appeared
  const errorMessage = page.getByText('Registration successful. Redirecting to login page...', { exact: true });
  await expect(errorMessage).toBeVisible();

  // Assert user is redirected to the Sign In page
  await expect(page).toHaveURL(/#\/login/);
  await expect(nav.signIn()).toBeVisible();
});

test('user can login', async ({ page, creds }) => {
  const pages = createPages(page);
  const { nav, signIn, home } = pages;

  // Go to home page
  await home.goto('/');

  // Navigate to login
  await signIn.goto();

  // Perform login
  await signIn.login(creds.email, creds.password);

  // Assert we are on home page
  await expect(nav.profile(creds.username)).toBeVisible();
  await expect(home.globalFeed).toBeVisible();
  await expect(home.myFeed).toBeVisible();
});

test('login fails with wrong password', async ({ page }) => {
  const pages = createPages(page);
  const { signIn } = pages;
  // Navigate to login
  await signIn.goto();

  // Perform login
  await signIn.login('wrong@gmail.com', 'wrongpassword');

  // Intercept login API to check HTTP status
  let responseStatus = 0;
  page.on('response', response => {
    if (response.url().includes('/api/users/login')) {
      responseStatus = response.status();
    }
  });

  // Click Sign in
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Assert error message is visible
  const errorMessage = page.getByText('Invalid email or password', { exact: true });
  await expect(errorMessage).toBeVisible();

  // assert HTTP 422 status
  expect(responseStatus).toBe(422);
});
