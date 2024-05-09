const { scrollResultsList, waitForEl } = require("../misc/dom_helpers");
const setupPageContext = require("../misc/setup_page_context");
const getUserInput = require("../misc/user_input_helper");
const { ElNotFoundError, sleep, CONSTANTS } = require("../misc/utils");

const URL = "https://www.bing.com/maps";

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
    { key: "sunday", value: "Sunday" }
];

const SELECTORS = {
    searchBoxInput: ".searchbox input[type='search']",
    searchButton: ".searchbox .searchButton a.searchIcon",
    resultList: ".bm_listings-container .overlay-listings .entity-listing-container",
    resultItem: "a.listings-item",
    resultItemTitle: ".lm_titlerow",
    infoDisplayBox:
        ".bm_slideContainer .slidecard[data-containerareatype='cardsContainer'][role='complementary'] .local-taskpane",
    title: ".nameContainer",
    address: ".infoModule [aria-label='Address']",
    phone: ".infoModule [aria-label='Phone']",
    reviewSection: "[data-csn='reviews'] .b_subModule",
    singleReviewHeader: ".rvfltr",
    multiReviewHeader: ".lTabHead .lTabHdr",
    multiReviewRating: ".mrtCaption .row2 span:nth-child(1)",
    multiReviewScore: ".mrtCaption .row2 span:nth-child(2)",
    rating: ".b_rev_header a:nth-child(2)",
    websiteAnchor: ".infoModule a[viewname='InstLink'][aria-label='Website']",
    websiteAlternate: ".infoModule [aria-label='Website'] a",
    shareBtn: ".infoModule a#shareAction img",
    linkInput: ".selectionCardClass .copyAndLinkText input",
    shareCloseBtn: ".shareHeader a.panelClose",
    openHoursBtn: ".infoModule [aria-label='Hours'] .opHours .opHr_Exp",
    openHoursTable: ".infoModule [aria-label='Hours'] .opHours table",
    pagination: ".bm_svrpagination",
    leftPagination: ".bm_leftChevron",
    rightPagination: ".bm_rightChevron",
    waitLayer: ".bm_scrollbarMask[aria-hidden='false'] .bm_waitlayer",
};

/**
 * @param {import("puppeteer").Browser} browser
 */
