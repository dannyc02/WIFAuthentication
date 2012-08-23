Sitecore.PageModes.ChromeTypes.PlaceholderSorting = Class.create({
  initialize: function(placeholder, rendering) {
    this.placeholder = placeholder;
    this.rendering = rendering;
    var left = this.placeholder.position.offset().left;
    var defaultLeftMarginValue = 20;
    this.left = left - Math.min(defaultLeftMarginValue, left) + "px";
    this.handles = new Array();
  },
  
  activate: function() {
    var sorting = this;
    var rendering = this.rendering;
    
    var position = 0;
    
    var childRenderings = this.placeholder.children().findAll(function(chrome) { return chrome.type.key() == "rendering" }); 
    var totalPositionCount = childRenderings.length + 1;
    // if rendering comes from another placeholder, or it is a first rendering in this placeholder, insert a target at the top of the placeholder
    if (rendering.type.getPlaceholder() != this.placeholder || this.rendering.previous() != null) {
      sorting.insertSortingHandle('top', this.placeholder, position, totalPositionCount);
    }
    
    childRenderings.each(function(chrome) {
      position++;
    
      if (chrome != rendering && chrome.next() != rendering) {
        sorting.insertSortingHandle('after', chrome, position, totalPositionCount);
      }
    });

    if (this.handles.length > 1) {
      this.handles.last().setStyle({ marginTop: -this.handles.last().getHeight() + 2 + "px" });
    }
  },
  
  deactivate: function() {
    this.handles.each(function(handle) {
      handle.remove();
    });
  },
    
  insertSortingHandle: function(where, chrome, insertPosition, positionCount) {
    var handle = new Element("div", { className: "scSortingHandle", 
        title: Sitecore.PageModes.Texts.MoveToPositionInPlaceholder.replace("{0}", insertPosition + 1).replace("{1}", positionCount).replace("{2}", this.placeholder.displayName()) });
    
    var left = new Element("div", { className: "scInsertioHandleLeft scMoveToHere"}).update(" ");  
    handle.appendChild(left);

    var center = new Element("div", {className: "scInsertioHandleCenter"});
    center.appendChild(new Element("span").update(Sitecore.PageModes.Texts.MoveToHere));

    handle.appendChild(center);

    var right = new Element("div", {className: "scInsertioHandleRight"});
    handle.appendChild(right);
        
    handle.observe("click", function(e) {
      e.stop();
      Sitecore.PageModes.ChromeManager.design.sortingEnd();
      Sitecore.PageModes.ChromeManager.design.moveControlTo(this.rendering, this.placeholder, insertPosition);      
    }.bindAsEventListener(this));
    
    handle.hide();    
    var offset = chrome.position.offset();
    if (where == 'top') {
      handle.setStyle({ top: offset.top + "px", left: this.left });
    }
    else {
      var dimensions = chrome.position.dimensions();
      handle.setStyle({ top: offset.top + dimensions.height + "px", left: this.left });
    }

    $(document.body).insert(handle);
    handle.appear({ duration: 0.1 });
    
    this.handles.push(handle);
  }
})