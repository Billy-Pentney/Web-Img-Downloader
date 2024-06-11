const TAG = "IMG_EXTRACTOR"

const PINTEREST = 'pinterest'
const INSTAGRAM = 'instagram'
const FLICKR = 'flickr'
const ARTSTATION = 'artstation'

const PINTEREST_QUERY = "div[data-test-id='closeup-container'] div > img[src][alt]";
const INSTAGRAM_QUERY = "div[style^='padding'] > img[src]";
const FLICKR_QUERY = "img[class='main-photo']";
const ARTSTATION_QUERY = "picture img[src]";


// Extracts the desired sitename from the current URL
const VALID_SITES = [INSTAGRAM, FLICKR, ARTSTATION, PINTEREST]
const NAME_REGEX = VALID_SITES.join("|")
const SITE_NAME_REGEX = new RegExp(`https:\/\/.*(${NAME_REGEX})\..*`)


function log(m) {
	console.log(`Info: ${m}`);
}
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
	if (message.command == "extract_image_url") {
		console.log(`${TAG}: Received image-find request for... ${message.siteName}`);

		let url = window.location.href;
		siteName = getSiteName(url)

		// siteName = message.siteName;
		imageUrl = extractImageUrl(siteName);

		console.log(`Got URL ${imageUrl}`)
		message.url = imageUrl;
		notifyBackground(message);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}


function getSiteName(url) {
	console.log(url)

	match = url.match(SITE_NAME_REGEX)

	if (match && match.length > 1) {
		siteName = match[1]
		console.log(`Got sitename: ${siteName}`)
		return siteName
	}
	else {
		console.log("No Match")
	}

	return null
}



/** Extract the image from the current page */
function extractImageUrl(siteName) {
	if (!siteName) {
		onError("No site-name provided")
		return null
	}

	imgUrl = null

	switch (siteName) {
		case PINTEREST:
			imgUrl = getPinterestImageUrl();
			break;
		case INSTAGRAM:
			imgUrl = getInstagramImageUrl();
			break;
		case FLICKR:
			imgUrl = getImageUrlByQuery(FLICKR_QUERY);
			break;
		case ARTSTATION:
			imgUrl = getImageUrlByQuery(ARTSTATION_QUERY);
			break;
		default:
			onError(`Unsupported site-name \'${siteName}\'`)
			break;
	}

	return imgUrl;
}




/** Extract the image from the current Instagram page */
function getInstagramImageUrl() {
	// First check for a main content image
	log("Checking for main Instagram Content Image")
	imgElement = document.querySelector(INSTAGRAM_QUERY);
	if (imgElement) {
		imgUrl = imgElement.src;
		return imgUrl;
	}
	
	log("Main Image Element not found; checking for Video Thumbnail")

	// If image check failed, then check for a video thumbnail
	vidElement = document.querySelector("div:not([id='splash-screen']) > img[src]")
	
	if (!vidElement) {
		onError("no Instagram images found!");
		return null;
	}

	log("Found Instagram Video Thumbnail Image!")
	return vidElement.src;
}



/** Extract the image from the current Pinterest page */
function getPinterestImageUrl() {
	imgs = document.querySelectorAll(PINTEREST_QUERY);

	if (!imgs) {
		onError("No Pinterest images found")
		return null
	}

	img = imgs.item(imgs.length-1)
	console.log(img)
	
	if (!img) {
		onError('Could not parse image!');
		return null
	}

	return img.src;
}


/** 
 * Extract the image from the current page.
 * Perform the given CSS query to identify the first image element. 
 * If found, return its src attribute.
 */
function getImageUrlByQuery(query) {
	imgElement = document.querySelector(query);
	if (!imgElement) {
		onError("no images found!")
		return null
	}
	imgUrl = imgElement.src
	return imgUrl;
}




/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
