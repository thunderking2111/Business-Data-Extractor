const { waitForEl, scrollResultsList } = require("../misc/dom_helpers");
const setupPageContext = require("../misc/setup_page_context");
const { sleep, ElNotFoundError } = require("../misc/utils");

const URL = "https://www.google.com/maps";

const HEADERS = [
    { key: "url", value: "URL" },
    { key: "title", value: "Title" },
    { key: "rating", value: "Rating" },
    { key: "reviewScore", value: "Review Score" },
    { key: "category", value: "Category" },
    { key: "address", value: "Address" },
    { key: "website", value: "Website" },
    { key: "phone", value: "Phone" },
    { key: "monday", value: "Monday" },
    { key: "tuesday", value: "Tuesday" },
    { key: "wednesday", value: "Wednesday" },
    { key: "thursday", value: "Thursday" },
    { key: "friday", value: "Friday" },
    { key: "saturday", value: "Saturday" },
    { key: "sunday", value: "Sunday" },
];

const RES_SKELTON = {
    title: "",
    address: "",
    phone: "",
    reviewScore: "",
    rating: "",
    website: "",
    url: "",
    sunday: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    category: "",
};

const SELECTORS = {
    searchBoxInput: "input#searchboxinput",
    searchButton: "button#searchbox-searchbutton",
    resultList: "div[role='feed']",
    resultItem: "div[role='feed'] a[aria-label][href^='https://www.google.com/maps/']",
    infoDisplayBox: "div[role='main']",
    title: "div[role='main'][aria-label] h1:last-of-type",
    ratingSibling: "span[aria-label*='star']",
    reviews: "span[aria-label*='review']",
    category: "button[jsaction*='category']",
    address: "button[data-item-id='address']",
    website: "a[aria-label^='Website:'][data-item-id='authority']",
    phone: "button[aria-label^='Phone:']",
    openHoursButton: "div[jsaction*='openhours']",
    openHoursTable: "div[jsaction*='openhours'] + div table",
};

/**
 * @param {import("puppeteer").Browser} browser
 */
async function* scrapGoogleMaps(browser, keyword, location, ITEM_SWITCH_DELAY, stopScrapping) {
    const page = await browser.newPage();
    await page.goto(URL, { timeout: 60000 });
    await page.waitForSelector(SELECTORS.searchBoxInput);
    await page.type(SELECTORS.searchBoxInput, `${keyword} in ${location}`);
    await page.click(SELECTORS.searchButton);
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector(SELECTORS.resultList);
    await sleep();

    await setupPageContext(page, { SELECTORS, RES_SKELTON });

    // Store the reference to the results section
    const resultsListHandle = await page.$(SELECTORS.resultList);
    await scrollResultsList(page, resultsListHandle, "end of the list");
    const resultItemHandles = await resultsListHandle.$$(SELECTORS.resultItem);
    if (resultItemHandles.length == 0) {
        return Promise.reject("Nothing to scrap");
    }
    console.log("Length Of results:", resultItemHandles.length);

    // Finding the length of infoDisplayBoxes
    try {
        await resultItemHandles[0].click();
        await page.waitForSelector(SELECTORS.title, { timeout: 10000 });
    } catch {
        await resultItemHandles[0].click();
        await page.waitForSelector(SELECTORS.title, { timeout: 10000 });
    }
    await page.evaluate(async () => {
        const infoBoxes = document.querySelectorAll(SELECTORS.infoDisplayBox);
        if (infoBoxes.length === 0) {
            return Promise.reject();
        }
        const infoBoxIndex = infoBoxes.length === 1 ? 0 : 1;
        window.infoBoxIndex = infoBoxIndex;
    });

    for (const resultItemHandle of resultItemHandles) {
        const res = await resultItemHandle.evaluate(async (item) => {
            let el;
            for (let i = 0; i < 3; i++) {
                try {
                    item.click();
                    await new Promise((resolve) => requestAnimationFrame(resolve));
                    // item.scrollIntoView({ block: "center" });
                    el = await waitForEl(SELECTORS.title, { text: item.ariaLabel });
                    if (el) {
                        break;
                    }
                } catch (error) {
                    if (!(error instanceof ElNotFoundError)) {
                        throw error;
                    }
                }
            }
            if (!el) {
                return;
            }
            const res = { ...RES_SKELTON };
            res.url = item.getAttribute("href");
            const infoBox = document.querySelectorAll(SELECTORS.infoDisplayBox)[
                window.infoBoxIndex
            ];
            const titleEl = infoBox.querySelector(SELECTORS.title);
            res.title = titleEl && titleEl.textContent.trim().sanitize();
            const ratingSiblingEl = infoBox.querySelector(SELECTORS.ratingSibling);
            let ratingEl;
            let prevEl;
            if (ratingSiblingEl) {
                for (const el of ratingSiblingEl.parentElement.children) {
                    if (ratingSiblingEl === el) {
                        ratingEl = prevEl;
                        break;
                    }
                    prevEl = el;
                }
            }
            res.rating = ratingEl && ratingEl.textContent.sanitize();
            const reviewScoreEl = infoBox.querySelector(SELECTORS.reviews);
            res.reviewScore = reviewScoreEl && reviewScoreEl.textContent.sanitize();
            const categoryEl = infoBox.querySelector(SELECTORS.category);
            res.category = categoryEl && categoryEl.textContent.sanitize();
            const addressEl = infoBox.querySelector(SELECTORS.address);
            res.address = addressEl && addressEl.textContent.sanitize();
            const websiteEl = infoBox.querySelector(SELECTORS.website);
            res.website = websiteEl && websiteEl.textContent.sanitize();
            const phoneEl = infoBox.querySelector(SELECTORS.phone);
            res.phone = phoneEl && phoneEl.textContent.sanitize();
            const openingHoursBtn = infoBox.querySelector(SELECTORS.openHoursButton);
            if (openingHoursBtn) {
                let openingHoursTable = undefined;
                try {
                    openingHoursTable = await waitForEl(SELECTORS.openHoursTable);
                } catch (error) {
                    if (!(error instanceof ElNotFoundError)) {
                        throw error;
                    }
                    openingHoursTable = undefined;
                }
                if (openingHoursTable) {
                    const openingHoursRows = Array.from(
                        openingHoursTable.querySelectorAll("tbody tr"),
                    );
                    for (const row of openingHoursRows) {
                        const tdEls = row.querySelectorAll("td");
                        if (tdEls[0] && tdEls[1]) {
                            res[tdEls[0].textContent.sanitize().toLowerCase()] =
                                tdEls[1].textContent.sanitize();
                        }
                    }
                }
            }
            return res;
        });
        if (stopScrapping()) {
            await Promise.all((await browser.pages()).map((page) => page.close()));
            await browser.close();
            return;
        }
        if (res) {
            yield res;
        }
        await sleep(
            ITEM_SWITCH_DELAY === "random"
                ? Math.floor(Math.random() * 3000) + 1000 + 500
                : ITEM_SWITCH_DELAY,
        );
    }
    await page.close();
}

module.exports = scrapGoogleMaps;
module.exports.HEADERS = HEADERS;
