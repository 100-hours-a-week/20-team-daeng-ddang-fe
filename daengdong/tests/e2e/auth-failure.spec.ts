import { expect, test } from "@playwright/test";

test.describe("인증 실패 시나리오", () => {
  test("비로그인 상태에서 산책일지(발자국) 접근 시 로그인 유도", async ({ page }) => {
    await page.goto("/footprints");
    await expect(page.getByText("로그인이 필요해요!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("발자국 기록을 보려면 로그인이 필요해요")).toBeVisible();
    await page.getByRole("button", { name: "로그인하기" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("비로그인 상태에서 마이페이지 접근 시 로그인 유도", async ({ page }) => {
    await page.goto("/mypage");
    await expect(page).toHaveURL(/\/login$/);
  });
});
