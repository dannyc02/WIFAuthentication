
function scBrowser() {
  this.isIE = true;
  
  var ua = navigator.userAgent;
  var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
  if (re.exec(ua) != null) {
    this.version = parseFloat( RegExp.$1 );
    this.isIE8CompatibilityMode = this.version == 7 && navigator.userAgent.indexOf("Trident/4.0")>0;
  }
}

scBrowser.prototype.initialize = function() {
  document.attachEvent("onselectstart", scIEOnSelectStart);
  document.attachEvent("oncontextmenu", scIEOnContextMenu);
}  

scBrowser.prototype.attachEvent = function(object, eventName, method) {
  object.attachEvent(eventName, method);
}

scBrowser.prototype.clearEvent = function(evt, cancelBubble, returnValue, keyCode) {
  try {
    if (cancelBubble != null) {
      evt.cancelBubble = cancelBubble;
    }

    if (returnValue != null) {
      evt.returnValue = returnValue;
    }
    
    if (keyCode != null) {
      evt.keyCode = keyCode;
    }
  }
  catch(e) {
  }
}

scBrowser.prototype.closePopups = function (text) {
  try {
    if (document.popup != null) {
      document.popup.hide();
    }
    document.popup = null;
  }
  catch (e) {
  }
}
    
scBrowser.prototype.createHttpRequest = function() {
  return new ActiveXObject("microsoft.xmlhttp");
}

scBrowser.prototype.detachEvent = function(object, eventName, method) {
  object.detachEvent(eventName, method);
}

scBrowser.prototype.getControl = function(id, doc) {
  if (id == null || id == "") {
    return null;
  }

  if (doc != null) {
    return doc.getElementById(id);
  }
  var result = document.getElementById(id);
                                                                               
  if (result == null && scForm.lastEvent != null && scForm.browser.getSrcElement(scForm.lastEvent)!= null) {
    result = scForm.browser.getSrcElement(scForm.lastEvent).ownerDocument.getElementById(id)
  }
  
  return result;
}

scBrowser.prototype.getEnumerator = function(collection) {
  return new Enumerator(collection);
}

scBrowser.prototype.getFrameElement = function(win) {
  win = win ? win : window;
  return win.frameElement;
}

scBrowser.prototype.getImageSrc = function(img) {
  if (img.filters != null && img.filters.length > 0) {
    var src = img.filters[0].src;
    
    if (src != null) {
      return src;
    }
  }
  
  return img.src;
}

scBrowser.prototype.getMouseButton = function(evt) {
  return evt.button;
}

scBrowser.prototype.getNextSibling = function(ctl) {
  return ctl.nextSibling;
}

scBrowser.prototype.getOffset = function(evt) {
  var result = new Object();
  
  result.x = evt.offsetX;
  result.y = evt.offsetY;
  
  return result;
}

scBrowser.prototype.getOuterHtml = function(control) {
  return control.outerHTML;
}

scBrowser.prototype.getParentWindow = function(doc) {
  return doc.parentWindow;
}

scBrowser.prototype.getPreviousSibling = function(ctl) {
  return ctl.previousSibling;
}

scBrowser.prototype.getSrcElement = function(evt) {
  try {
    return evt.srcElement;
  }
  catch(e) {
    return null;
  }
}

scBrowser.prototype.getTableRows = function(table) {
  var result = new Array();
  
  for(var n = 0; n < table.rows.length; n++) {
    result.push(table.rows[n]);
  }

  return result;
}

scBrowser.prototype.insertAdjacentHTML = function(control, where, html) {
  control.insertAdjacentHTML(where, html);
}

scBrowser.prototype.prompt = function(text, defaultValue) {
  var arguments = new Array(text, defaultValue);
  var data = { height: this.version > 6 ? "110" : "150" };

  var features = "dialogWidth:400px;dialogHeight:#{height}px;help:no;scroll:no;resizable:no;status:no;center:yes".interpolate(data);
    
  return showModalDialog("/sitecore/shell/prompt.html", arguments, features);
}

scBrowser.prototype.releaseCapture = function(control) {
  control.releaseCapture();
}

