Sitecore.PageModes.Navigation = Class.create({
  initialize: function() {
    Event.observe(document, "keydown", function(e) {
      if (!e.ctrlKey) {
        return;
      }
    
      switch (e.keyCode) {
        case Event.KEY_UP: 
          e.stop();
          
          this.previous();
                    
          break;
          
        case Event.KEY_DOWN:
          e.stop();
          
          this.next();
          
          break;
          
        case Event.KEY_LEFT:
          e.stop();
          
          this.levelUp();
          
          break;
          
        case Event.KEY_RIGHT:
          e.stop();
          
          this.levelDown();
          
          break;
      }
    }.bindAsEventListener(this));
  },
  
  levelDown: function() {
    if (!this.selectedChrome()) {
      return;
    }
    
    var children = this.selectedChrome().children();
    if (!children || children.length == 0) {
      return;
    }
    
    Sitecore.PageModes.ChromeManager.select(children[0]);
  },
  
  levelUp: function() {
    if (!this.selectedChrome()) {
      return;
    }
    
    if (!this.selectedChrome().parent()) {
      return;
    }
    
    this.selectedChrome().expand();
  },
  
  next: function() {
    if (!this.selectedChrome()) {
      return;
    }
    
    var nextChrome = this.selectedChrome.next();
    if (!nextChrome) {
      return;
    }
    
    Sitecore.PageModes.ChromeManager.select(nextChrome);
  },
  
  previous: function() {
    if (!this.selectedChrome()) {
      return;
    }

    var previousChrome = this.selectedChrome.previous();
    
    if (!previousChrome) {
      return;
    }
    
    Sitecore.PageModes.ChromeManager.select(previousChrome);
  },
  
  selectedChrome: function() {
    return Sitecore.PageModes.ChromeManager.selectedChrome();
  }
});