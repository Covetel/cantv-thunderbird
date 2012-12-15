var MailDownloader = {
	localFolders : null,
	rootFolder : null,

	//TODO: establecer el fetch_by_chuncks por si no está establecido
	init: function() {

		var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
		                        .getService(Components.interfaces.nsIMsgAccountManager);

		this.localFolders = acctMgr.localFoldersServer.rootFolder;
		this.rootFolder = AccountManager.account.incomingServer.rootFolder;
	},
	start: function() {


		this.localFolders.createSubfolder(this.rootFolder.name, msgWindow);
		var localRootFolder = this.localFolders.findSubFolder(this.rootFolder.name);
		this.moveFolder(this.rootFolder, localRootFolder);

	},
	moveFolder: function(srcFolder, dstFolder) {

		dump("Copiando los mensajes de: " + srcFolder.name + " a: " + dstFolder.name + "\n");

		if (srcFolder.hasSubFolders) {

			dump("Subcarpetas encontradas\n");

			var subFolders = srcFolder.subFolders;

			while(subFolders.hasMoreElements()) {
				var subFolder = subFolders.getNext();
				dstFolder.createSubfolder(subFolder.name, msgWindow);
				var localSubFolder = dstFolder.findSubFolder(subFolder.name);
				this.moveFolder(subFolder, localSubFolder);
			}			
		}

		dstFolder.copyMessages(srcFolder, this.toArray(srcFolder.messages), true, msgWindow, null, true, false);
	},
	toArray: function(elements) {

            	let array = Components.classes["@mozilla.org/array;1"]
                                  .createInstance(Components.interfaces.nsIMutableArray);

		while(elements.hasMoreElements())
			array.appendElement(elements.getNext(), false);
		
		return array;
	}
}
