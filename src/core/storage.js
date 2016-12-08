// GreaseMonkey API compatibility for non-GM browsers (Chrome, Safari, Firefox)
// @copyright       2009, 2010 James Campos
// @modified        2010 Steve Sobel - added some missing gm_* functions
// @modified        2015 Travis Grammer - interact with storage via JSON
// @license         cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
/* eslint-disable */
if ((typeof GM_deleteValue === 'undefined') || (typeof GM_addStyle === 'undefined')) {
  var GM_getValue = function (name, defaultValue) {
    var value = localStorage[name]
        // do not use '===' (ignore JSHint)
    return value == null ? defaultValue : JSON.parse(value)
  }

  var GM_setValue = function (name, value) {
    localStorage[name] = JSON.stringify(value)
  }

  var GM_deleteValue = function (name) {
    localStorage.removeItem(name)
  }

  var GM_addStyle = function (css) {
    var style = document.createElement('style')
    style.textContent = css
    var head = document.getElementsByTagName('head')[0]
    if (head) {
      head.appendChild(style)
    }
  }

  var GM_log = function (message) {
    console.log(message)
  }

  var GM_openInTab = function (url) {
    window.open(url)
  }

    // GM_listValues
    // GM_xmlhttpRequest
}

// get values out of GM/localStorage, and perform an
// action using them with the callback. 'items' (whatever matches 'key')
// can be used as the argument in the callback.
get = function (key, val, callback) {
// OR function(key, callback), if val isn't specified
  var items
    // if val is specified then we're looking for the specific instance of
    // 'key' with value 'val'
  if (typeof callback === 'function') {
    items = item(key, val)
  } else { // if val isn't specified get every entry with the key
    items = key
    callback = val
  }

    // perform the callback
  for (key in items) {
    val = GM_getValue(info.namespace + key)
    if (val) {
      items[key] = JSON.parse(val)
    }
  }
  return callback(items)
}

// set values to GM/localStorage.
set = (function () {
  var set = function (key, val) {
    key = info.namespace + key // 'key' -> 'VES.key'
    val = JSON.stringify(val)
    return GM_setValue(key, val)
  }
    // this is the actual definition of set():
  return function (keys, val) {
    if (typeof keys === 'string') {
            // set the value if there's only one key
      set(keys, val)
      return
    }
        // if it's a JSON, iterate & set each key
    for (var key in keys) {
      val = keys[key]
      set(key, val)
    }
  }
})()

// remove data from GM/localStorage
_delete = function (keys) {
  if (!(keys instanceof Array)) { // we'll want an array
    keys = [keys]
  }
    // delete each key:
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i]
    key = info.namespace + key // 'key' -> 'VES.key'
        // purge the key's data
    localStorage.removeItem(key)
    GM_deleteValue(key)
  }
}

function testLocalStorage () {
  var accessible = true

  try {
    localStorage.setItem('VES.test', 'test')
    GM_setValue('VES.test', 'test')
    localStorage.removeItem('VES.test')
    GM_deleteValue('VES.test')
  } catch (e) {
    accessible = false
  }

  if (!(accessible)) {
    cli.error('Browser storage is unavailable. Are you in a private session?')
  }
}
