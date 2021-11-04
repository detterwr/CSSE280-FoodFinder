/**
 * @author 
 * Steven and Will. Thanks to any images, templates, documents adapted from Google, Firebase and others. 
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.FB_COLLECTION_RESTAURANTS = "restaurants";
rhit.FB_KEY_TITLE = "title";
rhit.FB_KEY_DESCRIPTION = "description";
rhit.FB_KEY_LOCATION = "locationLink";
rhit.FB_KEY_MENU = "menuLink";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author"; 
rhit.RestaurantsManager = null;
rhit.SingleRestaurantManager = null;
rhit.fbAuthManager = null;



// rhit.FB_COLLECTION_USERS = "Users";
// rhit.FB_COLLECTION_FILTERS = "Filters";
// rhit.FB_KEY_USERNAME = "userName";
// rhit.FB_KEY_UID = "uid";

// rhit.UserManager = null;
// rhit.SingleUserManager = null;


// from: https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
};

rhit.ListPageController = class {
	constructor() {
		document.querySelector("#menuShowRestaurants").addEventListener("click", (event) => {
			window.location.href = "/list.html"; 
		}); 
		document.querySelector("#menuApplyFilters").addEventListener("click", (event) => {
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`; 
		}); 
		document.querySelector("#menuApplyFilters").addEventListener("click", (event) => {
			//TODO
			console.log("applying filters"); 
		}); 
		document.querySelector("#menuShowFavorites").addEventListener("click", (event) => {
			//TODO
		}); 
		
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut(); 
		}); 


		document.querySelector("#submitAddRestaurant").addEventListener("click", (event) => {
			const title = document.querySelector("#inputTitle").value;
			const menu = document.querySelector("#inputMenuLink").value; 
			const maps = document.querySelector("#inputMapsLink").value; 
			const description = document.querySelector("#inputDescription").value; 
 
			rhit.RestaurantsManager.add(title, menu, maps, description); 
		}); 

		$('#addRestaurantDialog').on('show.bs.modal', (event) => {
			// Pre animation
			document.querySelector("#inputTitle").value = "";
			document.querySelector("#inputMenuLink").value = ""; 
			document.querySelector("#inputMapsLink").value = ""; 
			document.querySelector("#inputDescription").value = ""; 
		}); 

		$("#addRestaurantDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputTitle").focus();
		}); 

		//Start listening
		rhit.RestaurantsManager.beginListening(this.updateList.bind(this)); 
	}
	_createCard(restaurant) {
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${restaurant.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${restaurant.locationLink}</h6>
		  <h6 class="card-subtitle mb-2 text-muted">${restaurant.menuLink}</h6>
		  <p class="card-subtitle mb-2 text-muted">${restaurant.description}</p>
        </div>
      </div>`); 
	}

	updateList() {
		console.log(" I need to update the list on the page!"); 
		console.log(`Num Quotes: ${rhit.RestaurantsManager.getLength()}`); 
		console.log(rhit.RestaurantsManager.getRestaurantAtIndex(0)); 

		//make a new quotelistcontainer, loop to fill it, remove the old one, and put it in the new container. 
		const newList = htmlToElement('<div id="restaurantListContainer"></div>'); 

		for (let i = 0; i < rhit.RestaurantsManager.getLength(); i++) {
			const rt = rhit.RestaurantsManager.getRestaurantAtIndex(i); 
			const newCard = this._createCard(rt);

			newCard.onclick = (event) =>{
				console.log(`you clicked on ${rt.id}`); 
				//rhit.storage.setMovieQuoteId(mq.id); 
				
				window.location.href = `/restaurant.html?id=${rt.id}`; 

			};


			newList.appendChild(newCard);  
		}

		const oldList = document.querySelector("#restaurantListContainer"); 
		oldList.removeAttribute("id"); 
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList); 
	}
}

rhit.restaurant = class {
	constructor(id, title, menuLink, locationLink, description){
		this.id = id;
		this.title = title; 
		this.menuLink = menuLink; 
		this.locationLink = locationLink; 
		this.description = description; 
	}
}

rhit.FbRestaurantsManager = class {
	constructor(uid){
	console.log("created FbRestaurantsManager")
	this._uid = uid; 
	this._documentSnapshots = [];
	this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_RESTAURANTS);
	this._unsubscribe = null;
	}

	add(title, menuLink, locationLink, description){
		this._ref.add({
			[rhit.FB_KEY_TITLE]: title, 
			[rhit.FB_KEY_MENU]: menuLink,
			[rhit.FB_KEY_LOCATION]: locationLink,
			[rhit.FB_KEY_DESCRIPTION]: description,
			//[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(), 
			
		})
		.then(function (docRef){
			console.log("document written with id: ", docRef.id);
		})
		.catch(function (error) {
			console.error("error adding document: ", error); 
		});
	}

	beginListening(changeListener) {
		//let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		let query = this._ref;
	 	if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		 }
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
				console.log("Restaurant update!");
				this._documentSnapshots = querySnapshot.docs;

				changeListener();
			});
	}
	stopListening() {
		this._unsubscribe(); 
	}

	getLength() {
		return this._documentSnapshots.length;
	}
	getRestaurantAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index]; 
		const rt = new rhit.restaurant(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TITLE),
			docSnapshot.get(rhit.FB_KEY_MENU),
			docSnapshot.get(rhit.FB_KEY_LOCATION),
			docSnapshot.get(rhit.FB_KEY_DESCRIPTION)
		);
		return rt;
	}
}

//   DETAIL PAGE CONTROLLER   

//   SINGLE RESTAURANT MANAGER  

//   LOGIN PAGE CONTROLLER  
rhit.LoginPageController = class {
	constructor() {
		console.log("You have made the login page controller");
		document.querySelector("#roseFireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
			console.log("sign in with rose fire todo");
		};
	}
}


//   AUTH MANAGER   

rhit.FbAuthManager = class {
	constructor() {
	  this._user = null;
	  console.log("You have made the Auth Manager");
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
	});

	}
	signIn() {
		console.log("todo: sign in with rosefire");

		Rosefire.signIn("d2d8ebfa-4c53-4fa3-baf4-65c4b725efb1", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);

			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message; 
				if (errorCode === 'auth/invalid-custom-token'){
					alert('The token you provided is not valid');

				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}

			});
			
			// TODO: Use the rfUser.token with your server.
		  });
		  
	}
	signOut() {
		
		firebase.auth().signOut().catch(function (error){
			console.log("an error has occured");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid; 
	}
}

rhit.checkForRedirects = function(){
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		window.location.href = "/list.html"; 
	}

	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn){
		window.location.href = "/"; 
	}

};

rhit.initializePage = function(){
	const urlParams = new URLSearchParams(window.location.search); 
	if(document.querySelector("#listPage")){
		console.log("You are on the list page.")
		const uid = urlParams.get("uid");
		rhit.RestaurantsManager = new rhit.FbRestaurantsManager(uid);
		new rhit.ListPageController();
	}

/* 	if(document.querySelector("#detailPage")){
		console.log("You are on the detail page.")
		const restaurantId = urlParams.get("id"); 

		console.log(restaurantId); 
		if (!restaurantId){
			console.log("Error! Missing restaurant ID"); 
			window.location.href = "/"; 
		}
		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(restaurantId);
		new rhit.DetailPageController(); 
	
	}
*/
	if(document.querySelector("#loginPage")){
		console.log("You are on the login page.")
		new rhit.LoginPageController();
	} 
} 




/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready: ");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("auth change callback fired"); 
		console.log("isSignedIn =", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
		 
	});
};

rhit.main();
