var peribeco =  {
	mailingLists: null,
	serverURL: null,
	mailDomains: null,
	authCookie: null,
	ooEnabled: false,
	mlEnabled: false,
	mfEnabled: false,
	account: null,
	init: function()
	{
		this.loadSettings();
	
		// check if the current account is valid for the extension
		/*if (!validateDomain(getUsername(this.account), this.mailDomains))
			return false;*/

		if (this.authenticate())
		{
			this.connect();
			Application.console.log("Exito!!");		
		}
		else
			$('loading-box').setAttribute("hidden", true);

	},
	loadSettings: function()
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.peribeco.");	

		// Server url
		this.serverURL = prefs.getCharPref("server.url");

		// Allowed mail domains
		this.mailDomains = prefs.getCharPref("mail.allowed.domains").split(",");

		// Enable modules
		this.ooEnabled = prefs.getBoolPref("outofoffice.enabled");
		this.mfEnabled = prefs.getBoolPref("forwardmail.enabled");
		this.mlEnabled = prefs.getBoolPref("mailinglist.enabled");
	},
	authenticate: function()
	{
		var user = getUsername(this.account).split("@")[0];	
		$('loading-box').setAttribute("hidden", false);
		var pwd = getPassword(this.account);

		if(pwd == null) {

			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					        .getService(Components.interfaces.nsIPromptService);

			var input = {value:null};
			var check = {value:false};
			var title = "Introduzca la contraseña";
			var label = "Introduzca la contraseña";
			var result = prompts.promptPassword(window,title, label, input, null, check);

			prompts = null;

			if (result) {
				pwd = input.value;
			} 

			else return false;
		}

		var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.open("POST", this.serverURL + "/login", false);
	 	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.withCredentials = true;
		request.send('login='+user+'&passw='+pwd+'&Botones.submit=Ingresar');

		if (request.status === 200) {
			this.authCookie = (request.getAllResponseHeaders().match(/(?:Set-Cookie: )[a-zA-z0-9_=]*/) + '').split(" ")[1];
			return true;
		}
	
		return false;
	},
	connect: function()
	{
		if (this.ooEnabled)
			this.getOutOfOfficeSettings();
		if (this.mfEnabled)
			this.getMailForwardSettings();
		if (this.mlEnabled)
			this.getMailingListsSettings();
	},
	// Update values from server for each group element in the configuration tab. 
	updateUI: function(element, data)
	{
		switch(element)
		{
			case 'outofoffice':
				var status = JSON.parse(data);
				$('outofoffice-state').setAttribute("disabled", false);
				$('ooo-enable').checked = (status.vacation == 0) ? false : true;
				$('notification-text').value = (status.message == 0) ? "" : status.message;
			break;
			case 'mailinglist':
				this.mailingLists = JSON.parse(data);

				if (this.mailingLists.length > 0) {

					$('mailinglist-state').setAttribute("disabled", false);

					for (var i = 0; i < this.mailingLists.length; i++)
						$('mailinglist-name-listbox').menupopup.appendChild(createMenuItem(this.mailingLists[i].cn, i, this.refreshMailingLists));

					$('mailinglist-name-listbox').selectedIndex =  0;
					this.refreshMailingLists();		

				}
			break;
			case 'mailforward':

				var mails = JSON.parse(data);

				if (mails.length > 0) {

					$('forward-state').setAttribute("disabled", false);

					for (var i = 0; i < mails.length; i++)
						$('forward-listbox').appendItem(mails[i], mails[i]);
				}

			break;
		}
	},
	setAccount: function(account)
	{
		this.account = account;
	},
	getOutOfOfficeSettings: function()
	{
		var request = get(this.serverURL + "/rest/vacation/", this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				this.updateUI('outofoffice', request.responseText);
			break;
		}

	},
	setOutOfOfficeSettings: function()
	{
		var data = JSON.stringify({vacation: ($('ooo-enable').checked)?1 : 0, message : ($('ooo-enable').checked)?$('notification-text').value : 0}); 

		$('loading-box').setAttribute("hidden", false);

		var request = post(this.serverURL + "/rest/vacation/", data, this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				// TODO BIEN
			break;
		}
	},
	getMailForwardSettings: function()
	{
		var request = get(this.serverURL + "/rest/mailforward/", this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				this.updateUI('mailforward', request.responseText);
			break;
		}
	},
	setMailForwardSettings: function()
	{
		var array = new Array();
		for (var i = 0; i < $('forward-listbox').getRowCount(); i++) {
			array.push($('forward-listbox').getItemAtIndex(i).value);
		}

		var data = JSON.stringify({ localcopy:($('mf-localcopy').checked)? 1 : 0, forward:array}); 

		Application.console.log(data);
		$('loading-box').setAttribute("hidden", false);

		var request = post(this.serverURL + "/rest/mailforward/", data, this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				// TODO BIEN
			break;
		}
	},
	getMailingListsSettings: function()
	{
		var request = get(this.serverURL + "/rest/maillist/", this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				this.updateUI('mailinglist', request.responseText);
			break;
		}
	},
	addToMailForward: function()
	{
		var email = $('forward-email-textbox').value;


		if (validateEmail(email) && validateDomain(email, this.mailDomains)) {
			$('forward-listbox').appendItem(email, email);
		}
		else {
			alert("Dirección de correo inválida");
		}

		$('forward-email-textbox').value = '';
		
	},
	removeFromMailForward: function()
	{
		var items = $('forward-listbox').selectedItems;

		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	 
		if (prompts.confirm(window, "Eliminar elementos", "Desea eliminar la direccion de correo seleccionada de la lista?")) {

			for(var i in items) {
				var idx = $('forward-listbox').getIndexOfItem(items[i]);
				$('forward-listbox').removeItemAt(idx);
			}
		}
	},
	setMailingListsSettings: function()
	{
		var data = JSON.stringify(this.mailingLists); 

		Application.console.log(data);

		$('loading-box').setAttribute("hidden", false);

		var request = post(this.serverURL + "/rest/maillist/", data, this.authCookie);		

		$('loading-box').setAttribute("hidden", true);

		switch(request.status)
		{
			case 0:
				logMsg("El certificado de seguridad del servidor no es valido", true);				
			break;
			case 200:
				Application.console.log(request.responseText);
				// TODO BIEN
			break;
			case 500:
				Application.console.log("Error de la aplicacion");
			break;
		}
	},
	refreshMailingLists: function()
	{
		var index = $('mailinglist-name-listbox').selectedIndex;	
		var size = $('mailinglist-listbox').getRowCount();

		while($('mailinglist-listbox').hasChildNodes()){
		    $('mailinglist-listbox').removeChild($('mailinglist-listbox').firstChild);
		}

		for (var i = 0; i < peribeco.mailingLists[index].members.length; i++)
			$('mailinglist-listbox').appendItem(peribeco.mailingLists[index].members[i], peribeco.mailingLists[index].members[i]);
	},
	addToMailingLists: function()
	{
		var email = $('mailinglist-email-textbox').value;
		var index = $('mailinglist-name-listbox').selectedIndex;	
		
		if (validateEmail(email) && validateDomain(email, this.mailDomains)) {
			this.mailingLists[index].members.push(email);
			$('mailinglist-listbox').appendItem(email, email);
		}
		else {
			alert("Dirección de correo inválida");
		}

		$('mailinglist-email-textbox').value = '';
	},
	removeFromMailingLists: function()
	{
		var items = $('mailinglist-listbox').selectedItems;
		var index = $('mailinglist-name-listbox').selectedIndex;	

		let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	 
		if (prompts.confirm(window, "Eliminar elementos", "Desea eliminar la direccion de correo seleccionada de la lista?")) {

			for(var i in items) {
				var idx = $('mailinglist-listbox').getIndexOfItem(items[i]);
				$('mailinglist-listbox').removeItemAt(idx);
				this.mailingLists[index].members.splice(idx, 1);
			}
		}
	}
}
