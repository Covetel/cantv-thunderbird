function wizardLoadAccounts() {

	AccountManager.init();

	var list = AccountManager.getAccounts();
	var menuList = document.getElementById("account-list");

	menuList.removeAllItems();

	for (var i = 0; i < list.length; i++) {
		menuList.appendItem(list[i].name, list[i].index, "");
	}

	menuList.selectedIndex = 0;
}

function wizardLockProperties() {
	document.getElementById('migration-wizard').canAdvance = false;
	document.getElementById('migration-wizard').canRewind = false;
	wizardStart(1);
}

function wizardStart(step) {

	switch(step)
	{
		// AddressBook migration
		case 1:
			Application.console.log("Migrando contactos");
			MigratorHandler.init("contacts", 1);

			if  (!userPrefs.prefHasUserValue("1"))
			{
/*				MailForwardMigrator.init(MigratorHandler);
				MailForwardMigrator.start();
				DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();*/
	                        ABookMigrator.init(MigratorHandler);
        	                ABookMigrator.start();
			}
			else
			{
				MigratorHandler.onStop();
			}
/*			ABookMigrator.init(MigratorHandler);
			ABookMigrator.start();
/*			SettingsMigrator.init(MigratorHandler);
			SettingsMigrator.start();*/

			
		break;
		// Calendar migration
		case 2:
			Application.console.log("Migrando calendario");
			MigratorHandler.init("calendar", 2);
			if  (!userPrefs.prefHasUserValue("2"))
			{
/*				DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();*/
				CalendarMigrator.init(MigratorHandler);
				CalendarMigrator.start();
			}
			else
			{
				MigratorHandler.onStop();
			}
		break;
		// Mailbox migration
		case 3:
			Application.console.log("Migrando mailbox");
			MigratorHandler.init("mailbox", 3);
			if  (!userPrefs.prefHasUserValue("3"))
			{
				/*DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();*/
				MailDownloader.init(MigratorHandler);
				MailDownloader.start();
			}
			else
			{
				MigratorHandler.onStop();
			}
		break;
		// Settings migration	
		case 4:
			Application.console.log("Migrando settings");
			MigratorHandler.init("config", 4);
			if  (!userPrefs.prefHasUserValue("4"))
			{
				/*DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();*/
				SettingsMigrator.init(MigratorHandler);
				SettingsMigrator.start();
			}
			else
			{
				MigratorHandler.onStop();
			}
		break;
		// Mailhost migration
		case 5:
			Application.console.log("Cambiando mailhost");
			MigratorHandler.init("mailhost", 5);

			if  (!userPrefs.prefHasUserValue("5"))
			{
				DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();
				/*MailHostMigrator.init(MigratorHandler);
				MailHostMigrator.start();*/
			}
			else
			{
				MigratorHandler.onStop();
			}

		break;
		// Forward creation
		case 6:
			Application.console.log("Creando mailbox");
			MigratorHandler.init("forward", 6);
			if  (!userPrefs.prefHasUserValue("6"))
			{
				DummyMigrator.init(MigratorHandler);
				DummyMigrator.start();
				/*ForwardCreator.init(MigratorHandler);
				ForwardCreator.start();*/
			}
			else
			{
				MigratorHandler.onStop();
			}

		break;
	}
}

function wizardStop() {

	var complete = parseInt(document.getElementById("progress").getAttribute('value'));

	if (complete == 100)
	{
		var wizard = document.getElementById('migration-wizard');
		wizard.canAdvance = true;
		wizard.canRewind = false;
	}
}

function wizardCancel() {

	var wizard = document.getElementById('migration-wizard');

	if (wizard.pageIndex == 2)
		return false;

	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);
	
	var cancel = promptService.confirm(window, "Confirmar", "Desea cancelar el asistente de migración?");

	return cancel;
}

function wizardSelectAccount() {

	var index = 0;
	index = document.getElementById("account-list").selectedItem.value;
	var account = AccountManager.getAccounts()[index].object;

	if (account) {
		return AccountManager.setDefaultAccount(account);
	}
	else {
		alert("Debe seleccionar una cuenta de correo válida");
		return false;
	}

	return false;
}



var MigratorHandler = {
	stepName : null,
	step : 0,
	sucess : false,	
	init : function(stepName, step) {
		this.step = step;
		this.stepName = stepName;
	},
	onStart: function() {
		document.getElementById(this.stepName + "-progress").setAttribute('hidden', false);
	},
	onSuccess: function() {
		document.getElementById(this.stepName + "-status").value = "OK";
		var progress = parseInt(document.getElementById("progress").getAttribute("value"));
		dump(progress);
		progress += 20;
		document.getElementById("progress").setAttribute('value', progress);
		userPrefs.setBoolPref(this.step, true);
	},
	onError: function() {
		document.getElementById(this.stepName + "-status").value = "ERR";
	},
	onStop: function () {

		document.getElementById(this.stepName + "-progress").setAttribute('hidden', true);

		if (this.step < 6)
		{
			this.step++;
			wizardStart(this.step);
		}
		else
			wizardStop();		
	}
}

function restartBaby()
{
        var appStartup = Components.interfaces.nsIAppStartup;
        Components.classes["@mozilla.org/toolkit/app-startup;1"]
                .getService(appStartup).quit(appStartup.eRestart | appStartup.eAttemptQuit);
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

function showMigrationWizard() {
	window.openDialog("chrome://migrador/content/migrador-wizard.xul","showmore", "chrome", msgWindow);
}

function WizardSendMail()
{

}

//WizardSendMail();

