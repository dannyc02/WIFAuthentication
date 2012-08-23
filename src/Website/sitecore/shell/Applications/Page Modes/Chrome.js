if (typeof(Sitecore.PageModes) == "undefined") {
  Sitecore.PageModes = new Object();
}

Sitecore.PageModes.Chrome = Class.create({
  initialize: function(domElement, type) {
    this.element = domElement;

    this.type = type;
    type.chrome = this;

    this.position = new Sitecore.PageModes.Position(this);

    this._level = -1;

    var dataNode = this.type.dataNode(this.element);
    this.hasDataNode = false;
    if (dataNode) {
      var json = dataNode.innerHTML;
      this.hasDataNode = true;
      this.data = json.evalJSON();
    }
    else {
      this.data = new Object();
      this.data.custom = new Object();
    }
  },

  ancestors: function() {
    var result = new Array();

    var parent = this.parent();

    while (parent) {
      result.push(parent);
      parent = parent.parent();
    }

    return result;
  },

  // Returns currently enabled child chromes.  
  descendants: function() {          
     return this.getChildChromes(function(chrome) { return chrome && chrome.isEnabled();}, true);                    
  },

  // Returns currently enabled child chromes, immediate descentants of the current chrome.
  // The returning value is cached.
  children: function() {
    if (!this._children) {      
      this._children = this.getChildChromes(function(chrome) { return chrome && chrome.isEnabled();});            
    }

    return this._children;
  },

  commands: function() {
    return this.data.commands ? this.data.commands : new Array();
  },

  controlId: function() {
    return this.type.controlId();
  },

  displayName: function() {
    return this.data.displayName ? this.data.displayName : Sitecore.PageModes.Texts.NotSet;
  },

  expand: function() {
    var excludeFakeParents = true;
    var parent = this.parent(excludeFakeParents);
    if (parent) {
      Sitecore.PageModes.ChromeManager.select(parent);
    }
    else {
      console.error("no parent - nowhere to expand");
    }
  },
    
  // Returns child chromes, immediate descentants of the current chrome, which match the specified predicate.
  // If deep = true, all descendant chromes are returned, otherwise only immediate children are returned.
  getChildChromes: function(predicate, deep) {
     var root = this.element;
     var selector = ".scPageDesignerPlaceholder, .scPageDesignerControl, .scLooseFrameZone, .scWebEditInput";
     var elements = root.select(selector);
     if (!deep) {
      elements = elements.findAll(function(node) { return node.up(selector) == root; });
     }

     elements = elements.map(function(node) { return Sitecore.PageModes.ChromeManager.getChrome(node); });
     return elements.findAll(predicate);
  },

  handleMessage: function(message, params) {
    if (message == "chrome:explain") {
      this.toggleExplanation();
    }

    this.type.handleMessage(message, params);
  },

  icon: function() {
    return this.type.icon();
  },

  isEnabled: function() {
    return this.type.isEnabled();
  },
  
  isFake: function() {
    if (this.type instanceof Sitecore.PageModes.ChromeTypes.Field) {
      var childField = this.children().find(function(chrome) { return chrome.type instanceof Sitecore.PageModes.ChromeTypes.Field });
      return !!childField;
    }

    return false;
  },

  key: function() {
    return this.type.key();
  },

  level: function() {
    if (this._level <= 0) {
      var level = 1

      var node = this.element.up();

      while (node && node.match) {
        if (node.match(".scPageDesignerPlaceholder") || node.match(".scPageDesignerControl") || node.match(".scLooseFrameZone") || node.match(".scWebEditInput")) {
          level++;
        }

        node = node.up();
      }

      this._level = level;
    }

    return this._level;
  },

  load: function() {    
    this.element.observe("click", function(e) {
      if (this.isEnabled()) {
        if (e.ctrlKey) return;

         if (e.cancelBubble) {
          e.cancelBubble = true;
        }
        else {
          e.stopPropagation();
        }

        if (Sitecore.PageModes.ChromeManager.selectedChrome() != this || this.key() == "field" ) {
          if (e.preventDefault) {
            e.preventDefault();
          }
          else {
            e.returnValue = false;
          }
        }
        
        Sitecore.PageModes.ChromeManager.select(this);
      }
    }.bindAsEventListener(this));

    this.element.observe("mouseenter", function(e) {
      if (this.isEnabled()) {
        Sitecore.PageModes.ChromeManager.onMouseOver(this);
      }
    }.bindAsEventListener(this));

    this.element.observe("mouseleave", function(e) {
      if (this.isEnabled()) {
        Sitecore.PageModes.ChromeManager.onMouseOut(this);
      }
    }.bindAsEventListener(this));
    
    this._fixCursor();

    if (this.type.load) {
      this.type.load();
    }
  },

  showHover: function() {
    if (!this._selected) {
      Sitecore.PageModes.ChromeManager.hoverFrame().show(this);
    }
  },
 
  hideHover: function() {
    Sitecore.PageModes.ChromeManager.hoverFrame().hide();
  },
  
  //excludeFake determines if we should consider fake parents (if field chrome A has nested field chrome B, then A is fake parent)
  parent: function(excludeFake) {
    var node = this.element.up();

    while (node && node.match) {
      if (node.match(".scPageDesignerPlaceholder") || node.match(".scPageDesignerControl") || node.match(".scLooseFrameZone")) {
        var chrome = Sitecore.PageModes.ChromeManager.getChrome(node);
        if (chrome.isEnabled()) return chrome;
      }

      if (node.match(".scWebEditInput")) {
        var chrome = Sitecore.PageModes.ChromeManager.getChrome(node);
        if (chrome.isEnabled()) {
          if (excludeFake) {
            if (!chrome.isFake()) return chrome;
          }
          else return chrome;
        }
      }

      node = node.up();
    }

    return null;
  },

  showHighlight: function() {
    if (this._selected) return;

    if (!this._highlight) {      
      this._highlight = new Sitecore.PageModes.HighlightFrame();
    }
       
    this._highlight.show(this);    
  },

  hideHighlight: function() {
    if (this._highlight) {      
      this._highlight.hide();
    }
  },
  
  showSelection: function() {
    this._selected = true;
    this.hideHover();
    this.hideHighlight();
    
    //this.toggleExplanation();

    if (this.type.onShow) {
      this.type.onShow();
    }
  },

  hideSelection: function() {
    this._selected = false;
    if (Sitecore.PageModes.ChromeHighlightManager.isHighlightActive(this)) {
      this.showHighlight();
    }
    
    this.hideExplanation();

    if (this.type.onHide) {
      this.type.onHide();
    }
  },

  getContextItemUri: function() {
    return this.type.getContextItemUri();
  },

  previous: function() {
    if (!this.parent()) {
      return;
    }

    var children = this.parent().children();

    var index = children.indexOf(this);
    if (index == 0) {
      return;
    }

    return children[index - 1];
  },

  next: function() {
    if (!this.parent()) {
      return;
    }

    var children = this.parent().children();

    var index = children.indexOf(this);
    if (children.length <= index + 1) {
      return;
    }

    return children[index + 1];
  },

  reload: function() {
    this._fixCursor();

    if (this.type.reload) {
      this.type.reload();
    }
  },
  
  reset: function() {
    this.position.reset();
    this._children = null;
  },

  toggleExplanation: function() {
    if (!this._explanationActive) {        
      this._explanationActive = true;
    }
    else {
      this.hideExplanation();
    }
  },

  hideExplanation: function() {   
    this._explanationActive = false;
  },

  onDelete: function() {
    if (this._highlight) {
      this._highlight.dispose();
    }
    
    this.type.onDelete();    
  },
  
  _fixCursor: function() {
    if (this.isEnabled()) {
      this.element.removeClassName("noPointer");
    } 
    else if (!this.element.hasClassName("noPointer")) {
      this.element.addClassName("noPointer");
    }
  }  
});