if (typeof(Sitecore.PageModes) == "undefined") Sitecore.PageModes = new Object();
if (typeof(Sitecore.PageModes.ChromeTypes) == "undefined") Sitecore.PageModes.ChromeTypes = new Object();

Sitecore.PageModes.ChromeTypes.ChromeType = Class.create({
  initialize: function() {
  },

  // "Spacer div hack" to enclose floated elements. For CSS 2.1 compliant browsers we use :after pseudo-elements instead
  appendClearingElement: function() {
    if (Sitecore.PageModes.Utility.isNoStandardsIE()) {
      var childs = this.chrome.element.childElements();     
      var clearElement = new Element("div", {"class": "scClearBoth" });              
      this.chrome.element.appendChild(clearElement);
    }
  },

  controlId: function() {
    return this.chrome.element.id;
  },
  
  dataNode: function(domElement) {
    return domElement.down(".scChromeData");
  },
  
  expandIcon: function() {
    return '/sitecore/shell/~/icon/ApplicationsV2/16x16/nav_up_left_blue.png.aspx';
  },

  // Return values:
  // * null - the ribbon context item shouldn't be changed
  // * "" - the ribbon context item should be changed to the one of the whole page
  // * non-empty string - the context item should be changed to the one specified by the string uri 
  getContextItemUri: function () {
    var uri = this.chrome.data.contextItemUri;
    return uri == null ? "" : uri;
  },
  
  frameColor: function() {
    return 'black';
  },
  
  frameLook: function() {
    return 'corner';
  },
  
  handleMessage: function(message, params) {
  },
  
  highlightOnCommands: function() {
    //return true;
    return false;
  },

  icon: function() {
    return '/sitecore/shell/~/icon/ApplicationsV2/16x16/bullet_square_glass_blue.png.aspx';
  },

  isEnabled: function() {
    return this.chrome && this.chrome.hasDataNode;
  },

  key: function() {
    return "override chrometype type key";
  },
  
  layoutRoot: function() {        
    return this.chrome.element;
  },

  onShow: function() {
  },

  onHide: function() {
  },
  
  onDelete: function() {
    this.chrome.getChildChromes(function(chrome) { return chrome;}).invoke("onDelete");
  }  
});
