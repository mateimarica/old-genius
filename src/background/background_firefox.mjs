'use strict';

import regex from '../modules/regex.mjs';

// General initializing run, also runs when extension is set from disabled to enalbed
initialize();

// Listens for installs and updates
browser.runtime.onInstalled.addListener((details) => {
	// Enable old page and oneTimeConfirm on first install
	if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
		browser.storage.local.set({ enabled: true, oneTimeConfirm: true });
		setRule(true);
	} else {
		initialize();
	}
});

// Set up rule and icon
function initialize() {
	setRule();
	setIcon();
}

// Message listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.event === 'toggleTriggered') {
		const enabled = message.enabled;
		browser.storage.local.set({ enabled: enabled }).then(async () => {
			await setRule(enabled);

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
		'https://genius.com/*'
	]
};

// "blocking" ensures request is blocked until the callback function returns. We need this for the redirect
// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
const extraInfoSpec = ['blocking'];

// Add or remove the redirect rule
 async function setRule(enabled) {
	enabled = await validateEnabled(enabled);

	// If enabled, add rule. If not, remove it
	if (enabled) {
		if (!browser.webRequest.onBeforeRequest.hasListener(beforeRequestCallback)) {
			browser.webRequest.onBeforeRequest.addListener(beforeRequestCallback, beforeRequestFilter, extraInfoSpec);
		}
	} else {
		browser.webRequest.onBeforeRequest.removeListener(beforeRequestCallback);
	}
}

// Set icon enabled/disabled
async function setIcon(enabled) {
	enabled = await validateEnabled(enabled);

	browser.browserAction.setIcon({
		path: enabled ? '../icons/icon_16.png' : '../icons/icon_16_disabled.png'
	});
}

// Ensure that "enabled" is not undefined and set it if it is
async function validateEnabled(enabled) {
	if (enabled === undefined) {
		const results = await browser.storage.local.get('enabled');
		enabled = results.enabled;
	}
	return enabled;
}