Sitecore.PageModes.ChromeFrame = Class.create({
  initialize: function() {
    this.sides = new Array();
  },
  
  addSidesToDom: function() {
    var body = $(document.body);
    
    this.sides.each(function(side) {
      side.setStyle({ display: 'none' });
      body.insert(side);
    });
  },

  applyCssClass:function(className) {
    this.sides.each(function(side) {
      side.addClassName(className);
    });
  },

  removeCssClass:function(className) {
    this.sides.each(function(side) {
      side.removeClassName(className);
    });
  },

  activate: function() {
    this.removeCssClass("scInvisible");
  },

  deactivate: function() {
    this.applyCssClass("scInvisible");
  },

  horizontalSideClassName: function() {
    return "";
  },

  verticalSideClassName: function() {
    return "";
  },

  createSides: function() {
    this.addSidesToDom();
  },

  hide: function() {
    if (this.sides) {
      this.sides.invoke("hide");
    }
  },

  show: function(chrome) {
    if (chrome == null) return;

    if (this.sides == null || this.sides.length == 0) {
      this.createSides();
    }
            
    this.showSides(chrome);
  },

  showSides: function(dimensions, offset) {
    this.sides.invoke("show");
  },

  setSideStyle: function (side, top, left, length) {
    side.setStyle({top: top + "px", left: left + "px" });
    if (typeof(length) == "undefined") return;
    
    if (side.hasClassName(this.horizontalSideClassName())) {
      side.setStyle({ width: length < 0 ? "0" : length  + "px" });
      return;
    }

    if (side.hasClassName(this.verticalSideClassName())) {
      side.setStyle({ height: length < 0 ? "0" : length + "px"});
      return;
    }

    console.error("Unknown side type");
  } 
});