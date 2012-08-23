Sitecore.PageModes.ChromeTypes.EditFrame = Class.create(Sitecore.PageModes.ChromeTypes.ChromeType, {
  initialize: function($super) {
    $super();
    this._editFrameUpdating = false;
    this.fieldsChangedDuringFrameUpdate = false;
  },

  frameColor: function() {
    return '#13ADA8';
  },

  frameLook: function() {
    return 'corner';
  },

  handleMessage: function(message, params) {
    switch (message) {
      case "chrome:editframe:updatestart":
        this.updateStart();
        break;
      case "chrome:editframe:updateend":
        this.updateEnd();
        break;
    }
  },

  isEnabled: function($super) {
    return Sitecore.PageModes.ChromeManager.getCapabilities().indexOf(Sitecore.PageModes.Capabilities.edit) > -1 && $super();
  },

  key: function() {
    return "editframe";
  },

  load: function() {
    this.appendClearingElement();
  },

  updateStart: function() {  
    this._editFrameUpdating = true;
    this.fieldsChangedDuringFrameUpdate = false;    
  },

  updateEnd: function() {
    if (this.fieldsChangedDuringFrameUpdate) {
      this.chrome.element.addClassName("scWebEditFrameModified");      
    }

    this._editFrameUpdating = false;
    this.fieldsChangedDuringFrameUpdate = false;
  }
});