var scSavedTab = null;
var enabledSaveIcon = null;
var isRibbonVisible;
var isRibbonFixed = null;

function scSave(postaction) {
  var saveButton = $('scRibbonButton_Save');
  //Workaround for FF not appriciating disabled attribute
  if (saveButton && saveButton.disabled) {
    return;
  }
  
  window.parent.Sitecore.PageModes.ChromeManager.save(postaction);  
}

function scBeginEdit() {
  scForm.postRequest('','','','webedit:beginedit');
}

function scNew() {
  scForm.postRequest('','','','webedit:new');
}

function scNewRendering() {
  window.parent.Sitecore.PageModes.ChromeManager.design.insertionStart();
}

function scDelete(id) {
  scForm.postRequest('','','','webedit:delete(id=' + id + ')');
}

function scSetLayout() {
  scForm.postRequest('','','','webedit:changelayout');
}

function scCancel() {
  scForm.setCookie("sitecore_webedit_editing", "");
  window.top.location.href = scSetDesigning(false);
}

function scClose() {
  scForm.postRequest('','','','webedit:close');
}

function scNavigate(href) {
  window.top.location.href = href;
}

function scSetHtmlValue(controlid, preserveInnerContent) {
  var ctl = $("scHtmlValue");
  if (ctl == null) {
    return;
  }
  
  var plainValueControl = $("scPlainValue");
  if (plainValueControl == null) {
    return;
  }
  
  var value = ctl.value;
  var plainValue = plainValueControl.value;
  
  ctl.value = "";
  plainValueControl.value = "";
  
  var win = window.parent;
  if (win == null) {
    return;
  }
 
  var doc = win.document;
  
  ctl = doc.getElementById(controlid);
  var controlExists = true;
  if (ctl != null) {
    if (plainValue) {
      ctl.value = plainValue;
    }
    else {
      ctl.value = value;
    }
  }
  else {
    controlExists = false;
  }
 
  ctl = doc.getElementById(controlid + "_edit"); 
  if (ctl == null) {
    alert("control '" + controlid + "_edit" + "' not found");
    return;
  }
    
  if (!preserveInnerContent) {
    ctl.innerHTML = value;
    // chrome's innerHTMl was changed. Since chrome's layout root may be it's child, we should update chrome's position. 
    win.Sitecore.PageModes.ChromeManager.updateChromeDimensions();
  }
  else {
    //Instead of setting whole innerHtml only setting needed attributes
    //Useful when replacing tags that contain children, like links.
    var targetCtl = ctl.firstChild;
    if (targetCtl && targetCtl.attributes) {
      for (i = 0; i < targetCtl.attributes.length; i++) {
        if (targetCtl.attributes.item(i).specified) {
          targetCtl.attributes.removeNamedItem(targetCtl.attributes.item(i).name);
        }
      }

      var wrapper = document.createElement("span"); 
      wrapper.innerHTML = value;
      var elem = wrapper.firstChild;
    
      if (elem && elem.attributes) {
        for (i = 0; i < elem.attributes.length; i++) {
          if (elem.attributes.item(i).specified && elem.attributes.item(i).value ) {
            targetCtl[elem.attributes.item(i).name] = elem.attributes.item(i).value;       
          }
        }
      }
  
      delete wrapper;
    }           
  }
  
  if (controlExists) {
    win.Sitecore.PageModes.ChromeManager.setModified(true);
  }
}

function scSetSaveButtonState(isEnabled) {
  var scSaveButton = $("scRibbonButton_Save");
  if (scSaveButton == null) {
    return;
  }
  
  scSaveButton.disabled = !isEnabled;
  if (isEnabled) {
    scSaveButton.removeClassName("scDisabledButton");
    if (typeof(disabledSaveIcon) != 'undefined') {
      var icon = scSaveButton.select("img")[0];
      if (icon != null && enabledSaveIcon != null) {
        icon.src = enabledSaveIcon;
      }
    }
  }
  else {
    scSaveButton.addClassName("scDisabledButton");
    var icon = scSaveButton.select("img")[0];    
    if (icon && typeof(disabledSaveIcon) != 'undefined') {
      if (enabledSaveIcon == null) {
        enabledSaveIcon = icon.src;
      }

      icon.src = disabledSaveIcon;
    }
  }      
}

