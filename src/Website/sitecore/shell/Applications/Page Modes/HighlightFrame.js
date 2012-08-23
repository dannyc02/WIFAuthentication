Sitecore.PageModes.HighlightFrame = Class.create(Sitecore.PageModes.HoverFrame, {      
  horizontalSideClassName: function($super) {
    return $super() + " scHilghlightedChrome";
  },

  verticalSideClassName: function($super) {
    return $super() + " scHilghlightedChrome";
  },
   
  dispose: function() {
    if (this.sides) {
      this.sides.each(function(side) {
        side.remove();
      });
    }

    this.sides = null;
  }  
});