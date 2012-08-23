Sitecore.LayoutDefinition = new function() {
}

Sitecore.LayoutDefinition.insert = function(placeholderKey, id) {
  var layoutDefinition = this.getLayoutDefinition();
  var device = this.getDevice(layoutDefinition);

  var r = new Object();
  r["@id"] = id;
  r["@ph"] = placeholderKey;

  device.r.splice(0, 0, r);

  this.setLayoutDefinition(layoutDefinition);
}

Sitecore.LayoutDefinition.remove = function(uid) {
  var layoutDefinition = this.getLayoutDefinition();
  var device = this.getDevice(layoutDefinition);

  this.removeRendering(device, uid);

  this.setLayoutDefinition(layoutDefinition);
}

Sitecore.LayoutDefinition.removeRendering = function(device, uid) {
  for (n = 0; n < device.r.length; n++) {
    if (this.getShortID(device.r[n]["@uid"]) == uid) {
      r = device.r[n];
      device.r.splice(n, 1);
      return r;
    }
  }
  return null;
}

Sitecore.LayoutDefinition.moveToPosition = function(uid, placeholderKey, position) {
  var layoutDefinition = this.getLayoutDefinition();
  var device = this.getDevice(layoutDefinition);
  var originalPosition = this._getRenderingPositionInPlaceholder(device, placeholderKey, uid);
  var r = this.removeRendering(device, uid);
  if (r == null) {
    return;
  }
  
  r["@ph"] = placeholderKey;

  if (position == 0) {
     device.r.splice(0, 0, r);
     this.setLayoutDefinition(layoutDefinition);
     return;
  }
  // Rendering is moving down inside the same placeholder. Decrement the real position, because rendering itself is removed 
  // from his original position. 
  if (originalPosition > -1 && originalPosition < position) {
    position--;
  }

  var placeholderWiseCount = 0;
  for (var totalCount = 0; totalCount < device.r.length; totalCount++)
  {
    var rendering = device.r[totalCount];       
    if (Sitecore.PageModes.Utility.areEqualPlaceholders(rendering["@ph"], placeholderKey))
    {
      placeholderWiseCount++;
    }

    if (placeholderWiseCount == position)
    {
      device.r.splice(totalCount + 1, 0, r);
      break;
    }
  }
    
  this.setLayoutDefinition(layoutDefinition);
}

Sitecore.LayoutDefinition.getRenderingIndex = function(placeholderKey, index) {
  var layoutDefinition = this.getLayoutDefinition();
  var device = this.getDevice(layoutDefinition);

  var i = 0;

  for (n = 0; n < device.r.length; n++) {
    if (device.r[n]["@ph"] == placeholderKey) {
      if (i == index) {
        return n;
      }

      i++;
    }
  }

  return -1;
}

Sitecore.LayoutDefinition.getRenderingPositionInPlaceholder = function(placeholderKey, uid) {
  var layoutDefinition = this.getLayoutDefinition();
  var device = this.getDevice(layoutDefinition);
  return this._getRenderingPositionInPlaceholder(device, placeholderKey, uid);
}

Sitecore.LayoutDefinition.getLayoutDefinition = function() {
  return $F("scLayout").evalJSON(true);
}

Sitecore.LayoutDefinition.setLayoutDefinition = function(layoutDefinition) {
  var newValue = Object.toJSON(layoutDefinition);
  if ($("scLayout").value != newValue) {
    $("scLayout").value = newValue;
    Sitecore.PageModes.ChromeManager.setModified(true);
  }
}

Sitecore.LayoutDefinition.getDeviceID = function() {
  return $F("scDeviceID");
}

Sitecore.LayoutDefinition.getDevice = function(layoutDefinition) {
  var deviceID = this.getDeviceID();

  if (!layoutDefinition.r.d) {
    return null;
  }

  //By serialization behaivour. If there is single element- it would not be serialized as array
  if (!layoutDefinition.r.d.length) {
    layoutDefinition.r.d = [layoutDefinition.r.d];
  }

  var list = layoutDefinition.r.d;

  for (var n = 0; n < list.length; n++) {
    var d = list[n];

    var id = this.getShortID(d["@id"]);

    if (id == deviceID) {
      //By serialization behaivour. If there is single element- it would not be serialized as array
      if (d.r && !d.r.length) {
        d.r = [d.r];
      }
      return d;
    }
  }

  return null;
}

Sitecore.LayoutDefinition.getShortID = function(id) {
  return id.substr(1, 8) + id.substr(10, 4) + id.substr(15, 4) + id.substr(20, 4) + id.substr(25, 12);
}

Sitecore.LayoutDefinition._getRenderingPositionInPlaceholder = function(device, placeholderKey, uid) {
  var counter = 0;
  for (var i = 0; i < device.r.length; i++) {
    if (Sitecore.PageModes.Utility.areEqualPlaceholders(device.r[i]["@ph"],placeholderKey)) {
      if (this.getShortID(device.r[i]["@uid"]) == uid) {
        return counter;
      }

      counter++;
    }
  }

  return -1;
}

