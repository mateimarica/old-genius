"use strict";

// Remove bagon=1 param from URL after load (cosmetic only)
const currentUrl = new URL(location.toString());
currentUrl.searchParams.delete('bagon');
const cleanedUrl = currentUrl.toString();
window.history.replaceState({ path: cleanedUrl }, '', cleanedUrl);

// Add a message listener for when we switch between song pages
// If we're on a lyric or annoation page, the page will get reload automatically
let regex;
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.origin === 'stateToggled') {
		if (!regex) await initRegex(); // Load regex if we don't have it
		if (regex.test(location.href)) location.reload(); // Reload the page if match is found
	}
});

// Dynamically import the regex only when we need it
async function initRegex() {
	const src = chrome.runtime.getURL('scripts/regex.mjs');
	regex = new RegExp((await import(src)).default);
}