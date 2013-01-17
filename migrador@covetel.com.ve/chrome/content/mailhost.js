var MailHostMigrator = {
	eventHandler: null,
	authCookie: null,
	mailhost: null,
	init: function(handler) {
		this.eventHandler = handler;	
	},
	start: function() {

		this.eventHandler.onStart();

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService).getBranch("extensions.migration.peribeco.");

		var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.open("POST", prefs.getCharPref("login.url"), false);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send('login='+AccountManager.getUsername()+'&passw='+AccountManager.getPassword()+'&Botones.submit=Ingresar');

		if (request.status === 200) {
			this.authCookie = (request.getAllResponseHeaders().match(/(?:Set-Cookie: )[a-zA-z0-9_=]*/) + '').split(" ")[1];
			var request = post(prefs.getCharPref("mailhost.url"), null, this.authCookie);
			request = get(prefs.getCharPref("mailhost.url"), this.authCookie);
			var status = JSON.parse(request.responseText);
			this.mailhost = status.mailhost;
			MailHostMigrator.eventHandler.onSuccess();
			MailHostMigrator.eventHandler.onStop();
		}
		else {
			MailHostMigrator.eventHandler.onError();
			MailHostMigrator.eventHandler.onStop(); 
		}
	}
}
