const TAG = "YT-GETSRC"


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
    const reg = /.*\/watch\?v=(?<id>[^&]*)(?:&list=(?<pl>[^&]*)(&index=(?<ind>\d*))?)?/
    let url = document.URL
	
    log(`Analysing url ${url}`)

    let match = url.match(reg)
    if (match) {
        id = match.groups.id
        playlist = match.groups.pl
        // Index in playlist
        index = match.groups.index

        log(`Got YT VideoID=${id}, PlaylistID=${playlist}, Index=${index}`)

        src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
        return src;
    }

    onError("URL did not match expected format")
    return null;
}


browser.runtime.onMessage.addListener(handleUserAction);
