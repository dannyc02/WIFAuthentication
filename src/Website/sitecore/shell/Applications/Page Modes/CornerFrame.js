Sitecore.PageModes.CornerFrame = Class.create({
  initialize: function() {
    this.sideLength = 25;
  
    this.topLeftH = new Element("div", { className: 'scCornerFrameSideHorizontal' });
    this.topLeftV = new Element("div", { className: 'scCornerFrameSideVertical' });
    
    this.topRightH = new Element("div", { className: 'scCornerFrameSideHorizontal' });
    this.topRightV = new Element("div", { className: 'scCornerFrameSideVertical' });
  
    this.bottomLeftH = new Element("div", { className: 'scCornerFrameSideHorizontal' });
    this.bottomLeftV = new Element("div", { className: 'scCornerFrameSideVertical' });
    
    this.bottomRightH = new Element("div", { className: 'scCornerFrameSideHorizontal' });
    this.bottomRightV = new Element("div", { className: 'scCornerFrameSideVertical' });
    
    sides = new Array();
    this.sides = sides;
    
    sides.push(this.topLeftH);
    sides.push(this.topLeftV);
    sides.push(this.topRightH);
    sides.push(this.topRightV);
    sides.push(this.bottomLeftH);
    sides.push(this.bottomLeftV);
    sides.push(this.bottomRightH);
    sides.push(this.bottomRightV);
    
    var body = $(document.body);
    
    sides.each(function(side) {
      side.setStyle({ display: 'none' });
      body.insert(side);
    });
  },
  
  hide: function() {
    this.sides.invoke('hide');
    this.visible = false;
  },
  
  show: function(chrome) {
    this.chrome = chrome;
    
    var offset = chrome.position.offset();
    var dimensions = chrome.position.dimensions();
    
    if (!this.visible) {
      this.topLeftH.setStyle({ top: offset.top - 1, left: offset.left - 1 });
      this.topLeftV.setStyle({ top: offset.top - 1, left: offset.left - 1 });
      
      this.topRightH.setStyle({ top: offset.top - 1, left: offset.left + dimensions.width - this.sideLength + 1 });
      this.topRightV.setStyle({ top: offset.top - 1, left: offset.left + dimensions.width + 1 });

      this.bottomLeftH.setStyle({ top: offset.top + dimensions.height + 1, left: offset.left - 1 });
      this.bottomLeftV.setStyle({ top: offset.top + dimensions.height - this.sideLength + 1, left: offset.left - 1 });
      
      this.bottomRightH.setStyle({ top: offset.top + dimensions.height + 1, left: offset.left + dimensions.width - this.sideLength + 1 });
      this.bottomRightV.setStyle({ top: offset.top + dimensions.height - this.sideLength + 1, left: offset.left + dimensions.width + 1 });
      
      this.sides.invoke('show');
      this.visible = true;
    }
    else {
      var duration = 0.2;
    
      new Effect.Move(this.topLeftH, { y: offset.top - 1, x: offset.left - 1, mode: 'absolute', duration: duration });
      new Effect.Move(this.topLeftV, { y: offset.top - 1, x: offset.left - 1, mode: 'absolute', duration: duration });

      new Effect.Move(this.topRightH, { y: offset.top - 1, x: offset.left + dimensions.width - this.sideLength + 1, mode: 'absolute', duration: duration });
      new Effect.Move(this.topRightV, { y: offset.top - 1, x: offset.left + dimensions.width + 1, mode: 'absolute', duration: duration });

      new Effect.Move(this.bottomLeftH, { y: offset.top + dimensions.height + 1, x: offset.left - 1, mode: 'absolute', duration: duration });
      new Effect.Move(this.bottomLeftV, { y: offset.top + dimensions.height - this.sideLength + 1, x: offset.left - 1, mode: 'absolute', duration: duration });
      
      new Effect.Move(this.bottomRightH, { y: offset.top + dimensions.height + 1, x: offset.left + dimensions.width - this.sideLength + 1, mode: 'absolute', duration: duration });
      new Effect.Move(this.bottomRightV, { y: offset.top + dimensions.height - this.sideLength + 1, x: offset.left + dimensions.width + 1, mode: 'absolute', duration: duration });
    }
  }
});