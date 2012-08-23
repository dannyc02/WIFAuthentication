if (typeof(Sitecore.PageModes) == "undefined") Sitecore.PageModes = new Object();

Sitecore.PageModes.Utility = new function() {
  this.isIE =  Prototype.Browser.IE;
       
  //Defines if browser is IE in non-standards mode (standards mode:IE 8 standards mode and higher)
  this.isNoStandardsIE = function() {
    return Prototype.Browser.IE && (!document.documentMode || document.documentMode < 8);
  };
  
  this.addStyleSheet = function(cssRule) {
    var el= document.createElement("style");
    el.type= "text/css";        
    if(el.styleSheet) { 
      el.styleSheet.cssText= cssRule;
    }
    else { 
      el.appendChild(document.createTextNode(cssRule));
    }

    return document.getElementsByTagName("head")[0].appendChild(el);
  };

  this.areEqualPlaceholders = function(lhsPlaceholderKey, rhsPlaceholderKey) {
    if (lhsPlaceholderKey == null || rhsPlaceholderKey == null)
      {
        return lhsPlaceholderKey == rhsPlaceholderKey;
      }

      var lhsSlashIndex = lhsPlaceholderKey.lastIndexOf('/');
      var rhsSlashIndex = rhsPlaceholderKey.lastIndexOf('/');
      if (lhsSlashIndex >= 0 && rhsSlashIndex >=0)
      {
        return lhsPlaceholderKey == rhsPlaceholderKey;
      }

      var lhsShortKey = (lhsSlashIndex >= 0) ? lhsPlaceholderKey.substr(lhsSlashIndex + 1) : lhsPlaceholderKey;
      var rhsShortKey = (rhsSlashIndex >= 0) ? rhsPlaceholderKey.substr(rhsSlashIndex + 1) : rhsPlaceholderKey;
      return lhsShortKey == rhsShortKey;
  };

  this.getCookie = function(name) {
    name = name + "=";
    var i = 0;
    while(i < document.cookie.length) {
      var j = i + name.length;
      if(document.cookie.substring(i, j) == name) {
        var n = document.cookie.indexOf(";", j);
        if(n == -1) {
          n = document.cookie.length;
        }

        return unescape(document.cookie.substring(j, n));
      }

      i = document.cookie.indexOf(" ", i) + 1;
      if(i == 0) {
        break;
      }
    }

    return null;
  };

  this.parseCommandClick = function(commandClick) {
    var msg = commandClick;
    var commandParams = null;
    var idx1 = commandClick.indexOf("(");
    var idx2 = commandClick.indexOf(")");
    if (idx1 >= 0 && idx2 > idx1) {
      msg = commandClick.substring(0, idx1);
      try {
        commandParams = commandClick.substring(idx1 + 1, idx2).evalJSON();
      }
      catch (e) {
        console.error("Cannot parse command parameters");
      }
    }

    return { message: msg, params : commandParams};
  };

  this.setCookie = function(name, value, expires, path, domain, secure) {
    if (expires == null) {
      expires = new Date();
      expires.setMonth(expires.getMonth() + 3);
    }
    
    if (path == null) {
      path = "/";
    }

    document.cookie = name + "=" + escape(value) +
      (expires ? "; expires=" + expires.toGMTString() : "") +
      (path ? "; path=" + path : "") +
      (domain ? "; domain=" + domain : "") +
      (secure ? "; secure" : "");
  };    
}

