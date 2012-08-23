function scTFind() {
}

scTFind.prototype.onChange = function(evt) {
  if (this.timer != null) {
    window.clearTimeout(this.timer);
    this.timer = null;
  }
  
  this.timer = window.setTimeout("scFind.update()", 500);
}

scTFind.prototype.update = function() {
  window.clearTimeout(this.timer);
  this.timer = null;
  
  var request = new scRequest();
  
  request.async = true;
  request.buildFields();
  request.build("", "", "", "Update", true, "", scForm.modified);

  return request.execute();
}

scTGallery.prototype.onShowed = function() {
  scForm.focus(document.body);
  // scForm.browser.getControl("Query").focus()
}

var scFind = new scTFind();
