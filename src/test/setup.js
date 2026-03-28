// Polyfill localStorage for node environment
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    setItem: function(key, value) {
      this._data[key] = String(value);
    },
    getItem: function(key) {
      return this._data[key] || null;
    },
    removeItem: function(key) {
      delete this._data[key];
    },
    clear: function() {
      this._data = {};
    }
  };
}
