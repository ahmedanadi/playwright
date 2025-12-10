import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    myFeed = this.page.locator('.feed-toggle .nav-link', { hasText: 'My Feed' });  
    globalFeed = this.page.locator('.feed-toggle .nav-link', { hasText: 'Global Feed' });

  emptyFeed = this.page.getByText('No articles are here... yet.');

  popularTagsTitle = this.page.getByText('Popular Tags');
  popularTagsList = this.page.locator('.sidebar .tag-list');

  // article previews inside the feed container
  feedContainer = this.page.locator('app-articles-feed');
  allArticles = this.feedContainer.locator('.article-preview');

  openMyFeed = async () => { await this.myFeed.click(); };
  openGlobalFeed = async () => { await this.globalFeed.click(); };

  // return all article preview locators after ensuring the feed tab is active
  async getGlobalFeedArticles() {
    await this.globalFeed.click();
    return this.allArticles;
  }

  async getMyFeedArticles() {
    await this.myFeed.click();
    return this.allArticles;
  }

  /**
   * Find article(s) by title and/or description.
   * If both title and description are provided, both must match.
   * Returns a Locator pointing to matching article preview(s).
   */
  findArticle = (opts: { title?: string; description?: string; author?: string }) => {
    let locator = this.allArticles;
    if (opts.title) locator = locator.filter({ hasText: opts.title });
    if (opts.description) locator = locator.filter({ hasText: opts.description });
    if (opts.author) locator = locator.filter({ hasText: opts.author });
    return locator;
  }

  /**
   * Return true if an article matching the provided criteria exists in the feed.
   * Performs a small polling loop until timeout (ms) to account for eventual consistency.
   */
  async articleExists(
    opts: { title?: string; description?: string; author?: string },
    timeout: number = 5000,
  ): Promise<boolean> {
    const pollInterval = 250;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const locator = this.findArticle(opts);
      const count = await locator.count();
      if (count > 0) return true;
      await this.page.waitForTimeout(pollInterval);
    }
    return false;
  }
}
