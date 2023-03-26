const switchBtn = document.querySelector('#switchBtn');
//const storage = chrome.storage.local;

chrome.storage.local.get('enabled').then((result) => {
	switchBtn.textContent = result.enabled;
	switchBtn.checked = result.enabled;
});


switchBtn.addEventListener('click', (event) => {

	switchBtn.disabled = true;
	// console.log(switchBtn.checked);
	// switchBtn.checked = false;
	// console.log(switchBtn.checked);
	// chrome.storage.local.get('enabled').then((result) => {
	// 	console.log('startup enabled=' + result.enabled);
	// 	//switchBtn.checked = result.enabled;
	// });

	const enabled = !switchBtn.checked;

	//chrome.storage.local.set({ enabled: switchBtn.checked });
	chrome.runtime.sendMessage({
		origin: 'switchBtn',
		enabled: enabled
	})
	.then((response) => {
		if (response.successful === true) {
			switchBtn.disabled = false;
			switchBtn.textContent = enabled;
			switchBtn.checked = enabled;
		}		
	});


	chrome.runtime.sendMessage({
		origin: 'stateToggled',
		enabled: enabled
	})

	// console.log("success: " + response.successful);
	// console.log("host: " + location.host);
	// if (response.successful && location.host === 'genius.com') {
	// 	location.reload();
	// }
});