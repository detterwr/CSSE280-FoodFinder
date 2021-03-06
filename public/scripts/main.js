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
rhit.FB_KEY_IMAGE = "imageLink";
rhit.FB_KEY_PRICE = "price";
rhit.FB_KEY_CATEGORY = "category"; 
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author"; 
rhit.FB_KEY_FAVORITEUSERS = "favoriteUsers";
rhit.RestaurantsManager = null;
rhit.SingleRestaurantManager = null;
rhit.fbAuthManager = null;



// rhit.FB_COLLECTION_USERS = "Users";
// rhit.FB_COLLECTION_FILTERS = "Filters";
// rhit.FB_KEY_USERNAME = "userName";
 rhit.FB_KEY_UID = "uid";

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
		document.querySelector("#menuShowFavorites").addEventListener("click", (event) => {
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`; 
		}); 
		document.querySelector("#filterRestaurants").addEventListener("click", (event) => {
			//TODO
			console.log("applying filters"); 
			const cat = document.querySelector("#filterCategory").value;
			const pr = document.querySelector("#filterPrice").value; 
			window.location.href = `/list.html?category=${cat}&price=${pr}`;
		}); 
		
		document.querySelector("#clearbutton").addEventListener("click", (event) => {
			document.querySelector("#searchcontent").value = "";
		}); 

		document.querySelector("#searchcontent").addEventListener("keypress", (event) => {
			if(event.key === 'Enter'){
			const ser = document.querySelector("#searchcontent").value;
			document.querySelector("#searchcontent").value = "";
			window.location.href = `/list.html?search=${ser}`;
			}
		}); 

		document.querySelector("#searchbutton").addEventListener("click", (event) => {
			const ser = document.querySelector("#searchcontent").value;
			document.querySelector("#searchcontent").value = "";
			window.location.href = `/list.html?search=${ser}`;
		}); 
		
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut(); 
		}); 


		document.querySelector("#submitAddRestaurant").addEventListener("click", (event) => {
			const title = document.querySelector("#inputTitle").value;
			const menu = document.querySelector("#inputMenuLink").value; 
			const maps = document.querySelector("#inputMapsLink").value; 
			const image = document.querySelector("#inputImageLink").value; 
			const description = document.querySelector("#inputDescription").value; 

			const category = document.querySelector("#inputCategory").value; 
			const price = document.querySelector("#inputPrice").value; 
 
			rhit.RestaurantsManager.add(title, menu, maps, image, description, category, price); 
		}); 

		$('#addRestaurantDialog').on('show.bs.modal', (event) => {
			// Pre animation
			document.querySelector("#inputTitle").value = "";
			document.querySelector("#inputMenuLink").value = ""; 
			document.querySelector("#inputMapsLink").value = ""; 
			document.querySelector("#inputImageLink").value = ""; 
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
          <h6 class="card-subtitle mb-2 text-muted">CATEGORY: ${restaurant.category}</h6>
		  <h6 class="card-subtitle mb-2 text-muted">PRICE: ${restaurant.price}</h6>
        </div>
      </div>`); 
	  //	  <p class="card-subtitle mb-2 text-muted">${restaurant.description}</p>
	}

	updateList() {
		console.log(" I need to update the list on the page!"); 
		console.log(`Number of Restaurants: ${rhit.RestaurantsManager.getLength()}`); 
		console.log(rhit.RestaurantsManager.getRestaurantAtIndex(0)); 


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
	constructor(id, title, menuLink, locationLink, imageLink, description, category, price){
		this.id = id;
		this.title = title; 
		this.menuLink = menuLink; 
		this.locationLink = locationLink; 
		this.imageLink = imageLink;
		this.price = price;
		this.category = category; 
		this.description = description; 
	}
}

