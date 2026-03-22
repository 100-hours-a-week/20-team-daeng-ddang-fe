import { expect, test } from "@playwright/test";

test.describe("필수 정보 부재 시나리오", () => {
  test("반려견 미등록 상태에서 산책하기 클릭 시 반려견 등록 유도", async ({ page }) => {
    await page.route("**/bff/proxy/users/dogs**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "ok",
          data: {
            dogId: null,
            name: "",
            breed: "",
            gender: "MALE",
            neutered: false,
            birthDate: null,
            birthUnknown: false,
            weight: 0,
            profileImageUrl: null,
          },
          errorCode: null,
        }),
      });
    });

    await page.request.post("/bff/auth/dev-login", {
      data: {
        kakaoUserId: 888888,
        nickname: "dev-existing-user",
        prefix: "existing",
      },
    });

    await page.goto("/walk");

    const okButton = page.getByRole("button", { name: "알겠어요!" });
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click();
    }

    await page.getByRole("button", { name: "산책 시작 🐕" }).click();

    await expect(page.getByText("반려견 등록이 필요해요")).toBeVisible();
    await expect(page.getByText("반려견 정보를 등록하고 산책을 시작할까요?")).toBeVisible();

    await page.getByRole("button", { name: "등록하기" }).click();
    await expect(page).toHaveURL(/\/mypage\/dog/);
  });

  test("지역 미등록 상태에서 지역 랭킹 탭 진입 시 지역 등록 유도", async ({ page }) => {
    await page.route("**/bff/proxy/users/me**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "ok",
          data: {
            userId: 1,
            regionId: null,
            parentRegionId: null,
            region: "",
            kakaoEmail: "test@test.com",
            dogId: null,
            profileImageUrl: null,
            isAgreed: true,
          },
          errorCode: null,
        }),
      });
    });

    await page.request.post("/bff/auth/dev-login", {
      data: {
        kakaoUserId: 888888,
        nickname: "dev-existing-user",
        prefix: "existing",
      },
    });

    await page.goto("/ranking");

    await page.getByRole("button", { name: "지역 랭킹" }).click();

    await expect(page.getByText("지역 설정 필요!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("지역 랭킹을 보려면 지역 정보가 필요합니다!")).toBeVisible();

    await page.getByRole("button", { name: "등록하기" }).click();
    await expect(page).toHaveURL(/\/mypage\/user/);
  });
});
