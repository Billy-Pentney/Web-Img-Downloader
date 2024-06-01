const TAG = "IMG_EXTRACTOR"

const TARGETS = {
	'instagram' : "div[style^='padding'] > img[src]",
	'pinterest' : "div > img[src]",
	'flickr'    : "div > img[class='main-photo']",
	'artstation': "div > img[src]"
};

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
		siteName = message.siteName;
		imageUrl = getImageUrl(siteName);

		console.log(`Got URL ${imageUrl}`)
		message.url = imageUrl;
		notifyBackground(message);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}



/** Extract the image from the current Instagram page */
function getImageUrl(siteName) {
	query = TARGETS[siteName];

	if (!query) {
		onError(`Unsupported site: ${siteName}`);
		return null;
	}

	imgElement = document.querySelector(query);
	if (!imgElement) {
		onError("No images found!");
		return null;
	}

	imgUrl = imgElement.src;
	return imgUrl;
}

/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
