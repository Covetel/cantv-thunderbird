// Display informative message in the bottom of the tab
function logMsg(message, hideProgress)
{
	alert(message);

	if (hideProgress)
		$('loading-box').setAttribute("hidden", true);
}

function $(e)
{
	return document.getElementById(e);
}

function createMenuItem(aLabel, aValue, aCallback) 
{
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	var item = document.createElementNS(XUL_NS, "menuitem"); // create a new XUL menuitem
	item.setAttribute("label", aLabel);
	item.setAttribute("value", aValue);
	item.addEventListener('command', aCallback, true);
	return item;
}

function validateDuplicate(str, array)
{
	for (i in array)
	{
		if (str == array[i])
		{
			return false;
		}
	}
	
	return true;
}

function validateDomain(email, domains)
{
	var email_domain = email.split("@")[1];

	for (i in domains)
	{
		if (email_domain == domains[i])
		{
			return true;
		}
	}

	return false;
}

function validateEmail(str) 
{
    var lastAtPos = str.lastIndexOf('@');
    var lastDotPos = str.lastIndexOf('.');
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
}

// helper functions, http get request
function get(url, onload, onerror, cookie)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.onload = onload;
	request.onerror = onerror;
	request.open("GET", url, true);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(null);
}

// helper functions, http post request
function post(url, onload, onerror, data, cookie)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.onload = onload;
	request.onerror = onerror;
	request.open("POST", url, true);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(data);	
}
