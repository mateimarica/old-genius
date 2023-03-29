"use strict";

const switchBtn = document.querySelector('#switchBtn');

chrome.storage.local.get('enabled').then((result) => {
	switchBtn.textContent = result.enabled;
	switchBtn.checked = result.enabled;
});

switchBtn.addEventListener('click', (event) => {

	switchBtn.disabled = true;

	const enabled = !switchBtn.checked;

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
	});
});