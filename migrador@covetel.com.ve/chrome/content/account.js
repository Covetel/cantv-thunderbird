var AccountManager = {
	account : null,
	username : null,
	password : null,
	domain : null,
	init: function() {
	},
	setDefaultAccount: function(account)
	{
		var email = account.defaultIdentity.email;
		var domain = email.split("@")[1];

		this.account = account;
		this.username = account.incomingServer.realUsername;

		this.domain = domain;

		if (account.incomingServer.passwordPromptRequired)
		{
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        			.getService(Components.interfaces.nsIPromptService);
 
			var pass = {value: ""};
 			var check = {value: true};
 			var result = prompts.promptPassword(null, "Autenticación", "Introduzca la contraseña para la cuenta: "+account.defaultIdentity.email, pass, null, check);			
			
			if (result) 
				this.password = pass.value;
			else 
				return false;
		}
		else
			this.password = account.incomingServer.password;

		this.setCredentials();

		return true;
	},
	setCredentials: function() {

		var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");	

		var password = AccountManager.getPassword();

		var serviceUrl = prefs.getCharPref('service.url');

		var authLoginInfoServer1 = Components.classes["@mozilla.org/login-manager/loginInfo;1"].createInstance(Components.interfaces.nsILoginInfo);
		authLoginInfoServer1.init(
			'http://localhost:1080',
			null,
			'DavMail Gateway',
		    	AccountManager.getUsername(),
			AccountManager.getPassword(),
		    	'',
			'');

		var authLoginInfoServer2 = Components.classes["@mozilla.org/login-manager/loginInfo;1"].createInstance(Components.interfaces.nsILoginInfo);
		authLoginInfoServer2.init(
			serviceUrl,
			null,
			'SOGo',
		    	AccountManager.getUsername()/*  + "@" + AccountManager.getDomain()*/,
			AccountManager.getPassword(),
		    	'',
			'');
		try {
			passwordManager.addLogin(authLoginInfoServer1);	
		} catch(e) { dump(e) }

		try {
			passwordManager.addLogin(authLoginInfoServer2);	
		} catch(e) { dump(e) }	
	},
	getAccounts: function(){

		var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
		                        .getService(Components.interfaces.nsIMsgAccountManager);

		var accounts = acctMgr.accounts;

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");

		var validDomain = prefs.getCharPref("domain");

		var list = new Array();

		for (var i = 0; i < accounts.Count(); i++) {

			var account = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount);

			if (account.defaultIdentity) {
				
				var email = account.defaultIdentity.email;
				var domain = email.split("@")[1];
	
				if (domain == validDomain)
					list.push({name:account.defaultIdentity.identityName, index:i, object:account});
			}
		}

		return list;
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