rhit.FbRestaurantsManager = class {
	constructor(uid, category, price, search){
	console.log("created FbRestaurantsManager")
	this._uid = uid; 
	this._category = category;
	this._price = price;
	this._search = search;
	this._documentSnapshots = [];
	this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_RESTAURANTS);
	this._unsubscribe = null;
	}

	add(title, menuLink, locationLink, imageLink, description, category, price){
		this._ref.add({
			[rhit.FB_KEY_TITLE]: title, 
			[rhit.FB_KEY_MENU]: menuLink,
			[rhit.FB_KEY_LOCATION]: locationLink,
			[rhit.FB_KEY_IMAGE]: imageLink,
			[rhit.FB_KEY_PRICE]: price,
			[rhit.FB_KEY_CATEGORY]: category,
			[rhit.FB_KEY_DESCRIPTION]: description,
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(), 
			[rhit.FB_KEY_FAVORITEUSERS]: [],
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
			// query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
			query = query.where(rhit.FB_KEY_FAVORITEUSERS, "array-contains", this._uid);
		 } 
		else if (this._price && this._price!="all"){
			query = query.where(rhit.FB_KEY_PRICE, "==", this._price);
			 if(this._category && this._category!="all"){
				query = query.where(rhit.FB_KEY_CATEGORY, "==", this._category);
			 }
		} 
		else if(this._category && this._category!="all"){
			query = query.where(rhit.FB_KEY_CATEGORY, "==", this._category);
		}
		if (this._search) {
			// query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
			// console.log(this._search.toUpperCase());
			// console.log(this._search.toLowerCase());
			query = query.where(rhit.FB_KEY_TITLE, ">=", this._search.toUpperCase())
			.where(rhit.FB_KEY_TITLE, "<=", this._search.toLowerCase() + "\uf8ff").orderBy("title", "asc");
			// .where(rhit.FB_KEY_TITLE, "<=", this._search.toLowerCase() );
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
			docSnapshot.get(rhit.FB_KEY_IMAGE),
			docSnapshot.get(rhit.FB_KEY_DESCRIPTION),
			docSnapshot.get(rhit.FB_KEY_CATEGORY),
			docSnapshot.get(rhit.FB_KEY_PRICE),
		);
		return rt;
	}
}

//   DETAIL PAGE CONTROLLER   
rhit.DetailPageController = class {
	constructor(){
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});
		document.querySelector("#back-btn").addEventListener("click", (event) => {
			window.location.href = "/list.html"; 
		}); 
		document.querySelector("#favorite-btn").addEventListener("click", (event) => {
			rhit.SingleRestaurantManager.favorite(rhit.fbAuthManager.uid);
		}); 
		document.querySelector("#submitEditRestaurant").addEventListener("click", (event) => {
			const title = document.querySelector("#inputTitle").value;
			const menu = document.querySelector("#inputMenuLink").value; 
			const maps = document.querySelector("#inputMapsLink").value; 
			const image = document.querySelector("#inputImageLink").value; 
			const description = document.querySelector("#inputDescription").value; 

			const category = document.querySelector("#inputCategory").value; 
			const price = document.querySelector("#inputPrice").value; 

			rhit.SingleRestaurantManager.update(title, menu, maps, image, description, price, category); 

		}); 

		$('#editRestaurantDialog').on('show.bs.modal', (event) => {
			// Pre animation
			document.querySelector("#inputTitle").value = rhit.SingleRestaurantManager.title;
			document.querySelector("#inputMenuLink").value = rhit.SingleRestaurantManager.menuLink; 
			document.querySelector("#inputMapsLink").value = rhit.SingleRestaurantManager.locationLink; 
			document.querySelector("#inputImageLink").value = rhit.SingleRestaurantManager.imageLink; 
			document.querySelector("#inputDescription").value = rhit.SingleRestaurantManager.description;
			
			document.querySelector("#inputCategory").value = rhit.SingleRestaurantManager.category;
			document.querySelector("#inputPrice").value = rhit.SingleRestaurantManager.price;
		}); 

		$("#editRestaurantDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputTitle").focus();
		}); 

		document.querySelector("#submitDeleteRestaurant").addEventListener("click", (event) => {
			rhit.SingleRestaurantManager.delete().then(function () {
				console.log("Document successfully deleted");
				window.location.href = "/list.html"; 
			}).catch(function (error) {
				console.error("error removing the document: ", error);
			});

		}); 

		console.log("made the detail page controller");
		rhit.SingleRestaurantManager.beginListening(this.updateView.bind(this)); 
	}
	updateView(){
		console.log("The view is being updated");
		document.querySelector("#cardTitle").innerHTML = rhit.SingleRestaurantManager.title; 
		document.querySelector("#cardMenuLink").href = rhit.SingleRestaurantManager.menuLink; 
		document.querySelector("#cardLocationLink").href = rhit.SingleRestaurantManager.locationLink; 
		document.querySelector("#cardImageLink").src = rhit.SingleRestaurantManager.imageLink;
		document.querySelector("#cardDescription").innerHTML = rhit.SingleRestaurantManager.description; 

		if (rhit.SingleRestaurantManager.favoriteUsers.includes(rhit.fbAuthManager.uid)){
			document.querySelector("#favorite-btn").style.color = "red"; 
			// document.querySelector("#menuDelete").style.display = "flex"; 
		}else{
			document.querySelector("#favorite-btn").style.color = "black"; 
		}

		if (rhit.SingleRestaurantManager.author == rhit.fbAuthManager.uid){
			document.querySelector("#menuEdit").style.display = "flex"; 
			document.querySelector("#menuDelete").style.display = "flex"; 
		}

	}
}

