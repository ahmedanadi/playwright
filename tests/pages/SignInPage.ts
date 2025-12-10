import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignInPage extends BasePage {
  email = this.page.locator('input[type="text"]');
  password = this.page.locator('input[type="password"]');
  signInBtn = this.page.getByRole('button', { name: 'Sign in' });
  
  async goto(path: string = '/login'): Promise<void> {
    await super.goto(path);
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInBtn.click();
  }
}