function getPassword(account)
{ 
  if (account.passwordPromptRequired == false)
    return account.password;

  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                      .getService(Components.interfaces.nsIPromptService);

  var input = {value:null};
  var check = {value:false};

  // Localization of the popup title and label
  var title = "Introduzca la contraseña";
  var label = "Introduzca la contraseña";
  var result = prompts.promptPassword(window,title, label, input, null, check);

  prompts = null;

  if (result)
    return input.value;

  return null;
}

function getUsername(account)
{
        return account.realUsername;
}

function updateVacationUI(statusText)
{
	var status = JSON.parse(statusText);
	document.getElementById('outofoffice-box').setAttribute('hidden', true);

	if (status.vacation == 0) {
		document.getElementById('ooo-enable').checked = false;
	}
	else {
		document.getElementById('ooo-enable').checked = true;
	}

	if (status.message == 0) {
		document.getElementById('notification-text').setAttribute("value", "");
	}
	else {
		document.getElementById('notification-text').setAttribute("value", status.message);
	}

	document.getElementById('notification-text').setAttribute('hidden',!document.getElementById('ooo-enable').checked)
	document.getElementById('outofoffice-box').setAttribute('hidden', false);
		
}

function getVacationStatus(cookie) 
{	
	var url = "http://192.168.113.108:3000/rest/vacation/"
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);

	request.onload = function(aEvent) {
		updateVacationUI(aEvent.target.responseText);
	};

	request.open("GET", url, true);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(null);	
}

function setVacationStatus(cookie, active, message) 
{	
	var url = "http://192.168.113.108:3000/rest/vacation/"
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	
	//FIXME: Generar alerta en caso de que no se genere 
	request.onload = function(aEvent) {
		alert("Response Text: " + aEvent.target.responseText);
	};
	request.onerror = function(aEvent) {
	   	alert("Error Status: " + aEvent.target.status);
	};

	request.open("POST", url, true);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(JSON.stringify({active: active, info : message}));	
}



