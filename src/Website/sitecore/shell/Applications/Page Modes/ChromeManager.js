if (typeof(Sitecore.PageModes) == "undefined") {
  Sitecore.PageModes = new Object();
}

Sitecore.PageModes.Capabilities = {
  design: "design",
  edit: "edit"
}

Sitecore.PageModes.ChromeManager = new function() {
  this.overChromes = new Array();      
  this._capabilities = new Array();
  this.ignoreDOMChanges = false;
  this.selectionChanged = new Sitecore.Event();
  this.onSave = new Sitecore.Event();
  
  this.load = function() {
    if (!this.editing()) {
      return;
    }
    this._fixStyles();
    
    this.initCapabilities();  
    
    this.onModeChanged = new Sitecore.Event();
    this.onWindowScroll = new Sitecore.Event();
      
    this._selectionFrame = new Sitecore.PageModes.SelectionFrame();
    this._hoverFrame = new Sitecore.PageModes.HoverFrame();
    this._moveControlFrame = new Sitecore.PageModes.MoveControlFrame();
   
    this.chromes().invoke('load');
    this.navigation = new Sitecore.PageModes.Navigation();

    this.design = new Sitecore.PageModes.DesignManager(this);

    $(document).observe("click", this.onDocumentClick.bindAsEventListener(this));
    $(document).observe("keydown", this.onKeyDown.bindAsEventListener(this));
    $(document).observe("keyup", this.onKeyUp.bindAsEventListener(this));
    if (Prototype.Browser.Gecko) {
      $(document).observe("keypress", this.onKeyPress.bindAsEventListener(this));      
    }    
  };

  this.pageLoad = function() {   
    var ribbon = this.ribbon();    
    Event.observe(ribbon.contentWindow, "resize", this.onRibbonResize.bind(this));    
    if (this.editing()) {
      Event.observe(window,"scroll", function () {this.onWindowScroll.fire(); }.bind(this));
      if (typeof(ribbon.contentWindow.scShowControls) != 'undefined' && ribbon.contentWindow.scShowControls) {
        setTimeout(Sitecore.PageModes.ChromeHighlightManager.activate.bind(Sitecore.PageModes.ChromeHighlightManager), 100);      
      }
    }
    
    Event.observe(ribbon.contentWindow.document, "keyup", this.onKeyUp.bindAsEventListener(this));
    Event.observe(ribbon.contentWindow.document, "keydown", this.onKeyDown.bindAsEventListener(this));    
  };

  Event.observe(document, "dom:loaded", this.load.bind(this));
  Event.observe(window, "load", this.pageLoad.bind(this));

  this.addFieldValue = function(fieldValueElement) {
    if (this.fieldValuesContainer == null) {
      this._createFieldValuesContainer();
    }
    
    this.fieldValuesContainer.insert(fieldValueElement); 
  };

  this.chromes = function() {
    if (!this._chromes) {
      var chromesToLoad = new Array();
      this._chromes = $$(".scPageDesignerPlaceholder, .scPageDesignerControl, .scLooseFrameZone, .scWebEditInput").collect(function(domElement) {
        // preserve existing chromes in case of reset, only create chromes for new dom elements
        var chrome = domElement.retrieve("scChrome");

        if (!chrome) {
          var type = this.getChromeType(domElement);
          chrome = new Sitecore.PageModes.Chrome(domElement, type);
          domElement.store("scChrome", chrome);

          if (this._reseted) {            
            chromesToLoad.push(chrome);            
          }
        }
                
        return chrome;

      }.bind(this));

      this._reseted = false;
      chromesToLoad.invoke("load");
      this._chromes = this._chromes.findAll(function(c) { return c /*&& c.isEnabled()*/; });
    }

    return this._chromes;
  };

  this.getChrome = function(domElement) {
    return domElement.retrieve("scChrome");
  };

  this.getChromesByType = function(chromeType) {
    return this._chromes.findAll(function(c) {
      return (c.type instanceof chromeType);
    });
  }

  this.getChromeType = function(domElement) {
    if (domElement.hasClassName("scWebEditInput")) {
      if (domElement.hasClassName("scWordContainer")) {
        return new Sitecore.PageModes.ChromeTypes.WordField();
      }

      return new Sitecore.PageModes.ChromeTypes.Field();
    }

    if (domElement.hasClassName("scLooseFrameZone")) {
      return new Sitecore.PageModes.ChromeTypes.EditFrame();
    }

    if (domElement.hasClassName("scPageDesignerPlaceholder")) {
      return new Sitecore.PageModes.ChromeTypes.Placeholder();
    }

    if (domElement.hasClassName("scPageDesignerControl")) {
      return new Sitecore.PageModes.ChromeTypes.Rendering();
    }

    console.error("Unknown chrome type:");
    console.log(domElement);

    throw ("Unknown chrome type");
  };

  this.handleMessage = function(msgName, params) {
    var msgHandler = null;
    if (this._commandSender) {
      msgHandler = this._commandSender;
    }
    else if (this.selectedChrome()) {
      msgHandler = this.selectedChrome();
    }

    if (params && params.controlId) {
      if (msgHandler == null || (msgHandler != null && msgHandler.controlId() != params.controlId)) {
        msgHandler = this.chromes().find(function(c) { return c.controlId() == params.controlId; });
      }
    }
    
    if (msgHandler != null) {
      msgHandler.handleMessage(msgName, params);
    }
  };

  this.handleCommonCommands = function (sender, msgName, params) {
    switch (msgName) {
      case "chrome:common:edititem":
        var reGuid = /(\{){0,1}[0-9A-F]{8}\-[0-9A-F]{4}\-[0-9A-F]{4}\-[0-9A-F]{4}\-[0-9A-F]{12}(\}){0,1}/i;
        var matches = reGuid.exec(sender.getContextItemUri());
        if (matches != null && matches.length > 0) {
          var itemid = matches[0];
          this.postRequest(params.command + "(id=" + itemid + ")", null, false);
        }

        break;
    }
    // throw message further in order corresponding chrome could handle it either/
    sender.handleMessage(msgName, params);
  }; 
 
  this.initCapabilities = function() {            
    var capabilities =  $("scCapabilities");
    var enabledCapabilities = [];
    if (capabilities && capabilities.value) {
      enabledCapabilities = capabilities.value.split("|");
    }
    
    for (var n in Sitecore.PageModes.Capabilities) {        
      if (enabledCapabilities.include(Sitecore.PageModes.Capabilities[n])) {
        this._capabilities.push(Sitecore.PageModes.Capabilities[n]);
      }
    }    
  };

  //Defindes the if ribbon has fixed position (when it is NOT PLACED in a custom placeholder)
  this.isRibbonFixed = function() {
    var ribbon = this.ribbon();
    return (ribbon != null && ribbon.hasClassName("scFixedRibbon"));
  }; 
  
  this.editing = function() {
    return Sitecore.WebEditSettings.editing;
  };

  this.hideSelection = function() {
    if (this._selectedChrome) {
      this._selectedChrome.hideSelection();
      this._selectedChrome = null;
      this.selectionFrame().hide();
    }
  };

  this.hoverActive = function() {
    return !this.design.sorting;
  };

  this.hoverFrame = function() {
    return this._hoverFrame;
  };

  this.moveControlFrame = function() {
    return this._moveControlFrame;
  };

  this.onDocumentClick = function(e) {    
    //e.stop();

    this.select(null);
  };
  
  this.onKeyDown = function(e) {     
    //Escape    
    if (e.keyCode == 27) {
      this.hideSelection();
      return;      
    }

    //Ctrl+S
    if (e.keyCode == 83 && e.ctrlKey) {      
      if (e.preventDefault) {
        e.preventDefault();  
      }
     
      this.save();
      return;
    }

    if (e.keyCode == 17 && !this.ctrlPressed) {
      this.ctrlPressed = true;
      this.hoverFrame().deactivate();
      this.selectionFrame().deactivate();
    }
  };

  this.onKeyUp = function(e) {
    if (e.keyCode == 17) {
      this.ctrlPressed = false;
      this.hoverFrame().activate();
      this.selectionFrame().activate();
    }
    
    if (this.design) {
      this.design.onKeyUp(e);
    } 
  };

  this.onKeyPress = function(e) {         
    // Preventing FF from showing standard "Save as" dialog when clicking <Ctrl>+<S>   
    if (e.ctrlKey && String.fromCharCode(e.which).toLowerCase() == "s") {          
      e.preventDefault();
    }
  };

  this.onMouseOver = function(chrome) {
    if (!this.hoverActive()) {
      return;
    }

    this.overChromes.push(chrome);

    this.updateHoverChrome();
  };

  this.onMouseOut = function(chrome) {
    this.overChromes = this.overChromes.without(chrome);

    this.updateHoverChrome();
  };
  //Note: ribbon resize also occurs when the whole window is resized (except if only window's height is changed)
  this.onRibbonResize = function() {            
    if ( !this.editing()) {
      return;
    }
    
    this.resetSelectionFrame();   
    Sitecore.PageModes.ChromeHighlightManager.planUpdate();
  };

  this.panel = function() {
    return $(this.ribbon().contentWindow.document.getElementById("ChromePanel"));
  };
  
  this.postRequest = function(request, callback, async) {
    var ribbon = this.ribbon();

    if (ribbon == null) {
      return;
    }

    isAsync = (typeof (async) == 'undefined') ? true : async;
    ribbon.contentWindow.scForm.postRequest("", "", "", request, callback, isAsync);
  };

  this.ribbon = function() {
    return $("scWebEditRibbon");
  };

  this.resetChromes = function() {   
    this.chromes().invoke('reset');

    this._chromes = null;
    this._reseted = true;

    // force init of new chromes to attach event handlers
    this.chromes();
    Sitecore.PageModes.ChromeHighlightManager.planUpdate();
  };

  this.resetSelectionFrame = function () {
    var selectionFrame = this.selectionFrame();
    if (!selectionFrame) {
      return;
    }

    var selectedChrome = this.selectedChrome();    
    if (selectedChrome) {
      this.hideSelection();
      this.select(selectedChrome);
    }
  };

  this.save = function(postaction) {
    //Content editable element is active, thus it's onBlur event might not happen yet. Force persist field value. 
    if (this._selectedChrome != null && this._selectedChrome.type.key() == "field" && this._selectedChrome.type.contentEditable()) {
      this._selectedChrome.type.persistValue();
    }

    var command = 'webedit:save';
    if (postaction) {
      command += "(postaction=" + postaction + ")";
    }

    this.onSave.fire(null);
    this.postRequest(command, null, false);
  };

  this.select = function(chrome) {
    if (!chrome) {
      this.hideSelection();            
      this.selectionChanged.fire(null);

      return;
    }

    this.selectionChanged.fire(chrome);

    if (this._selectedChrome == chrome) {
      this.selectionFrame().show(chrome);
      return;
    }

    if (this._selectedChrome && this._selectedChrome != chrome) {
      this._selectedChrome.hideSelection();
    }

    this._selectedChrome = chrome;
    chrome.showSelection();

    this.selectionFrame().show(chrome);    
  };

  this.selectedChrome = function() {
    return this._selectedChrome;
  };

  this.selectionFrame = function() {
    return this._selectionFrame;
  };

  this.setModified = function(value) {   
    this.modified = value;
    var ribbon = this.ribbon();
    if (ribbon == null) {
      return;
    }

    ribbon.contentWindow.scForm.setModified(value);
  };

  this.isModified = function() {
    var ribbon = this.ribbon();
    if (ribbon == null) {
      return this.modified;
    }

    return ribbon.contentWindow.scForm.modified;
  };

  this.setCommandSender = function(chrome) {
    this._commandSender = chrome;
  };

  this.showControlsChange = function (enabled) {
    if (!this.editing()) {
        return;
    }

    if (!enabled) {
      Sitecore.PageModes.ChromeHighlightManager.deactivate();
    }
    else {
      Sitecore.PageModes.ChromeHighlightManager.activate();
    } 
  };

  this.getCapabilities = function() {
    return this._capabilities;
  };

  this.capabilityChange = function(capability, enabled) {
    if (!this.editing()) {
        return;
    }
        
    if (!enabled) {         
      this._capabilities = this._capabilities.without(capability);
    }
    else {      
      this._capabilities.push(capability);
    } 
        
    var selectedChrome =  this.selectedChrome();
    this.hideSelection();    
    this.resetChromes();
    this.chromes().invoke("reload");
    if (selectedChrome && selectedChrome.isEnabled()) {
       this.select(selectedChrome);        
    }

    this.onModeChanged.fire();
  };

  this.updateHoverChrome = function() {
    this.overChromes = this.overChromes.uniq();

    var level = 0;
    var deepestChrome = null;

    this.overChromes.each(function(chrome) {
      if (chrome.level() > level) {
        level = chrome.level();
        deepestChrome = chrome;
      }
    });

    if (this._hoverChrome && this._hoverChrome != deepestChrome) {
      this._hoverChrome.hideHover();
    }

    if (deepestChrome) {
      this._hoverChrome = deepestChrome;
      deepestChrome.showHover();
    }
  };

  this.updateChromeDimensions = function() {    
    if (this._selectedChrome) {     
        this._selectedChrome.position.reset(this._selectedChrome.type.layoutRoot());      
    }
  };

  this._createFieldValuesContainer = function() {
    var fieldValuesContainer = new Element("div", { id: "scFieldValues" });
    $(document.body).insert({ top: fieldValuesContainer });
    this.fieldValuesContainer = fieldValuesContainer;
  };
  
  this._fixStyles = function() {
    // When floating elements appear inside a container we should enclose the floating to calculate the dimenstions of container. 
    var cssRule = ".scPageDesignerControl:after, .scLooseFrameZone:after {" +
                  "content: url('sitecore/images/fake_img.jpg');" + //hack. The image file doesn't exist
                  "height: 0;" +
                  "display: block;" +                      
                  "clear: both;" +
                  "visibility: hidden;" +
                  " }";
    
    if (!Sitecore.PageModes.Utility.isNoStandardsIE()) {
      Sitecore.PageModes.Utility.addStyleSheet(cssRule);
      if (!Prototype.Browser.IE) {
        // min-height and min-width are added to prevent browser form setting height and with of contenteditable elements to 0 when they have no content.        
        Sitecore.PageModes.Utility.addStyleSheet("body .scWebEditInput { display: inline-block;}\r\n.scWebEditInput[contenteditable=\"true\"] { min-height: 1em;min-width: 0.5em;}");
      }       
    }                   
  };

  this._getFieldValueContainer = function(itemUri, fieldID) {
    var id = "fld_" + itemUri.id + "_" + fieldID + "_" + itemUri.language + "_" + itemUri.version;

    var result = $A(this.fieldValuesContainer.childNodes).find(function(input) {
      return input.id.startsWith(id);
    });

    return result;
  };

  this.getFieldValue = function(itemUri, fieldID) {
    var container = this._getFieldValueContainer(itemUri, fieldID);

    if (!container) {
      return null;
    }

    return container.getAttribute("value");
  };

  this.setFieldValue = function(itemUri, fieldID, value) {    
    value = value.gsub("-,scDQuote,-", "\"");
    value = value.gsub("-,scSQuote,-", "'");

    var container = this._getFieldValueContainer(itemUri, fieldID, value);

    if (!container) {
      var revision = itemUri.revision || "#!#Ignore revision#!#";

      var id = "fld_" + itemUri.id + "_" + fieldID + "_" + itemUri.language + "_" + itemUri.version + "_" + revision + "_999";

      container = new Element("input", { name: id, id: id, type: "hidden", value: "" });
      this.fieldValuesContainer.insert(container);
    }

    if (container.getAttribute("value") != value) {
      container.setAttribute("value", value);
      this.setModified(true);
      if (this.selectedChrome() && this.selectedChrome().type instanceof Sitecore.PageModes.ChromeTypes.EditFrame) {
        this.selectedChrome().type.fieldsChangedDuringFrameUpdate = true;
      }
    }

    var dependingElements = this.getChromesByType(Sitecore.PageModes.ChromeTypes.Field).findAll(function(chrome) { return chrome.type.fieldValue == container; });
    dependingElements.each(function(chrome) { chrome.type.refreshValue(); });
  };   
}