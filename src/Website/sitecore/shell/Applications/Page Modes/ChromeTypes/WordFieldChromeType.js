// Class defines logic for Word document field in inline edititng mode
Sitecore.PageModes.ChromeTypes.WordField = Class.create(Sitecore.PageModes.ChromeTypes.Field, {  
  load: function($super) {    
    try {
      var obj = new ActiveXObject("Edraw.OfficeViewer");
    }
    catch(e) {                                                   
      this.activeXAvailable = false;
      // change the style to make all word html visible, not only inside the frame user had defined.
      var obj = this.wordObj();
      if (obj) {
        obj.style.height = "auto";
        obj.style.width = "auto";
        this.chrome.element.setStyle({padding:"0px", margin: "0px", height: "auto", width: "auto" });
      }

      return;
    }

    this.activeXAvailable = true;
    this.initWord();
    // Dirty hack. Can we find modified event in .ocx?   
    this.intervalID = setInterval(this._checkWordFieldModified.bind(this), 1000);
    this.onSaveHandler = function() {
      var word = this.wordObj();
      if (word == null) {                            
        return;
      }

      if (!word.IsDirty && !word.fileWasOpened) {
        return;
      }
                                                   
      this.updateWordField();                         
    }.bind(this);

    Sitecore.PageModes.ChromeManager.onSave.observe(this.onSaveHandler);       
    this.adjustSize();
    $super();
  },
  
  adjustSize: function() {
    var width = this.chrome.data.custom.editorWidth;
    var minHeight = this.chrome.data.custom.editorHeight;
    var maxHeight = this.chrome.data.custom.editorMaxHeight;
    if (width > 0 && minHeight > 0 && maxHeight > 0 && maxHeight > minHeight) {
       var wordBorderHeight = 60;
       if(maxHeight <= wordBorderHeight) {
         return;
       }
   
       var word = this.wordObj();
       if (word == null) {
         return;
       }

       var wrapper = new Element("span").update(word.innerHTML);
       var rawHTMLContainer = wrapper.down(".scWordHtml");
       if ( rawHTMLContainer == null) return;

       height = this._getHeight(rawHTMLContainer.innerHTML, width, maxHeight - wordBorderHeight) + wordBorderHeight;
   
       if(height <= minHeight) {
         return;
       }
   
       word.style.height = height + 'px';
       var topPadding = parseInt(this.chrome.element.getStyle("padding-top"));
       var bottomPadding = parseInt(this.chrome.element.getStyle("padding-bottom"));
       this.chrome.element.setStyle({height: height + topPadding + bottomPadding + "px"});
    }
  },

  handleMessage: function($super, message, params) {
    switch (message) {      
      case "chrome:field:word:mediainserted":
        this.insertMediaToWord(params.path, params.alt);
        break;
      case "chrome:field:word:insertLink":
        this.insertLinkToWord(params.link, params.text);
        break;
      case "chrome:field:word:toggletoolbar":
        this.toggleWordToolbar();
        break;
      default:
        $super(message, params);
        break;      
    }
  },

  isEnabled: function($super) {
    return this.activeXAvailable && $super();
  },

  initWord: function() {
    this._wordObj = null;
    var word = this.wordObj();
    if (word) {
      WordOCX_Initialize(word);
      setTimeout(function() {       
        var obj = this.wordObj();
        if (obj == null) return;
        obj.CreateNew("Word.Document");
        obj.currentView = word.ActiveDocument.ActiveWindow.View.Type;        
        if (this.chrome.data.custom.downloadLink) {
          obj.Open(this.chrome.data.custom.downloadLink, "Word.Document");
        } 
        else {
          obj.CreateNew("Word.Document");
        }          
      }.bind(this), 500);
    }
  },

  insertMediaToWord: function(imagePath, alt) {    
    var word = this.wordObj();
    if(word != null) {
      WordOCX_InsertPicture(word, imagePath, alt);  
    }
  },

  insertLinkToWord: function(link, defaultText) {
    var word = this.wordObj();
    if(word != null) {
      WordOCX_InsertLink(word, link, defaultText);  
    }
  },

  hasModifications: function() {
    var obj = this.wordObj();
    return obj && obj.IsOpened != 'undefined' && obj.IsOpened == true && obj.IsDirty == true; 
  },
  
  key: function() {
    return "word field";
  },

  layoutRoot: function() {    
    return this.chrome.element;
  },

  onDelete: function() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }

    if (this.onSaveHandler) {
       Sitecore.PageModes.ChromeManager.onSave.stopObserving(this.onSaveHandler); 
    }

    if (this._wordObj && this._wordObj.IsOpened) {
      this._wordObj.Close();
    }

    this._wordObj = null;
  },

  onHide: function() {
  },
  
  onMouseDown: function(e) {
  },   

  onShow: function() { 
  },

  toggleWordToolbar: function() {
    var word = this.wordObj();
    if(word != null) {
      WordOCX_ToggleToolbar(word);  
    }
  },

  updateWordField: function() {
     var word = this.wordObj();  
     if (word == null) {
      return;
     }

     var uploadLink = this.chrome.data.custom.uploadLink;
     if(uploadLink && (word.IsDirty || word.fileWasOpened)){
       WordOCX_UploadDocument(word, uploadLink, true);
     }

     var fieldValue = $(word).next("input.scWordBlobValue");
     if (fieldValue && fieldValue.id.startsWith("flds_")) {
        var blobID = this.chrome.data.custom.blobID;
        if (blobID) {
          fieldValue.value = blobID;
        }
     }
     else {
      console.error("word field value input was not found");
     }
  },

  wordObj: function() {        
    if (!this._wordObj) {
      this._wordObj = this.chrome.element.firstChild;
    }
    
    return this._wordObj;  
  },

  _checkWordFieldModified: function() {    
    if (this.hasModifications()) {
      Sitecore.PageModes.ChromeManager.setModified(true);
    }
  },

  _getHeight: function(html, width, maxHeight) {
      if(html == "") {
        return -1;
      }

      var doc = document;

      var element = doc.createElement("span");
      element.innerHTML = html;
      element.firstChild.style.display = "";
  
      if(typeof(maxHeight) == 'undefined') {
        maxHeight = doc.body.offsetHeight;
      }
  
      var div = doc.createElement("<div style=\"position:absolute;left:99999;top:99999;width:" + width + "px;height:" + maxHeight + "px\">");
      doc.body.appendChild(div);  
  
      var span = doc.createElement("span");
      div.appendChild(span);
 
      span.appendChild(element); 
  
      var height = span.offsetHeight;
      doc.body.removeChild(div);
  
      if(height > maxHeight) {
        height = maxHeight;
      }
  
      return height;
   }
});