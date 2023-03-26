import regex from './regex.mjs';

// Old-song-page rule and its id
const id = 1;
const rule = {
	id: id,
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

// const callback = (details) => {
// 	if (lyricsRegex.test(details.url) || annotationRegex.test(details.url)) {
// 	   return {
// 		  redirectUrl: "hen"
// 	   }
// 	}
// };

// const filter = { 
// 	urls: [
// 		"*://genius.com"
// 	]
// };

// // "blocking" ensures request is blocked until the callback function returns. We need this for the redirect
// // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
// const extraInfoSpec = ["blocking"];

// chrome.webRequest.onBeforeRequest.addListener(callback, filter, extraInfoSpec);

// a={
//     "id": 4,
//     "priority": 1,
//     "action": { "type": "redirect", "redirect": { "url": "https://example.com" } },
//     "condition": { "urlFilter": "google.com", "resourceTypes": ["main_frame"] }
// }
// b=[
// 	{
// 	  "id": 1,
// 	  "priority": 1,
// 	  "action": {
// 		"type": "redirect",
// 		"redirect": {
// 		  "transform": {
// 			"queryTransform": {
// 			  "addOrReplaceParams": [{ "key": "test", "value": "123" }]
// 			}
// 		  }
// 		}
// 	  },
// 	  "condition": {
// 		"urlFilter": "https://example.com",
// 		"resourceTypes": ["main_frame"],
// 	  }
// 	}
//   ]

// chrome.storage.onChanged.addListener((changes, namespace) => {
// 	if (changes.enabled.newValue !== changes.enabled.oldValue) {
// 		toggleRule()
// 	}
// });

// Listens for installs and updates
chrome.runtime.onInstalled.addListener((details) => {
	// Enable old page on install
	if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.storage.local.set({ enabled: true });
	}

	// Refresh rule
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [id],
		addRules: [rule]
	});
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.origin === 'switchBtn') {
		const enabled = message.enabled;
		chrome.storage.local.set({ enabled: enabled }).then(() => {
			toggleRule(enabled).then(() => {

				chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
					try {
						await chrome.tabs.sendMessage(tabs[0].id, {origin: 'stateToggled'})
					} catch (error) {
						// chrome.tabs.sendMessage will throw an error if 
						// the given tab has no listener registered.
						// (that is, if it's not a genius.com tab)
						// So just gobble up the error instead
					}
				});

				sendResponse({ successful: true });
			});
		});
	}

	
	return true;
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