async function scrapBingMaps(browser, keyword, location) {
    const page = await browser.newPage();
    await page.goto(URL, { timeout: 60000 });
    await page.waitForSelector(SELECTORS.searchBoxInput);
    await page.type(SELECTORS.searchBoxInput, `${keyword} in ${location}`);

    await page.click(SELECTORS.searchButton);
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });

    await setupPageContext(page, { SELECTORS });

    // Finding the length of infoDisplayBoxes
    page.evaluate(async () => {
        const item = await waitForEl(`${SELECTORS.resultList} ${SELECTORS.resultItem}`);
        item.click();
        await waitForEl(`${SELECTORS.infoDisplayBox} ${SELECTORS.title}`);
        const infoBoxes = document.querySelector(SELECTORS.infoDisplayBox);
        if (infoBoxes.length === 0) {
            return Promise.reject();
        }
        const infoBoxIndex = infoBoxes.length === 1 ? 0 : 1;
        window.infoBoxIndex = infoBoxIndex;
    });

    const results = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        await page.evaluate(async () => {
            const waitLayer = document.querySelector(SELECTORS.waitLayer);
            if (waitLayer) {
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (["none", ""].includes(waitLayer.style.display)) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 500);
                });
            }
        });
        const resultsListHandle = await page.$(SELECTORS.resultList);
        await scrollResultsList(page, resultsListHandle, SELECTORS.pagination, true);
        const resultItemHandles = await resultsListHandle.$$(SELECTORS.resultItem);
        if (resultItemHandles.length == 0) {
            return Promise.reject("Nothing to scrap");
        }
        console.log("Length Of results:", resultItemHandles.length);

        for (const resultItemHandle of resultItemHandles) {
            const res = await resultItemHandle.evaluate(async (item) => {
                try {
                let el;
                for (let i = 0; i < 3; i++) {
                    try {
                        item.click();
                        await new Promise((resolve) => requestAnimationFrame(resolve));
                        // item.scrollIntoView({ block: "center" });
                        el = await waitForEl(SELECTORS.title, {
                            text: item.querySelector(SELECTORS.resultItemTitle).textContent,
                        });
                        console.log(`${i}th el ${el}`);
                        if (el) {
                            break;
                        }
                    } catch (error) {
                        console.log(`${i}th error`);
                        if (!(error instanceof ElNotFoundError)) {
                            throw error;
                        }
                    }
                }
                if (!el) {
                    return;
                }
                const res = {};
                const infoBox = document.querySelector(SELECTORS.infoDisplayBox);
                const titleEl = infoBox.querySelector(SELECTORS.title);
                res.title = titleEl && titleEl.textContent.trim().sanitize();
                const reviewSection = infoBox.querySelector(SELECTORS.reviewSection);
                if (reviewSection) {
                    const singleReviewHeader = reviewSection.querySelector(
                        SELECTORS.singleReviewHeader,
                    );
                    const multiReviewHeader = reviewSection.querySelector(
                        SELECTORS.multiReviewHeader,
                    );
                    if (singleReviewHeader) {
                        const ratingEl = singleReviewHeader.querySelector(SELECTORS.rating);
                        res.rating = ratingEl && ratingEl.textContent().sanitize();
                    } else if (multiReviewHeader) {
                        const ratingEl = multiReviewHeader.querySelector(
                            SELECTORS.multiReviewRating,
                        );
                        const reviewScoreEl = multiReviewHeader.querySelector(
                            SELECTORS.multiReviewScore,
                        );
                        res.rating = ratingEl && ratingEl.textContent().sanitize();
                        res.reviewScore = reviewScoreEl && reviewScoreEl.textContent().sanitize();
                    }
                }
                const addressEl = infoBox.querySelector(SELECTORS.address);
                res.address = addressEl && addressEl.textContent.sanitize();
                const websiteEl =
                    infoBox.querySelector(SELECTORS.websiteAnchor) ||
                    infoBox.querySelector(SELECTORS.websiteAlternate);
                if (websiteEl) {
                    const href = websiteEl.getAttribute("href");
                    if (href) {
                        const hrefUrl = new URL(href);
                        res.website =
                            href.origin === window.origin ? hrefUrl.searchParams.get("url") : href;
                    }
                }
                const phoneEl = infoBox.querySelector(SELECTORS.phone);
                res.phone = phoneEl && phoneEl.textContent.sanitize();
                const openingHoursBtn = infoBox.querySelector(SELECTORS.openHoursBtn);
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
                        const data = {};
                        for (const row of openingHoursRows) {
                            const tdEls = row.querySelectorAll("td");
                            if (tdEls[0] && tdEls[1]) {
                                data[tdEls[0].textContent.sanitize()] = Array.from(
                                    tdEls[1].querySelectorAll("hrRange"),
                                )
                                    .map((range) => range.textContent)
                                    .join(" & ")
                                    .textContent.sanitize();
                            } else {
                                data[""] = "";
                            }
                        }
                        res.openingHoursData = data;
                    }
                }

                const shareBtn = infoBox.querySelector(SELECTORS.shareBtn);
                if (shareBtn) {
                    shareBtn.click();
                    const linkInput = await waitForEl(SELECTORS.linkInput, { value: "bing.com", delay: 10000 });
                    res.url = linkInput.value;
                    document.querySelector(SELECTORS.shareCloseBtn).click();
                    await waitForEl(
                        `${SELECTORS.resultList} ${SELECTORS.resultItem} ${SELECTORS.resultItemTitle}`,
                        { text: res.title },
                    );
                }
                return res;
                } catch (error) {
                    debugger;
                }
            });
            if (res) {
                results.push(res);
            }
            await sleep(CONSTANTS.ITEM_SWITCH_DELAY);
        }
        try {
            const shouldContinue = await page.$eval(SELECTORS.rightPagination, (rightEl) => {
                if (rightEl.style.display !== "none") {
                    rightEl.click();
                    return true;
                } else {
                    return false;
                }
            });
            if (!shouldContinue) {
                break;
            }
        } catch {
            break;
        }
    }
    return results;
}

module.exports = scrapBingMaps;
module.exports.HEADERS = HEADERS;
