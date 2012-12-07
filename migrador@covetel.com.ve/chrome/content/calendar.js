Components.utils.import("resource://calendar/modules/calUtils.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

var CalendarMigrator = {
	cManager : null,
	tmpFile : null,
	inputCalendar: null,
	outputCalendar: null,
	tmpFile: null,
	init: function() {
		this.cManager =  Components.classes["@mozilla.org/calendar/manager;1"]
                     		.getService(Components.interfaces.calICalendarManager);

	},
	start: function(){
		this.removeCalendars();
		this.createCalendars();

		var inputObserver = {
			QueryInterface: XPCOMUtils.generateQI([Components.interfaces.calIObserver]),
			onStartBatch: function() {},
			onEndBatch: function () {},
			onLoad: function () {
				CalendarMigrator.exportCalendar();
			},
			onAddItem: function() {},
			onModifyItem: function() {},
			onDeleteItem: function() {},
			onError: function() {},
			onPropertyChanged: function() {},
			onPropertyDeleting: function() {}
		}

		this.inputCalendar.addObserver(inputObserver);
	},
	removeCalendars: function() {

		let calendars = this.cManager.getCalendars({});

		for (let i = 0; i < calendars.length; i++) {
	
			if(calendars[i].type == "caldav") {

				try {
					this.cManager.unregisterCalendar(calendars[i]);
					this.cManager.deleteCalendar(calendars[i]);					
				}
				catch(Exception){ dump(Exception); }
			}
		}
	},
	createCalendars: function(){

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.migration.");	

		var inputURL = prefs.getCharPref("calendar.input.url").replace("#USER", AccountManager.getUsername());
		var outputURL = prefs.getCharPref("calendar.output.url").replace("#USER", AccountManager.getUsername());

		inputURL = inputURL.replace("#DOMAIN", AccountManager.getDomain());
		outputURL = outputURL.replace("#DOMAIN", AccountManager.getDomain());		

		this.inputCalendar  = this.cManager.createCalendar("caldav", makeURL(inputURL));
		this.inputCalendar.name = "input";
		this.cManager.registerCalendar(this.inputCalendar);
		
		this.outputCalendar = this.cManager.createCalendar("caldav", makeURL(outputURL));
		this.outputCalendar.name = prefs.getCharPref("calendar.name")
		this.cManager.registerCalendar(this.outputCalendar);
	},
	exportCalendar: function(){

		var itemArray = [];
		var getListener = {
			onOperationComplete: function(aCalendar, aStatus, aOperationType, aId, aDetail)
			{
 				let exporter = Components.classes["@mozilla.org/calendar/export;1?type=ics"]
                                 		.getService(Components.interfaces.calIExporter);

				CalendarMigrator.tmpFile = FileUtils.getFile("TmpD", ["calendar.tmp"]);
				CalendarMigrator.tmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

				let outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                 		   .createInstance(Components.interfaces.nsIFileOutputStream);
				try {
					outputStream.init(CalendarMigrator.tmpFile, MODE_WRONLY | MODE_CREATE | MODE_TRUNCATE, parseInt("0664", 8), 0);
					exporter.exportToStream(outputStream, itemArray.length, itemArray, null);
					outputStream.close();

				} catch(Exception){ dump(Exception) }

				CalendarMigrator.importCalendar();
			},
			onGetResult: function(aCalendar, aStatus, aItemType, aDetail, aCount, aItems)
			{
		    		for each (let item in aItems) {
		        		itemArray.push(item);
			    	}
			}
	    	};

        	this.inputCalendar.getItems(Components.interfaces.calICalendar.ITEM_FILTER_ALL_ITEMS, 0, null, null, getListener);
	},
	importCalendar: function(){

		let importer = Components.classes["@mozilla.org/calendar/import;1?type=ics"]
                               .getService(Components.interfaces.calIImporter);

		let inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                               .createInstance(Components.interfaces.nsIFileInputStream);

		let items = [];
		
		try {

			//DEBUG
			dump("Cargando items desde el archivo\n");
			
            		inputStream.init(this.tmpFile, MODE_RDONLY, parseInt("0444", 8), {});
           	 	items = importer.importFromStream(inputStream, {});
		}
		catch(Exception) {

		} finally {
			inputStream.close();
			
			try {
				this.tmpFile.remove(false);
			} catch(ex){ dump(ex)}

			//DEBUG
			dump("Finalizado: carga desde archivo\n");

		}


	    	// Set batch for the undo/redo transaction manager
	    	startBatchTransaction();

	        // And set batch mode on the calendar, to tell the views to not
	        // redraw until all items are imported
	        this.outputCalendar.startBatch();

	        // This listener is needed to find out when the last addItem really
	        // finished. Using a counter to find the last item (which might not
	        // be the last item added)
	        var count = 0;
	        var failedCount = 0;
	        var duplicateCount = 0;
	        // Used to store the last error. Only the last error, because we don't
	        // wan't to bomb the user with thousands of error messages in case
	        // something went really wrong.
	        // (example of something very wrong: importing the same file twice.
	        //  quite easy to trigger, so we really should do this)
	        var lastError;
		var listener = {
			onOperationComplete: function(aCalendar, aStatus, aOperationType, aId, aDetail) {
			    	count++;
			    	if (!Components.isSuccessCode(aStatus)) {
			        	if (aStatus == Components.interfaces.calIErrors.DUPLICATE_ID) {
			            		duplicateCount++;
			        	} else {
			            		failedCount++;
			            		lastError = aStatus;
			        	}
			    	}
			    	// See if it is time to end the calendar's batch.
			    	if (count == items.length) {
			        	CalendarMigrator.outputCalendar.endBatch();
			        	if (!failedCount && duplicateCount) {
			            		showError(calGetString("calendar", "duplicateError", [duplicateCount, aFilePath]));
			        	} else if (failedCount) {
			            		showError(calGetString("calendar", "importItemsFailed", [failedCount, lastError.toString()]));
			        	}
			    	}
			}
		}
		
		for each (let item in items) {
			// XXX prompt when finding a duplicate.
			try {
			    CalendarMigrator.outputCalendar.addItem(item, listener);
			} catch(e) {
			    failedCount++;
			    lastError = e;
			    // Call the listener's operationComplete, to increase the
			    // counter and not miss failed items. Otherwise, endBatch might
			    // never be called.
			    listener.onOperationComplete(null, null, null, null, null);
			    Components.utils.reportError("Import error: "+e);
			}
		}

		// End transmgr batch	
		endBatchTransaction();		
	}
}
