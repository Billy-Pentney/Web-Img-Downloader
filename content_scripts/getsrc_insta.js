const TAG = "INSTA-DOWNLOADER"


function log(msg) {
	console.log(`${TAG}: ${msg}`);
}
function onError(e) {
	console.log(`Error <${TAG}>: ${e}`);
}

function notifyBackground(message) {
	if (message.url) {
		browser.runtime.sendMessage(message)
					   .catch(onError);
	}
	else {
		onError('no image url to return');
	}
}

function handleUserAction(message) {
	log(`received request for '${message.command}'`);
	if (message.command == "extract_image_url") {
		imageUrl = getImageUrl();
		log(`got image URL ${imageUrl}`)
		message.url = imageUrl
		notifyBackground(message);
	}
	else {
		onError(`unknown command: ${message.command}`)
	}
}

/** Extract the image from the current Instagram page */
function getImageUrl() {
	imgElement = document.querySelector("div[style^='padding'] > img[src]");
	if (!imgElement) {
		onError("no images found!")
		return null
	}
	imgUrl = imgElement.src
	return imgUrl;
}

/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
