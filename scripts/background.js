// Annotation URLs, like https://genius.com/5140304
// Matches strings containing genius.com/\<number>
const annotationRegex = /genius\.com\/[0-9]+/; 

// Lyric URLs, like https://genius.com/Don-toliver-slow-motion-lyrics
// Matches string containing genius.com/<string_without_slash>lyrics
const lyricsRegex = /genius\.com\/[^\/]+lyrics/;

const regex = annotationRegex.source + '|' + lyricsRegex.source;

// const callback = (details) => {
// 	if (lyricsRegex.test(details.url) || annotationRegex.test(details.url)) {
// 	   return {
// 		  redirectUrl: "cock"
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


chrome.runtime.onInstalled.addListener(() => {
	console.log('installed');
	const RULE = {
		id: 1,
		condition: {
			//initiatorDomains: [chrome.runtime.id],
			requestDomains: ['mateimarica.dev'],
			// requestMethods: ['get'],
			// regexFilter: regex,
			//resourceTypes: ['main_frame']
	 	},
		action: {
			type: 'redirect',
			redirect: {
				transform: {
					queryTransform: {
						addOrReplaceParams: [{ key: 'bagon', value: '1'}]
					}
				}
			}
		}
	};
	//chrome.declarativeNetRequest.updateDynamicRules({);
	
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [1],
		addRules: [
			// {
			// 	"id": 1,
			// 	"priority": 1,
			// 	"action": { "type": "redirect", "redirect": { "url": "https://example.com" } },
			// 	"condition": { "urlFilter": "google.com", "resourceTypes": ["main_frame"] }
			// },
			{
				id: 1,
				condition: {
					requestDomains: ['genius.com'],
					requestMethods: ['get'],
					regexFilter: regex,
					"resourceTypes": ["main_frame"]
					/*"urlFilter": "genius.com",*/ 
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
			}
		]
	});
});

console.log('hello')




