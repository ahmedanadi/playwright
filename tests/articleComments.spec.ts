import { test, expect } from './fixtures/test-fixtures';
import { v4 as uuidv4 } from 'uuid';
import { createArticle, loginGetToken } from './api/apiHelpers';
import { createPages } from './pages/PageFactory';
import { ArticlePage } from './pages/ArticlePage';

test('user can add a comment to an article', async ({ page, request, creds }) => {
  const id = uuidv4().slice(0, 8);
  // create an article via API as the test user
  const token = await loginGetToken(request, creds.email, creds.password);
  const article = await createArticle(request, token, {
    title: `Commented Article ${id}`,
    description: `desc ${id}`,
    body: `body ${id}`,
    tagList: ['comment'],
  });

  // login in-browser by injecting token and open article page
  await page.addInitScript(t => localStorage.setItem('token', t), token);
  const pages = createPages(page);
  await pages.home.goto(`/article/${article.slug}`);

  const articlePage = new ArticlePage(page);
  const commentText = `This is a test comment ${id}`;

  // add comment and assert it appears
  await articlePage.addComment(commentText);
  await expect(articlePage.commentBodies.first()).toHaveText(commentText);
});

test('user can delete a comment and it is removed from the article', async ({ page, request, creds }) => {
  const id = uuidv4().slice(0, 8);
  const token = await loginGetToken(request, creds.email, creds.password);
  const article = await createArticle(request, token, {
    title: `Comment Delete Article ${id}`,
    description: `desc ${id}`,
    body: `body ${id}`,
    tagList: ['comment'],
  });

  // login in-browser and open article
  await page.addInitScript(t => localStorage.setItem('token', t), token);
  const pages = createPages(page);
  await pages.home.goto(`/article/${article.slug}`);

  const articlePage = new ArticlePage(page);
  const commentText = `Comment to delete ${id}`;

  // add comment
  await articlePage.addComment(commentText);
  await expect(await articlePage.commentBodies.first()).toHaveText(commentText);
  await expect(await articlePage.commentItems.count()).toBe(1);
  
  // delete the first comment and assert no comments remain
  await articlePage.deleteFirstComment();
  await expect(articlePage.commentItems).toHaveCount(0);
});