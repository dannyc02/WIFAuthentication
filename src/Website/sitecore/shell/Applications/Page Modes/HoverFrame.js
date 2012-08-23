Sitecore.PageModes.HoverFrame = Class.create(Sitecore.PageModes.ChromeFrame, {
  initialize: function($super) {
    $super();
    this.cornerSize = {height: 4, width: 4};
    this.createSides();   
  },

  createSides: function($super) {
    this.top = new Element("div", { className: this.horizontalSideClassName() });
    this.topLeftCorner = new Element("div", { className: this.verticalSideClassName() + " scTlHoverFrameCorner" });

    this.topRightCorner = new Element("div", { className: this.horizontalSideClassName() + " scTrHoverFrameCorner" });
    this.right = new Element("div", { className: this.verticalSideClassName() });

    this.bottom = new Element("div", { className: this.horizontalSideClassName() });
    this.bottomLeftCorner = new Element("div", { className: this.verticalSideClassName() + " scBlHoverFrameCorner" });

    this.bottomRightCorner = new Element("div", { className: this.horizontalSideClassName() + " scBrHoverFrameCorner" });
    this.left = new Element("div", { className: this.verticalSideClassName() });
    
    sides = new Array();
    this.sides = sides;
    
    sides.push(this.top);
    sides.push(this.topLeftCorner);
    sides.push(this.topRightCorner);
    sides.push(this.right);
    sides.push(this.bottom);
    sides.push(this.bottomLeftCorner);
    sides.push(this.bottomRightCorner);
    sides.push(this.left);

    $super();
  },
  
  horizontalSideClassName: function() {
    return "scHoverFrameSideHorizontal";
  },

  verticalSideClassName: function() {
    return "scHoverFrameSideVertical";
  },
  
  calculateSideLengths: function(dimensions) {
    var horizontal = dimensions.width - 2 * this.cornerSize.width;
    var vertical = dimensions.height - 2 * this.cornerSize.height;
    
    return { horizontal: horizontal > 0 ? horizontal : 0, vertical: vertical > 0 ? vertical : 0};    
  },
      
  showSides: function($super, chrome) {            
    var offset = chrome.position.offset();
    var dimensions = chrome.position.dimensions();
    
    var sideLengths = this.calculateSideLengths(dimensions);

    var leftCornerX = offset.left;    
    var horizontalX = leftCornerX + this.cornerSize.width;    
    var verticalLeftX = leftCornerX;
    var verticalRightX = offset.left + dimensions.width - 1;
    var rightCornerX = verticalRightX - this.cornerSize.width + 1;

    var topY = offset.top;
    var bottomY = offset.top + dimensions.height - 1;
    var verticalY = topY + this.cornerSize.height;
    var bottomCornerY = offset.top + dimensions.height - this.cornerSize.height;

    this.setSideStyle(this.top, topY, horizontalX, sideLengths.horizontal);
    this.setSideStyle(this.topLeftCorner, topY , leftCornerX);
    
    this.setSideStyle(this.topRightCorner, topY, rightCornerX);
    this.setSideStyle(this.right, verticalY, verticalRightX, sideLengths.vertical);

    this.setSideStyle(this.bottom, bottomY, horizontalX, sideLengths.horizontal);
    this.setSideStyle(this.bottomLeftCorner, bottomCornerY, leftCornerX);
    
    this.setSideStyle(this.bottomRightCorner, bottomCornerY, rightCornerX);
    this.setSideStyle(this.left, verticalY, verticalLeftX, sideLengths.vertical);
      
    $super(chrome);
  }
});