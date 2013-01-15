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
/*			ABookMigrator.init(MigratorHandler);
			ABookMigrator.start();*/
			DummyMigrator.init(MigratorHandler);
			DummyMigrator.start();
		break;
		// Calendar migration
		case 2:
			Application.console.log("Migrando calendario");
			MigratorHandler.init("calendar", 2);
/*			CalendarMigrator.init(MigratorHandler);
			CalendarMigrator.start();*/
			SettingsMigrator.init(MigratorHandler);
			SettingsMigrator.start();
		break;
		// Mailbox migration
		case 3:
			Application.console.log("Migrando mailbox");
			MigratorHandler.init("mailbox", 3);
/*		        MailDownloader.init(MigratorHandler);
			MailDownloader.start();*/
			DummyMigrator.init(MigratorHandler);
			DummyMigrator.start();

		break;
		// Settings migration	
		case 4:
			Application.console.log("Migrando settings");
			MigratorHandler.init("config", 4);
/*			SettingsMigrator.init(MigratorHandler);
			SettingsMigrator.start();*/
			DummyMigrator.init(MigratorHandler);
			DummyMigrator.start();

		break;
		// Verify migration
		case 5:
			Application.console.log("Chequeando");
			MigratorHandler.init("check", 5);
			DummyMigrator.init(MigratorHandler);
			DummyMigrator.start();
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

	var index = document.getElementById("account-list").selectedItem.value;
	var account = AccountManager.getAccounts()[index-1].object;

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

	},
	onError: function() {
		document.getElementById(this.stepName + "-status").value = "ERR";
	},
	onStop: function () {

		document.getElementById(this.stepName + "-progress").setAttribute('hidden', true);

		if (this.step < 5)
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

function showMigrationWizard() {
	window.openDialog("chrome://migrador/content/migrador-wizard.xul","showmore", "chrome", msgWindow);
}
