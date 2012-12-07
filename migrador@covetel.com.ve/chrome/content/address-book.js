var ABookMigrator = {
	abManager : null,
	nManager: null,
	inputAb : null,
	outputAb : null,
	init: function() {
		this.abManager = Components.classes["@mozilla.org/abmanager;1"]
		                 .getService(Components.interfaces.nsIAbManager);

		this.nManager = Components.classes["@inverse.ca/notification-manager;1"]
				     .getService(Components.interfaces.inverseIJSNotificationManager)
				     .wrappedJSObject;
	},
	start: function(resume) {
		this.removeAddressBooks();
		this.createAddressBooks();

		//FIXME: Pasar al AccountManager
		this.setCredentials();

		this.nManager.registerObserver("groupdav.synchronization.stop", { 
			handleNotification: function(notification, data) {
				ABookMigrator.nManager.unregisterObserver("groupdav.synchronization.stop", this);
				ABookMigrator.copyAddressBook();
				SynchronizeGroupdavAddressbook(ABookMigrator.outputAb.URI, null, null);
			}});
		startFolderSync();
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
		this.outputAb = SCCreateGroupDAVDirectory(prefs.getCharPref("addressbook.name"), outputURL);
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
		    'https://190.142.238.79:8081',
		    null,
		    'SOGo',
		    /*DEBUG AccountManager.getUsername()*/"emujic",
		    /*DEBUG: password */"123456",
		    "",
		    ""
		);

		if (!passwordManager.getLoginSavingEnabled("http://localhost:1080"))
			passwordManager.addLogin(authLoginInfoServer1);
		if (!passwordManager.getLoginSavingEnabled("https://190.142.238.79:8081"))
		passwordManager.addLogin(authLoginInfoServer2); 


	},
   	copyAddressBook: function() {

		let childCards = this.inputAb.childCards;

		while (childCards.hasMoreElements()) {

			let card = childCards.getNext().QueryInterface(Components.interfaces.nsIAbCard);

		        if (card.isMailList) {

		        	let oldListDir = this.abManager.getDirectory(card.mailListURI);
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
					cloneCard.setProperty("groupDavVersion", "-1");
					listDir.addressLists.appendElement(cloneCard, false);
				}

				this.outputAb.addMailList(listDir);
		        }
		        else {

				if (card.getProperty("groupDavKey", "NONE") != "NONE") {
					
					let cloneCard = Components.classes["@mozilla.org/addressbook/moz-abmdbcard;1"]
				                              .createInstance(Components.interfaces.nsIAbCard);
					cloneCard.copy(card);
					cloneCard.setProperty("groupDavVersion", "-1");
					this.outputAb.addCard(cloneCard);
				}
		        }
		}
	}
};
