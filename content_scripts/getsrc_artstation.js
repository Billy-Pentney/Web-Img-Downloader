const TAG = "IMG-GETSRC"


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
		onError(`${TAG}: No image url to retrieve`);
	}
}

function handleUserAction(message) {
	log(`received request '${message.command}'`);

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


function getImageUrl() {
	img = document.querySelector("picture img[src]");
	
	if (!img) {
		onError(`could not parse image!`);
		return null
	}

	return img.src;
}


browser.runtime.onMessage.addListener(handleUserAction);
