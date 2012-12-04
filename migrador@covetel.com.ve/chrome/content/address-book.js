let addressBookSynchronizationObserver = {
    syncCount: 0,
    handleNotification: function(notification, data) {

	Application.console.log("Notificacion: " + notification + " " + data);

        if (notification == "groupdav.synchronization.stop") {
		this.syncCount++;
        }

	// Only 2 addressbooks are synchronized
	if (this.syncCount == 2) {

			Application.console.log("Entro aqui!");
			ABookMigrator.unloadObservers();
			ABookMigrator.moveAddressBook();
			/*startFolderSync();
			ABookMigrator.removeAddressBooks();*/
	}
    }
};

var ABookMigrator = {
	abManager : null,
	inputAb : null,
	outputAb : null,
	init: function() {
		this.abManager = Components.classes["@mozilla.org/abmanager;1"]
		                      .getService(Components.interfaces.nsIAbManager);
	},
	start: function(resume) {
		this.removeAddressBooks();
		this.createAddressBooks();
		this.setCredentials();
	    	this.loadObservers();
		startFolderSync();
	},
	
	loadObservers: function() {

		let nmgr = Components.classes["@inverse.ca/notification-manager;1"]
				     .getService(Components.interfaces.inverseIJSNotificationManager)
				     .wrappedJSObject;

  		nmgr.registerObserver("groupdav.synchronization.start", addressBookSynchronizationObserver);
  		nmgr.registerObserver("groupdav.synchronization.stop", addressBookSynchronizationObserver);
 	},
	unloadObservers: function() {

		let nmgr = Components.classes["@inverse.ca/notification-manager;1"]
				     .getService(Components.interfaces.inverseIJSNotificationManager)
				     .wrappedJSObject;

  		nmgr.unregisterObserver("groupdav.synchronization.start", addressBookSynchronizationObserver);
  		nmgr.unregisterObserver("groupdav.synchronization.stop", addressBookSynchronizationObserver);
	},
	removeAddressBooks: function() {
		
		var directories = this.abManager.directories;
	
		while (directories.hasMoreElements()) {
			
			let directory = directories.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);

			if (directory instanceof Components.interfaces.nsIAbDirectory) {
				// Only removes remote addressbooks
				try {			
					SCDeleteDAVDirectory(directory.URI);

				} catch(e){}
			}
			
		}
	},
	createAddressBooks: function() {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");	

		var inputURL = prefs.getCharPref("addressbook.input.url").replace("#USER", AccountManager.getUsername());
		var outputURL = prefs.getCharPref("addressbook.output.url").replace("#USER", AccountManager.getUsername());

		inputURL = inputURL.replace("#DOMAIN", AccountManager.getDomain());
		outputURL = outputURL.replace("#DOMAIN", AccountManager.getDomain());		

		this.inputAb = SCCreateGroupDAVDirectory("input", inputURL);
		this.outputAb = SCCreateGroupDAVDirectory("output", outputURL);
	},
	createFinalAddressBooks: function() {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");	

		var url = prefs.getCharPref("addressbook.output.url").replace("#USER", AccountManager.getUsername());
		url = url.replace("#DOMAIN", AccountManager.getDomain());		

		SCCreateGroupDAVDirectory(prefs.getCharPref("extensions.migration.addressbook.name"), url);
	},
	//TODO: Delete credentials when migration is finished
	setCredentials: function() {

		var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");	

		var password = AccountManager.getPassword();

		//TODO: Get url from preferences.

		// input service
		var authLoginInfoServer1 = new nsLoginInfo(
		    'http://localhost:1080',
		    null,
		    'DavMail Gateway',
		    AccountManager.getUsername(),
		    password,
		    "",
		    ""
		);
	
		// output service
		var authLoginInfoServer2 = new nsLoginInfo(
		    'http://sogo-demo.inverse.ca',
		    null,
		    'SOGo',
		    /*DEBUG AccountManager.getUsername()*/"sogo1",
		    /*DEBUG: password */"sogo1",
		    "",
		    ""
		);

		if (!passwordManager.getLoginSavingEnabled("http://localhost:1080"))
			passwordManager.addLogin(authLoginInfoServer1);
		if (!passwordManager.getLoginSavingEnabled("http://sogo-demo.inverse.ca"))
		passwordManager.addLogin(authLoginInfoServer2); 


	},
   	moveAddressBook: function() {

		Application.console.log("Depurando...");

		let abManager = Components.classes["@mozilla.org/abmanager;1"]
		                          .getService(Components.interfaces.nsIAbManager);

		if (this.inputAb.URI != this.outputAb.URI) {
		    /* ugly hack: we empty the addressbook after its cards were
		     transfered, so that we can be sure the ab no longer "exists" */
		    let cardsArray = Components.classes["@mozilla.org/array;1"]
		                               .createInstance(Components.interfaces.nsIMutableArray);

		    let childCards = this.inputAb.childCards;
		    let countCards = 0;
		    let countLists = 0;
		    while (childCards.hasMoreElements()) {
		        let card = childCards.getNext().QueryInterface(Components.interfaces.nsIAbCard);
		        if (card.isMailList) {
		            let oldListDir = abManager.getDirectory(card.mailListURI);
		            let listDir = Components.classes["@mozilla.org/addressbook/directoryproperty;1"]
		                                    .createInstance(Components.interfaces.nsIAbDirectory);
		            listDir.isMailList = true;

		            listDir.dirName = oldListDir.dirName;
		            listDir.listNickName = oldListDir.listNickName;
		            listDir.description = oldListDir.description;

		            for (let i = 0; i < oldListDir.addressLists.length; i++) {
		                let subcard = oldListDir.addressLists.queryElementAt(i, Components.interfaces.nsIAbCard);
		                let cloneCard = Components.classes["@mozilla.org/addressbook/moz-abmdbcard;1"]
		                                          .createInstance(Components.interfaces.nsIAbCard);
		                cloneCard.copy(subcard);
		                listDir.addressLists.appendElement(cloneCard, false);
		            }
		            this.outputAb.addMailList(listDir);
		            countLists++;
		        }
		        else {
		            let cloneCard = Components.classes["@mozilla.org/addressbook/moz-abmdbcard;1"]
		                                      .createInstance(Components.interfaces.nsIAbCard);
		            cloneCard.copy(card);
		            this.outputAb.addCard(cloneCard);
		            countCards++;
		        }
		        cardsArray.appendElement(card, false);
		    }
		    this.inputAb.deleteCards(cardsArray);
		    this.inputAb.QueryInterface(Components.interfaces.nsIAbMDBDirectory).database.close(true);
		    if (countCards || countLists) {
		        dump("moved " + countCards + " cards and "
		             + countLists + " lists from " + this.inputAb.URI
		             + " to " + this.outputAb.URI + "\n");
		    }
		}
		else {
		    dump("_moveAddressBook: source and destination AB are the same\n");
		}
	}
};
