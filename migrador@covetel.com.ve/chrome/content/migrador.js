
function migrateAddressBook() {

	AccountManager.init();

	ABookMigrator.init();
	ABookMigrator.start();


}
