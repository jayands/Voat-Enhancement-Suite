var info = {
  v: '0.0.3',
  namespace: 'VES.',
  name: 'Voat Enhancement Suite',
  abbr: 'VES'
}

// shortening
var doc = document,
  cli = console

// isolate VES's jQuery instance from Voat's
this.$ = this.jQuery = jQuery.noConflict(true)

// test for unsafeWindow, signaling Grease/Tampermonkey
if (typeof (unsafeWindow) !== 'undefined') {
  localStorage = unsafeWindow.localStorage
}

/*
    global utils
*/

// create a JSON from key/val pair
item = function (key, val) {
  var item = {}
  item[key] = val
  return item
}

// add (with replacement) a JSON of properties to an object
extend = function (obj, props) {
  for (var key in props) {
    val = props[key]
    obj[key] = val
  }
}

// wait until test can be done and then perform a callback
asap = function (test, callback) {
    // if test CAN be done perform the callback
  if (test()) {
    return callback()
  } else {
        // if you can't do test, wait and try again
    return setTimeout(asap, 25, test, callback)
  }
}

// DOM utilities

// create a new element with a list of properties
el = function (tag, props) {
  var el = doc.createElement(tag)
    // if a JSON of properties is passed in, apply them
  if (props) {
    extend(el, props)
  }
  return el
}
// alias for getElementById()
id = function (id) {
  return doc.getElementById(id)
}

fragment = function () {
  return doc.createDocumentFragment()
}
nodes = function (nodes) {
    // if just one node return it
  if (!(nodes instanceof Array)) {
    return nodes
  }
    // if theres a bunch, create a new section of document,
    // then add all of the nodes as sibilings
  var frag = fragment()
  for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i]
    frag.appendChild(node)
  }
  return frag
}

add = function (parent, el) {
  return $(parent).append(nodes(el))
}
prepend = function (parent, el) {
  return $(parent).insertBefore(nodes(el), parent.firstChild)
}
after = function (root, el) {
  return root.parentNode.insertBefore(nodes(el), root.nextSibiling)
}
before = function (root, el) {
  return root.parentNode.insertBefore(nodes(el), root)
}

// create a custom event
event = function (event, detail, root) {
    // OR function(event, detail), if root is document
  if (root === null) {
    root = doc
  }
  if ((detail !== null) && typeof cloneInto === 'function') {
    detail = cloneInto(detail, doc.defaultView)
  }
  return root.dispatchEvent(new CustomEvent(event, {
    bubbles: true,
    detail: detail
  }))
}

// limit the rate the a function can fire at, so
// browser performance is maintained
debounce = function (wait, func) {
  var args = null
  var lastCall = 0
  var timeout = null
  var that = null
  var exec = function () {
    lastCall = Date.now()
    return func.apply(that, args)
  }
  return function () {
    args = arguments
    that = this
        // if enough time has passed exec the function
    if (lastCall < Date.now() - wait) {
      return exec()
    }
    clearTimeout(timeout)
    timeout = setTimeout(exec, wait)
    return timeout
  }
}

// sanitize HTML
escape = (function () {
  var str = {
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#039;',
    '<': '&lt;',
    '>': '&gt;'
  }
  var r = String.prototype.replace
  var regex = /[&"'<>]/g
  var fn = function (x) {
    return str[x]
  }
  return function (text) {
    return r.call(text, regex, fn)
  }
})()

// don't kill everything if a JSON parse fails
safeJSON = function (data, storageSource, silent) {
  try {
    return JSON.parse(data)
  } catch (e) {
    if (silent) return {}
    if (storageSource) {
      cli.error('Error caught: JSON parse fail on \'' + data + '\' from ' + storageSource)
            // cli.error('Storing and deleting corrupt data.');
      GM_setValue(storageSource + '.error', data)
    } else {
      cli.error('Error caught: JSON parse failed on: ' + data)
    }
    return {}
  }
}

// keycodes
var KEY = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  NUMPAD_ENTER: 108,
  COMMA: 188
}

var Utils = {}
var Modules = {}
