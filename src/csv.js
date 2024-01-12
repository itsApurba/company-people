import fs from "fs";
import { parse } from "csv-parse";

const startUrls = [];

fs.createReadStream("./data.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async (row) => {
    // console.log(row);
    startUrls.push({
      url: row[0],
      userData: {
        designation: row[1],
      },
      useExtendedUniqueKey: true,
    });
  })
  .on("end", () => {
    console.log(startUrls);
  });
