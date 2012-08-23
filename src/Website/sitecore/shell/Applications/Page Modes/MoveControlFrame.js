Sitecore.PageModes.MoveControlFrame = Class.create(Sitecore.PageModes.ChromeFrame, {
  initialize: function($super) {
    $super();
    this.bgVerticalPatternSize = {height: 3, width: 8};
    this.bgHorizontalPatternSize = {height: 8, width: 3};       
  },

  horizontalSideClassName: function() {
    return "scMoveControlSideHorizontal";
  },

  verticalSideClassName: function() {
    return "scMoveControlSideVertical";
  },

  calculateSideLengths: function(dimensions) {
    var horizontal = dimensions.width;
    var vertical = dimensions.height - 2 * this.bgHorizontalPatternSize.height;    
    return { horizontal: horizontal, vertical: vertical};    
  },    

  showSides: function($super, chrome) {    
    var offset = chrome.position.offset();
    var dimensions = chrome.position.dimensions();
            
    var sideLengths = this.calculateSideLengths(dimensions);
    
    var horizontalSideLengthLeft = Math.ceil(sideLengths.horizontal / 2);
    var horizontalSideLengthRight = Math.floor(sideLengths.horizontal / 2);
            
    var verticalSideLengthTop = Math.ceil(sideLengths.vertical / 2);
    var verticalSideLengthBottom = Math.floor(sideLengths.vertical / 2);
    
    var topHorizontalY = offset.top;
    var bottomHorizontalY = offset.top + dimensions.height - this.bgHorizontalPatternSize.height;

    var leftHorizontalX = offset.left;    
    var rightHorizontalX = leftHorizontalX + horizontalSideLengthLeft;

    var verticalRightX = rightHorizontalX + horizontalSideLengthRight - this.bgVerticalPatternSize.width;
    var verticalLeftX = offset.left;

    var verticalTopY = offset.top + this.bgHorizontalPatternSize.height;   
    var verticalBottomY = verticalTopY + verticalSideLengthTop; 
    
       
    this.setSideStyle(this.topLeftHorizontal, topHorizontalY, leftHorizontalX, horizontalSideLengthLeft);    
    this.setSideStyle(this.topRightHorizontal, topHorizontalY, rightHorizontalX, horizontalSideLengthRight);

    this.setSideStyle(this.rightTopVertical, verticalTopY, verticalRightX, verticalSideLengthTop);    
    this.setSideStyle(this.rightBottomVertical, verticalBottomY, verticalRightX, verticalSideLengthBottom);

    this.setSideStyle(this.bottomLeftHorizontal, bottomHorizontalY, leftHorizontalX, horizontalSideLengthLeft);    
    this.setSideStyle(this.bottomRightHorizontal, bottomHorizontalY, rightHorizontalX, horizontalSideLengthRight);

    this.setSideStyle(this.leftTopVertical, verticalTopY, verticalLeftX, verticalSideLengthTop);    
    this.setSideStyle(this.leftBottomVertical, verticalBottomY, verticalLeftX, verticalSideLengthBottom);

    $super();
  },

  createSides: function($super) {
    this.topLeftHorizontal = new Element ("div", { className: this.horizontalSideClassName() + " scLeftPart scTopSide" });    
    this.topRightHorizontal = new Element ("div", {className: this.horizontalSideClassName() + " scRightPart scTopSide"});

    this.rightTopVertical = new Element ("div", {className: this.verticalSideClassName() + " scTopPart scRightSide"});    
    this.rightBottomVertical = new Element ("div", {className: this.verticalSideClassName() + " scBottomPart scRightSide"});
    
    this.bottomLeftHorizontal = new Element ("div", { className: this.horizontalSideClassName() + " scLeftPart scBottomSide" });    
    this.bottomRightHorizontal = new Element ("div", {className: this.horizontalSideClassName() + " scRightPart scBottomSide"});

    this.leftTopVertical = new Element ("div", {className: this.verticalSideClassName() + " scTopPart scLeftSide"});    
    this.leftBottomVertical = new Element ("div", {className: this.verticalSideClassName() + " scBottomPart scLeftSide"});

    sides = new Array();
    this.sides = sides;

    sides.push(this.topLeftHorizontal);    
    sides.push(this.topRightHorizontal);

    sides.push(this.bottomLeftHorizontal);    
    sides.push(this.bottomRightHorizontal);

    sides.push(this.rightTopVertical);    
    sides.push(this.rightBottomVertical);

    sides.push(this.leftTopVertical);    
    sides.push(this.leftBottomVertical);
    
    $super();
  }
});