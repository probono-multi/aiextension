"use strict";
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "STORE_ELEMENT") {
        console.log("Stored element:", msg.payload);
    }
});
