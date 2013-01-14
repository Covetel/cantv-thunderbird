var SettingsMigrator = {
	eventHandler: null,
	init: function(handler) {
		this.eventHandler = handler;	
	},
	start: function() {
		this.eventHandler.onStart();

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.settings.server");

	/*	var incomingServer = AccountManager.account.incomingServer;
		incomingServer.setCharValue("hostName", prefs.getCharPref("imap.hostname"));
		incomingServer.setIntValue("port", prefs.getIntPref("imap.port"));

		var outgoingServer = AccountManager.account.defaultIdentity;
		outgoingServer.setCharValue("hostname", prefs.getCharPref("smtp.hostname"));
		outgoingServer.setIntValue("port", prefs.getIntPref("imap.port"));*/
		
		this.eventHandler.onSuccess();
		this.eventHandler.onStop();
	}
}
