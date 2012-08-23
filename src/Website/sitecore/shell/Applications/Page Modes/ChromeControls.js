Sitecore.PageModes.ChromeControls = Class.create({
  initialize: function() {
    this._maxToolbarCommands = 6;    
    this.toolbar = new Element("div", { className: 'scChromeToolbar' }); 
    this.commands = new Element("div", { className: 'scChromeControls' });
    // we need this element to calculate real dimensions of toolbar. Since
    // the toolbar will change the position (top and left) on the page 
    // it's dimensions may be calculated incorrectly when it is docked to the page's border. 
    this.dummy = new Element("div", { className: 'scChromeToolbar', id: "scDummyToolbar" });    
    this.commands.observe("click", function(e) {
      this.hideMoreCommands();
      this.hideAncestors();
      e.stop();
    }.bindAsEventListener(this));

    this.commands.hide();     
    this.toolbar.insert(this.commands);
    $(document.body).insert(this.toolbar);
    $(document.body).insert({top: this.dummy});
    
    this.ancestorList = new Element("div", { className: 'scChromeDropDown' });
    this.ancestorList.hide();    
    $(document.body).insert({top: this.ancestorList});

    this.moreCommands =  new Element("div", { className: 'scChromeDropDown' });
    this.moreCommands.hide();    
    $(document.body).insert({top: this.moreCommands});
    
    this.positioningManager = new Sitecore.PageModes.PositioningManager();
    
    Sitecore.PageModes.ChromeManager.onWindowScroll.observe(this.scrollHandler.bind(this));
  },
  
  activate: function() {
    this.toolbar.removeClassName("scInvisible");
  },

  deactivate: function() {
    this.toolbar.addClassName("scInvisible");
  },
    
  hide: function() {
    this.chrome = null;
    this.dimensions = null;
    this.commands.hide();
    this.hideMoreCommands();
    this.hideAncestors();
  },

  hideAncestors: function() {
    if (this.ancestorList.visible()) {
      this.ancestorList.hide();
      var combo = this.commands.select(".scChromeComboButton");
      if (combo && combo.length > 0) {
        combo[0].removeClassName("scDdExpanded");
      }
    }     
  },

  hideMoreCommands: function() {
    if (this.moreCommands.visible()) {
      this.moreCommands.hide();
      var more = this.commands.select(".scChromeMoreSection");
      if (more && more.length > 0) {
        more[0].removeClassName("scDdExpanded");
      }
    }  
  },

  showAncestors: function() {
    if (!this.ancestorList.visible()) {
      this.ancestorList.show();
      var combo = this.commands.select(".scChromeComboButton");
      if (combo && combo.length > 0) {
        combo[0].addClassName("scDdExpanded");
      }
    }
  },

  showMoreCommands: function() {
    if (!this.moreCommands.visible()) {
      this.moreCommands.show();
      var more = this.commands.select(".scChromeMoreSection");
      if (more && more.length > 0) {
        more[0].addClassName("scDdExpanded");
      }
    }  
  },

  renderAncestors: function() {
    this.ancestorList.update("");
    var ancestors = this.chrome.ancestors();
    for(var i = ancestors.length - 1; i >= 0; i--) {
      if(!ancestors[i].isFake()) {
        var level = ancestors.length - i - 1;
        this.ancestorList.insert(this.renderAncestor(ancestors[i], level));
      }
    }

    return this.ancestorList;
  },

  renderAncestor: function(ancestor, level) {    
    var paddingValue = 16;
    var row = new Element("a", { className: "scChromeDropDownRow", href: "#" });    
    if (level > 0) {          
      var levelConnection = new Element("img", { src: "/sitecore/shell/themes/standard/images/pageeditor/corner.gif", className: "scLevelConnection"} );
      levelConnection.setStyle({ paddingLeft: (level - 1) * paddingValue + "px" });      
      row.insert(levelConnection);
    }   
       
    var icon = new Element("img", { src: ancestor.icon(), className: "scChromeAncestorIcon"});   
    row.insert(icon);
            
    var name = new Element("span");
    name.innerHTML = ancestor.displayName();
    row.insert(name);   
       
    row.observe("mouseenter", function() {
      ancestor.showHover("ancestor menu mouseenter");
    }.bind(this));

    row.observe("mouseleave", function() {
      ancestor.hideHover("ancestor menu mouseleave");
    }.bind(this));

    row.observe("click", function(e) {
      e.stop();
      this.hideAncestors();
      Sitecore.PageModes.ChromeManager.select(ancestor);
    } .bind(this));
    
    return row;
  },

  /*
  command:
    -- click
    -- header
    -- tooltip
    -- icon
  */
  renderCommand: function(command, chrome, isMoreCommand /*Defines if commnad appears in More dropDown*/ ) {           
    var tag = new Element("a", { href: '#', title: command.tooltip });      
    tag.addClassName(isMoreCommand ? "scChromeDropDownRow" : "scChromeCommand");

    if (command.click.startsWith("chrome:")) {
      var click = Sitecore.PageModes.Utility.parseCommandClick(command.click);
      if (command.type == "common") {
        tag.observe("click", function(e) {       
          Sitecore.PageModes.ChromeManager.setCommandSender(chrome);
          Sitecore.PageModes.ChromeManager.handleCommonCommands(chrome, click.message, click.params);
        }.bindAsEventListener(this));
      }
      else {
        tag.observe("click", function(e) {       
          Sitecore.PageModes.ChromeManager.setCommandSender(chrome);
          chrome.handleMessage(click.message, click.params);
        }.bindAsEventListener(this));
      }
    }
    else if (command.click.startsWith("javascript:")) {      
      if (Sitecore.PageModes.Utility.isNoStandardsIE()) {
        tag.onclick = new Function (command.click.replace("javascript:",""));
      }
      else {
        tag.setAttribute("onclick", command.click);
      }

      tag.observe("click", function(e) {
        Sitecore.PageModes.ChromeManager.setCommandSender(chrome);
        //e.stop();
      }.bindAsEventListener(this));
    }
    else {
      tag.observe("click", function(e) {
        eval(command.click);
        Sitecore.PageModes.ChromeManager.setCommandSender(chrome);
        //e.stop();
      }.bindAsEventListener(this));
    }

    var icon = new Element("img", { src: command.icon, alt: command.tooltip });
    tag.insert(icon);
    if (isMoreCommand) {
      var commandName = new Element("span").update(command.header ? command.header : command.tooltip);
      tag.insert(commandName);
    }

    return tag;
  },

  renderExpandCommand: function() {
    var excludeFakeParents = true;

    var parent = this.chrome.parent(excludeFakeParents);

    if (!parent) {
      return;
    }

    var container = new Element("span", { className: 'scChromeComboButton' });

    var tag = new Element("a", { className: 'scChromeCommand', href: '#', title: Sitecore.PageModes.Texts.SelectParentElement.replace("{0}",parent.displayName()) });    
    tag.observe("mouseenter", function() {
      parent.showHover("ancestor menu mouseenter");
    }.bind(this));

    tag.observe("mouseleave", function() {
      parent.hideHover("ancestor menu mouseleave");
    }.bind(this));

    tag.observe("click", function(e) {
      e.stop();
      this.chrome.expand();
    }.bindAsEventListener(this));

    var icon = new Element("img", { src: this.chrome.type.expandIcon(), alt: parent.displayName() });

    icon.observe("mouseover", function() {
      var excludeFakeParents = true;
      icon.src = this.chrome.parent(excludeFakeParents).type.expandIcon();
    }.bind(this));

    icon.observe("mouseout", function() {
      icon.src = this.chrome.type.expandIcon();
    }.bind(this));

    tag.insert(icon);

    container.insert(tag);
    container.insert(this.renderExpandDropdown());

    return container;
  },

  renderExpandDropdown: function() {
    var tag = new Element("a", { className: 'scChromeCommand scExpandDropdown', href: '#', title: Sitecore.PageModes.Texts.ShowAncestors });

    tag.observe("click", function(e) {
      e.stop();

      var sender = Event.element(e);
      var comboButton = sender.up(".scChromeComboButton");
      
      var offset = comboButton.cumulativeOffset();
      var height = comboButton.measure("border-box-height"); 
      this.showAncestorList({top: offset.top + height, left: offset.left});
    }.bindAsEventListener(this));

    var icon = new Element("img", { src: '/sitecore/shell/Themes/Standard/Images/menudropdown_black9x8.png', alt: Sitecore.PageModes.Texts.ShowAncestors });

    tag.insert(icon);

    return tag;
  },

  renderMoreSection: function() {
    var moreSection = document.createDocumentFragment();
    var moreText = new Element("span", { className: "scChromeCommandText"}).update(Sitecore.PageModes.Texts.More);    
    
    var tag = new Element("a", { className: "scChromeCommand scChromeMoreSection", href: "#", title: Sitecore.PageModes.Texts.ShowMoreCommands });
    tag.insert(moreText);
    
    var dropDownIcon = new Element("img", { src: '/sitecore/shell/Themes/Standard/Images/menudropdown_black9x8.png', alt: Sitecore.PageModes.Texts.ShowMoreCommands });
    
    tag.insert(dropDownIcon);   
    
    tag.observe("click", function(e) {
      e.stop();
      var sender = Event.element(e);
      if (sender.tagName.toUpperCase() != "A") {
        sender = sender.up("a");
      }
            
      var offset = sender.cumulativeOffset();
      var height = sender.measure("border-box-height");     
      this.showMoreCommandsList({top: offset.top + height, left:offset.left});
    }.bindAsEventListener(this));

    moreSection.appendChild(tag);         
    return moreSection;
  },
   
  renderTitle: function() {
    var container = new Element("div", { className: 'scChromeName' });

    var tooltip = this.chrome.data.expandedDisplayName || this.chrome.displayName();

    var tag = new Element("span", { className: 'scChromeText', title: tooltip });
    
    tag.innerHTML = this.chrome.displayName().truncate(28);
    
    container.insert(tag);
    
    return container;
  },

  renderSeparator: function() {
    return new Element('span', { className: 'scChromeCommandSectionDelimiter' }).update("|");
  },

  updateCommands: function() {
    this.commands.show();
    this.commands.update("");
    
    this.hideMoreCommands();
    this.moreCommands.update("");    

    /* first row - icon and name */   
    this.commands.appendChild(this.renderTitle());

    /* second row - commands */
    var commandsRow = this.commands.appendChild(new Element("div"));
    var parent = this.chrome.parent();

    var hasCommands = false;
    var commandsCounter = 0;
    
    var commonCommands = this.chrome.commands().findAll(function (c) { return c.type == "common"; });
    
    var commands = this.chrome.commands().findAll(function (c) { return c.type != "common"; });

    if (parent != null && parent.type instanceof Sitecore.PageModes.ChromeTypes.Field) {
      var parentCommandsAdded = false;
      var commandClicks = commands.pluck('click');

      parent.commands().each(function(command) {
        if (command.type != "common" && !commandClicks.include(command.click)) {
          this._addCommand(command, parent, commandsCounter);
          commandsCounter++;
          hasCommands = true;
          parentCommandsAdded = true;
        }
      }.bind(this));

      if (parentCommandsAdded && commands.length > 0 && commandsCounter < this._maxToolbarCommands /*at least one command will be added to toolbar*/ ) {
        commandsRow.appendChild(this.renderSeparator());
      }
    }

    commands.each(function(command) {
      if (command.hidden) {
        return;
      }

      this._addCommand(command, this.chrome, commandsCounter);
      commandsCounter++;
      hasCommands = true;
    }.bind(this));
    
    /* The "expand" section */
    var expandCommand = this.renderExpandCommand();
    if (expandCommand) {
      if (hasCommands) {
        commandsRow.appendChild(this.renderSeparator());
      }

      commandsRow.appendChild(expandCommand);      
      hasCommands = true; 
    }
    
    /*The "more" section */
    commonCommands.each(function (c) {
      var idx = this._maxToolbarCommands;/*The command should appear in "More" dropdown */
      this._addCommand(c, this.chrome, idx); 
    }.bind(this));

    if (this._hasMoreCommands()) {
      if (hasCommands) {
        commandsRow.appendChild(this.renderSeparator());
      }

      commandsRow.appendChild(this.renderMoreSection());
    }

    if (commandsRow.childNodes.length > 0) {
      commandsRow.appendChild(new Element("div", {className: "scClearBoth" }));      
    }   
  },

  scrollHandler: function() {
    if (!this.commands.visible() || this.chrome == null) return;
    this.hideMoreCommands();
    this.hideAncestors();          
    var fixedPosition =  this.positioningManager.getFixedChromeRelativeElementPosition(this.dimensions == null ? this.toolbar.getDimensions() : this.dimensions, this.chrome);
    this.toolbar.setStyle({ left: fixedPosition.left + 'px', top: fixedPosition.top + 'px' });    
  },

  show: function(chrome, duration) {
    if (this.chrome != chrome) {
      this.chrome = chrome;
      this.updateCommands();      
      this.dummy.update(this.toolbar.innerHTML);
      this.dimensions = this.dummy.getDimensions();      
    }
    
    this.hideAncestors();
                
    if (duration) {          
      var fixedPosition = this.positioningManager.getFixedChromeRelativeElementPosition(this.dimensions == null ? this.toolbar.getDimensions() : this.dimensions, chrome);            
      new Effect.Move(this.toolbar, { x: fixedPosition.left, y: fixedPosition.top, mode: 'absolute', duration: duration });
    }
    else {
      this.commands.show();
      var fixedPosition = this.positioningManager.getFixedChromeRelativeElementPosition(this.dimensions == null ? this.toolbar.getDimensions() : this.dimensions, chrome);                        
      this.toolbar.setStyle({ left: fixedPosition.left + 'px', top: fixedPosition.top + 'px' });      
    }
  },

  showAncestorList: function(position) {
    if (this.ancestorList.visible()) return;

    this.renderAncestors();
    this.showAncestors();   
    this.hideMoreCommands();
                    
    var fixedPosition = this.positioningManager.getFixedElementPosition(position.top, position.left, this.ancestorList);
    this.ancestorList.setStyle({ top: fixedPosition.top + 'px', left: fixedPosition.left + 'px' });     
  },

  showMoreCommandsList: function(position) {                  
    this.showMoreCommands();       
    
    var fixedPosition = this.positioningManager.getFixedElementPosition(position.top, position.left, this.moreCommands);
    this.moreCommands.setStyle({ top: fixedPosition.top + 'px', left: fixedPosition.left + 'px' });   
    
    this.hideAncestors();
  },
 
  _addCommand: function(command, chrome, index) {
    var isMoreCommand;

    if (command.type == "separator") {
      this.commands.lastChild.appendChild(this.renderSeparator());
    }
    else if (index >= this._maxToolbarCommands ) {
      isMoreCommand = true;
      this.moreCommands.appendChild(this.renderCommand(command, chrome, isMoreCommand));
    }
    else {
      isMoreCommand = false;
      this.commands.lastChild.appendChild(this.renderCommand(command, chrome, isMoreCommand));
    }
  },

  _hasMoreCommands: function() {
    return this.moreCommands.childElements().length > 0;
  }
});