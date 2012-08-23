Sitecore.PageModes.ChromeTypes.PlaceholderInsertion = Class.create({
  initialize: function(placeholder) {
    this.placeholder = placeholder;

    var left = this.placeholder.position.offset().left;
    var defaultLeftMarginValue = 20;
    this.left = left - Math.min(defaultLeftMarginValue, left) + "px";

    this.handles = new Array();
    this.command = this.placeholder.commands().find(function(command) { return command.click.include("chrome:placeholder:addControl"); });
    if (!this.command) {
      this.command = new Object();
      this.command.tooltip = Sitecore.PageModes.Texts.AddNewRenderingToPlaceholder;
      this.command.header = Sitecore.PageModes.Texts.AddToHere;
    }
  },

  activate: function() {
    var inserter = this;
    var position = 0;

    inserter.addTarget('top', this.placeholder, position);

    this.placeholder.children().findAll(function(chrome) { return chrome.type.key() == "rendering" }).each(function(chrome) {
      position++;
    
      inserter.addTarget('after', chrome, position);
    });
   
    if (this.handles.length > 1) {   
      this.handles.last().setStyle({ marginTop: -this.handles.last().getHeight() + 2 + "px" });
    }
  },

  addTarget: function (where, chrome, insertPosition) {
    var handle = new Element("div", { className: "scInsertionHandle", title: this.command.tooltip.replace("{0}", this.placeholder.displayName()) });

    var left = new Element("div", { className: "scInsertioHandleLeft scAddToHere"}).update(" ");  
    handle.appendChild(left);

    var center = new Element("div", {className: "scInsertioHandleCenter"});
    center.appendChild(new Element("span").update(this.command.header));

    handle.appendChild(center);

    var right = new Element("div", {className: "scInsertioHandleRight"});
    handle.appendChild(right);
   
    // TODO: use icon src, title, etc, from the 'add' button defined in the content tree        
    handle.observe("click", function(e) {
      e.stop();
      Sitecore.PageModes.ChromeManager.setCommandSender(this.placeholder);
      this.placeholder.type.addControl(insertPosition);
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
  },

  deactivate: function() {
    this.handles.each(function(handle) {
      handle.remove();
    });
  }
});