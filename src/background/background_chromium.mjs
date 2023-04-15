'use strict';

import regex from '../modules/regex.mjs';

// General initializing run, also runs when extension is set from disabled to enalbed
initialize();

// Listens for installs and updates
chrome.runtime.onInstalled.addListener((details) => {
	// Enable old page and oneTimeConfirm on first install
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.storage.local.set({ enabled: true, oneTimeConfirm: true });
		setRule(true);
	} else {
		initialize();
	}
});

// Set up rule and icon
function initialize() {
	console.log('running');
	setRule();
	setIcon();
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.event === 'toggleTriggered') {
		const enabled = message.enabled;
		chrome.storage.local.set({ enabled: enabled }).then(async () => {
			await setRule(enabled);

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
	}

	return true; // Need this, otherwise sendResponse() won't work
});

// Initialize old-song-page rule and its id
const id = 1;
const rule = {
	id: id,
	priority: 100,
	condition: {
		requestDomains: ['genius.com'],
		requestMethods: ['get'],
		regexFilter: regex.source,
		resourceTypes: ['main_frame']
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

// Add or remove the redirect rule
 async function setRule(enabled) {
	enabled = await validateEnabled(enabled);
	
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
async function setIcon(enabled) {
	enabled = await validateEnabled(enabled);

	chrome.action.setIcon({
		path: enabled ? '../icons/icon_16.png' : '../icons/icon_16_disabled.png'
	});
}

// Ensure that "enabled" is not undefined and set it if it is
async function validateEnabled(enabled) {
	if (enabled === undefined) {
		const results = await chrome.storage.local.get('enabled');
		enabled = results.enabled;
	}
	return enabled;
}