var SERVER_URL = "https://peribeco.lab.covetel.com.ve";
var COOKIE = "peribeco_session=77554b136e459f8b15248136d490e2e500bc9435";appendItem
var MLISTS = "";

// Get all the settings related to the extension as global variables
function loadSettings()
{
}

// Check connection to server, this returns true if succeeds
function connectToServer()
{
	//TODO: Http Authentication
	getOutOfOfficeSettings();
	getMailingListsSettings();
	//getMailForward();	
	//getMailingLists();
}

// Update values from server for each group element in the configuration tab. 
function updateUI(element, data)
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
			MLISTS = JSON.parse(data);
			var lists = MLISTS;

			if (lists.length > 0) {

				$('mailinglist-state').setAttribute("disabled", false);

				for (var i = 0; i < lists.length; i++)
					$('mailinglist-name-listbox').menupopup.appendChild(createMenuItem(lists[i].cn, i));

				$('mailinglist-name-listbox').menupopup.selectedIndex =  0;				

			}
		break;
	}
}


// Display informative message in the bottom of the tab
function logMsg(message, hideProgress)
{
	alert(message);

	if (hideProgress)
		$('loading-box').setAttribute("hidden", true);
}


function setOutOfOfficeSettings()
{
	var data = JSON.stringify({vacation: ($('ooo-enable').checked)?1 : 0, message : ($('ooo-enable').checked)?$('notification-text').value : 0}); 
	$('loading-box').setAttribute("hidden", false);

	post(SERVER_URL + "/rest/vacation/", 
		function(aEvent) {
			$('loading-box').setAttribute("hidden", true);
		},
		function(aEvent){
			('loading-box').setAttribute("hidden", true);
			var status = aEvent.target.status;
			switch (status)
			{
				// SSL Certificate problem (invalid)
				case 0:
					logMsg("El certificado de seguridad del servidor no es valido", true);
				break;
			}
		}, data);

}

function refreshMailList(event)
{
	var index = event.target.value;	
	var size = $('mailinglist-listbox').getRowCount();

	while($('mailinglist-listbox').hasChildNodes()){
	    $('mailinglist-listbox').removeChild($('mailinglist-listbox').firstChild);
	}

	for (var i = 0; i < MLISTS[index].members.length; i++)
		$('mailinglist-listbox').appendItem(MLISTS[index].members[i], i);
}

function addToMailList()
{
	
}

function updateMailingList()
{
	
}

function removeFromMailList()
{
	var items = $('mailinglist-listbox').selectedItems;

	let prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
 
	if (prompts.confirm(window, "Eliminar elementos", "Desea eliminar las direcciones seleccionadas de la lista?")) {

		for(var i in items) {
			$('mailinglist-listbox').removeItemAt($('mailinglist-listbox').getIndexOfItem(items[i]));
		}
	}
}

function getOutOfOfficeSettings()
{
	get(SERVER_URL + "/rest/vacation/",
		function(aEvent) {

			$('loading-box').setAttribute("hidden", true);
			// Everything Ok, updating UI
			updateUI('outofoffice', aEvent.target.responseText);
		},
		function(aEvent){

			var status = aEvent.target.status;
			switch (status)
			{
				// SSL Certificate problem (invalid)
				case 0:
					logMsg("El certificado de seguridad del servidor no es valido", true);
				break;
			}
		});
}

function setMailForward(data)
{
}

function getMailForward()
{
}

function setMailingLists(data)
{
}

function getMailingListsSettings()
{
	get(SERVER_URL + "/rest/maillist/", 
		function(aEvent) {

			$('loading-box').setAttribute("hidden", true);
			// Everything Ok, updating UI
			updateUI('mailinglist', aEvent.target.responseText);
		},
		function(aEvent){

			var status = aEvent.target.status;
			switch (status)
			{
				// SSL Certificate problem (invalid)
				case 0:
					logMsg("El certificado de seguridad del servidor no es valido", true);
				break;
			}
		});
}

function $(e)
{
	return document.getElementById(e);
}

function createMenuItem(aLabel, aValue) 
{
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	var item = document.createElementNS(XUL_NS, "menuitem"); // create a new XUL menuitem
	item.setAttribute("label", aLabel);
	item.setAttribute("value", aValue);
	item.addEventListener('command', refreshMailList, true);
	return item;
}

// helper functions, http get request
function get(url, onload, onerror)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.onload = onload;
	request.onerror = onerror;
	request.open("GET", url, true);
	request.setRequestHeader("Cookie", COOKIE);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(null);
}

// helper functions, http post request
function post(url, onload, onerror, data)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.onload = onload;
	request.onerror = onerror;
	request.open("POST", url, true);
	request.setRequestHeader("Cookie", COOKIE);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(data);	
}