scBrowser.prototype.removeChild = function(tag) {
  try {
    // SSL none-secure items work-around
    if (tag.tagName == "IFRAME") {
      tag.src = "/sitecore/shell/blank.html";
    }
    else if (tag.tagName == "TD") {
      tag.innerHTML = "";
      tag.parentNode.deleteCell(tag.cellIndex);
      return;
    }
    else {
      tag.innerHTML = "";
    }
  }
  catch(e) {
  }
  
  tag.parentNode.removeChild(tag);
}

scBrowser.prototype.scrollIntoView = function(control, alignToTop) {
  control.scrollIntoView(alignToTop);
}

scBrowser.prototype.setCapture = function(control) {
  control.setCapture();
}

scBrowser.prototype.setImageSrc = function(img, src) {
  if (img.filters != null && img.filters.length > 0) {
    if (img.filters[0].src != null) {
      img.filters[0].src = src;
      return;
    }
  }
  
  img.src = src;
}

scBrowser.prototype.setOuterHtml = function(control, html) {
  if (control.tagName == "TR") {
    var container = control.ownerDocument.createElement("div");
    
    container.innerHTML = "<table>" + html + "</table>";

    var row = container.childNodes[0].rows[0];
    
    control.parentNode.replaceChild(row, control);
  }
  else {
    control.outerHTML = html;
  }
}

scBrowser.prototype.showModalDialog = function(url, arguments, features, request) {
  var result = showModalDialog(url, arguments, features);
  
  if (request != null) {
    request.dialogResult = result;
  }
  
  return result;
}

scBrowser.prototype.showPopup = function (data) {
  var id = data.id;

  var evt = (scForm.lastEvent != null ? scForm.lastEvent : window.event);

  var doc = document;
  if (document.popup != null && evt != null && evt.srcElement != null) {
    doc = evt.srcElement.ownerDocument;
  }

  var width = data.width != null ? data.width : 0;
  var height = data.height != null ? data.height : 0;
  var cache = null;
  var cacheKey = "";
  var html = "";

  if (typeof (data.value) == "string") {
    html = data.value;
  }
  else {
    html = data.value.outerHTML;

    var p = html.indexOf(">");
    if (p > 0) {
      html = html.substring(0, p).replace(/display[\s]*\:[\s]*none/gi, "") + html.substr(p);
      html = html.substring(0, p).replace(/position[\s]*\:[\s]*absolute/gi, "") + html.substr(p);
    }
  }

  if (width == 0 && height == 0) {

      var element = null;

      if (typeof (data.value) != "string" && data.value.style.display == "") {
        width = data.value.offsetWidth;
        height = data.value.offsetHeight;
      }
      else {
        if (typeof (data.value) == "string") {
          element = doc.createElement("span");
          element.innerHTML = data.value;
        }
        else if (doc != data.value.ownerDocument) {
          element = doc.createElement("span");
          element.innerHTML = data.value.outerHTML;
          element.firstChild.style.display = "";
        }
        else {
          element = data.value.cloneNode(true);
          element.style.display = "";
          element.style.position = "";
        }

        var div = doc.createElement("<div style=\"position:absolute;left:-99999px;top:-99999px;width:" + doc.body.offsetWidth + "px;height:" + doc.body.offsetHeight + "px\">");

        doc.body.appendChild(div);

        var span = doc.createElement("span");
        div.appendChild(span);

        span.appendChild(element);

        width = span.offsetWidth;
        height = span.offsetHeight;
        scForm.browser.removeChild(div);

      
      if (height > window.screen.availHeight) {
        height = window.screen.availHeight;
        width += 16;
      }

      if (width > window.screen.availWidth) {
        width = window.screen.availWidth;
      }

    }
  }

  var ctl = null;
  var x = (evt != null ? evt.screenX : 0);
  var y = (evt != null ? evt.screenY : 0);

  if (id != null && id != "") {
    ctl = scForm.browser.getControl(id, doc);

    if (ctl != null) {
      switch (data.where) {
        case "contextmenu":
          ctl = null;
          break;

        case "left":
          x = -width;
          y = 0;
          break;

        case "right":
          x = ctl.offsetWidth - 3;
          y = 0;
          break;

        case "above":
          var temp = doc.body.offsetWidth - $(ctl).cumulativeOffset().left - width;
          x = temp < 0 ? temp : 0;
          y = -height + 1;
          break;

        case "below-right":
          x = ctl.offsetWidth - width;
          y = ctl.offsetHeight;
          break;

        case "dropdown":
          x = 0;
          y = ctl.offsetHeight;
          width = ctl.offsetWidth;
          break;

        default:
          x = 0;
          y = ctl.offsetHeight;
      }
    }
  }

  var popup = doc.parentWindow.createPopup();

  for (var n = 0; n < doc.styleSheets.length; n++) {
    popup.document.createStyleSheet(document.styleSheets[n].href);
  }

  popup.document.body.innerHTML = "<div style=\"width:100%;height:100%;overflow:hidden;\">" + html + "</div>";

  popup.document.parentWindow.scForm = scForm;
  popup.document.attachEvent("onselectstart", scIEOnSelectStart);
  popup.document.attachEvent("oncontextmenu", scIEOnContextMenu);

  if (this.version >= 8 || this.isIE8CompatibilityMode)
  {
    var popupData = new Object();
    popupData.where = data.where;
    popupData.x = x;
    popupData.y = y;
    popupData.width = width;
    popupData.height = height;
    popupData.eventX = doc.parentWindow.event.screenX;
    popupData.eventY = doc.parentWindow.event.screenY;
    
    scIE8FixPopup(popupData);
    
    x = popupData.x;
    y = popupData.y;
    width = popupData.width;
    height = popupData.height;
  }
  
  popup.show(x, y, width, height, ctl);

  doc.popup = popup;
}

