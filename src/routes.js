import { Dataset, createPlaywrightRouter, sleep } from "crawlee";

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, request, enqueueLinks }) => {
  console.log(request.userData);
  // await sleep(5000);
  // const navigationItem = page.locator("li.org-page-navigation__item", { hasText: "People" });
  //   console.log("navigationItem", await navigationItem.count());
  // if (await navigationItem.count()) {
  //   await navigationItem.first().click();
  //   await page.waitForSelector("input#people-search-keywords");
  //   const peopleSearchKeyword = page.locator("input#people-search-keywords");
  //   await peopleSearchKeyword.fill(`${request.userData.designation || "Frontend Developer"}`);
  //   await peopleSearchKeyword.press("Enter");

  //   await sleep(2000);

  // const peopleHeaderCount = await page
  //   .locator("div.org-people__header-spacing-carousel")
  //   .innerText()
  //   .then((text) => {
  //     return Number(text.split(" ")[0]);
  //   });

  for (let i = 0; i < 5; i++) {
    console.log("enqueue", i + 1);
    await enqueueLinks({
      urls: [`${await page.locator("li.org-people-profile-card__profile-card-spacing").nth(i).locator("a").nth(1).getAttribute("href")}`],
      label: "people",
      userData: {
        designation: request.userData.designation,
        url: request.url,
      },
      transformRequestFunction: (request) => {
        request.url = request.url.split("?")[0];
        request.keepUrlFragment = false;
        request.maxRetries = 10;
        return request;
      },
    });
  }
  await sleep(2000);
  // }
});

router.addHandler("people", async ({ request, page, browserController }) => {
  const name = await page.locator("h1.text-heading-xlarge").innerText();
  const location = await page
    .locator("div", { hasText: "Contact info" })
    .last()
    .innerText()
    .then((text) => {
      return text.split("Contact info")[0].trim();
    })
    .catch((e) => "");
  const profileURL = page.url();

  const educationSection = page.locator("section", { has: page.locator('span[aria-hidden="true"]', { hasText: "Education" }) });
  const collegeName = await educationSection
    .locator(".mr1 span[aria-hidden='true']")
    .first()
    .innerText()
    .catch(() => "");
  const highestDegree = await educationSection
    .locator("span.t-14")
    .first()
    .locator('span[aria-hidden="true"]')
    .innerText()
    .catch(() => "");
  const gradYear = await educationSection
    .locator("span.t-14.t-black--light")
    .first()
    .locator('span[aria-hidden="true"]')
    .innerText()
    .catch(() => "");

  const expSection = page.locator("section", { has: page.locator('span[aria-hidden="true"]', { hasText: "Experience" }) });

  const companyWorkExperience = await expSection
    .locator(".mr1 span[aria-hidden='true']")
    .first()
    .innerText()
    .catch(() => "");
  const companyDesignation = await expSection
    .locator("span.t-14")
    .first()
    .locator('span[aria-hidden="true"]')
    .innerText()
    .catch(() => "");

  const gradWorkingYear = await expSection
    .locator("span.t-14.t-black--light")
    .first()
    .locator('span[aria-hidden="true"]')
    .innerText()
    .catch(() => "");

  await page.goto(`${profileURL}details/skills/`);
  await sleep(10_000);

  const skills = [];
  let skip = 0;
  for (let i = 0; i < 5; i++) {
    if (skip == 0) {
      const skillsListItem = await page
        .locator(".active .mr1 span[aria-hidden='true']")
        .nth(i)
        .innerText()
        .catch(() => {
          skip = 1;
          return "";
        });
      skills.push(skillsListItem);
    } else {
      break;
    }
  }

  //   const newPage = await browserController.newPage();
  //   console.log(`Navigating to ${profileURL}details/education/`);
  //   await newPage.goto(`${profileURL}details/education/`);
  // //   await sleep(3_000);
  // //   fs.writeFileSync("image0.png", await newPage.screenshot({ fullPage: true, type: "png" }));
  //   await newPage.close();

  console.log({
    name,
    profileURL,
    location,
    collegeName,
    highestDegree,
    gradYear,
    companyWorkExperience,
    companyDesignation,
    gradWorkingYear,
    skills: skills.join(","),
    designation: request.userData.designation.trim(),
    queryCompany: request.userData.url.split("company/")[1].split("/")[0],
    //   workExperience,
    //   Skills,
  });
  await Dataset.pushData({
    name,
    profileURL,
    location,
    collegeName,
    highestDegree,
    gradYear,
    companyWorkExperience,
    companyDesignation,
    gradWorkingYear,
    skills: skills.join(","),
    designation: request.userData.designation.trim(),
    queryCompany: request.userData.url.split("company/")[1].split("/")[0],
  });

  await Dataset.exportToCSV("data");
});
