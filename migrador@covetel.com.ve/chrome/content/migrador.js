
function migrateAddressBook() {

	AccountManager.init();

	// AddressBook migration
	/*ABookMigrator.init();
	ABookMigrator.start();*/

	
	//exportEntireCalendar();
	CalendarMigrator.init();
	CalendarMigrator.start();


}
