'use strict';

// Remove bagon=1 param from URL after load (cosmetic only)
const currentUrl = new URL(location.toString());
currentUrl.searchParams.delete('bagon');
const cleanedUrl = currentUrl.toString();
window.history.replaceState({ path: cleanedUrl }, '', cleanedUrl);

// Firefox linter doesn't like dynamic imports with dynamic arguments
// This is good enough for now, though I'd rather have a universal source for this regex
const regex = /genius\.com\/[0-9]+|genius\.com\/[^\/]+lyrics/

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.event === 'toggleCompleted') {
		if (regex.test(location.href)) location.reload(); // Reload the page if match is found
	}
});