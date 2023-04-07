"use strict";

// jQuery-like syntax for document-level queries
const $ = document.querySelector.bind(document);

const switchBtn = $('#switch'),
      slider = $('#slider'),
      infoTextState = $('#infoText > b');

// Set the state of the toggle switch
chrome.storage.local.get(['enabled', 'oneTimeConfirm']).then((result) => {
	if (result.oneTimeConfirm) showConfirmation();

	setSwitch(result.enabled);

	// Wait 50ms before allowing transitions
	// to allow for transition-less repaint with new "checked" attribute
	// This way, the toggle animation won't trigger every time we open the popup
	setTimeout(() => {
		slider.classList.remove('noTransition');
	}, 50);
});

switchBtn.addEventListener('click', (event) => {
	switchBtn.disabled = true;

	const enabled = !switchBtn.hasAttribute('checked');

	chrome.runtime.sendMessage({
		event: 'toggleTriggered',
		enabled: enabled
	})
	.then((response) => {
		if (response.successful === true) {
			// Set new state of toggle button once we know the switch was successful
			setSwitch(enabled);
			
			// Re-enable the checkbox
			switchBtn.disabled = false;
		}	
	});
});

function setSwitch(enabled) {
	if (enabled)
		switchBtn.setAttribute('checked', '');
	 else
	 	switchBtn.removeAttribute('checked');

	infoTextState.textContent = enabled ? "ON" : "OFF";
}

// This is the one-time confirmation
function showConfirmation() {
	const confirmation = $('#confirmation'),
	      confirmBtn = $('#confirmBtn');

	confirmation.style.display = 'block';

	confirmBtn.addEventListener('click', () => {
		confirmation.style.display = 'none';
		chrome.storage.local.set({ oneTimeConfirm: false });
	});
}