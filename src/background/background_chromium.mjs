"use strict";

import regex from '../modules/regex.mjs';

// On launch, check if enabled and set icon.
// Only call setIcon() if disabled, since the enabled icon is default
chrome.storage.local.get('enabled').then((result) =>
	result.enabled === false && setIcon(result.enabled)
);

// Initialize old-song-page rule and its id
const id = 1;
const rule = {
	id: id,
	priority: 100,
	condition: {
		requestDomains: ['genius.com'],
		requestMethods: ['get'],
		regexFilter: regex,
		"resourceTypes": ["main_frame"]
	},
	action: {
		type: 'redirect',
		redirect: {
			transform: {
				queryTransform: {
					addOrReplaceParams: [{ key: 'bagon', value: '1' }]
				}
			}
		}
	}
};

// Listens for installs and updates
chrome.runtime.onInstalled.addListener((details) => {
	// Enable old page on install
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.storage.local.set({ enabled: true, oneTimeConfirm: true });
	}

	// Refresh rule
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [id],
		addRules: [rule]
	});
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.event === 'toggleTriggered') {
		const enabled = message.enabled;
		chrome.storage.local.set({ enabled: enabled }).then(() => {
			toggleRule(enabled).then(() => {

				chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
					try {
						await chrome.tabs.sendMessage(tabs[0].id, {
							event: 'toggleCompleted',
							enabled: enabled
						});
					} catch (error) {
						// chrome.tabs.sendMessage will throw an error if
						// the given tab has no listener registered.
						// (that is, if it's not a genius.com tab)
						// So just gobble up the error instead
					}
				});

				setIcon(enabled);

				sendResponse({ successful: true });
			});
		});
	}

	return true; // Need this, otherwise sendResponse() won't work
});

/**
 * Toggle the old-song-page rule.
 * @param {Boolean} enabled
 * @returns {Promise} a promise
 */
function toggleRule(enabled) {
	// If enabled, add rule. If not, remove it
	const options = enabled ?
	      { 
			removeRuleIds: [id],
			addRules: [rule] 
		  } :
	      { removeRuleIds: [id] };

	return chrome.declarativeNetRequest.updateDynamicRules(options);
}

// Set icon enabled/disabled
function setIcon(enabled) {
	chrome.action.setIcon({
		path: enabled ? '../icons/icon_16.png' : '../icons/icon_16_disabled.png'
	});
}