// Dummy handler, simulates the progress in the UI
var DummyMigrator = {
	eventHandler: null,
	init: function(handler) {
		this.eventHandler = handler;	
	},
	start: function() {
		this.eventHandler.onStart();
		setTimeout(function () {
			//(!! Math.round(Math.random() * 1))? DummyMigrator.eventHandler.onSuccess() : DummyMigrator.eventHandler.onError();
			DummyMigrator.eventHandler.onSuccess();
			DummyMigrator.eventHandler.onStop(); 
		}, Math.floor(Math.random() * 5000));
	}
}