//   SINGLE RESTAURANT MANAGER  
rhit.FbSingleRestaurantManager = class {
	constructor(restaurantId) {
		this._documentSnapshot = {};
		this._unsubscribe = null; 
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_RESTAURANTS).doc(restaurantId);
		console.log(`Listening to ${this._ref.path}`); 
	}

	beginListening(changeListener) {

		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists){
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else{
				console.log("No such document!"); 
			}
		}); 

	}

	stopListening() {
		this._unsubscribe();
	}

	favorite(uid){
		const ar = this._documentSnapshot.get(rhit.FB_KEY_FAVORITEUSERS);
		if(!ar.includes(uid)){
		ar.push(uid);
		} else{
			ar.pop(uid);
		}
		this._ref.update({
			[rhit.FB_KEY_FAVORITEUSERS]: ar, 
		})
		.then(function (){
			console.log("restaurant (un)favorited ");
			// console.log(ar);
		})
		.catch(function (error) {
			console.error("error favoriting document: ", error); 
		});
	}

	update(title, menuLink, locationLink, imageLink, description, price, category){
	this._ref.update({
		[rhit.FB_KEY_TITLE]: title, 
		[rhit.FB_KEY_MENU]: menuLink,
		[rhit.FB_KEY_LOCATION]: locationLink,
		[rhit.FB_KEY_IMAGE]: imageLink,
		[rhit.FB_KEY_PRICE]: price,
		[rhit.FB_KEY_CATEGORY]: category,
		[rhit.FB_KEY_DESCRIPTION]: description,
		[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(), 
	})
	.then(function (){
		console.log("document updated ");
	})
	.catch(function (error) {
		console.error("error editing document: ", error); 
	});
}

	delete(){
		return this._ref.delete();
	}

	get title() {
		return this._documentSnapshot.get(rhit.FB_KEY_TITLE); 

	}

	get menuLink() {
		return this._documentSnapshot.get(rhit.FB_KEY_MENU); 
	}

	get locationLink() {
		return this._documentSnapshot.get(rhit.FB_KEY_LOCATION); 
	}

	get imageLink() {
		return this._documentSnapshot.get(rhit.FB_KEY_IMAGE); 
	}
	
	get description() {
		return this._documentSnapshot.get(rhit.FB_KEY_DESCRIPTION); 
	}
	
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR); 
	}

	get category() {
		return this._documentSnapshot.get(rhit.FB_KEY_CATEGORY); 
	}
	
	get price() {
		return this._documentSnapshot.get(rhit.FB_KEY_PRICE); 
	}

	get favoriteUsers() {
		return this._documentSnapshot.get(rhit.FB_KEY_FAVORITEUSERS); 
	}
}

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
		const category = urlParams.get("category");
		const price = urlParams.get("price");
		const search = urlParams.get("search");
		// search.replace("%20",' ');
		rhit.RestaurantsManager = new rhit.FbRestaurantsManager(uid, category, price, search);
		new rhit.ListPageController();
		//document.querySelector("#searchcontent").value = "Search";
	}

 	if(document.querySelector("#detailPage")){
		console.log("You are on the detail page.")
		const restaurantId = urlParams.get("id"); 

		console.log(restaurantId); 
		if (!restaurantId){
			console.log("Error! Missing restaurant ID"); 
			window.location.href = "/"; 
		}
		rhit.SingleRestaurantManager = new rhit.FbSingleRestaurantManager(restaurantId);
		new rhit.DetailPageController(); 
	
	}

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
