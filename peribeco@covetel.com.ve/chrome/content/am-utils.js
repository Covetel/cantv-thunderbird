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

function getPassword(account)
{
  if (account.passwordPromptRequired == false)
	return account.password;
  else 
	return null;
}

function getUsername(account)
{
        return account.realUsername;
}

// helper functions, http get request
function get(url, cookie)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.open("GET", url, false);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(null);
	return request;
}

// helper functions, http post request
function post(url, data, cookie)
{
	var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	request.open("POST", url, false);
	request.setRequestHeader("Cookie", cookie);
	request.setRequestHeader("Content-Type", "application/json");
	request.send(data);	
	return request;
}
