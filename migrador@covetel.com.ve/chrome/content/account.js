var AccountManager = {
	username : null,
	password : null,
	domain : null,
	init: function() {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");

		var validDomain = prefs.getCharPref("domain");

		var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
		                        .getService(Components.interfaces.nsIMsgAccountManager);

		var accounts = acctMgr.accounts;

		var cont = true;
		for (var i = 0; i < accounts.Count() && cont; i++) {
			var account = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount);

			if (account.defaultIdentity) {

				var email = account.defaultIdentity.email;
				var domain = email.split("@")[1];

				if (domain == validDomain)
				{
					this.username = account.incomingServer.realUsername;
					this.domain = domain;

					if (account.incomingServer.passwordPromptRequired)
						this.password = account.incomingServer.password;
					else
						this.password = null;
				}
			}
		}

		this.setCredentials();

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
	getUsername: function(){
		return this.username;

	},
	getPassword: function(){
		return this.password;
	},
	getDomain: function(){
		return this.domain;
	}
}
