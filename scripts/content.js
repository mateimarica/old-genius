

const currentUrl = new URL(location.toString());
currentUrl.searchParams.delete('bagon');
const cleanedUrl = currentUrl.toString();
window.history.replaceState({ path: cleanedUrl }, '', cleanedUrl);

// const allLinks = document.querySelectorAll('a[href^="https://genius.com"]');
// console.log(allLinks.length)
// const allLinksLen = allLinks.length;
// for (let i = 0; i < allLinksLen; i++) {
// 	console.log(allLinks[i].href);
// 	if (allLinks[i].matches('[href$="lyrics"]')) {
// 		allLinks[i].href = addStyleParam(allLinks[i].href, '1');
// 	}
// }

// function addStyleParam(url, value) {
// 	const urlSplit = url.split('?');
// 	const urlParams = new URLSearchParams(urlSplit[1]);
// 	urlParams.set('bagon', value);
// 	return urlSplit[0] + '?' + urlParams;
// }

// let previousUrl = '';
// const observer = new MutationObserver(() => {
// 	if (location.href !== previousUrl && location.pathname.endsWith('lyrics')) {
// 		previousUrl = location.href;
// 		const currentUrl = new URL(location.toString());
// 		currentUrl.searchParams.set('bagon', '1');
// 		window.history.replaceState({ path: currentUrl.toString() }, '', currentUrl.toString());
// 	}
// });

// observer.observe(document, {
// 	subtree: true, // monitor the entire subtree of nodes rooted at document
// 	childList: true // monitor targets for the addition/removal of child nodes
// });


	