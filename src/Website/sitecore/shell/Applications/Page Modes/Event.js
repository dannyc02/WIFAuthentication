Sitecore.Event = Class.create({
  initialize: function() {
    this._callbacks = new Array();
  },
  
  fire: function(args) {
    this._callbacks.each(function(callback) { callback(args); });
  },
  
  observe: function(callback) {
    if (this._callbacks.include(callback)) {
      return;
    }
    
    this._callbacks.push(callback);
  },
  
  stopObserving: function(callback) {
    this._callbacks = this._callbacks.without(callback);
  }
})