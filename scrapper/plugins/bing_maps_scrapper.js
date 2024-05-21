const { scrollResultsList, waitForEl } = require("../misc/dom_helpers");
const setupPageContext = require("../misc/setup_page_context");
const { ElNotFoundError, sleep } = require("../misc/utils");

const URL = "https://www.bing.com/maps";

const HEADERS = [
    { key: "url", value: "URL" },
    { key: "title", value: "Title" },
    { key: "rating", value: "Rating" },
    { key: "reviewScore", value: "Review Score" },
    { key: "ratingProvider", value: "Rating Provider" },
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
    ratingProvider: "",
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

const openHoursMap = {
    Mon: "monday",
    Tue: "tuesday",
    Wed: "wednesday",
    Thu: "thursday",
    Fri: "friday",
    Sat: "saturday",
    Sun: "sunday",
};

const SELECTORS = {
    searchBoxInput: ".searchbox input[type='search']",
    searchButton: ".searchbox .searchButton a.searchIcon",
    resultList:
        ".taskCard:not(.hidden) .bm_listings-container .overlay-listings .entity-listing-container",
    resultItem: "a.listings-item",
    resultItemTitle: ".lm_titlerow",
    resultItemTitleSpan: ".lm_titlerow span",
    infoDisplayBox:
        ".bm_slideContainer .slidecard[data-containerareatype='cardsContainer'][role='complementary'] .overlay-taskpane",
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

function formatTime(timeStr) {
    const [hour, minute] = timeStr.split(":").map((part) => part.padStart(2, "0"));
    return `${hour}:${minute}`;
}

/**
 * @param {import("puppeteer").Browser} browser
 */
async function* scrapBingMaps(browser, keyword, location, ITEM_SWITCH_DELAY, stopScrapping) {
    const page = await browser.newPage();
    await page.goto(URL, { timeout: 60000 });
    await page.waitForSelector(SELECTORS.searchBoxInput);
    await page.type(SELECTORS.searchBoxInput, `${keyword} in ${location}`);

    await page.click(SELECTORS.searchButton);
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });

    await setupPageContext(page, { SELECTORS, RES_SKELTON, openHoursMap });

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
            await resultItemHandle.click();
            const res = await resultItemHandle.evaluate(async (item) => {
                const res = { ...RES_SKELTON };
                try {
                    let el;
                    const itemEntity = JSON.parse(item.dataset.entity).entity;
                    const itemTitleText = itemEntity.title;
                    for (let i = 0; i < 3; i++) {
                        try {
                            await new Promise((resolve) => requestAnimationFrame(resolve));
                            // item.scrollIntoView({ block: "center" });\
                            el = await waitForEl(SELECTORS.title, {
                                text: itemTitleText,
                                getTextNode: (el) => el.firstChild,
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
                    const infoBox = document.querySelector(SELECTORS.infoDisplayBox);
                    res.title = itemTitleText.trim().sanitize();
                    const entity = infoBox.dataset.entity
                        ? JSON.parse(infoBox.dataset.entity).entity
                        : undefined;
                    const facts = infoBox.dataset.facts
                        ? JSON.parse(infoBox.dataset.facts)
                        : undefined;
                    const itineraryFacts = infoBox.dataset.itineraryfacts
                        ? JSON.parse(infoBox.dataset.itineraryfacts)
                        : undefined;
                    if (entity) {
                        res.title = entity.title;
                        res.address = entity.address;
                        res.website = entity.website;
                    }
                    debugger;
                    if (facts?.openHours) {
                        facts.openHours.foreach((hourData) => {
                            const hourRange = hourData.hoursRanges[0];
                            const formattedStart = formatTime(hourRange.start);
                            const formattedEnd = formatTime(hourRange.end);
                            const timing = `${formattedStart} - ${formattedEnd}`;
                            res[hourData.day.toLowerCase()] = timing;
                        });
                    }
                    if (itineraryFacts) {
                        res.address = res.address || itineraryFacts.Address.formattedAddress;
                        if (itineraryFacts.OpenHours?.[0]) {
                            if (!facts?.openHours) {
                                itineraryFacts.OpenHours[0].Hours.forEach((hour) => {
                                    const hourRange = hour.HoursRanges[0];
                                    const hRangeSt = hourRange.Start;
                                    const hRangeEn = hourRange.End;
                                    const startHour = hRangeSt.Hour.toString().padStart(2, "0");
                                    const startMinute = hRangeSt.Minute.toString().padStart(2, "0");
                                    const endHour = hRangeEn.Hour.toString().padStart(2, "0");
                                    const endMinute = hRangeEn.Minute.toString().padStart(2, "0");
                                    const timing = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;
                                    res[openHoursMap[hour.Day]] = timing;
                                });
                            }
                            if (itineraryFacts.OpenHours[0].ClosedDays) {
                                itineraryFacts.OpenHours[0].ClosedDays.forEach((day) => {
                                    res[openHoursMap[day]] = "Closed";
                                });
                            }
                        }
                        res.category = itineraryFacts.Categories?.[0] || "";
                        res.phone = itineraryFacts.PhoneNumber
                            ? itineraryFacts.PhoneNumber
                            : res.phone;
                        if (itineraryFacts.Rating) {
                            res.rating = itineraryFacts.Rating.Rating;
                            res.reviewScore = itineraryFacts.Rating.TotalNo;
                            res.ratingProvider = itineraryFacts.Rating.Provider;
                        }
                        if (itineraryFacts.Action?.ActionUrl && !res.website) {
                            res.website = itineraryFacts.Action.ActionUrl;
                        }
                    }
                    if (!res.rating) {
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
                                res.reviewScore =
                                    reviewScoreEl && reviewScoreEl.textContent().sanitize();
                            }
                        }
                    }
                    if (!res.address) {
                        const addressEl = infoBox.querySelector(SELECTORS.address);
                        res.address = addressEl && addressEl.textContent.sanitize();
                    }
                    if (!res.website) {
                        const websiteEl =
                            infoBox.querySelector(SELECTORS.websiteAnchor) ||
                            infoBox.querySelector(SELECTORS.websiteAlternate);
                        if (websiteEl) {
                            const href = websiteEl.getAttribute("href");
                            if (href) {
                                const hrefUrl = new URL(href);
                                res.website =
                                    href.origin === window.origin
                                        ? hrefUrl.searchParams.get("url")
                                        : href;
                            }
                        }
                    }
                    if (!res.phone) {
                        const phoneEl = infoBox.querySelector(SELECTORS.phone);
                        res.phone = phoneEl && phoneEl.textContent.sanitize();
                    }
                    if (
                        !(
                            res.sunday &&
                            res.monday &&
                            res.tuesday &&
                            res.wednesday &&
                            res.thursday &&
                            res.friday &&
                            res.saturday
                        )
                    ) {
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
                                    if (
                                        tdEls[0] &&
                                        tdEls[1] &&
                                        !res[tdEls[0].toLowerCase().sanitize()]
                                    ) {
                                        data[tdEls[0].textContent.sanitize()] = Array.from(
                                            tdEls[1].querySelectorAll("hrRange"),
                                        )
                                            .map((range) => range.textContent)
                                            .join(" & ")
                                            .textContent.sanitize();
                                    }
                                }
                                res.openingHoursData = data;
                            }
                        }
                    }

                    const shareBtn = infoBox.querySelector(SELECTORS.shareBtn);
                    if (shareBtn) {
                        shareBtn.click();
                        const linkInput = await waitForEl(SELECTORS.linkInput, {
                            value: "bing.com",
                            delay: 10000,
                        });
                        res.url = linkInput.value;
                        document.querySelector(SELECTORS.shareCloseBtn).click();
                        await sleep(2000);
                    }
                    return res;
                } catch (error) {
                    console.log(error);
                    return { res, error };
                }
            });
            if (stopScrapping()) {
                await Promise.all((await browser.pages()).map((page) => page.close()));
                await browser.close();
                return;
            }
            if (res) {
                if (res.error) {
                    console.log(res.error);
                    yield res.res;
                } else {
                    yield res;
                }
            }
            await sleep(
                ITEM_SWITCH_DELAY === "random"
                    ? Math.floor(Math.random() * 3000) + 1000 + 500
                    : ITEM_SWITCH_DELAY,
            );
        }
        try {
            let shouldContinue = await page.$eval(SELECTORS.rightPagination, (rightEl) => {
                if (rightEl.style.display !== "none") {
                    rightEl.click();
                    return true;
                } else {
                    return false;
                }
            });
            await sleep();
            if (!shouldContinue) {
                break;
            }
            debugger;
            shouldContinue = await page.evaluate(
                async () => {
                    debugger;
                    let next = true;
                    const waitLayer = document.querySelector(SELECTORS.waitLayer);
                    if (waitLayer) {
                        try {
                            await new Promise((resolve, reject) => {
                                let done = false;
                                const checkInterval = setInterval(() => {
                                    if (["none", ""].includes(waitLayer.style.display)) {
                                        clearTimeout(finalTimeout);
                                        clearInterval(checkInterval);
                                        done = true;
                                        resolve();
                                    }
                                }, 500);
                                const finalTimeout = setTimeout(() => {
                                    if (!done) {
                                        clearInterval(checkInterval);
                                        reject();
                                    }
                                }, 5000);
                            });
                        } catch {
                            next = false;
                        }
                    }
                    if (!next) {
                        return false;
                    }
                    try {
                        await new Promise((res, rej) => {
                            let done = false;
                            const checkInterval = setInterval(() => {
                                if (document.querySelector(SELECTORS.leftPagination)) {
                                    clearTimeout(finalTimeout);
                                    clearInterval(checkInterval);
                                    done = true;
                                    res();
                                }
                            });
                            const finalTimeout = setTimeout(() => {
                                if (!done) {
                                    clearInterval(checkInterval);
                                    rej();
                                }
                            }, 5000);
                        });
                    } catch {
                        return false;
                    }
                    return true;
                },
                { timeout: 20000 },
            );
            if (!shouldContinue) {
                break;
            }
        } catch {
            break;
        }
    }
}

module.exports = scrapBingMaps;
module.exports.HEADERS = HEADERS;
