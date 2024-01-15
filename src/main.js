import { PlaywrightCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";
import { parse } from "csv-parse";
import fs from "fs";

const startUrls = [];

let isAuth = fs.existsSync("./auth");
let session = [];
if (isAuth) {
  session = JSON.parse(fs.readFileSync("./auth")).map((e) => {
    // console.log(e);
    const { sameSite, ...rest } = e;
    return rest;
  });
}

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  maxConcurrency: 5,
  preNavigationHooks: [
    async ({ page, browserController }) => {
      await browserController.setCookies(page, session);
      page.setViewportSize({ width: 1024, height: 500 });
    },
  ],
  requestHandlerTimeoutSecs: 60000,
  requestHandler: router,
  // headless: false,
});

// await crawler.run(
//   [
//     { url: "https://www.linkedin.com/company/tata-consultancy-services/people/", userData: { designation: "frontend developer" }, useExtendedUniqueKey: true },
//     { url: "https://www.linkedin.com/company/tata-consultancy-services/people/", userData: { designation: "backend developer" }, useExtendedUniqueKey: true },
//   ],
//   {
//     waitBetweenBatchesMillis: 3000,
//   }
// );

fs.createReadStream("./data.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async (row) => {
    // console.log(row);
    startUrls.push({
      url: `${row[0]}people/?keywords=${row[1].replace(" ", "%20")}`,
      userData: {
        // replace all %20 with space
        designation: row[1],
      },
      uniqueKey: Math.random().toString(),
      useExtendedUniqueKey: true,
    });
  })
  .on("end", async () => {
    await crawler.run(startUrls);
  });
