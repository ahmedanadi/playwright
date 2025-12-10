import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    myFeed = this.page.locator('.feed-toggle', { hasText: 'My Feed' });
    globalFeed = this.page.locator('.feed-toggle', { hasText: 'Global Feed' });

    emptyFeed = this.page.getByText('No articles are here... yet.');

    popularTagsTitle = this.page.getByText('Popular Tags');
    popularTagsList = this.page.locator('.tag-list');

    openMyFeed = async () => { await this.myFeed.click(); };
    openGlobalFeed = async () => { await this.globalFeed.click(); };
}
