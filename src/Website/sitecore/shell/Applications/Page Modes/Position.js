Sitecore.PageModes.Position = Class.create({
  initialize: function(chrome) {
    this.chrome = chrome;
    this.element = chrome.type.layoutRoot();
    this.onResizeHandler = this.onResize.bindAsEventListener(this);
    if (Sitecore.PageModes.Utility.isIE) {
      this.element.observe("resize", this.onResizeHandler);
    }
    else {
      this.element.observe("DOMSubtreeModified", this.onResizeHandler);
    }
    
    this.updated = new Sitecore.Event();
  },
  
  dimensions: function() {
    if (!Sitecore.PageModes.Utility.isIE/*cache only for IE. FF and Chrome are fast enough*/ || !this._dimensions) {           
      Sitecore.PageModes.ChromeManager.ignoreDOMChanges = true;
      this._dimensions = this.element.getDimensions();                  
      this._dimensions = this.fixInlineContainerHeight(this._dimensions);
      Sitecore.PageModes.ChromeManager.ignoreDOMChanges = false;     
    }

    return this._dimensions;
  },
  
  fixInlineContainerHeight: function(dimensions) {
    if (dimensions.height == 0 && this.element.getStyle("display") == "inline") {
      dimensions.height = this.element.childElements().max(function(element) { 
        return element.getHeight(); 
      });
    }
    
    return dimensions;
  },
  
  offset: function() {
    return this.element.cumulativeOffset();
  },
  
  onResize: function(e) {        
    if (Sitecore.PageModes.Utility.isIE) {    
      this.reset();
      Sitecore.PageModes.ChromeHighlightManager.planUpdate();
    } 
    else {
      e.stop();
      if (Sitecore.PageModes.ChromeManager.ignoreDOMChanges) return;
      var selectedChrome = Sitecore.PageModes.ChromeManager.selectedChrome();
      if (selectedChrome && selectedChrome == this.chrome) {        
        this.reset();
        Sitecore.PageModes.ChromeHighlightManager.planUpdate();
      }
    }    
  },
  
  reset: function(domElement) {
    this._dimensions = null;
    if (domElement) {
      if (this.element) {
        this.element.stopObserving(this.onResizeHandler);
      }

      this.element = domElement;
      if (Sitecore.PageModes.Utility.isIE) {
        this.element.observe("resize", this.onResizeHandler);
      } 
      else {
        this.element.observe("DOMSubtreeModified", this.onResizeHandler);
      }
    }

    this.updated.fire();
  },
  
  toString: function() {
    return this.offset().left + "," + this.offset().top + " " + this.dimensions().width + "x" + this.dimensions().height;
  }
});