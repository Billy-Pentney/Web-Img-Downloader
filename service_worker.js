

const SCRIPT_PINT = {
	id: 'extr_pinterest',
	matches: ["*://*.pinterest.com/pin/*", "*://*.pinterest.co.uk/pin/*"],
	js: ["content_pin.js"]
};
const SCRIPT_INSTA = { 
	id: 'extr_instagram',
	matches: ["*://*.instagram.com/*"],
	js: ["content_insta.js"]
};
const SCRIPT_FLICKR = {
	id: 'extr_flickr',
	matches: ["*://*.flickr.com/photos/*"],
	js: ["content_flickr.js"]
};


browser.scripting.registerContentScripts([SCRIPT_PINT, SCRIPT_INSTA, SCRIPT_FLICKR])
    .then(() => {
        scriptsRegistered = true;
        console.log("registration complete");
    })
    .catch((err) => console.error(`failed to register content scripts: ${err}`));


//     {
//         "matches": [
//           "*://*.pinterest.com/*", 
//           "*://*.pinterest.co.uk/*", 
//           "*://*.instagram.com/*", 
//           "*://*.flickr.com/*",
//           "*://*.artstation.com/*"
//       ],
//         "js": ["img_extract.js"]
//   }