function scShowRibbon() {  
  scSetRibbonVisibility(!isRibbonVisible);    
  var toggleIcon = $("scToggleRibbon");
  if (toggleIcon) {
    toggleIcon.src = isRibbonVisible ? 
                "/sitecore/shell/themes/standard/Images/WebEdit/more_expanded.png" :
                "/sitecore/shell/themes/standard/Images/WebEdit/more_collapsed.png";
  }
    
  scAdjustSize();  
  scForm.setCookie("sitecore_webedit_ribbon", isRibbonVisible ? "1" : "0");

  if (!isRibbonVisible) {
    scDiactiveCurrentTab();
  }    
}

function scShowPalette() {
  window.top.location.href = scSetDesigning(true);
}

function scOnLoad() { 
  scAdjustPositioning();
  var tabsContainer = $$(".scRibbonNavigatorButtonsGroupButtons");
  if (tabsContainer != null && tabsContainer.length > 0 ) {
    tabsContainer = tabsContainer[0];
    tabsContainer.childElements().each( function(tab) {
      tab.observe("click", scTabClicked);
      tab.observe("dblclick", scTabDblClicked);
    });
  }
     
  if (scIsRibbonFixed()) {
    var tag = $(window.parent.document.createElement("div"));
    tag.id = "scCrossPiece";
    tag.update(" ");
    tag.setStyle({ visibility:"hidden" });
    $(window.parent.document.body).insert({ top: tag });    
  }
 
  scAdjustSize(); 
}

function scAdjustSize() {
  var frame = scForm.browser.getFrameElement(window);    
  if (!Prototype.Browser.IE) {    
    frame.style.height = "1px";
  }  
  
  var height = document.body.scrollHeight;

  var crossPiece = window.parent.document.getElementById("scCrossPiece");   
  if (crossPiece) {      
    crossPiece.style.height = "" + height + "px";
  }

  var frameElement = $(frame);
  if (frameElement) 
  {
   if (!isRibbonVisible) {
    frameElement.addClassName("scCollapsedRibbon");
   }
   else {
    frameElement.removeClassName("scCollapsedRibbon");
   }
  }

  frame.style.height = "" + height + "px";
}

if (typeof(scSitecore) != 'undefined') { 
  scSitecore.prototype.setModifiedEx = scSitecore.prototype.setModified;

  scSitecore.prototype.setModified = function (value) {
    scSetSaveButtonState(value);
    this.setModifiedEx(value);
  }

  scSitecore.prototype.onKeyDownEx = scSitecore.prototype.onKeyDown;
  scSitecore.prototype.onKeyDown = function (evt) {
      var e = (evt != null ? evt : window.event);
      if (e && e.ctrlKey && e.keyCode == 83) {
        //Ctrl + S is handled in Page Editor        
        return;
      }

      this.onKeyDownEx(evt);
   }
}

scRequest.prototype.buildFieldsEx = scRequest.prototype.buildFields;

scRequest.prototype.buildFields = function(doc) {
  this.buildFieldsEx(parent.document);
  
  this.form = this.form.replace("__VIEWSTATE=", "__VIEWSTATE2=")
  
  this.buildFieldsEx();
}

scContentEditor.prototype.setActiveStripEx = scContentEditor.prototype.setActiveStrip;

scContentEditor.prototype.setActiveStrip = function(id, toggleRibbon) {
  scContentEditor.prototype.setActiveStripEx(id, toggleRibbon);
  
  var ctl = scForm.browser.getControl("scActiveRibbonStrip");
  
  if (ctl != null) {
    scForm.setCookie("sitecore_webedit_activestrip", ctl.value);
  }
}

function scSetDesigning(enabled) {
  var page = window.top.location.href;
  
  var params = page.toQueryParams();
  
  if (enabled) {
    params["sc_de"] = "1";
  }
  else {
    delete params["sc_de"];
  }
  
  var n = page.indexOf("?");
  if (n >= 0) {
    page = page.substr(0, n + 1);
  }
  else {
    page += "?";
  }

  return page + Object.toQueryString(params);
}

function scSetModified(modified) {
  var doc = scForm.browser.getParentWindow(scForm.browser.getFrameElement(window).ownerDocument);

  if (doc.Sitecore.WebEdit) {
    doc.Sitecore.WebEdit.modified = modified;
  }
  else {
    doc.Sitecore.Designer.setModified(modified);
  }
}

