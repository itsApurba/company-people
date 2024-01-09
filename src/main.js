// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";
import fs from "fs";

let isAuth = fs.existsSync("./auth");

let session = [];

if (isAuth) {
  session = JSON.parse(fs.readFileSync("./auth"));
}

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  preNavigationHooks: [
    async ({ page, browserController }) => {
      await browserController.setCookies(page, session);
      page.setViewportSize({ width: 1024, height: 500 });
    },
  ],
  requestHandlerTimeoutSecs: 60000,
  requestHandler: router,
  headless: false,
  // Comment this option to scrape the full website.
  // maxRequestsPerCrawl: 20,
});

await crawler.addRequests([{ url: "https://www.linkedin.com/company/nobroker-in/", userData: { data: "HEllo" } }]);

await crawler.run();
