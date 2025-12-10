import { test, expect } from './fixtures/test-fixtures';
import { createPages } from './pages/PageFactory';
import { v4 as uuidv4 } from 'uuid';
import { createUser, loginGetToken, createArticle } from './api/apiHelpers';

test('user B follows user A and sees A’s new article in Your Feed', async ({ page, request }) => {
  // Create two users A and B
  const idA = uuidv4().slice(0, 8);
  const idB = uuidv4().slice(0, 8);
  const userA = { username: `userA_${idA}`, email: `userA+${idA}@example.com`, password: 'Password12!' };
  const userB = { username: `userB_${idB}`, email: `userB+${idB}@example.com`, password: 'Password12!' };

  await createUser(request, userA);
  await createUser(request, userB);

  // Login A and create an article (fast: API)
  const tokenA = await loginGetToken(request, userA.email, userA.password);
  const article1 = await createArticle(request, tokenA, {
    title: `First Article ${idA}`,
    description: 'initial',
    body: 'body initial',
    tagList: ['init'],
  });

  // Login in browser as B and follow A by opening the article page and clicking Follow
  const tokenB = await loginGetToken(request, userB.email, userB.password);
  await page.addInitScript(t => localStorage.setItem('token', t), tokenB);

  const pages = createPages(page);
  // open the article page produced by A
  await pages.home.goto(`/article/${article1.slug}`);

  // Click Follow
  const followBtn = page.getByRole('button', { name: /Follow/i }).first();
  await expect(followBtn).toBeVisible();
  await followBtn.click();

  // After follow, button text changes to "Unfollow"
  const unfollowBtn = page.getByRole('button', { name: /Unfollow/i }).first();
  await expect(unfollowBtn).toBeVisible();

  // Now have A publish a new article (API)
  const article2 = await createArticle(request, tokenA, {
    title: `Second Article ${idA}`,
    description: 'second',
    body: 'body second',
    tagList: ['e2e'],
  });

  // Refresh B's home and open "My Feed"
  await pages.home.goto('/');
  await pages.home.openMyFeed();

  // Assert the new article from A appears in B's feed
  const found = await pages.home.articleExists({ title: article2.title, author: userA.username }, 5000);
  expect(found).toBeTruthy();
});