function scIE8FixPopup(showData){
  resolutionX = window.screen.availWidth;
  resolutionY = window.screen.availHeight;
  someCorrection = 10;

  switch (showData.where){
        case "left":
          if (showData.eventX - showData.width < 0)
          {
            showData.x = showData.x + showData.width - showData.eventX + someCorrection + 20;
          }
          
          if (showData.eventY + showData.height > resolutionY)
          {
            showData.y = showData.y - (showData.eventY + showData.width - resolutionY) - someCorrection;
          }
          break;

        case "right":
          if (showData.eventX + showData.width >= resolutionX)
          {
           showData.x = showData.x - (showData.eventX + showData.width - resolutionX) - someCorrection - 20;
          }       
          
          if (showData.eventY + showData.height > resolutionY)
          {
            showData.y = showData.y - (showData.eventY + showData.height - resolutionY) - someCorrection;
          }
          break;
          
        case "above":
          if (showData.eventX + showData.width >= resolutionX)
          {
           showData.x = showData.x - (showData.eventX + showData.width - resolutionX) - someCorrection;
          }       
          if (showData.eventY - showData.height < 0)
          {
            showData.y = showData.y + showData.height - showData.eventY + someCorrection;
          }

          break;

        case "below-right":
          if (showData.eventY + showData.height > resolutionY)
          {
            showData.y = showData.y - (showData.eventY + showData.height - resolutionY) - someCorrection;
          }
          break;
          
        case "dropdown":
          if (showData.eventY + showData.height > resolutionY)
          {
            showData.y = showData.y - (showData.eventY + showData.height - resolutionY) - someCorrection;
          }
          break;
        case "contextmenu":
        default:
          if (showData.eventX + showData.width >= resolutionX){
           showData.x = showData.x - (showData.eventX + showData.width - resolutionX);
          }
          
          if (showData.eventY + showData.height >= resolutionY){
           showData.y = showData.y - (showData.eventY + showData.height - resolutionY) - someCorrection;
          }                
      }
}

scBrowser.prototype.swapNode = function(control, withControl) {
  control.swapNode(withControl);
}

// Disable text selection
function scIEOnSelectStart() {
  if (window.event == null) {
    return false;
  }
  
  if (window.event.altKey) {
    return;
  }

  var ctl = scForm.browser.getSrcElement(event);
  
  while (ctl != null) {
    var tag = ctl.tagName.toLowerCase();
    if (ctl.isContentEditable || tag == "input" || tag == "textarea") {
      return true;
    }
    ctl = ctl.parentElement;
  }
  
  return false;
}

// Disable context menu
function scIEOnContextMenu() {
  if (window.event == null) {
    return false;
  }

  var evt = window.event;
  
  if (evt.ctrlKey) {
    return true;
  }
  
  var ctl = scForm.browser.getSrcElement(evt);

  while (ctl != null) {
    if (ctl.tagName) {
      var tag = ctl.tagName.toLowerCase();
      
      if (ctl.isContentEditable || tag == "input" || tag == "textarea") {
        return true;
      }
    }
    ctl = ctl.parentElement;
  }
  
  return false;
}
