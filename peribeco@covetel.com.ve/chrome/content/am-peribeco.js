function onPreInit(account, accountvalues)  {
	//Application.console.log("El password es:" + account.incomingServer.password);
	//alert(getUsername(account.incomingServer));
	//account.incomingServer.getPasswordWithUI("pregunta", "titulo", this, true);
	//console.log(accountvalues);
}

function onInit(pageId, serverId)  { 
	//alert(serverId);
	//setVacationStatus("peribeco_session=e5fa191433b8a9bd5b7ea1e76ee5d1e4458051b1", 0, "probando nuevamente");
	// FIXME: Corregir detalles de la autenticación
	//document.getElementById('outofoffice-box').setAttribute("disabled", "true");
	//getVacationStatus("peribeco_session=e5fa191433b8a9bd5b7ea1e76ee5d1e4458051b1");
	//loadSettings();
	//connectToServer();
	peribeco.init();
}

function onAcceptEditor() { 
} 

function onSave() { 
	//setVacationStatus("peribeco_session=e5fa191433b8a9bd5b7ea1e76ee5d1e4458051b1", (document.getElementById('ooo-enable').checked)? 1 : 0, document.getElementById('notification-text').value);
} 

function UpdatePage() {
	//alert("update");
}
