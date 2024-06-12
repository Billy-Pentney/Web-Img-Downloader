
const TAG = "IMG_EXTRACTOR"




const PINTEREST = 'pinterest'
const INSTAGRAM = 'instagram'
const FLICKR = 'flickr'
const ARTSTATION = 'artstation'
const DEVIANTART = 'deviantart'
const YOUTUBE = 'youtube'

const PINTEREST_QUERY = "div[data-test-id='closeup-container'] div > img[src][alt]";
const INSTAGRAM_QUERY = "div[style^='padding'] > img[src]";
const INSTAG_REEL_THUMB_QUERY = "div:not([id='splash-screen']) > img[src]"
const FLICKR_QUERY = "img[class='main-photo']";
const ARTSTATION_QUERY = "picture img[src]";
const DEVIANTART_QUERY = "img[src][fetchpriority='high']"

// SITE2QUERY_MAP = {
// 	DEVIANTART: DEVIANTART_QUERY,
// 	ARTSTATION: ARTSTATION_QUERY,
// 	FLICKR: FLICKR_QUERY
// }

// Extracts the desired sitename from the current URL
const VALID_SITES = [
	INSTAGRAM, FLICKR, ARTSTATION, PINTEREST, DEVIANTART, YOUTUBE
]
const NAME_REGEX = VALID_SITES.join("|")
const SITE_NAME_REGEX = new RegExp(`https:\/\/.*(${NAME_REGEX})\..*`)


function log(m) {
	console.log(`Info: ${m}`);
}
function onError(e) {
	console.log(`Error: ${e}`);
}

/**
 * Pass the given message back to the Background script, informing it
 * of the image url.
 * @param {object} message 
 */
function notifyBackground(message) {
	if (message.url) {
		browser.runtime.sendMessage(message)
					   .catch(onError);
	}
	else {
		onError(`${TAG}: No image url to retrieve`);
	}
}

/**
 * Handles a request received from the Background script, then 
 * returns a response if the message is valid.
 * @param {object} message 
 */
function handleUserAction(message) {
	if (message.command == "get_image_url") {
		let url = window.location.href;

		console.log(`${TAG}: Received image-find request for ${url}`);
		siteName = getSiteName(url)
		imageUrl = extractImageUrl(siteName);

		let return_message = {
			sitename: siteName,
			url: imageUrl,
			action: message.return_action,
			command: message.command
		}

		console.log(`Got URL ${imageUrl}`)
		notifyBackground(return_message);
	}
	else {
		onError(`Unknown command: ${message.command}`)
	}
}


/**
 * Extracts the sitename from the given url e.g.
 * 		https://www.pinterest.com/pins/abcd.. -> 'pinterest'
 * 		youtube.co.uk/ACD -> 'youtube'
 *   	http://www.github.com -> null
 * @param {string} url - the url of the current page
 * @returns The name of the site if supported; otherwise null.
 */
function getSiteName(url) {
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





/** 
 * Determines which extraction techniques to apply based on the current sitename.
 * @returns If successful, the url of the image extracted from the current page, or null otherwise.
 */
function extractImageUrl(siteName) {
	if (!siteName) {
		onError("No site-name provided")
		return null
	}

	imgUrl = null

	switch (siteName) {
		case PINTEREST:
			imgUrl = getLastImageUrl(PINTEREST_QUERY);
			break;
		case INSTAGRAM:
			imgUrl = getInstagramImageUrl();
			break;
		case FLICKR:
			imgUrl = getFirstImageUrl(FLICKR_QUERY);
			break;
		case ARTSTATION:
			imgUrl = getFirstImageUrl(ARTSTATION_QUERY);
			break;
		case DEVIANTART:
			imgUrl = getFirstImageUrl(DEVIANTART_QUERY);
			break;
		case YOUTUBE:
			imgUrl = getYoutubeThumbnailUrl()
			break;
		default:
			onError(`Unsupported site-name \'${siteName}\'`)
			break;
	}

	return imgUrl;
}



/**
 * Attempts to extract the url of the main image content for the current instagram page.
 * If the page shows an image, its source url is returned; if the page is for a reel (video), then 
 * the video thumbnail (preview image) is returned.
 * @returns The src attribute of the first image on the current instagram page, if one exists.
 * 			If this is an Instagram Reel, the src attribute of its thumbnail.
 * 			Otherwise, null.
 */
function getInstagramImageUrl() {
	// First check for a main content image
	log("Checking for main Instagram Content Image")
	imgUrl = getFirstImageUrl(INSTAGRAM_QUERY)
	if (imgUrl) {
		return imgUrl
	}
	
	log("Main Image Element not found; checking for Video Thumbnail")
	imgUrl = getFirstImageUrl(INSTAG_REEL_THUMB_QUERY)
	
	return imgUrl
}




/**
 * Gets the url of the thumbnail for the current YouTube video, using its video-id.
 * @returns A url to the thumbnail if successful; or null otherwise.
 */
function getYoutubeThumbnailUrl() {
    const ytUrlRegex = /.*\/watch\?v=(?<id>[^&]*)(?:&list=(?<pl>[^&]*)(&index=(?<ind>\d*))?)?/
    let url = document.URL
	
    log(`Analysing url ${url}`)

    let match = url.match(ytUrlRegex)
    if (!match) {
		onError("URL did not match expected format")
    	return null;
	}

	id = match.groups.id
	playlist = match.groups.pl
	// Index in playlist
	index = match.groups.index

	log(`Got YT VideoID=${id}, PlaylistID=${playlist}, Index=${index}`)

	// Generate the thumbnail link from the video id
	src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
	return src;    
}




/**
 * Extract the FIRST image on the current page whose CSS matches the given selector query.
 * @param {string} query A CSS selector query to be applied.
 * @returns The src attribute of the first element on the current tab page out of 
 * those returned by the selector query; or null if no images match the given query. 
 * */
function getFirstImageUrl(query) {
	imgElement = document.querySelector(query);
	if (!imgElement) {
		onError("no images found!")
		return null
	}
	imgUrl = imgElement.src
	return imgUrl;
}


/**
 * Extract the LAST image on the current page whose CSS matches the given query.
 * @param {string} query A CSS selector query to retrieve the images
 * @returns The src attribute of the last element on the current tab page out of 
 * those returned by the selector query; or null if no images match the given query.
 */
function getLastImageUrl(query) {
	imgs = document.querySelectorAll(query);
	if (!imgs) {
		onError("No suitable images found")
		return null
	}
	img = imgs.item(imgs.length-1)
	console.log(img)
	if (!img) {
		onError('Could not parse image!');
		return null
	}
	return img.src
}




/** Register for window actions */
browser.runtime.onMessage.addListener(handleUserAction);
