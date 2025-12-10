import { authTest as test, expect } from './fixtures/test-fixtures';
import { v4 as uuidv4 } from 'uuid';
import { ArticleEditorPage } from './pages/articleEditorPage';

test('user can create an article', async ({ pages, creds }) => {
const articleEditor = new ArticleEditorPage(pages.page);
  await pages.home.goto('/');

  // Open the editor
  await pages.nav.newArticle().click();

  // Create a unique article
  const id = uuidv4().slice(0, 8);
  const title = `E2E Article ${id}`;
  const description = `Short description ${id}`;
  const body = `This is the article body for ${id}`;
  const tags = 'e2e,playwright';

  await articleEditor.createArticle({ title, description, body, tags });

  // Check success message appeared
  const errorMessage = pages.page.getByText('Published successfully!', { exact: true });
  await expect(errorMessage).toBeVisible();

  // check the article is visible in global feed
    await pages.home.goto('/');
    await pages.home.openGlobalFeed();
    const found = await pages.home.articleExists({title, description: description ,author: creds.username});
    await expect(found).toBeTruthy();
});