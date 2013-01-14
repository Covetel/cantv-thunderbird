var MailDownloader = {
	msgWindow : window.arguments[0],
	localFolders : null,
	rootFolder : null,
	copyServiceListener : null,
	eventHandler: null,
	msgCopyService: null,
	init: function(handler) {

		var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
		                        .getService(Components.interfaces.nsIMsgAccountManager);

		this.eventHandler = handler;
		this.localFolders = acctMgr.localFoldersServer.rootFolder;
		this.rootFolder = AccountManager.account.incomingServer.rootFolder;
		this.msgWindow = Components.classes["@mozilla.org/messenger/msgwindow;1"].createInstance(Components.interfaces.nsIMsgWindow);
		this.msgCopyService = Components.classes['@mozilla.org/messenger/messagecopyservice;1'].getService(Components.interfaces.nsIMsgCopyService);
	},
	start: function() {

		this.eventHandler.onStart();
		
		//AccountManager.account.incomingServer.performBiff(this.msgWindow);

		try {
			this.localFolders.createSubfolder(this.rootFolder.name, this.msgWindow);
		}
		catch(Exception) {
			Application.console.log("Oopss");
			Application.console.log(Exception);
			//MailDownloader.eventHandler.onError();
			//MailDownloader.eventHandler.onStop();				
			//return;
		}
		var localRootFolder = this.localFolders.findSubFolder(this.rootFolder.name);
		this.moveFolder(this.rootFolder, localRootFolder);
	},
	moveFolder: function(srcFolder, dstFolder) {

		dump("Copiando los mensajes de: " + srcFolder.name + " a: " + dstFolder.name + "\n");

		if (srcFolder.hasSubFolders) {

			dump("Subcarpetas encontradas\n");

			var subFolders = srcFolder.subFolders;
			
			while(subFolders.hasMoreElements()) {
				var subFolder = subFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder);
				dstFolder.createSubfolder(subFolder.name, this.msgWindow);
				var localSubFolder = dstFolder.findSubFolder(subFolder.name);
				this.moveFolder(subFolder, localSubFolder);
			}			
		}

		//FIXME: establecer isMove = true para eliminar los mensajes del servidor
		dstFolder.copyMessages(srcFolder, this.toArray(srcFolder.name, srcFolder.messages), false, null, new MoveMessagesListener(dstFolder.name), true, false);
	},
	toArray: function(name, elements) {

            	let array = Components.classes["@mozilla.org/array;1"]
                                  .createInstance(Components.interfaces.nsIMutableArray);

		var count = 0;
		if (elements != null) { 		
			while(elements.hasMoreElements()) {
				count++;
				var message = elements.getNext().QueryInterface(Components.interfaces.nsIMsgDBHdr);			
				array.appendElement(message, false);
			}
		}
		
		FolderMessageCounter.addFolder(name, count);

		return array;
	}
}

function MoveMessagesListener(folderName) {
	
	dump("Creando listener para carpeta " + folderName + "\n");
	this.folderName = folderName;
	// Interface   nsISupports
	this.QueryInterface = function(iid) 
	{
		if (iid.equals(Components.interfaces.nsIMsgCopyServiceListener) || iid.equals(Components.interfaces.nsISupports)) return this;
		throw Components.results.NS_NOINTERFACE; return 0;
	};
	this.AddRef = function() 
	{
	};
	this.Release = function() 
	{
	};
	// Interface   nsIMsgCopyServiceListener
	this.OnProgress = function (progress, progressMax, data) 
	{
		dump("onprogress: " + progress + "\n");
	};
	this.OnStartCopy = function (data) 
	{
		dump("Start " + this.folderName + "\n");
	};
	this.OnStopCopy = function (status, data) 
	{
		dump("Stop " + this.folderName + "\n");
	};
	this.SetMessageKey = function (key) 
	{ 
		//Application.console.log(this.folderName + ": setmessagekey: " + key + "\n");
		if (key > 0)
		{
			if (FolderMessageCounter.messageCopied(this.folderName))
			{
				Application.console.log("*********************** FINALIZADO *********************");
				MailDownloader.eventHandler.onSuccess();
				MailDownloader.eventHandler.onStop();			
			}
		}

	};
	this.GetMessageId = function (messageId) { 
		dump(this.folderName + ": getmessageid: " + messageid + "\n");
	};
}

var FolderMessageCounter = {
	folders : new Array(),
	addFolder: function(folderName, messageCount) 
	{
		var folder = new Object();
		folder["name"] = folderName;
		folder["count"] = messageCount;
		this.folders.push(folder);
	},
	messageCopied: function(folderName)
	{
		for ( var i = 0; i < this.folders.length; i++)
		{
			if (folderName == this.folders[i]["name"])
			{
				this.folders[i]["count"]--;
				break;
			}
		}

		return this.checkAllMessagesCopied();
	},
	checkAllMessagesCopied: function()
	{
		var allMessagesDownloaded = true;
		for ( var i = 0; i < this.folders.length; i++)
		{
			if (this.folders[i]["count"] > 0)
			{
				allMessagesDownloaded = false;
				break;
			}
		}

		return allMessagesDownloaded;
	}
}
