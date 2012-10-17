function onPreInit(account, accountvalues)  {
	peribeco.setAccount(account.incomingServer);
}

function onInit(pageId, serverId)  { 
	peribeco.init();
}
