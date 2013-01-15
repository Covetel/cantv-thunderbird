var SettingsMigrator = {
	eventHandler: null,
	init: function(handler) {
		this.eventHandler = handler;	
	},
	start: function() {
		this.eventHandler.onStart();

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)

		var imapBranch = prefs.getBranch("extensions.migration.settings.server.imap.");
		var smtpBranch = prefs.getBranch("extensions.migration.settings.server.smtp.");
	
		var incomingServer = AccountManager.account.incomingServer;
		var outgoingServer = AccountManager.account.defaultIdentity;

		var imapKey = incomingServer.key;
		var smtpKey = outgoingServer.smtpServerKey;

		var imapHostname = imapBranch.getCharPref("hostname");
		var imapPort = imapBranch.getIntPref("port");
		var smtpHostname = smtpBranch.getCharPref("hostname");
		var smtpPort = smtpBranch.getIntPref("port");

		imapBranch = prefs.getBranch("mail.server." +  imapKey + ".");
		smtpBranch = prefs.getBranch("mail.smtpserver." +  smtpKey + ".");

		imapBranch.setCharPref("hostname", imapHostname);
		imapBranch.setIntPref("port", imapPort);

		smtpBranch.setCharPref("hostname", smtpHostname);
		smtpBranch.setIntPref("port", smtpPort);

		this.eventHandler.onSuccess();
		this.eventHandler.onStop();
	}
}
