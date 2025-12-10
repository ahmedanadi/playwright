import { authTest as test, expect } from './fixtures/test-fixtures';
import { v4 as uuidv4 } from 'uuid';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { createUser, loginGetToken, createArticle } from './api/apiHelpers';
import { ArticlePage } from './pages/ArticlePage';
import { createPages } from './pages/PageFactory';

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

// Edit article: Author can update body & tags, changes are visible
test('author can edit article body and tags', async ({ page, request, creds }) => {
    const id = uuidv4().slice(0, 8);
    // use creds fixture (creates a fresh user)
    const user = creds;

    // login via API to obtain token for API operations
    const token = await loginGetToken(request, user.email, user.password);

    // create initial article
    const article = await createArticle(request, token, {
        title: `Editable Article ${id}`,
        description: `desc ${id}`,
        body: `initial body ${id}`,
        tagList: ['initial'],
    });

    // login in browser as author (inject token) and open article page
    await page.addInitScript(t => localStorage.setItem('token', t), token);
    const pages = createPages(page);
    await pages.home.goto(`/article/${article.slug}`);

    let articlePage = new ArticlePage(page);
    await expect(articlePage.title).toHaveText(article.title);

    // Click edit
    await articlePage.editArticleButton.click();

    // Update body and tags using editor
    const editor = new ArticleEditorPage(page);
    const newBody = `updated body ${id}`;
    const newTags = 'updated,playwright';

    // Keep title & description same, update body & tags
    await editor.createArticle({ title: article.title, description: article.description, body: newBody, tags: newTags });

    // After publishing, ensure we're back on the article page
    await pages.home.goto(`/article/${article.slug}`);
    
    // re-init page object to ensure locators are fresh
    articlePage = new ArticlePage(page);

    await expect(articlePage.articleBody).toHaveText(newBody);
    const tags = await articlePage.articleTags.allTextContents(); // ['updated','playwright']
    await expect(tags).toContain('updated,playwright');
});

// Delete article: Author can delete the article, it disappears from all lists
test('author can delete article and it disappears from feeds', async ({ page, request, creds }) => {
  const id = uuidv4().slice(0, 8);
  const user = creds;
  const token = await loginGetToken(request, user.email, user.password);

  // create article to delete
  const article = await createArticle(request, token, {
    title: `Delete Article ${id}`,
    description: `desc ${id}`,
    body: `body ${id}`,
    tagList: ['todelete'],
  });

  // login as author in browser
  await page.addInitScript(t => localStorage.setItem('token', t), token);
  const pages = createPages(page);
  await pages.home.goto(`/article/${article.slug}`);

  const articlePage = new ArticlePage(page);
  await expect(articlePage.title).toHaveText(article.title);

  // Click delete
  await articlePage.deleteArticleButton.click();

  // After deletion, article should not be present in global feed
  await pages.home.goto('/');
  await pages.home.openGlobalFeed();
  const exists = await pages.home.articleExists({ title: article.title }, 5000);
  expect(exists).toBeFalsy();
});