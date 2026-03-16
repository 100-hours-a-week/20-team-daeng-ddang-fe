import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {

  const response = await page.request.post('/api/auth/dev-login', {
    data: {
      kakaoUserId: 888888,
      nickname: 'dev-existing-user',
      prefix: 'existing',
    },
  });

  expect(response.status()).toBeLessThan(500);

  await page.goto('/walk');

  const okButton = page.getByRole('button', { name: '알겠어요!' });

  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click();
  }

  await page.getByRole('button', { name: '산책 시작 🐕' }).click();
  await page.getByRole('button', { name: '산책 종료' }).click();
  await page.getByRole('button', { name: '종료하기' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();

  await page.getByRole('textbox', {
    name: '오늘의 산책은 어떠셨나요? 즐거웠던 순간을 기록해주세요!'
  }).fill('오늘의 산책 끝!');

  await page.getByRole('button', { name: '기록 완료' }).click();

});