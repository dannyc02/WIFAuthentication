if (typeof(Sitecore) == "undefined") {
  Sitecore = new Object();
}

Sitecore.Treeview = new function() {
}

Sitecore.Treeview.collapseTreeNode = function(node) {
  while(node.childNodes.length > 2) {
    node.removeChild(node.childNodes[2]);
  }

  this.setGlyph(node.down(), "/expand15x15");
}

Sitecore.Treeview.expandTreeNode = function(node, html) {
  this.collapseTreeNode(node);
  
  if (html != "") {
    node.insert("<div>" + html + "</div>");

    this.setGlyph(node.down(), "/collapse15x15");
  }
  else {
    this.setGlyph(node.down(), "/noexpand15x15");
  }
}

Sitecore.Treeview.onTreeClick = function(element, evt, click) {
  var source = Event.element(evt);
  var node = source.up("div");
  if (node == null || node.id == null || node.id == "") {
    return;
  }
  
  var id = node.id.substr(node.id.lastIndexOf("_") + 1)
  
  if (source.className == "scContentTreeNodeGlyph") {
    return this.onTreeGlyphClick(node, $(element), id);
  }
  
  return this.onTreeNodeClick(node, $(element), evt, id, click);
}

Sitecore.Treeview.onTreeGlyphClick = function(node, treeElement, id) {
  var glyph = node.down();

  if (glyph.src.indexOf("expand15x15") >= 0) {
    this.setGlyph(glyph, "/loading15x15");
    
    var content = $F(treeElement.id + "_Database");
    
    body = treeElement.id + "_Selected=" + escape($F(treeElement.id + "_Selected")) + "&" + treeElement.id + "_Parameters=" + escape($F(treeElement.id + "_Parameters"));
    var templateID = $(treeElement.id + "_templateID");   
    if (templateID) {
      body += "&" + treeElement.id + "_templateID=" + escape(templateID.value);
    }
    var displayFieldName = $(treeElement.id + "_displayFieldName");
    if (displayFieldName) {
      body += "&" + treeElement.id + "_displayFieldName=" + escape(displayFieldName.value);
    }


    new Ajax.Request("/sitecore/shell/Controls/TreeviewEx/TreeviewEx.aspx?treeid=" + encodeURIComponent(treeElement.id) + "&id=" + encodeURIComponent(id) + (content != null ? "&sc_content=" + content : ""), {
        method:"post",
        postBody: body,
        onSuccess: function(transport) { Sitecore.Treeview.expandTreeNode(node, transport.responseText) },
        onException: function(request, ex){ alert(ex) },
        onFailure: function(request){ alert("Failed") }
      });
  }
  else {
    this.collapseTreeNode(node);
  }
  
  return false;
}

Sitecore.Treeview.refresh = function(node, treeElement, id) {
  scForm.browser.closePopups();
  node = $(node);
  this.collapseTreeNode(node);
  this.onTreeGlyphClick(node, $(treeElement), id);
}

Sitecore.Treeview.onTreeNodeClick = function(node, treeElement, evt, id, click) {
  var selectedElement = $(treeElement.id + "_Selected")
  var selected = selectedElement.value;
  
  if (!evt.shiftKey) {
    selected = "";
    var active = treeElement.getElementsBySelector(".scContentTreeNodeActive");
    
    if (active != null && active.length > 0) {
      active.each(function(e) { 
        e.className = "scContentTreeNodeNormal" 
      });
    }
  }
  
  node.down().next().className = "scContentTreeNodeActive";
  selectedElement.value = selected + (selected != "" ? "," : "") + id;
  
  if (click != null) {
    scForm.postEvent(treeElement, evt, click);
  }
  
  return false;
}

Sitecore.Treeview.setGlyph = function(glyph, src) {
  glyph.src = glyph.src.replace("/expand15x15", src).replace("/noexpand15x15", src).replace("/collapse15x15", src).replace("/loading15x15", src);
}

Sitecore.Treeview.onTreeDrag = function(element, evt) {
  if (evt.button == 1 || evt.type == "dragstart") {
    var source = Event.element(evt).up("div");
    
    if (source != null) {
      scForm.drag(element, evt, "item:" + source.id);
    }
  }
}

Sitecore.Treeview.onTreeDrop = function(element, evt) {
  var e = $(document.elementFromPoint(evt.clientX, evt.clientY)).up("DIV");
  
  if (e != null && e.id != null && e.id != "") {
    var parameters = null;
    
    if (evt.type == "drop") {
      parameters = element.id + '.Drop("$Data,'+ e.id + '")';
    }
  
    scForm.drop(element, evt, parameters);
  }
}

