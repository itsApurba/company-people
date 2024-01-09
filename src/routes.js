import { createPlaywrightRouter, sleep } from "crawlee";

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, request }) => {
  //   console.log(request.userData);
  const navigationItem = page.locator("li.org-page-navigation__item", { hasText: "People" });
  //   console.log("navigationItem", await navigationItem.count());
  if (await navigationItem.count()) {
    await navigationItem.click();
    await page.waitForSelector("input#people-search-keywords");
    const peopleSearchKeyword = page.locator("input#people-search-keywords");
    await peopleSearchKeyword.fill("Frontend developer");
    await peopleSearchKeyword.press("Enter");

    const peopleHeaderCount = await page
      .locator("div.org-people__header-spacing-carousel")
      .innerText()
      .then((text) => {
        return Number(text.split(" ")[0]);
      });

    for (let i = 0; i < peopleHeaderCount; i++) {
      await page.locator("div.org-people__header-spacing-carousel").locator("button").nth(i).click();
    }
  }
  await sleep(10000);
});

router.addHandler("detail", async ({ request, page, log, pushData }) => {
  const title = await page.title();
  log.info(`${title}`, { url: request.loadedUrl });

  await pushData({
    url: request.loadedUrl,
    title,
  });
});
