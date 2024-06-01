
const TAG = "PINTEREST-DOWNLOADER"

/* On image click, download the image */
// document.addEventListener("click", (e) => {
// 	console.log(e.target)
// 	if (e.target.matches("div[data-test-id='more-options-download'] div[role='button'] div")) {
// 		console.log("Hit 'download image' button!");
// 		extractImageUrlAndPerformAction(ACTION_DOWNLOAD);
// 	}
// });

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
	// if (message.command == "extract_image_url") {
	// 	imageUrl = getImageUrl();
	// 	console.log(`Got URL ${imageUrl}`)
	// 	message.url = imageUrl
	// 	notifyBackground(message);
	// }
	if (message.command == "get_site_name") {
		message.siteName = "pinterest";
		browser.runtime.sendMessage(message)
					   .catch(onError);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}


function getImageUrl() {
	img = document.querySelector("div > img[src]");
	
	if (!img) {
		onError(`${TAG}: Could not parse image!`);
		return null
	}

	return img.src;
}


// browser.runtime.onMessage.addListener(handleUserAction);

browser.runtime.sendMessage({
	command: "get_site_name",
	siteName: "pinterest"
}).catch(onError);


// 	{
// 		"matches": ["*://*.pinterest.com/*", "*://*.pinterest.co.uk/*", "*://*.artstation.com/*"],
// 		"js": ["content_scripts/getsrc_simple.js"]
//   }, 