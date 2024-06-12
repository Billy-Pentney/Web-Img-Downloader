
const ACTION_OPEN_TAB = "open_tab"
const ACTION_DOWNLOAD = "download"
const ACTION_COPY_TEXT = "copy_text"

let siteName = null

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
		title: "Open Image in New Tab",
		contexts: ["all"]
	}, onMenuItemCreated);
	browser.contextMenus.create({
		id: ACTION_DOWNLOAD,
		title: "Save Image As...",
		contexts: ["all"]
	}, onMenuItemCreated);
	browser.contextMenus.create({
		id: ACTION_COPY_TEXT,
		title: "Copy Image Link to Clipboard",
		contexts: ["all"]
	}, onMenuItemCreated);
});


function onError(error) {
	console.log(error);
}

// Register the actions in the Right-click context menu
browser.contextMenus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case ACTION_OPEN_TAB:
		case ACTION_DOWNLOAD:
		case ACTION_COPY_TEXT:
			startContentExtraction(info.menuItemId);
			break;
		default:
			onError(`No suitable action for menu item '${item.menuitemId}'`)
    }
});


function sendStartMessage(tabs, action) {
    browser.tabs.sendMessage(
		tabs[0].id, 
		{ 
			command: "extract_image_url", 
			action: action
		}
	).catch(onError);
}


// Send a message to the Content Script to get the Image URL
function startContentExtraction(userAction) {
	browser.tabs.query({ currentWindow: true, active: true })
		.then((tabs) => { sendStartMessage(tabs, userAction) })
		.catch(onError);
}


function handleMessage(message, sender, sendResponse) { 
	console.log("Received a message from the content")

	if (message.command == "extract_image_url") {
		let imageUrl = message.url
		if (imageUrl) {
			switch (message.action) {
				case ACTION_OPEN_TAB:
					createNewTab(imageUrl);
					break;
				case ACTION_DOWNLOAD:
					downloadImage(imageUrl);
					break;
				case ACTION_COPY_TEXT:
					copyToClipboard(imageUrl);
					break;
				default:
					onError(`undefined behaviour ${action}`)
			}
		}
	}
	else {
		onError("no image url received by background")
	}
}

function createNewTab(imageUrl) {				
	browser.tabs.create({ url: imageUrl })
		.then(() => { console.log(`Created new tab: ${tab.id}`);})
		.catch(onError);
}

function downloadImage(imageUrl) {
	browser.downloads.download({ url: imageUrl, saveAs: true})
		.then(() => {console.log(`Downloaded image with id ${id}`);})
		.catch(onError);
}

function copyToClipboard(newClip) {
	navigator.clipboard.writeText(newClip).then(
		() => {
			console.log(`Copied url to clipboard`)
		},
		() => {
			onError('cannot copy to clipboard. Check permissions!')
		},
	);
}
  

browser.runtime.onMessage.addListener(handleMessage);