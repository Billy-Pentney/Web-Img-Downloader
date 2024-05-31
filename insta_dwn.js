

function onMenuItemCreated() {
	if (browser.runtime.lastError) {
		onError(browser.runtime.lastError);
	} else {
		console.log("Item created successfully");
	}
}


// Create the Context Menu action(s)
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: ACTION_OPEN_TAB,
    title: "Open Instagram Image in New Tab",
    contexts: ["all"]
  }, onMenuItemCreated)
  browser.contextMenus.create({
    id: ACTION_DOWNLOAD,
    title: "Save Instagram Image As...",
    contexts: ["all"]
  }, onMenuItemCreated)
});


// Register the actions in the Right-click context menu
browser.contextMenus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case ACTION_OPEN_TAB:
			console.log("Opening new tab");
			startContentExtraction(ACTION_OPEN_TAB);
			break;
		case ACTION_DOWNLOAD:
			console.log("Downloading image directly");
			startContentExtraction(ACTION_DOWNLOAD);
			break;
    }
});


function onTabCreated(tab) {
  console.log(`Created new tab: ${tab.id}`);
}
function onDownloaded(id) {
  console.log(`Downloading image with id ${id}`);
}
function onError(error) {
  console.log(error);
}


function sendStartMessage(tabs, purpose) {
    browser.tabs.sendMessage(
		tabs[0].id, 
		{ command: "extract_image_url", purpose: purpose }
	).catch(onError);
}

// Send a message to the Content Script to get the Image URL
function startContentExtraction(purpose) {
	browser.tabs.query({currentWindow: true, active : true})
		.then((tabs) => {sendStartMessage(tabs, purpose)})
		.catch(onError);
}


function handleMessage(request, sender, sendResponse) { 
	console.log("INSTA_DOWNLOADER: Received a message from the content")
	
	let imageUrl = request.url
	let behaviour = request.behaviour
	
	if (imageUrl) {
		switch (behaviour) {
			case ACTION_OPEN_TAB:
				// Open the image in a new tab
				console.log(`Opening new tab for image`);
				let creating = browser.tabs.create({ url: imageUrl });
				creating.then(onTabCreated, onError);
				break;
			case ACTION_DOWNLOAD:
				console.log(`Downloading image, ${imageUrl}`)
				browser.downloads.download({url:imageUrl, saveAs: true})
					.then(onDownloaded)
					.catch(onError);
				break;
			default:
				onError(`Error: Undefined behaviour ${behaviour}`)
		}
	}
	else {
		onError("Error: No image url received by background")
	}
}

browser.runtime.onMessage.addListener(handleMessage);
