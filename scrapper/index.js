const puppeteer = require("puppeteer");
const { CONSTANTS } = require("./misc/utils");
const scrapGoogleMaps = require("./plugins/google_maps_scrapper");

let browser = null;

async function startScrapping(scrapperFn, DEV_MODE) {
    browser = await puppeteer.launch({
        headless: !DEV_MODE,
        defaultViewport: { width: CONSTANTS.BROWSER_WIDTH, height: CONSTANTS.BROWSER_HEIGHT },
    });
    let results = [];
    try {
        results = await scrapperFn(browser);
    } finally {
        browser.close();
    }

    console.log("Final Results: ", results.length);
    return results;
}

module.exports = { startScrapping };
