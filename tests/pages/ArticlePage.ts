import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticlePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Header
  title = this.page.locator('h1');
  author = this.page.locator('app-article-meta .info a').first();
  articleMeta = this.page.locator('app-article-meta').first();

  // Buttons: primary controls are in the banner; secondary copies exist in the page container
  banner = this.page.locator('div.banner');
  pageContainer = this.page.locator('div.container.page');
  editArticleButton = this.banner.getByRole('button', { name: 'Edit Article' });
  deleteArticleButton = this.banner.getByRole('button', { name: 'Delete Article' });
  editArticleButtonInline = this.pageContainer.getByRole('button', { name: 'Edit Article' });
  deleteArticleButtonInline = this.pageContainer.getByRole('button', { name: 'Delete Article' });

  // Article body and tags
  articleBody = this.page.locator('app-article .row p');
  articleTags = this.page.locator('.tag-list li');

  // Comments
  commentTextarea = this.page.locator('textarea');
  postCommentButton = this.page.getByRole('button', { name: 'Post Comment' });
  commentItems = this.page.locator('app-article-comment');
  commentAuthors = this.page.locator('app-article-comment .comment-author');
  commentBodies = this.page.locator('app-article-comment .card-text');
  deleteCommentButtons = this.page.locator('app-article-comment button:has-text("Delete")');

  // Actions
  async addComment(text: string) {
    await this.commentTextarea.fill(text);
    await this.postCommentButton.click();
  }

  async deleteFirstComment() {
    await this.deleteCommentButtons.first().click();
  }
}
