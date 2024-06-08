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
		log(`got image URL ${imageUrl}`);
		message.url = imageUrl;
		notifyBackground(message);
	}
	else {
		onError(`unknown command: ${message.command}`);
	}
}

/** Extract the image from the current Instagram page */
function getImageUrl() {
	// First check for a main content image
	log("Checking for main Content Image")
	imgElement = document.querySelector("div[style^='padding'] > img[src]");
	if (imgElement) {
		imgUrl = imgElement.src;
		return imgUrl;
	}
	
	log("Main Image Element not found; checking for Video Thumbnail")

	// If image check failed, then check for a video thumbnail
	vidElement = document.querySelector("div:not([id='splash-screen']) > img[src]")
	
	if (!vidElement) {
		onError("no images found!");
		return null;
	}

	log("Found Video Thumbnail Image!")
	return vidElement.src;
}

/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