function scTabClicked() {      
  scSavedTab = null;
  if (!isRibbonVisible) {
     var param = new Object();
     param.target = $$("a.scToggleIcon img")[0];
     scShowRibbon(param);
  }
}

function scTabDblClicked(e) { 
  if (isRibbonVisible) {
     var param = new Object();
     param.target = $$("a.scToggleIcon img")[0];
     scShowRibbon(param);
  }
}

function scSetRibbonVisibility(visibility) {
  var ribbon = $("Ribbon");
  if (ribbon.down() && ribbon.down().hasClassName("scRibbonNavigator")) {
    ribbon = $("Ribbon_Toolbar");    
  }
  else {
    ribbon = $("RibbonPane");    
  }

  var treeCrumb = $("TreecrumbPane");
  isRibbonVisible = visibility;
  if (isRibbonVisible) {
    ribbon.show();
    if (scIsTreecrumbVisible()) {
      treeCrumb.show();
    }

    if (scSavedTab != null) {
      scSavedTab.className = "scRibbonNavigatorButtonsActive";
    }
  }
  else {
    ribbon.hide();
    treeCrumb.hide();
  }
}

function scDiactiveCurrentTab() {
  var activeTabs = $$(".scRibbonNavigatorButtonsActive");
  if (activeTabs != null && activeTabs.length > 0) {      
    activeTabs[0].className = "scRibbonNavigatorButtonsNormal";
    scSavedTab = activeTabs[0];
  }
}

function scAdjustPositioning() {
  var buttonsContainer = $("Buttons");
  if (buttonsContainer == null) return;
  var commands = buttonsContainer.select(".scCommandIcon, .scMenuDevider");
  var commandWidth = 0;
  if (commands.length > 0) {
    commandWidth = commands[0].measure("margin-box-width");      
  }

  var deviders = buttonsContainer.select(".scMenuDevider");
  var deviderWidth = 0;
   if (deviders.length > 0) {
    deviderWidth = deviders[0].measure("margin-box-width");      
  }

  var ribbonNavigators = $$(".scRibbonNavigator");
  //Set the navigator margin according to the number of commands
  if (ribbonNavigators.length > 0 && ribbonNavigators[0].visible()) {
    ribbonNavigators[0].setStyle({ marginLeft: commands.length * commandWidth + deviders.length * deviderWidth + 12 + "px" });
  }
  // There's no ribbon tabs. Add the margin to the toolbar to avoid overlaping with commands
  else if (buttonsContainer.childElements().length > 0) {
    var ribbonPanel = $("RibbonPanel");
    if (ribbonPanel) {
      var marginValue = buttonsContainer.measure("border-box-height");
      if (marginValue >= 1 && Prototype.Browser.IE) {
        marginValue -= 1;
      }

      ribbonPanel.setStyle({ marginTop: marginValue + "px" });
    }
  }
}

function scShowControlsClick(enabled) {
  if (!window.parent.Sitecore.PageModes) return;

  window.parent.Sitecore.PageModes.ChromeManager.showControlsChange(enabled);
  // enforce ribbon refresh
  scForm.postRequest('','','','Update("#!#keep current#!#")', null, true);
}

function scCapabilityClick(capability, enabled) {
  if (!window.parent.Sitecore.PageModes) return;
  
  window.parent.Sitecore.PageModes.ChromeManager.capabilityChange(capability, enabled);
  // enforce ribbon refresh to make capabilty button have appropriate state
  scForm.postRequest('','','','Update("#!#keep current#!#")', null, true);
}

function scShowTreecrumb(isTreecrumbVisisble)
{ 
  if (!isTreecrumbVisisble) {   
    scTreecrumbVisible = false;
    $("TreecrumbPane").hide();    
  }
  else {
    scTreecrumbVisible = true;    
    $("TreecrumbPane").show();
  }

  // enforce ribbon refresh
  scForm.postRequest('','','','Update("#!#keep current#!#")', null, true);
  scAdjustSize();
}

function scIsRibbonFixed() {
  if (isRibbonFixed == null) {
    var frame = scForm.browser.getFrameElement(window);
    if (frame) {
      isRibbonFixed = $(frame).hasClassName("scFixedRibbon");
    }
  }

  return isRibbonFixed;
}

function scIsTreecrumbVisible() {
  return typeof(scTreecrumbVisible) != 'undefined' && scTreecrumbVisible == true;
}