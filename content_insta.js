const TAG = "INSTA-DOWNLOADER"


function onError(e) {
	console.log(`Error: ${e}`);
}

function notifyBackground(message) {
	if (message.url) {
		browser.runtime.sendMessage(message)
					   .catch(onError);
	}
	else {
		onError(`${TAG}: No image url to retrieve`);
	}
}

function handleUserAction(message) {
	console.log(`${TAG}: Content received message`);
	if (message.command == "extract_image_url") {
		imageUrl = getImageUrl();
		console.log(`Got URL ${imageUrl}`)
		message.url = imageUrl
		notifyBackground(message);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}

/** Extract the image from the current Instagram page */
function getImageUrl() {
	imgElement = document.querySelector("div[style^='padding'] > img[src]");
	if (!imgElement) {
		onError("No Instagram images found!")
		return null
	}
	imgUrl = imgElement.src
	return imgUrl;
}

/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
