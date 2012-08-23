Sitecore.PageModes.ChromeTypes.Rendering = Class.create(Sitecore.PageModes.ChromeTypes.ChromeType, {
  initialize: function($super) {
    $super();
  },
  
  deleteControl: function() {
    var placeholder = this.getPlaceholder();
    
    if (placeholder) {
      placeholder.type.deleteControl(this.chrome);
    }
  },
  
  editProperties: function() {
    var placeholder = this.getPlaceholder();
    
    if (placeholder) {
      placeholder.type.editProperties(this.chrome);
    }
  },

  editPropertiesCompleted: function() {
    var placeholder = this.getPlaceholder();
    
    if (placeholder) {
      placeholder.type.editPropertiesResponse(this.chrome);
    }
  },
  
  getControl: function(placeholder) {
    var element = this.chrome.element;
    
    return placeholder.controls().find(function(c) {
      return c.element == element;
    });
  },
  
  getPlaceholder: function() {
    var domNode = this.chrome.element.up(".scPageDesignerPlaceholder");
    if (!domNode) {
      console.error("cannot find parent placeholder dom node");
      return;
    }
    
    var placeholderChrome = Sitecore.PageModes.ChromeManager.getChrome(domNode);
    if (!placeholderChrome) {
      console.error("cannot find parent placeholder chrome");
      return;
    }
    
    return placeholderChrome;
  },
  
  frameColor: function() {
    return '#24249E';
  },
  
  frameLook: function() {
    return "corner";
  },
  
  handleMessage: function(message, params) {
    switch (message) {
      case "chrome:rendering:sort":
        this.sort();
        break;
      case "chrome:rendering:properties":
        this.editProperties();
        break;
      case "chrome:rendering:propertiescompleted":
        this.editPropertiesCompleted();
        break;
      case "chrome:rendering:delete": 
        this.deleteControl();
        break;
      case "chrome:rendering:morph":
        this.morph(params);
        break;
      case "chrome:rendering:morphcompleted":
        this.morphCompleted(params.id, params.openProperties);
        break;        
    }
  },

  isEnabled: function($super) {
    return Sitecore.PageModes.ChromeManager.getCapabilities().indexOf(Sitecore.PageModes.Capabilities.design) > -1 && $super();
  },
  
  key: function() {
    return "rendering";
  },

  morph: function(morphingRenderings) {
    var placeholder = this.getPlaceholder();
    
    if (placeholder) {
      placeholder.type.morphRenderings(this.chrome, morphingRenderings);
    }
  },

  morphCompleted: function(mophedRenderingId, openProperties) {
    var placeholder = this.getPlaceholder();
    
    if (placeholder) {
      placeholder.type.morphRenderingsResponse(this.chrome, mophedRenderingId, openProperties);
    }
  },

  load: function() {
    this.appendClearingElement();
    
    var morphCommand = this.chrome.commands().find(function(command) { return command.click && command.click.include("chrome:rendering:morph"); });
    
    var placeholder = this.getPlaceholder();
    
    if (morphCommand && placeholder) {
      var hasAllowedMorphingRenderings = false;
      var click = Sitecore.PageModes.Utility.parseCommandClick(morphCommand.click);
      var morphingRenderingsIds = click.params;
      
      for (var i = 0; i < morphingRenderingsIds.length; i++) {
        if (placeholder.type.renderingAllowed(morphingRenderingsIds[i])) {
          hasAllowedMorphingRenderings = true;
          break;
        }
      }
     
      //None of the morphing rendering is not allowed in this placeholder due to its setting. Don't show the morph command.
      if (!hasAllowedMorphingRenderings) {
        morphCommand.hidden = true;
      }       
    }
  },
  
  onShow: function($super) {
    $super();
  },
  
  onHide: function($super) {
    $super();

    if (this._sorting) {
      this.sortingEnd();
    }
  },

  positionInPlaceholder: function() {    
    var placeholder = this.getPlaceholder();    
    return placeholder ? Sitecore.LayoutDefinition.getRenderingPositionInPlaceholder(placeholder.type.placeholderKey(), this.uniqueId()) : -1;    
  },
  
  renderingId: function() {
    return this.chrome.data.custom.renderingID;
  },
  
  sort: function() {
    var placeholder = this.getPlaceholder();
    
    Sitecore.PageModes.ChromeManager.design.sortingStart(this.chrome);
    this._sorting = true;
    
    Sitecore.PageModes.ChromeManager.selectionFrame().controls.hide();        
    Sitecore.PageModes.ChromeManager.moveControlFrame().show(this.chrome);
  },
  
  sortingEnd: function() {
    Sitecore.PageModes.ChromeManager.design.sortingEnd();
    Sitecore.PageModes.ChromeManager.moveControlFrame().hide();
    this._sorting = false;
  },
  
  uniqueId: function() {
    return this.chrome.element.id.substring(2);
  },
  
  update: function(html) {
    this.chrome.element.insert({ before: this.handle });
    this.chrome.element.innerHTML = html;        
    this.chrome.element.insert({ top: this.handle });
    this.appendClearingElement(); 
  }
});