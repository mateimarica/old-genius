"use strict";

import regex from './regex.mjs';

// On launch, check if enabled and set icon.
// Only call setIcon() if disabled, since the enabled icon is default
browser.storage.local.get('enabled').then((result) =>
	result.enabled === false && setIcon(result.enabled)
);

// Listens for installs and updates
browser.runtime.onInstalled.addListener((details) => {
	// Enable old page and oneTimeConfirm on first install
	if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
		browser.storage.local.set({ enabled: true, oneTimeConfirm: true });
	}

	// Remove the rule and re-add it, just in case
	toggleRule(false);
	toggleRule(true);
});

// Message listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.event === 'toggleTriggered') {
		const enabled = message.enabled;
		browser.storage.local.set({ enabled: enabled }).then(() => {
			toggleRule(enabled);

			browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
				try {
					await browser.tabs.sendMessage(tabs[0].id, {
						event: 'toggleCompleted',
						enabled: enabled
					});
				} catch (error) {
					// browser.tabs.sendMessage will throw an error if
					// the given tab has no listener registered.
					// (that is, if it's not a genius.com tab)
					// So just gobble up the error instead
				}
			});

			setIcon(enabled);

			sendResponse({ successful: true });
		});
	}

	return true; // Need this, otherwise sendResponse() won't work
});

// On launch, check if enabled and set icon.
// Only call setIcon() if disabled, since the enabled icon is default
browser.storage.local.get('enabled').then((result) =>
	result.enabled === false && setIcon(result.enabled)
);

const beforeRequestCallback = (details) => {
	if (regex.test(details.url)) {
		const currentUrl = new URL(details.url);
		// If the URL already has the param, return. Otherwise, you'd have an infinite loop of redirects.
		if (currentUrl.searchParams.has('bagon')) return;
		currentUrl.searchParams.set('bagon', '1');
		return {
		  redirectUrl: currentUrl.toString()
		}
	}
};

const beforeRequestFilter = {
	urls: [
		"https://genius.com/*"
	]
};

// "blocking" ensures request is blocked until the callback function returns. We need this for the redirect
// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
const extraInfoSpec = ["blocking"];

/**
 * Toggle the old-song-page rule.
 * @param {Boolean} enabled
 * @returns {Promise} a promise
 */
function toggleRule(enabled) {
	// If enabled, add rule. If not, remove it
	if (enabled) {
		browser.webRequest.onBeforeRequest.addListener(beforeRequestCallback, beforeRequestFilter, extraInfoSpec);
	} else {
		browser.webRequest.onBeforeRequest.removeListener(beforeRequestCallback);
	}
}

// Set icon enabled/disabled
function setIcon(enabled) {
	browser.browserAction.setIcon({
		path: enabled ? '../icons/icon_16.png' : '../icons/icon_16_disabled.png'
	});
}