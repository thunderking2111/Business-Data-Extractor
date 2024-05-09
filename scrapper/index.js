const puppeteer = require("puppeteer");
const { CONSTANTS } = require("./misc/utils");

let browser = null;

async function* startScrapping(scrapperFn, keywords, locations, maxResPerQuery, delay, stopScrapping, DEV_MODE) {
    browser = await puppeteer.launch({
        headless: !DEV_MODE,
        defaultViewport: { width: CONSTANTS.BROWSER_WIDTH, height: CONSTANTS.BROWSER_HEIGHT },
    });

    yield browser;

    yield { stage: "ongoing" };

    try {
        for (const keyword of keywords) {
            for (const location of locations) {
                yield { currentKeyword: `${keyword} in ${location}` };
                const resultGenerator = await scrapperFn(browser, keyword, location, delay, stopScrapping);
                for await (const result of resultGenerator) {
                    yield { row: result, keyword, location };
                }
            }
        }
    } finally {
        yield { stage: "done" };
        browser.close();
    }
}

module.exports = { startScrapping };
