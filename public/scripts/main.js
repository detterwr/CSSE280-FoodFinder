/**
 * @author 
 * Steven and Will. Thanks to any images, templates, documents adapted from Google, Firebase and others. 
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.FB_COLLECTION_RESTAURANTS = "Restaurants";
rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_COLLECTION_FILTERS = "Filters";

rhit.FB_KEY_DISCRIPTION = "discription";
rhit.FB_KEY_TITLE = "title";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_LOCATION = "locationLink";
rhit.FB_KEY_RECIPE = "recipeLink";


rhit.FB_KEY_USERNAME = "userName";
rhit.FB_KEY_UID = "uid";

rhit.RestaurantsManager = null;
rhit.UserManager = null;
rhit.SingleUserManager = null;
rhit.SingleRestaurantManager = null;
rhit.fbAuthManager = null;

// from: https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
};

rhit.main();
