Sitecore.PageModes.ChromeTypes.Field = Class.create(Sitecore.PageModes.ChromeTypes.ChromeType, {
  initialize: function($super) {
    $super();
    //Key codes which aren't tracked as ones that modify contenteditable fields
    this._ignoreKeyCodes = [16, 17, 18, 27, 35, 36, 37, 38, 39, 40];
  },

  load: function() {
    var fieldValueInput = this.chrome.element.previousSibling.previousSibling;
    if (fieldValueInput && fieldValueInput.id.toUpperCase().startsWith("FLD")) {
      this.fieldValue = fieldValueInput;
      Sitecore.PageModes.ChromeManager.addFieldValue(fieldValueInput);
    }
    else {
      this.fieldValue = new Object();
    }
    
    this.initialAttributes = new Object();    
    if (this.chrome.element.getAttribute("sc_parameters")) {
      this.parameters = this.chrome.element.getAttribute("sc_parameters").toQueryParams();
    }
    else {
      this.parameters = new Object();
    }

    this.parentLink = this.chrome.element.up("a");
    this.fieldType = this.chrome.element.getAttribute("scfieldtype");
    this.onMouseDownHandler = this.onMouseDown.bindAsEventListener(this); 
    this.chrome.element.observe("mousedown", this.onMouseDownHandler)
   
    if (this.contentEditable()) {     
      if (this.chrome.element.getAttribute("scWatermark") == "true") {
        this.chrome.element.removeAttribute("scWatermark");
        this.watermarkHTML = this.chrome.element.innerHTML;        
      }
     
      this.onKeyDownHandler = this.onKeyDown.bindAsEventListener(this);
      this.onKeyUpHandler = this.onKeyUp.bindAsEventListener(this);
      this.onCutPasteHandler = this.onCutPaste.bindAsEventListener(this);
      this.onClickHandler = this.onClick.bindAsEventListener(this);
      this.onBlurHandler = this.onBlur.bindAsEventListener(this);

      Sitecore.PageModes.ChromeManager.onModeChanged.observe(this.setContentEditableState.bind(this));
      this.setContentEditableState();
      // IE doesn't return calculated values for current style.
      if (Sitecore.PageModes.Utility.isIE) {       
        var dummy = new Element("div");
        dummy.setStyle({height:"0px",width: "1em", position:"absolute"});
        this.chrome.element.up().appendChild(dummy);
        this.fontSize = dummy.offsetWidth;
        dummy.remove();
      }
      else {
        this.fontSize = parseInt(this.chrome.element.getStyle("fontSize"));       
      }
    }
  },

  // attaches content editable elements specific event handlers
  attachEventHandlers: function() {
    this.chrome.element.observe("keyup", this.onKeyUpHandler);
    this.chrome.element.observe("keydown", this.onKeyDownHandler);
    this.chrome.element.observe("paste",  this.onCutPasteHandler);
    this.chrome.element.observe("cut", this.onCutPasteHandler);
    this.chrome.element.observe("click", this.onClickHandler);
    this.chrome.element.observe("blur", this.onBlurHandler);
  },

  contentEditable: function($super) {
    var attrValue = this.chrome.element.readAttribute("contentEditable");
    return attrValue == "true" || attrValue == "false";
  },

  // detaches content editable elements specific event handlers
  detachEventHandlers: function() {
    this.chrome.element.stopObserving("keyup", this.onKeyUpHandler);
    this.chrome.element.stopObserving("keydown", this.onKeyDownHandler);
    this.chrome.element.stopObserving("paste",  this.onCutPasteHandler);
    this.chrome.element.stopObserving("cut", this.onCutPasteHandler);
    this.chrome.element.stopObserving("click", this.onClickHandler);
    this.chrome.element.stopObserving("blur", this.onBlurHandler);    
  },

  dataNode: function($super, domElement) {
    return domElement.previous(".scChromeData");       
  },

  frameColor: function($super) {
    return '#9B2323';
  },

  handleMessage: function(message, params) {
    switch (message) {
      case "chrome:field:insertimage":
        this.insertImage();
        break;
      case "chrome:field:imageinserted":
        this.imageInserted(params.html);
        break;
      case "chrome:field:insertlink":
        this.insertLink();
        break;
      case "chrome:field:linkinserted":
        this.linkInserted(params.url);
        break;
      case "chrome:field:editcontrol":             
        var chars = this.characteristics();
        this.editControl(chars.itemId, chars.language, chars.version, chars.fieldId, this.controlId(), params.command);
        break;
      case "chrome:field:execute":
        this.execute(params.command, params.userInterface, params.value);
        break;      
    }
  },

  highlightOnCommands: function() {
    return false;
  },
   
  isEnabled: function($super) {
    return Sitecore.PageModes.ChromeManager.getCapabilities().indexOf(Sitecore.PageModes.Capabilities.edit) > -1 && $super();
  },

  layoutRoot: function() {
    if (this.contentEditable()) {
      return this.chrome.element;
    }

    if (this.chrome.element.childElements().length == 1) {
      return this.chrome.element.childElements()[0];
    }

    return this.chrome.element;
  },

  persistValue: function($super) {
    if (this.isWatermark()) return;
    this.fieldValue.value = this.chrome.element.innerHTML;
  },

  refreshValue: function() {
    if (this.contentEditable()) {
      this.chrome.element.innerHTML = this.fieldValue.value;
    }
  },
  
  // Sets whether content editable elements are editable (depends on the mode(Edit, Design etc.))
  setContentEditableState: function() {
    if (this.contentEditable()) {
      var isEnabled = this.isEnabled();
      this.chrome.element.writeAttribute("contentEditable", isEnabled.toString());
      if (isEnabled) {
        this.attachEventHandlers();
      }
      else {
        this.detachEventHandlers();
      }
    }
  },

  /*--- Helpers section ---*/
  controlId: function() {
    return this.fieldValue.id;
  },

  convertToGuid: function(shortId) {
    return "{" + shortId.substr(0, 8) + "-" + shortId.substr(8, 4) + "-" + shortId.substr(12, 4) + "-" + shortId.substr(16, 4) + "-" + shortId.substr(20, 12) + "}";
  },

  characteristics: function() {
    //ID format:fld_ItemID_FieldID_Language_Version_Revision_edit
    var fieldCharacteristics = this.chrome.element.id.split('_');
    return {
      itemId: this.convertToGuid(fieldCharacteristics[1]),
      fieldId: this.convertToGuid(fieldCharacteristics[2]),
      language: fieldCharacteristics[3],
      version: fieldCharacteristics[4]
    };
  },

  insertHtmlFragment: function(html) {
    if (window.getSelection && window.getSelection().getRangeAt) {//FF
      range = window.getSelection().getRangeAt(0);
      node = range.createContextualFragment(html);
      range.insertNode(node);
      return true;
    }

    if (document.selection && document.selection.createRange) {//IE
      document.selection.createRange().pasteHTML(html);
      return true;
    }

    return false;
  },

  isWatermark: function() {
    return this.watermarkHTML == this.chrome.element.innerHTML;
  },

  /*--- Commands section---*/
  editControl: function(itemid, language, version, fieldid, controlid, message) {
    var control = $(controlid);
    var plainValue = control.value;
    control = $(controlid + "_edit");
    var value = control.value;
    var parameters = control.getAttribute("sc_parameters");

    var ribbon = Sitecore.PageModes.ChromeManager.ribbon();
    if (ribbon != null) {
      ribbon.contentWindow.scForm.browser.getControl("scHtmlValue").value = value;
      ribbon.contentWindow.scForm.browser.getControl("scPlainValue").value = plainValue;
      Sitecore.PageModes.ChromeManager.postRequest(
          message + '(itemid=' + itemid + ',language=' + language + ',version=' + version + ',fieldid='
           + fieldid + ',controlid=' + controlid + ',webeditparams=' + parameters + ')', null, false);
    }

    return false;
  },
  
  execute: function(command, userInterface, value) {
    if (Prototype.Browser.Gecko) {
      document.execCommand(command, null, null);
    }
    else {
      document.execCommand(command, userInterface, value);
    }

    Sitecore.PageModes.ChromeManager.setModified(true);
    return false;
  },

  hasParentLink: function() {
    return this.parentLink != null;
  },

  insertImage: function() {
    var chars = this.characteristics();
    var parameters = this.chrome.element.getAttribute("sc_parameters");
    Sitecore.PageModes.ChromeManager.postRequest(
              "webedit:insertimage" + '(placement=cursor,itemid=' + chars.itemId + ',language='
              + chars.language + ',version=' + chars.version + ',fieldid=' + chars.fieldId +
              ',controlid=' + this.controlId() + ',webeditparams=' + parameters + ')', null, false);
    return false;
  },

  imageInserted: function(html) {
    this.chrome.element.focus();
    if (this.insertHtmlFragment(html)) {
      Sitecore.PageModes.ChromeManager.setModified(true);
    }
  },

  insertLink: function() {
    var selectionText;
    
    // Not MSIE.
    if (window.getSelection && window.getSelection().getRangeAt) {
      this.selection = window.getSelection().getRangeAt(0);
      selectionText = this.selection.toString();
    }
    // MSIE.
    else if (document.selection && document.selection.createRange) {
      this.selection = document.selection.createRange();
      selectionText = this.selection.text;
    }

    if (selectionText.blank()) {
      alert(Sitecore.PageModes.Texts.SelectSomeText);
      return;
    }

    var chars = this.characteristics();
    this.editControl(chars.itemId, chars.language, chars.version, chars.fieldId, this.controlId(), "webedit:insertlink");
  },
  
  linkInserted: function(url) {
    var isIE = document.selection && document.selection.createRange;
    
    if (!this.selection) {
      return;
    }

    // TODO: add preserving link contents for FF.
    var data = {
      html: isIE ? this.selection.htmlText : this.selection.toString(),
      url: url
    };

    // If link is selected, replace it with a new one, preserving link contents.
    if (isIE) {
      var htmlSelection = this.selection.htmlText.toLowerCase().strip() || "";

      if (htmlSelection.startsWith("<a ") && htmlSelection.endsWith("</a>")) {
        htmlSelection = data.html.substring(data.html.indexOf('>') + 1);
        htmlSelection = htmlSelection.substring(0, htmlSelection.length - "</a>".length);
        data.html = htmlSelection;
      }
    }

    var htmlToInsert = "<a href='#{url}'>#{html}</a>".interpolate(data);

    if (isIE) {
      this.selection.pasteHTML(htmlToInsert);
    }
    else {
      node = this.selection.createContextualFragment(htmlToInsert);
      this.selection.deleteContents();
      this.selection.insertNode(node);
    }

    Sitecore.PageModes.ChromeManager.setModified(true);
  },

  key: function() {
    return "field";
  },
  /*---Event handlers section---*/
  onBlur: function(e) {
    this.persistValue();    
    if (this.watermarkHTML && 
        (this.chrome.element.innerHTML == "" || this.fieldType == "text" && this.chrome.element.innerHTML.stripTags() == "" )) {
          this.chrome.element.innerHTML = this.watermarkHTML;
    }            
  },

  onClick: function(e) {
    if (this.isWatermark()) {
      this.chrome.element.innerHTML = "";
      //Trick to make Chrome set focus on content editable element
      if (Prototype.Browser.WebKit) {        
        var range = document.createRange();
        range.selectNodeContents(this.chrome.element);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);        
      }
    }
    // Restore original values saved in MouseDown handler
    this._restoreInitialStyles();
  },

  onCutPaste: function(e) {    
    if (!this.active) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      else {
        e.returnValue = false;
      }

      return;
    }
        
    Sitecore.PageModes.ChromeManager.setModified(true);
  },

  onHide: function() {   
    this.active = false;
    if (this.parentLink && this.initialAttributes.linkTextDecoration != null) {
      this.parentLink.style.textDecoration = this.initialAttributes.linkTextDecoration;
    }

    this._restoreInitialStyles();    
  },

  onKeyDown: function(e) {
    if (!this.active) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      else {
        e.returnValue = false;
      }

      return;
    }

    if (e.keyCode == 13 && this.parameters["linebreak"] == "br") {
      var html = "<br />";
      if (this.insertHtmlFragment(html)) {
        Sitecore.PageModes.ChromeManager.setModified(true);
      }

      e.stop();
    }
  },

  onKeyUp: function(event) {
    if (this._ignoreKeyCodes.include(event.keyCode)) return;
    if (this.fieldValue.value != event.element().innerHTML) {
      Sitecore.PageModes.ChromeManager.setModified(true);
      //at least one modification has been done, so we don't need to check for modifications any more
      event.element().stopObserving("keyup", this.onKeyUpHanler);
    }
  },

  onMouseDown: function(e) {     
     if (!e.isLeftClick()) {
      return;
     }

     if (e.ctrlKey) {
      if (!this.isEnabled()) {
        return;
      }

      var href = null;
      if (this.hasParentLink()) {
        href = this.parentLink.href;
        this.parentLink.onclick = function () {return false;}
        // For IE
        this.parentLink.href = "javascript:return false";
      }

      var sender = Event.element(e);
      if (sender.tagName.toUpperCase() == "A") {
        href = sender.href;       
        sender.onclick = function () {return false;}
        // For IE
        sender.href = "javascript:return false";       
      }
       
      if (!href || href.startsWith("javascript:")) {
        return;
      }
      
      e.stop();
      try 
      {
        window.location.href = href;
      }
      catch(e) {
      //silent
      }
    }
    else if (this.isEnabled() && this.contentEditable() && Sitecore.PageModes.Utility.isNoStandardsIE()) {
      // HACK FOR IE 7 issue with wrong cursor positioning in contentEditableElements
      this.initialAttributes.position = this.chrome.element.style.position;
      this.initialAttributes.zIndex = this.chrome.element.style.zIndex;
      this.chrome.element.style.position = "relative";
      this.chrome.element.style.zIndex = "9085";      
    }
  },

  onShow: function() {    
    this.active = true;
    if (this.parentLink) {
      this.initialAttributes.linkTextDecoration = this.parentLink.style.textDecoration;
      this.parentLink.style.textDecoration = 'none';
    }    
  },

  _restoreInitialStyles: function() {
    if (this.initialAttributes.position != null && this.initialAttributes.zIndex != null) {
      this.chrome.element.style.position = this.initialAttributes.position;
      this.chrome.element.style.zIndex = this.initialAttributes.zIndex;
      this.initialAttributes.position = null;
      this.initialAttributes.position = null;
    }
  }
});
