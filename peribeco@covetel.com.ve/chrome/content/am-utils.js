function getPassword(account)
{ 
  if (account.passwordPromptRequired == false)
    return account.password;

  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                      .getService(Components.interfaces.nsIPromptService);

  var input = {value:null};
  var check = {value:false};

  // Localization of the popup title and label
  var title = "Introduzca la contraseña";
  var label = "Introduzca la contraseña";
  var result = prompts.promptPassword(window,title, label, input, null, check);

  prompts = null;

  if (result)
    return input.value;

  return null;
}

function getUsername(account)
{
        return account.realUsername;
}
