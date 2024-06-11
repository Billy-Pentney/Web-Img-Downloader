const TAG = "FLICKR-DOWNLOADER"

function onError(e) {
	console.log(`Error<${TAG}>: ${e}`);
}
function log(msg) {
	console.log(`${TAG}: ${msg}`);
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
	log(`${TAG}: received message with command '${message.command}'`);
	if (message.command == "extract_image_url") {
		imageUrl = getImageUrlByQuery();
		log(`Got Image URL ${imageUrl}`)
		message.url = imageUrl
		notifyBackground(message);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}

/** Extract the image from the current page */
function getImageUrlByQuery() {
	imgElement = document.querySelector("img[class='main-photo']");
	if (!imgElement) {
		onError("no images found!")
		return null
	}
	imgUrl = imgElement.src
	return imgUrl;
}

/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
