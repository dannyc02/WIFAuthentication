Sitecore.PageModes.ChromeTypes.Placeholder = Class.create(Sitecore.PageModes.ChromeTypes.ChromeType, {
  addControl: function(position) {
    this._insertPosition = position;

    var ribbon = Sitecore.PageModes.ChromeManager.ribbon();

    ribbon.contentWindow.$("scLayoutDefinition").value = $F("scLayout");        
    Sitecore.PageModes.ChromeManager.postRequest("webedit:addrendering(placeholder=" + this.placeholderKey() + ")");
  },
  
  addControlResponse: function(id, openProperties, ds) {                       
    var body = "command=" + escape("insert") +
      "&rendering=" + escape(id) +
      "&itemid=" + escape($F("scItemID")) +
      "&language=" + escape($F("scLanguage")) +
      "&placeholderKey=" + escape(this.placeholderKey()) +
      "&deviceid=" + escape($F("scDeviceID")) +
      "&layout=" + escape($F("scLayout")) +
      "&siteName=" + escape($F("scSite")) +
      "&position=" + escape(this._insertPosition) +
      "&url=" + escape(window.location.href);
    
    if (ds) {
      body += "&datasource=" + escape(ds);
    }
              
    new Ajax.Request("/sitecore/shell/Applications/WebEdit/Palette.aspx", {
      method: "post",
      postBody: body,
      onSuccess: function(transport) {               
        var data = eval('(' + transport.responseText + ')');
        var persistedLayout;
        if (data.layout) {
          var layoutCtrl = $("scLayout");
          persistedLayout = layoutCtrl.value;
          layoutCtrl.value = data.layout;          
        }

        if (data.url != null) {          
          this._loadRenderingFromUrl(data.url, function(callbackData) {
            if (callbackData.error == null) {              
              var wrapper = Element.wrap(callbackData.renderingElement, "span");
              data.html = wrapper.innerHTML;              
              Sitecore.PageModes.ChromeManager.select(null);
              this.insertRendering(data, openProperties);
            }
            else {
              if (persistedLayout) {
                $("scLayout").value = persistedLayout;
              }

              alert(callbackData.error);
            } 
          });                   
        }
        else {
          Sitecore.PageModes.ChromeManager.select(null);
          this.insertRendering(data, openProperties);
        }
      }.bind(this),
      onException: function(request, ex) { 
        throw ex;         
      },
      onFailure: function(request) { alert(Sitecore.PageModes.Texts.ErrorOcurred); }
    });
  },
  
  deleteControl: function(chrome) {
    Sitecore.LayoutDefinition.remove(chrome.type.uniqueId());    
    Sitecore.PageModes.ChromeManager.select(null);
    Sitecore.PageModes.ChromeHighlightManager.stop();         
    chrome.element.fade({ 
      duration: 0.2,
      afterFinish: function() {
        this._removeChrome(chrome);                      
        if (this.chrome.children().length == 0) {
          this.showEmptyLook();
        }

        Sitecore.PageModes.ChromeHighlightManager.resume();         
      }.bind(this) 
    });
  },
  
  editProperties: function(chrome) {
    var ribbon = Sitecore.PageModes.ChromeManager.ribbon();

    if (ribbon == null) {
      return;
    }
    
    ribbon.contentWindow.$("scLayoutDefinition").value = $F("scLayout");
        
    Sitecore.PageModes.ChromeManager.postRequest("webedit:editrenderingproperties(uniqueid=" + chrome.type.uniqueId() + ")");
  },
  
  editPropertiesResponse: function(renderingChrome) {
    if (!this.readLayoutFromRibbon()) {
      return;
    }
           
    var body = "command=" + escape("preview") +
      "&renderingUniqueId=" + escape(renderingChrome.type.uniqueId()) +
      "&itemid=" + escape($F("scItemID")) +
      "&language=" + escape($F("scLanguage")) +
      "&layout=" + escape($F("scLayout")) +
      "&deviceid=" + escape($F("scDeviceID")) +
      "&siteName=" + escape($F("scSite")) +
      "&url=" + escape(window.location.href);

    var placeholder = this;

    new Ajax.Request("/sitecore/shell/Applications/WebEdit/Palette.aspx", {
      method: "post",
      postBody: body,
      onSuccess: function(transport) {       
        var data = eval('(' + transport.responseText + ')');
        Sitecore.PageModes.ChromeHighlightManager.stop();         
        Sitecore.PageModes.ChromeManager.setModified(true);
        //Inner chrome's content will be replaced. Call on delete to delete possible highlight frames.
        renderingChrome.onDelete(); 
        if (data.url != null) {          
           this._loadRenderingFromUrl(data.url, function(callbackData) {
              if (callbackData.error == null) {
                Sitecore.PageModes.ChromeManager.select(null);
                renderingChrome.type.update(callbackData.renderingElement.innerHTML);
                Sitecore.PageModes.ChromeManager.resetChromes();
              }
              else {
                console.log(callbackData.error);
              }
            }
           ); 
        }
        else {
          Sitecore.PageModes.ChromeManager.select(null);
          renderingChrome.type.update(data.html.gsub(",-scQuot,-", "'"));
          Sitecore.PageModes.ChromeManager.resetChromes();
        }

       var chrome = this._getChildRenderingByUid(renderingChrome.type.uniqueId());
       if (chrome) {
        setTimeout(function() {           
            Sitecore.PageModes.ChromeHighlightManager.resume();
            Sitecore.PageModes.ChromeManager.select(chrome);          
          }, 100);
       }
       else {
         Sitecore.PageModes.ChromeHighlightManager.resume();
       }
                
      }.bind(this),
      onException: function(request, ex) { 
        throw ex;
      },
      onFailure: function(request) { alert(Sitecore.PageModes.Texts.ErrorOcurred); }
    });
  },

  editPlaceholderSettings: function() {
    var ribbon = Sitecore.PageModes.ChromeManager.ribbon();
    if (ribbon == null) {
      return;
    }
        
    ribbon.contentWindow.$("scLayoutDefinition").value = $F("scLayout");
    if (Sitecore.PageModes.ChromeManager.isModified()) {
      if (confirm( Sitecore.PageModes.Texts.ThereAreUnsavedChanges)) {
        Sitecore.PageModes.ChromeManager.postRequest("webedit:editplaceholdersettings(key=" + this.placeholderKey() + ")");
      }
    }
    else {        
      Sitecore.PageModes.ChromeManager.postRequest("webedit:editplaceholdersettings(key=" + this.placeholderKey() + ")");
    }
  },
  
  initialize: function($super) {
    $super();
  },
  
  insertRendering: function(data, openProperties) {    
    var placeholder = this.chrome;
           
    if (this.emptyLook()) {
      this.hideEmptyLook();
    }

    Sitecore.PageModes.ChromeHighlightManager.stop();
    var outer = new Element("div");
    outer.innerHTML = data.html.gsub(",-scQuot,-", "'");    
    var newElement = outer.down();
    newElement.setOpacity(0.0);

    var position = this._insertPosition;
    this._insertPosition = null;

    var childRenderings = this.chrome.children().findAll(function(child) { return child.type.key() == "rendering" });

    if (position == 0) {
      placeholder.element.insert({ top: newElement });
    }
    if (position < childRenderings.length) {
      var rendering = childRenderings[position];
      rendering.element.insert({ before: newElement });
    }
    else {
      placeholder.element.insert({ bottom: newElement });
    }

    Sitecore.PageModes.ChromeManager.resetChromes();
        
    var newRenderingUniqueId = newElement.id.substring(2);
    var newRenderingChrome = this._getChildRenderingByUid(newRenderingUniqueId);

    if (!newRenderingChrome) {
      console.error("Cannot find rendering chrome with unique id: " + newRenderingUniqueId);
      Sitecore.PageModes.ChromeHighlightManager.resume();
      return;
    }

    Sitecore.PageModes.ChromeManager.setModified(true);
   
    newElement.appear(
    { duration: 0.5, 
      afterFinish: function() {        
        if (!openProperties) {
          Sitecore.PageModes.ChromeManager.select(newRenderingChrome);
          Sitecore.PageModes.ChromeHighlightManager.resume();
        }        
      }    
    });
                            
    if (openProperties) {
      Sitecore.PageModes.ChromeManager.setCommandSender(newRenderingChrome);                        
      this.editProperties(newRenderingChrome);            
    }      
  },

  insertRenderingAt: function(control, position) { 
    Sitecore.PageModes.ChromeManager.ignoreDOMChanges = true;
    control.element.hide();
    var originalPlaceholder = control.type.getPlaceholder();
    if (this.emptyLook()) {
      this.hideEmptyLook();
    }

    Sitecore.PageModes.ChromeHighlightManager.stop();         

    if (this.chrome.children().length == 0) {
      this.chrome.element.insert({ bottom: control.element });
    }
    else {
      var renderings = this.chrome.children().findAll(function(chrome) { return chrome.type.key() == "rendering"; });
      
      if (position < renderings.length) {    
        var rendering = renderings[position];
        rendering.element.insert({ before: control.element });
      }
      else {
        var rendering = renderings[position - 1];
        rendering.element.insert({ after: control.element});
      }
    }
    
    
    control._placeholder = this;
    control.element.appear({ duration: 0.5 });

    var wordFields = control.descendants().findAll(function(chrome) { return chrome.type.key() == "word field"; });

    setTimeout(function() { 
      Sitecore.PageModes.ChromeManager.resetChromes();
      if (originalPlaceholder) {
        originalPlaceholder.type.reload();
      }

      Sitecore.PageModes.ChromeHighlightManager.resume();
      wordFields.each(function (wf) {wf.type.initWord();}); 
      Sitecore.PageModes.ChromeManager.select(control);
      Sitecore.PageModes.ChromeManager.ignoreDOMChanges = false;     
    }, 100);
  },

  isEnabled: function($super) {
    return Sitecore.PageModes.ChromeManager.getCapabilities().indexOf(Sitecore.PageModes.Capabilities.design) > -1 && $super();
  },
  
  emptyLook: function() {
    return this.chrome.element.hasClassName("scEmptyPlaceholder");
  },
  
  fullKey: function() {
  },
    
  frameColor: function() {
    return '#2FA024';
  },
  
  frameLook: function() {
    return "solid";
  },

  getContextItemUri: function() {
    return "";
  },
  
  handleMessage: function(message, params) {
    if (message == "chrome:placeholder:addControl") {
      this.addControl();
      return;
    }

    if (message == "chrome:placeholder:editSettings") {
      this.editPlaceholderSettings();
      return;
    }

    if (message == "chrome:placeholder:controladded") {
      this.addControlResponse(params.id, params.openProperties, params.dataSource);
      return;
    }
  },
  
  hideEmptyLook: function() {
    this.chrome.element.removeClassName("scEmptyPlaceholder");
  },
    
  key: function() {
    return "placeholder";
  },
  
  layoutRoot: function() {
    return this.chrome.element;
  },
  
  load: function() {
    if (this.chrome.children().length == 0 && this.isEnabled()) {
      this.showEmptyLook();
    }

    var addCommand = this.chrome.commands().find(function(command) { return command.click.include("chrome:placeholder:addControl"); });
    if (addCommand) {
      this._insertionEnabled = true;
      addCommand.hidden = true;
    }
  },

  morphRenderings: function(chrome, morphingRenderingsIds) {
    var ribbon = Sitecore.PageModes.ChromeManager.ribbon();

    ribbon.contentWindow.$("scLayoutDefinition").value = $F("scLayout");    
    this._insertPosition = chrome.type.positionInPlaceholder();    
    Sitecore.PageModes.ChromeManager.postRequest("webedit:addrendering(placeholder=" + this.placeholderKey() + ",renderingIds=" + morphingRenderingsIds.join('|') +")");
  },

  morphRenderingsResponse: function(renderingChrome, id, openProperties) {            
    if (id == "") {
      return;
    }
           
    var body = "command=" + escape("morph") +
      "&morphedRenderingUid=" + escape(renderingChrome.type.uniqueId()) +
      "&rendering=" + escape(id) +
      "&itemid=" + escape($F("scItemID")) +
      "&language=" + escape($F("scLanguage")) +
      "&placeholderKey=" + escape(this.placeholderKey()) +
      "&deviceid=" + escape($F("scDeviceID")) +
      "&layout=" + escape($F("scLayout")) +
      "&siteName=" + escape($F("scSite")) +      
      "&url=" + escape(window.location.href);
    
    new Ajax.Request("/sitecore/shell/Applications/WebEdit/Palette.aspx", {
      method: "post",
      postBody: body,
      onSuccess: function(transport) {       
        var data = eval('(' + transport.responseText + ')');
        var persistedLayout;
        if (data.layout) {
          var layoutCtrl = $("scLayout");
          persistedLayout = layoutCtrl.value;
          layoutCtrl.value = data.layout;  
        }
        
        Sitecore.PageModes.ChromeManager.hideSelection();
        
        if (data.url != null) {          
          this._loadRenderingFromUrl(data.url, function(callbackData) {
            if (callbackData.error == null) {              
              var wrapper = Element.wrap(callbackData.renderingElement, "span");
              data.html = wrapper.innerHTML;
              
              this._removeChrome(renderingChrome);                                          
              this.insertRendering(data, openProperties);
            }
            else {
              if (persistedLayout) {
                $("scLayout").value = persistedLayout;
              }

              alert(callbackData.error);
            } 
          });                   
        }
        else {
          this._removeChrome(renderingChrome);          
          this.insertRendering(data, openProperties);
        }
      }.bind(this),
      onException: function(request, ex) { 
        throw ex;         
      },
      onFailure: function(request) { alert(Sitecore.PageModes.Texts.ErrorOcurred); }
    });
  },

  onShow: function() {
    if (this._insertionEnabled) {
      this.inserter = new Sitecore.PageModes.ChromeTypes.PlaceholderInsertion(this.chrome);
      this.inserter.activate();
    }
  },

  onHide: function() {
    if (this.inserter) {
      this.inserter.deactivate();
      this.inserter = null;
    }
  },
  
  readLayoutFromRibbon: function() {
    var layout = Sitecore.PageModes.ChromeManager.ribbon().contentWindow.$("scLayoutDefinition").value;
    
    if (layout && layout.length > 0) {
      $("scLayout").value = Sitecore.PageModes.ChromeManager.ribbon().contentWindow.$("scLayoutDefinition").value;
      return true;
    }

    return false;
  },
  
  placeholderKey: function() {
    return this.chrome.element.getAttribute("key");
  },
  
  removeChrome: function(chrome) {
    chrome.element.remove();
  },

  renderingAllowed: function(renderingId) {
    var allowedRenderings = this.chrome.data.custom.allowedRenderings;
    return allowedRenderings.length == 0 || allowedRenderings.include(renderingId);
  },

  reload: function() {
    if (this.chrome.children().length == 0) {
      if ( this.isEnabled()) {
        this.showEmptyLook();
      }
      else {
        this.hideEmptyLook();
      }
    }
  },
  
  sortingStart: function(rendering) {
    if (!this.renderingAllowed(rendering.type.renderingId())) {
      return;
    }
  
    this.sorter = new Sitecore.PageModes.ChromeTypes.PlaceholderSorting(this.chrome, rendering);
    this.sorter.activate(); 
  },
  
  sortingEnd: function() {
    if (!this.sorter) {      
      return;
    }
    
    this.sorter.deactivate();
    this.sorter = null;
  },
  
  showEmptyLook: function() {
    if (this.emptyLook()) {
      return;
    }
    
    this.chrome.element.addClassName("scEmptyPlaceholder");
    this.chrome.position.reset();
  },

  _getChildRenderingByUid: function(uid) {
    return this.chrome.children().find(function(child) { 
              return child.type.key() == "rendering" && child.type.uniqueId() == uid; 
            });
  },

  _loadRenderingFromUrl: function(url, callback) {    
     this._loadingFrame = new Element("iframe", {id:"loadingFrame", height:"0px", width:"0px", src: url });
     this._frameLoadedCallback = callback;
     this._loadingFrame.observe("load",this._frameLoaded.bindAsEventListener(this));
     $(document.body).insert(this._loadingFrame);
  },

  _frameLoaded: function() {
    if (this._loadingFrame == null) {
      console.error("cannot load data from frame. Frame isn't defined");
      return;    
    }

    var renderingUniqueId = this._loadingFrame.contentWindow.location.href.toQueryParams()["sc_ruid"];
    var doc = this._loadingFrame.contentDocument || this._loadingFrame.contentWindow.document;
    var renderingDomElement = doc.getElementById("r_"+renderingUniqueId);
    var callbackData = new Object();   
    if (renderingDomElement != null) {      
      callbackData.renderingElement = renderingDomElement;
    }
    else
    {
      if ( this._loadingFrame.contentWindow.location.href.toLowerCase().indexOf("pagedesignererror.aspx") > -1 ) {     
        callbackData.error = Sitecore.PageModes.Texts.SublayoutWasInsertedIntoItself;
      }
      else {
        callbackData.error = Sitecore.PageModes.Texts.ErrorOcurred;
      }
    }
   
    if (this._frameLoadedCallback != null) {
      this._frameLoadedCallback(callbackData);
      this._frameLoadedCallback = null;
    }

    this._loadingFrame.remove();
    this._loadingFrame = null;
  },
  
  _removeChrome: function(chrome) {
    if (chrome == null) return;
    chrome.onDelete();
    chrome.element.remove();
    Sitecore.PageModes.ChromeManager.resetChromes();
  } 
});