import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignUpPage extends BasePage {
  // Inputs
  username = this.page.locator('input[type="text"]').nth(0);
  email = this.page.locator('input[type="text"]').nth(1);
  password = this.page.locator('input[type="password"]').nth(0);

  // Button
  signUpButton = this.page.getByRole('button', { name: 'Sign up' });

  async goto() {
    await this.page.goto('/#/register');
  }

  async register(user: { username: string; email: string; password: string }) {
    await this.username.fill(user.username);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.signUpButton.click();
  }
}
