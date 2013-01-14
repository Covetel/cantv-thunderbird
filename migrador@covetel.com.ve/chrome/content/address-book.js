var ABookMigrator = {
	abManager : null,
	nManager: null,
	inputAb : null,
	outputAb : null,
	eventHandler: null,
	init: function(handler) {
		this.abManager = Components.classes["@mozilla.org/abmanager;1"]
		                 .getService(Components.interfaces.nsIAbManager);

		this.nManager = Components.classes["@inverse.ca/notification-manager;1"]
				     .getService(Components.interfaces.inverseIJSNotificationManager)
				     .wrappedJSObject;

		ABookMigrator.eventHandler = handler;
	},
	start: function() {

		ABookMigrator.eventHandler.onStart();
		this.removeAddressBooks();
		this.createAddressBooks();

		this.nManager.registerObserver("groupdav.synchronization.stop", { 
			handleNotification: function(notification, data) {
				ABookMigrator.nManager.unregisterObserver("groupdav.synchronization.stop", this);
				ABookMigrator.copyAddressBook();
				let OutputSynchronizer = new GroupDavSynchronizer(ABookMigrator.outputAb.URI, false);
				OutputSynchronizer.callback = ABookMigrator.OutputABSynchronizeCallback;
				OutputSynchronizer.start();
			}});

		let synchronizer = new GroupDavSynchronizer(ABookMigrator.inputAb.URI, false);
		synchronizer.callback = ABookMigrator.InputABSynchronizeCallback;
		synchronizer.start();
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
	},
	InputABSynchronizeCallback: function(url, code, failures)
	{
		if (code != 200) {
			ABookMigrator.eventHandler.onError();
			ABookMigrator.eventHandler.onStop();		
		}
	},
	OutputABSynchronizeCallback: function(url, code, failures)
	{
		try {
			SCDeleteDAVDirectory(ABookMigrator.inputAb.URI);
		} catch(e) { dump(e) };

		ABookMigrator.eventHandler.onSuccess();
		ABookMigrator.eventHandler.onStop();		
	}
};
