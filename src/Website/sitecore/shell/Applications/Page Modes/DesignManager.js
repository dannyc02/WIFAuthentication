Sitecore.PageModes.DesignManager = Class.create({
  initialize: function(chromeManager) {
    this.chromeManager = chromeManager;    
    Sitecore.PageModes.ChromeManager.selectionChanged.observe(this.onSelectionChanged.bind(this));
  },

  insertionStart: function() {
    Sitecore.PageModes.ChromeManager.hideSelection();
    if (this._inserting) return;

    this.placeholders().each(function(placeholder) {
      placeholder.type.onShow();
    });

    this._inserting = true;
  },

  insertionEnd: function() {
    this.placeholders().each(function(placeholder) {
      placeholder.type.onHide();
    });

    this._inserting = false;
  },
  
  moveControlTo: function(rendering, placeholder, position) {
    var descendants = rendering.descendants()
    if (descendants.any(function(chrome) { return chrome.key() == "word field" && chrome.type.hasModifications();} )) {
      if (confirm(Sitecore.PageModes.Texts.ThereAreUnsavedChanges)) {
        placeholder.type.insertRenderingAt(rendering, position);        
        Sitecore.LayoutDefinition.moveToPosition(rendering.type.uniqueId(), placeholder.type.placeholderKey(), position);
      }   
    }
    else {
      placeholder.type.insertRenderingAt(rendering, position);        
      Sitecore.LayoutDefinition.moveToPosition(rendering.type.uniqueId(), placeholder.type.placeholderKey(), position);
    }
  },
  
  onKeyUp: function(e) {
    if (e.keyCode == Event.KEY_ESC && this.sorting) {
      this.sortingEnd();
    }

    if (e.keyCode == Event.KEY_ESC && this._inserting) {
      this.insertionEnd();
    }
  },
  
  placeholders: function() {
    if (!this._placeholders) {
      this._placeholders = this.chromeManager.chromes().findAll(function(chrome) { return chrome.type.key() == "placeholder"; });
    }
    
    return this._placeholders;
  },

  onSelectionChanged: function(chrome) {
    if (this._inserting) {
      this.insertionEnd();
    }
  },
  
  sortingStart: function(rendering) {
    if (this.sorting) return;

    this.placeholders().each(function(placeholder) {
      placeholder.type.sortingStart(rendering);
    });
    
    this.sorting = true;
    this.sortableRendering = rendering;
    
  },
  
  sortingEnd: function() {
    if (!this.sorting) {
      return;
    }
    
    this.sorting = false;
    
    this.sortableRendering.type.sortingEnd();
  
    this.placeholders().each(function(placeholder) {
      placeholder.type.sortingEnd();
    });
  }
});