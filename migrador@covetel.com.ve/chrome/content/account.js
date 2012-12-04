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
