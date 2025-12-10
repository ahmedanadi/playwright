import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticleEditorPage extends BasePage {

  // Inputs (ordered exactly as they appear in the DOM)
  title = this.page.locator('input[type="text"]').nth(0);
  description = this.page.locator('input[type="text"]').nth(1);
  body = this.page.locator('textarea').nth(0);
  tags = this.page.locator('input[type="text"]').nth(2);

  publishButton = this.page.getByRole('button', { name: 'Publish Article' });

  async createArticle(data: {
    title: string;
    description: string;
    body: string;
    tags?: string;
  }) {
    await this.title.fill(data.title);
    await this.description.fill(data.description);
    await this.body.fill(data.body);

    if (data.tags) {
      await this.tags.fill(data.tags);
      // press Enter so the tag is added
      await this.tags.press('Enter');
    }

    await this.publishButton.click();
  }
}