import { test } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: '🆕 신규 유저로 로그인' }).click();
    await page.getByRole('button', { name: '알겠어요!' }).click();
    await page.getByRole('button', { name: '산책 시작 🐕' }).click();
    await page.getByRole('button', { name: '산책 종료' }).click();
    await page.getByRole('button', { name: '종료하기' }).click();
    await page.getByRole('button', { name: '건너뛰기' }).click();
    await page.getByRole('textbox', { name: '오늘의 산책은 어떠셨나요? 즐거웠던 순간을 기록해주세요!' }).click();
    await page.getByRole('textbox', { name: '오늘의 산책은 어떠셨나요? 즐거웠던 순간을 기록해주세요!' }).fill('오늘의 산책 끝!');
    await page.getByRole('button', { name: '기록 완료' }).click();
});