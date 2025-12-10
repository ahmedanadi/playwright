import { Page } from '@playwright/test';

export class NavBar {
  constructor(private page: Page) {}

  // Logged-out
  signIn = () => this.page.getByRole('link', { name: 'Sign in' });
  signUp = () => this.page.getByRole('link', { name: 'Sign up' });

  // Logged-in
  home = () => this.page.getByRole('link', { name: 'Home' });
  newArticle = () => this.page.getByRole('link', { name: 'New Article' });
  settings = () => this.page.getByRole('link', { name: 'Settings' });
  profile = (username: string) =>
    this.page.getByRole('link', { name: username });

  // Auto-detect state
  async isLoggedIn() {
    return await this.page.locator('a:has-text("Settings")').isVisible();
  }
}