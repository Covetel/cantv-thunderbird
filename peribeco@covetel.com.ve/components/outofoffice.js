const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;


//class constructor
function OutOfOfficeAccountManagerExtension() {};

// class definition
OutOfOfficeAccountManagerExtension.prototype = 
{
  classID : Components.ID("{06a487a9-4e76-439f-bb04-0a9d9999857e}"),
  contactID : "@mozilla.org/accountmanager/extension;1?name=outofoffice",
  classDescription: "OutOfOffice Account Manager Extension",
  
  name : "outofoffice",  
  chromePackageName : "peribeco",
  showPanel: function(server) 
  {
    if (server.type == "imap")
      return true;
      
    if (server.type == "pop3")
      return true;
      
    return false;
  },

  QueryInterface: function(aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIMsgAccountManagerExtension) 
      && !aIID.equals(Components.interfaces.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

// ************************************************************************** //

/***********************************************************
class factory

This object is a member of the global-scope Components.classes.


* @deprecated since Gecko 2.0 
*/
var OutOfOfficeAccountManagerExtensionFactory = 
{
  createInstance : function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
      
    return (new OutOfOfficeAccountManagerExtension()).QueryInterface(aIID);
  }
}

/**
 * module definition (xpcom registration)
 *
 * @deprecated since Gecko 2.0 
 */
var OutOfOfficeAccountManagerExtensionModule = 
{
  registerSelf: function(compMgr, fileSpec, location, type)
  {
    compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(
        OutOfOfficeAccountManagerExtension.prototype.classID, 
        OutOfOfficeAccountManagerExtension.prototype.classDescription,
        OutOfOfficeAccountManagerExtension.prototype.contactID,
        fileSpec, location, type);
        
    var catMgr = Components.classes["@mozilla.org/categorymanager;1"]
                     .getService(Ci.nsICategoryManager);
               
    catMgr.addCategoryEntry(
        "mailnews-accountmanager-extensions",
        OutOfOfficeAccountManagerExtension.prototype.classDescription,
        OutOfOfficeAccountManagerExtension.prototype.contactID,
        true, true);    
  },

  unregisterSelf: function(compMgr, location, type)
  {
    compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(
        OutOfOfficeAccountManagerExtension.prototype.classID, location);
    
    var catMgr = Components.classes["@mozilla.org/categorymanager;1"]
                     .getService(Ci.nsICategoryManager);
    catMgr.deleteCategoryEntry(
        "mailnews-accountmanager-extensions",
        OutOfOfficeAccountManagerExtension.prototype.contactID, true);    
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Ci.nsIFactory))
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(OutOfOfficeAccountManagerExtension.prototype.classID))
      return OutOfOfficeAccountManagerExtensionFactory;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

/***********************************************************
module initialization

When the application registers the component, this function
is called.
***********************************************************/

try
{
  Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
}
catch (e) { }

// Gecko 2.x uses NSGetFactory to register XPCOM Components...
// ... while Gecko 1.x uses NSGetModule


if ((typeof(XPCOMUtils) != "undefined") && (typeof(XPCOMUtils.generateNSGetFactory) != "undefined"))
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([OutOfOfficeAccountManagerExtension]);
else
  var NSGetModule = function(compMgr, fileSpec) { return OutOfOfficeAccountManagerExtensionModule; }
