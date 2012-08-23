Sitecore.PageModes.SelectionFrame = Class.create(Sitecore.PageModes.ChromeFrame, {
 initialize: function($super) {
    $super();
    this.createSides();                
    this.controls = new Sitecore.PageModes.ChromeControls();    
    this._chromeResizeHandler = this.onChromeResize.bind(this);
  },

  activate: function($super) {
    this.controls.activate();
    $super();
  },

  deactivate: function($super) {
    this.controls.deactivate();
    $super();
  },

  horizontalSideClassName: function() {
    return "scFrameSideHorizontal";
  },

  verticalSideClassName: function() {
    return "scFrameSideVertical";
  },
   
  calculateSideLengths: function(dimensions) {
    var horizontal = dimensions.width;
    var vertical = dimensions.height;
    
    return { horizontal: horizontal, vertical: vertical};    
  },

  createSides: function($super) {
    this.top = new Element("div", { className: this.horizontalSideClassName() });            
    this.right = new Element("div", { className: this.verticalSideClassName() });  
    this.bottom = new Element("div", { className: this.horizontalSideClassName() });
    this.left = new Element("div", { className: this.verticalSideClassName() });
           
    sides = new Array();
    this.sides = sides;
    
    sides.push(this.top);
    sides.push(this.right);
    sides.push(this.left);
    sides.push(this.bottom);
    
    $super();  
  },
  
  hide: function($super) {
    $super();
    this.controls.hide();
    
    this.visible = false;
    
    this.chrome.position.updated.stopObserving(this._chromeResizeHandler);
  },
  
  onChromeResize: function() {        
    this.show(this.chrome);
  },
  
  show: function($super, chrome) {
    if (this.chrome) {
      this.chrome.position.updated.stopObserving(this._chromeResizeHandler);
    }

    this.chrome = chrome;    
    $super(chrome);
  },

  showSides: function($super, chrome) {              
    var offset = chrome.position.offset();
    var dimensions = chrome.position.dimensions();
       
    var sideLengths = this.calculateSideLengths(dimensions);       
    var duration = 0.2;    
    if (this.visible) {
      var previousOffset = this.top.cumulativeOffset();
      var distance = Math.sqrt(Math.pow(offset.left - previousOffset.left, 2) + Math.pow(offset.top - previousOffset.top, 2));
      
      duration = distance / 1500;
      if (duration < 0.2) duration = 0.2;
      if (duration > 1) duration = 1;
    }
        
    this.controls.show(chrome, this.visible ? duration : false);

    var horizontalTopY = offset.top;
    var horizontalX =  offset.left;
    var horizontalBottomY = offset.top + sideLengths.vertical - 1;

    var verticalLeftX = offset.left;
    var verticalY = offset.top;
    var verticalRightX =  offset.left + sideLengths.horizontal - 1;

    //make selection frame wider for content editable elements in order to make caret visible in the first and last position
    if (chrome.type.key() == "field" && chrome.type.contentEditable()) {
      // Decrease left border coordinates to make cursor visible when it is placed in the first position 
      verticalLeftX--;
      // increase right border coordinates to avoid the lagging right border overlap the text when typing.
      // This also resolves the problem with the first space inserted at the last position doesn't increase the border width(sc:332300)
      var rightShift = chrome.type.fontSize ? chrome.type.fontSize : 1;
      verticalRightX += rightShift;
      
      sideLengths.horizontal += rightShift;
    }
     
    if (!this.visible) {
      this.setSideStyle(this.top, horizontalTopY, horizontalX, sideLengths.horizontal);                 
      this.setSideStyle(this.right, verticalY, verticalRightX, sideLengths.vertical);      
      this.setSideStyle(this.left, verticalY, verticalLeftX , sideLengths.vertical);      
      this.setSideStyle(this.bottom, horizontalBottomY , horizontalX, sideLengths.horizontal);
                  
      this.visible = true;
      $super(dimensions, offset);
    }
    else {
      new Effect.Move(this.top, { y: horizontalTopY, x: horizontalX, mode: 'absolute', duration: duration });            
      new Effect.Move(this.right, { y: verticalY, x: verticalRightX, mode: 'absolute', duration: duration });      
      new Effect.Move(this.left, { y: verticalY, x: verticalLeftX, mode: 'absolute', duration: duration });      
      new Effect.Move(this.bottom, { y: horizontalBottomY, x: horizontalX, mode: 'absolute', duration: duration });      
      
      var horizontalClassName = this.horizontalSideClassName();
      var verticalClassName = this.verticalSideClassName();

      this.sides.each(function(side) {
        if (side.hasClassName(horizontalClassName)) {
          new Effect.Morph(side, {
            style: { width: sideLengths.horizontal + 'px' },
            duration: duration
          });
        }
        else if (side.hasClassName(verticalClassName)) {
          new Effect.Morph(side, {
            style: { height: sideLengths.vertical + 'px' },
            duration: duration
          });
        }        
      });
    }
    
    chrome.position.updated.observe(this._chromeResizeHandler);       
  }
});