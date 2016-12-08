// ==UserScript==
// @name        Voat Enhancement Suite
// @version     0.0.3
// @description A suite of tools to enhance Voat.
// @namespace   http://tjg.io/Voat-Enhancement-Suite
// @author      @travis <travisjgrammer@gmail.com>
// @license     GPL; https://github.com/travis-g/Voat-Enhancement-Suite/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_openInTab
// @run-at      document-start
// @require     http://code.jquery.com/jquery-latest.js
// @updateURL   voat-enhancement-suite.meta.js
// @downloadURL voat-enhancement-suite.user.js
// ==/UserScript==

/*
*    Voat Enhancement Suite - Version 0.0.3 - 2015-07-10
*
*    Licensed under GNU General Public License.
*    https://github.com/travis-g/Voat-Enhancement-Suite/blob/master/LICENSE
*
This character may get silently deleted by one or more browsers.
*    Voat Enhancement Suite Copyright © 2015 @travis <travisjgrammer@gmail.com>
*    https://github.com/travis-g/Voat-Enhancement-Suite/
This character may get silently deleted by one or more browsers.
*    Reddit Enhancement Suite Copyright © 2010-2015 honestbleeps <steve@honestbleeps.com>
*    https://github.com/honestbleeps/Reddit-Enhancement-Suite/
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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

// GreaseMonkey API compatibility for non-GM browsers (Chrome, Safari, Firefox)
// @copyright       2009, 2010 James Campos
// @modified        2010 Steve Sobel - added some missing gm_* functions
// @modified        2015 Travis Grammer - interact with storage via JSON
// @license         cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
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

// register the OS, browser, and so on.
var System = {
  init: function () {
    this.browser = this.searchString(this.dataBrowser) || 'unknown browser'
    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'unknown version'
    this.OS = this.searchString(this.dataOS) || 'unknown OS'
  },
  searchString: function (data) {
    for (var i = 0; i < data.length; i++) {
      var dataString = data[i].string
      var dataProp = data[i].prop
      this.versionSearchString = data[i].versionSearch || data[i].identity
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1) {
          return data[i].identity
        }
      } else if (dataProp) {
        return data[i].identity
      }
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString)
    if (index == -1) return
    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1))
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: 'Chrome',
      identity: 'Chrome'
    },
    {
      string: navigator.vendor,
      subString: 'Apple',
      identity: 'Safari',
      versionSearch: 'Version'
    },
    {
      prop: window.opera,
      identity: 'Opera',
      versionSearch: 'Version'
    },
    {
      string: navigator.vendor,
      subString: 'KDE',
      identity: 'Konqueror'
    },
    {
      string: navigator.userAgent,
      subString: 'Firefox',
      identity: 'Firefox'
    },
    {
      string: navigator.vendor,
      subString: 'Camino',
      identity: 'Camino'
    },
    {
      string: navigator.userAgent,
      subString: 'MSIE',
      identity: 'Explorer',
      versionSearch: 'MSIE'
    }
  ],
  dataOS: [
    {
      string: navigator.platform,
      subString: 'Win',
      identity: 'Windows'
    },
    {
      string: navigator.platform,
      subString: 'Mac',
      identity: 'Mac'
    },
    {
      string: navigator.userAgent,
      subString: 'iPhone',
      identity: 'iPhone/iPod'
    },
    {
      string: navigator.platform,
      subString: 'Linux',
      identity: 'Linux'
    }
  ]
}
System.init()

/*
    common utils/functions for modules
*/

Utils = {
  css: '',
  addCSS: function (css) {
    this.css += css
  },
    // create and add VES's CSS to <head>
  applyCSS: function (css, id) {
    var style = el('style', {
      id: id,
      textContent: css
    })
    asap(function () {
      return doc.head
    }, function () {
      return add(doc.head, style)
    })
    return style
  },

  regexes: {
    all: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\//i,
    inbox: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\/messaging\/([\w\.\+]+)\//i,
    comments: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\/v\/([\w\.\+]+)\/comments\/([\w\.\+]+)/i,
        // commentPermalink:
    profile: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\/user\/([\w\.\+]+)/i,
        // prefs:
        // search:
    submit: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\/(?:[\-\w\.]+\/)?submit/i,
    subverse: /^https?:\/\/(?:[\-\w\.]+\.)?voat\.co\/v\/([\w\.\+]+)/i
        // subversePostListing:
  },
  isVoat: function () {
    var currURL = location.href
    return Utils.regexes.all.test(currURL)
  },
  isMatchURL: function (moduleID) {
    if (!Utils.isVoat()) {
      return false
    }
    var module = Modules[moduleID]
    if (!module) {
      console.warn('isMatchURL could not find module', moduleID)
      return false
    }

    var exclude = module.exclude,
      include = module.include
    return Utils.matchesPageLocation(include, exclude)
  },
  matchesPageLocation: function (includes, excludes) {
    includes = typeof includes === 'undefined' ? [] : [].concat(includes)
    excludes = typeof excludes === 'undefined' ? [] : [].concat(excludes)

    var excludesPageType = excludes.length && (Utils.isPageType.apply(Utils, excludes) || Utils.matchesPageRegex.apply(Utils, excludes))
    if (!excludesPageType) {
      var includesPageType = !includes.length || Utils.isPageType.apply(Utils, includes) || Utils.matchesPageRegex.apply(Utils, includes)
      return includesPageType
    }
  },
  pageType: function () {
    if (typeof this.pageTypeSaved === 'undefined') {
      var pageType = ''
      var currURL = location.href
      if (Utils.regexes.profile.test(currURL)) {
        pageType = 'profile'
      } else if (Utils.regexes.comments.test(currURL)) {
        pageType = 'comments'
      } else if (Utils.regexes.inbox.test(currURL)) {
        pageType = 'inbox'
      } else if (Utils.regexes.submit.test(currURL)) {
        pageType = 'submit'
      } else if (Utils.regexes.subverse.test(currURL)) {
        pageType = 'subverse'
      } else {
        pageType = 'linklist'
      }
      this.pageTypeSaved = pageType
    }
    return this.pageTypeSaved
  },
  isPageType: function (/* type1, type2 */) {
    var thisPage = Utils.pageType()
    return Array.prototype.slice.call(arguments).some(function (e) {
      return (e === 'all') || (e === thisPage)
    })
  },
  matchesPageRegex: function (/* type1, type2, type3 */) {
    var href = document.location.href
    return Array.prototype.slice.call(arguments).some(function (e) {
      return e.text && e.test(href)
    })
  },
  getURLParams: function () {
    var result = {}, queryString = location.search.substring(1),
      re = /([^&=]+)=([^&]*)/g, m = re.exec(queryString)
    while (m) {
      result[decodeURLComponent(m[1])] = decodeURLComponent(m[2])
    }
    return result
  },
  currentSubverse: function (check) {
    if (typeof this.curSub === 'undefined') {
      var match = location.href.match(Utils.regexes.subverse)
      if (match !== null) {
        this.curSub = match[1]
        if (check) return (match[1].toLowerCase() === check.toLowerCase())
        return match[1]
      } else {
        if (check) return false
        return null
      }
    } else {
      if (check) return (this.curSub.toLowerCase() === check.toLowerCase())
      return this.curSub
    }
  },
  getXYpos: function (obj) {
    var topValue = 0, leftValue = 0
    while (obj) {
      leftValue += obj.offsetLeft
      topValue += obj.offsetTop
      obj = obj.offsetParent
    }
    finalvalue = { 'x': leftValue, 'y': topValue }
    return finalvalue
  },
  elementInViewport: function (obj) {
        // check the headerOffset - if we've pinned the subverse bar, we need to add some pixels so the "visible" stuff is lower down the page.
    var headerOffset = this.getHeaderOffset()
    var top = obj.offsetTop - headerOffset
    var left = obj.offsetLeft
    var width = obj.offsetWidth
    var height = obj.offsetHeight
    while (obj.offsetParent) {
      obj = obj.offsetParent
      top += obj.offsetTop
      left += obj.offsetLeft
    }
    return (
            top >= window.pageYOffset &&
            left >= window.pageXOffset &&
            (top + height) <= (window.pageYOffset + window.innerHeight - headerOffset) &&
            (left + width) <= (window.pageXOffset + window.innerWidth)
    )
  },
  stripHTML: function (str) {
    var regex = /<\/?[^>]+>/gi
    str = str.replace(regex, '')
    return str
  },
  sanitizeHTML: function (htmlStr) {
    return window.Pasteurizer.safeParseHTML(htmlStr).wrapAll('<div></div>').parent().html()
  },
  firstValid: function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var argument = arguments[i]

      if (argument === void 0) continue
      if (argument === null) continue
      if (typeof argument === 'number' && isNaN(argument)) continue
      return argument
    }
  },
  click: function (obj, btn) {
    var evt = document.createEvent('MouseEvents')
    btn = btn || 0
    evt.initMouseEvent('click', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null)
    obj.dispatchEvent(evt)
  },
  mousedown: function (obj, btn) {
    var evt = document.createEvent('MouseEvents')
    btn = btn || 0
    evt.initMouseEvent('mousedown', true, true, window.wrappedJSObject, 0, 1, 1, 1, 1, false, false, false, false, button, null)
    obj.dispatchEvent(evt)
  },
  elementUnderMouse: function (obj) {
        // TODO
  },
  isDarkMode: function () {
        // check if isDarkMode has been run already
    if (typeof (this.isDarkModeCached) !== 'undefined') return this.isDarkModeCached
        // search the VES stylesheet link URL for 'Dark'

    this.isDarkModeCached = false
    var links = $('link')
    for (var i = 0, len = links.length; i < len; i++) {
      if (links[i].href.indexOf('Dark') > -1) {
        this.isDarkModeCached = true
      }
    }
    return this.isDarkModeCached
  }
}

$.extend(Utils, {
  resetModulePrefs: function () {
    prefs = {
      'debug': true,
      'hideChildComments': true,
      'voatingNeverEnds': false,
      'singleClick': true,
      'searchHelper': false,
      'filterVoat': false,
      'userTags': false,
      'voatingBooth': false
    }
    this.setModulePrefs(prefs)
    return prefs
  },
  getAllModulePrefs: function (force) {
    var storedPrefs
        // don't repeat if it's been done already
    if ((!force) && (typeof (this.getAllModulePrefsCached) !== 'undefined')) {
      return this.getAllModulePrefsCached
    }
        // console.log('entering getAllModulePrefs()...')
    if (localStorage.getItem('VES.modulePrefs') !== null) {
      storedPrefs = safeJSON(localStorage.getItem('VES.modulePrefs'))
    } else {
            // console.log('getAllModulePrefs: resetting stored prefs');
            // first time VES has been run
      storedPrefs = this.resetModulePrefs()
    }
    if (!storedPrefs) {
      storedPrefs = {}
    }
        // create a JSON object to return all prefs
        // console.log('getAllModulePrefs: creating prefs object');
    var prefs = {}
    for (var module in Modules) {
      if (storedPrefs[module]) {
        prefs[module] = storedPrefs[module]
      } else if (!Modules[module].disabledByDefault && (storedPrefs[module] === null || module.alwaysEnabled)) {
                // new module! ...or no preferences.
        prefs[module] = true
      } else {
        prefs[module] = false
      }
    }
    this.getAllModulePrefsCached = prefs
    return prefs
  },
  getModulePrefs: function (moduleID) {
    if (moduleID) {
      var prefs = this.getAllModulePrefs()
      return prefs[moduleID]
    } else {
      alert('no module name specified for getModulePrefs')
    }
  },
  setModulePrefs: function (prefs) {
    if (prefs !== null) {
      localStorage.setItem(info.namespace + 'modulePrefs', JSON.stringify(prefs))
      return prefs
    } else {
      alert('error - no prefs specified')
    }
  },
  getModuleIDsByCategory: function (category) {
    var moduleList = Object.getOwnPropertyNames(Modules)

    moduleList = moduleList.filter(function (moduleID) {
      return !Modules[moduleID].hidden
    })
    moduleList = moduleList.filter(function (moduleID) {
      return [].concat(Modules[moduleID].category).indexOf(category) !== -1
    })
    moduleList.sort(function (moduleID1, moduleID2) {
      var a = Modules[moduleID1]
      var b = Modules[moduleID2]

      if (a.sort !== void 0 || b.sort !== void 0) {
        var sortComparison = (a.sort || 0) - (b.sort || 0)
        if (sortComparison !== 0) {
          return sortComparison
        }
      }

      if (a.moduleName.toLowerCase() > b.moduleName.toLowerCase()) return 1
      return -1
    })

    return moduleList
  },
  enableModule: function (moduleID, onOrOff) {
    var module = Modules[moduleID]
    if (!module) {
      console.warn('options.enableModule could not find module', moduleID)
      return
    }
    if (module.alwaysEnabled && !onOrOff) {
      return
    }

    var prefs = this.getAllModulePrefs(true)
    prefs[moduleID] = !!onOrOff
    this.setModulePrefs(prefs)
    if (typeof module.onToggle === 'function') {
      Modules[moduleID].onToggle(onOrOff)
    }
  },
  setOption: function (moduleID, optionName, optionValue) {
    if (/_[\d]+$/.test(optionName)) {
      optionName = optionName.replace(/_[\d]+$/, '')
    }
    var thisOptions = this.getOptions(moduleID)
    if (!thisOptions[optionName]) {
      console.warn('Could not find option', moduleID, optionName)
      return false
    }

    var saveOptionValue
    if (optionValue === '') {
      saveOptionValue = ''
    } else if ((isNaN(optionValue)) || (typeof optionValue === 'boolean') || (typeof optionValue === 'object')) {
      saveOptionValue = optionValue
    } else if (optionValue.indexOf('.') !== -1) {
      saveOptionValue = parseFloat(optionValue)
    } else {
      saveOptionValue = parseInt(optionValue, 10)
    }
    thisOptions[optionName].value = saveOptionValue
        // save it to the object and to VESStorage
    Utils.saveModuleOptions(moduleID, thisOptions)
    return true
  },
  saveModuleOptions: function (moduleID, newOptions) {
    function minify (obj) {
      var min = {}
      if (obj) {
        for (var key in obj) {
          if ('value' in obj[key]) {
            min[key] = {value: obj[key].value}
          }
        }
      }
      return min
    }
    if (newOptions) {
      Modules[moduleID].options = newOptions
    }
    localStorage.setItem(info.namespace + moduleID, JSON.stringify(minify(Modules[moduleID].options)))
  },
  getOptionsFirstRun: [],
  getOptions: function (moduleID) {
    if (this.getOptionsFirstRun[moduleID]) {
            // we've already grabbed these out of localstorage, so modifications should be done in memory. just return that object.
      return Modules[moduleID].options
    }
    var thisOptions = localStorage.getItem('VESOptions.' + moduleID)
    if ((thisOptions) && (thisOptions !== 'undefined') && (thisOptions !== null)) {
            // merge options (in case new ones were added via code) and if anything has changed, update to localStorage
      var storedOptions = safeJSON(thisOptions, 'VESoptions.' + moduleID)
      var codeOptions = Modules[moduleID].options
      var newOption = false
      for (var attrname in codeOptions) {
        codeOptions[attrname].default = codeOptions[attrname].value
        if (typeof storedOptions[attrname] === 'undefined') {
          newOption = true
        } else {
          codeOptions[attrname].value = storedOptions[attrname].value
        }
      }
      Modules[moduleID].options = codeOptions
      if (newOption) {
        Utils.saveModuleOptions(moduleID)
      }
    } else {
            // nothing in localStorage, let's set the defaults...
      Utils.saveModuleOptions(moduleID)
    }
    this.getOptionsFirstRun[moduleID] = true
    return Modules[moduleID].options
  }
})

Modules.debug = {
  moduleID: 'debug',
  moduleName: 'VES Debugger',
  description: 'VES analytics for debugging.',
  options: {
    printSystemInfos: {
      type: 'boolean',
      value: true,
      description: 'Print system information (OS & browser) to the console. Helps when submitting bug reports.'
    },
    printLocalStorage: {
      type: 'boolean',
      value: false,
      description: 'Print the contents of localStorage to the console on every page load.'
    }
        // new options format:
        // 'Log System Info': [true, 'Print system information to the console. Helps when submitting bug reports.'],
        // 'Print localStorage': [true, 'Print the contents of localStorage to the console on each page.']
  },
  isEnabled: function () {
        // technically cheating
    return true
  },
  include: [
    'all'
  ],
  isMatchURL: function () {
    return Utils.isMatchURL(this.moduleID)
  },
  go: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
      cli.log('VES loaded: ' + Date())

      this.printSystemInfos()

            // add a link to VES in the footer
      var separator = el('span', {
        className: 'separator'
      })
      var link = el('a', {
        href: 'http://github.com/travis-g/Voat-Enhancement-Suite',
        innerHTML: 'VES'
      })

      asap(function () {
        return doc.body
      }, function () {
        var footer = $('.footer-container > .footer > div', doc)
        add(footer, separator)
        add(footer, link)
      })
    }
  },
  printSystemInfos: function () {
    if (this.options.printSystemInfos) {
      cli.log('System Information:')
      var json = {
        'OS': System.OS,
        'Browser': System.browser + ' ' + System.version
      }
      cli.log(JSON.stringify(json))
    }
  },
  printLocalStorage: function () {
        // this should probably go in Utils
    cli.log('localStorage data...')
    for (var key in localStorage) {
      cli.log(key + ':')
      cli.log(localStorage[key])
    }
  }
}

Modules.hideChildComments = {
  moduleID: 'hideChildComments',
  moduleName: 'Hide All Child Comments',
  description: 'Allows you to hide all child comments for easier reading.',
  options: {
    automatic: {
      type: 'boolean',
      value: false,
      description: 'Automatically hide all child comments on page load?'
    }
        // new options format
        // 'Auto Hide Child Comments': [false, 'Automatically hide all child comments on page load.'],
  },
  include: [
    'comments'
  ],
  isEnabled: function () {
    return Utils.getModulePrefs(this.moduleID)
  },
  isMatchURL: function () {
    return Utils.isMatchURL(this.moduleID)
  },
  go: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
            // begin creating the OP's 'hide child comments' button
      var toggleButton = el('li')
      this.toggleAllLink = el('a', {
        textContent: 'hide all child comments',
        href: '#',
        title: 'Show only replies to original poster.'
      })
      this.toggleAllLink.setAttribute('action', 'hide')
      this.toggleAllLink.addEventListener('click', function (e) {
        e.preventDefault()
        Modules.hideChildComments.toggleComments(this.getAttribute('action'))
        if (this.getAttribute('action') == 'hide') {
          this.setAttribute('action', 'show')
          this.setAttribute('title', 'Show all comments.')
          this.textContent = 'show all child comments'
        } else {
          this.setAttribute('action', 'hide')
          this.setAttribute('title', 'Show only replies to original poster.')
          this.textContent = 'hide all child comments'
        }
      }, true)
      add(toggleButton, this.toggleAllLink)
      var commentMenu = doc.querySelector('ul.buttons')
      if (commentMenu) {
                // add the post's toggle
        commentMenu.appendChild(toggleButton)
                // get the comments of every top-level comment
                // there's no parent element that groups every root comment's comments, so we'll need to get them all
        var rootComments = doc.querySelectorAll('div.commentarea > div.sitetable > div.thread')
                // for every root comment add a hide child elements link
        for (var i = 0, len = rootComments.length; i < len; i++) {
          toggleButton = el('li')
          var toggleLink = el('a', {
            textContent: 'hide child comments',
            href: '#',
            className: 'toggleChildren'
          })
          toggleLink.setAttribute('action', 'hide')
          toggleLink.addEventListener('click', function (e) {
            e.preventDefault()
            Modules.hideChildComments.toggleComments(this.getAttribute('action'), this)
          }, true)
          add(toggleButton, toggleLink)
                    // console.log('toggleButton: ' + typeof(toggleButton));
                    // get the first (if any) comment of the root
          var childComment = rootComments[i].querySelector('.child')
          if (childComment !== null) { // only add the link if they're comments
            var rootMenu = rootComments[i].querySelector('ul.buttons')
            if (rootMenu) rootMenu.appendChild(toggleButton)
          }
        }
        if (this.options.automatic.value) {
                    // don't auto-hide in comment permalinks
                    // url: /comments/12345/123456
          var linkRE = /\/comments\/(?:\w+)\/(?:\w+)/
          if (!location.pathname.match(linkRE)) {
            Utils.click(this.toggleAllLink)
          }
        }
      }
    }
  },
  toggleComments: function (action, obj) {
    var commentContainers
    if (obj) { // toggle a single comment tree
      commentContainers = $(obj).closest('.thread')
    } else { // toggle all comments
      cli.log('Hiding all child comments...')
      commentContainers = doc.querySelectorAll('div.commentarea > div.sitetable > div.thread')
    }
    for (var i = 0, len = commentContainers.length; i < len; i++) {
            // get the children under comment i
      var thisChildren = commentContainers[i].querySelectorAll('div.child')
      var numChildren = thisChildren.length
            // cli.log('hiding ' + numChildren + ' children');
            // get the root comment's "hide your kids" link
      var thisToggleLink = commentContainers[i].querySelector('a.toggleChildren')
      if (thisToggleLink !== null) {
                // for each child in thisChildren either hide it or show it
        for (var x = 0, y = thisChildren.length; x < y; x++) {
          if (action === 'hide') {
                        // Voat's already got a .hidden class, use that
            $(thisChildren[x]).addClass('hidden')
            thisToggleLink.innerHTML = 'show child comments'
            thisToggleLink.setAttribute('action', 'show')
          } else {
            $(thisChildren[x]).removeClass('hidden')
            thisToggleLink.innerHTML = 'hide child comments'
            thisToggleLink.setAttribute('action', 'hide')
          }
        }
      }
    }
  }
}

Modules.searchHelper = {
  moduleID: 'searchHelper',
  moduleName: 'Search Helper',
  description: 'Provide help with the use of search.',
  options: {
    searchSubverseByDefault: {
      type: 'boolean',
      value: true,
      description: 'Search the current subverse by default when using the search box, instead of all of voat.'
    }
        // addSearchOptions: {
        //     type: 'boolean',
        //     value: true,
        //     description: 'Allow you to choose sorting and time range on the search form of the side panel.'
        // },
        // addSubmitButton: {
        //     type: 'boolean',
        //     value: false,
        //     description: 'Add a submit button to the search field.'
        // },
        // toggleSearchOptions: {
        //     type: 'boolean',
        //     value: true,
        //     description: 'Add a button to hide search options while searching.',
        //     advanced: true
        // },
        // searchByFlair: {
        //     type: 'boolean',
        //     value: true,
        //     description: 'When clicking on a post\'s flair, search its subverse for that flair. <p>May not work in some subverses that hide the actual flair and add pseudo-flair with CSS (only workaround is to disable subverse style).</p>'
        // }

        // new options format:
        // 'Auto Search Current Subverse': [true, 'Search the current subverse by default when using the search box.']
  },
  isEnabled: function () {
    return Utils.getModulePrefs(this.moduleID)
  },
    // include: [
    // ],
  isMatchURL: function () {
        // return Utils.isMatchURL(this.moduleID);
    return true
  },
  go: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
            // var searchExpando;
      if (this.options.searchSubverseByDefault.value) {
        this.searchSubverseByDefault()
      }
            // if (this.options.addSearchOptions.value) {
            //     searchExpando = document.getElementById('searchexpando');
            //     if (searchExpando) {
            //         var searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>';
            //         if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
            //             searchOptionsHtml = '<br />' + searchOptionsHtml;
            //         }
            //         $(searchExpando).find('#moresearchinfo').before(searchOptionsHtml);
            //     }
            // }
            // if (this.options.addSubmitButton.value) {
            //     searchExpando = document.getElementById('searchexpando');
            //     if (searchExpando) {
            //         Utils.addCSS('#searchexpando .searchexpando-submit { text-align:center; }');
            //         var submitDiv = '<div class="searchexpando-submit"><button type="submit">search</button></div>';
            //         $(searchExpando).append(submitDiv);
            //     }
            // }
            // if (this.options.toggleSearchOptions.value && Utils.regexes.search.test(location.href)) {
            //     Utils.addCSS('.searchpane-toggle-hide { float: right; margin-top: -1em } .searchpane-toggle-show { float: right; } .searchpane-toggle-show:after { content:"\u25BC"; margin-left:2px; }.searchpane-toggle-hide:after { content: "\u25B2"; margin-left: 2px; }');
            //     if (this.options.hideSearchOptions.value || location.hash === '#ves-hide-options') {
            //         $('body').addClass('ves-hide-options');
            //     }
            //     Utils.addCSS('.ves-hide-options .search-summary, .ves-hide-options .searchpane, .ves-hide-options .searchfacets { display: none; } .ves-hide-options .searchpane-toggle-show { display: block; } .searchpane-toggle-show { display: none; }');
            //     $('.content .searchpane').append('<a href="#ves-hide-options" class="searchpane-toggle-hide">hide search options</a>');
            //     $('.content .searchpane ~ .menuarea').prepend('<a href="#ves-show-options" class="searchpane-toggle-show">show search options</a>');
            //     $('.searchpane-toggle-hide').on('click', function() {
            //         $('body').addClass('ves-hide-options');
            //     });
            //     $('.searchpane-toggle-show').on('click', function() {
            //         $('body').removeClass('ves-hide-options');
            //     });
            // }
            // if (this.options.searchByFlair) {
            //     Utils.addCSS('.ves-flairSearch { cursor: pointer; position: relative; } .linkflairlabel.ves-flairSearch a { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }');
            //     $('.sitetable').on('mouseenter', '.title > .linkflairlabel:not(.ves-flairSearch)', function(e) {
            //         var parent = $(e.target).closest('.thing')[0],
            //             srMatch = Utils.regexes.subverse.exec(parent.querySelector('.entry a.subverse')),
            //             subverse = (srMatch) ? srMatch[1] : Utils.currentSubverse(),
            //             flair = e.target.title.replace(/\s/g, '+');
            //         if (flair && subverse) {
            //             var link = document.createElement('a');
            //             link.href = '/r/' + encodeURIComponent(subverse) + '/search?sort=new&restrict_sr=on&q=flair%3A' + encodeURIComponent(flair);
            //             e.target.classList.add('ves-flairSearch');
            //             e.target.appendChild(link);
            //         }
            //     });
            // }
    }
  },
  searchSubverseByDefault: function () {
    var restrictSearch = $('form[action="/search"] > input#l')
    if (restrictSearch && !$('meta[content="search results"]', doc.head)) { // prevent autochecking after searching with it unchecked
      restrictSearch.checked = true
    }
  }
}

Modules.singleClick = {
  moduleID: 'singleClick',
  moduleName: 'Single Click',
  description: 'Adds an [l+c] link that opens both the link and the comments page in new tabs.',
  options: {
    openOrder: {
      type: 'enum',
      values: [
                { name: 'open comments then link', value: 'commentsfirst' },
                { name: 'open link then comments', value: 'linkfirst' }
      ],
      value: 'commentsfirst',
      description: 'What order to open the link/comments in.'
    },
    hideLEC: {
      type: 'boolean',
      value: false,
      description: 'Hide the [l=c] where the link is the same as the comments page'
    }
        // new options format:
        // 'Open Order': ['commentsfirst', 'The order to open the link and comments.' ['commentsfirst', 'linkfirst']],
        // 'Hide [l=c]': [false, 'Hide the [l=c] on self/text posts']
  },
  isEnabled: function () {
    return Utils.getModulePrefs(this.moduleID)
  },
  include: [
    'all'
  ],
  exclude: [
    'comments'
  ],
  isMatchURL: function () {
    return Utils.isMatchURL(this.moduleID)
  },
  beforeLoad: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
      if (Utils.isDarkMode()) {
        Utils.addCSS('.VESSingleClick { color: #bcbcbc; font-weight: bold; }')
        Utils.addCSS('.VESSingleClick:hover { text-decoration: underline; cursor: pointer; }')
      } else {
        Utils.addCSS('.VESSingleClick { color: #6a6a6a; font-weight: bold; }')
        Utils.addCSS('.VESSingleClick:hover { text-decoration: underline; cursor: pointer; }')
      }
    }
  },
  go: function () {
        // if ((this.isMatchURL())) {    // force run
    if ((this.isEnabled()) && (this.isMatchURL())) {
      this.applyLinks()
            // watch for changes to .sitetable, then reapply
            // Utils.watchForElement('sitetable', Modules.singleClick.applyLinks);
      doc.body.addEventListener('DOMNodeInserted', function (event) {
        if ((event.target.tagName == 'DIV') && (event.target.getAttribute('class') == 'sitetable')) {
          Modules.singleClick.applyLinks()
        }
      }, true)
    }
  },
  applyLinks: function (ele) {
    ele = ele || doc
    var entries = $('.sitetable>.submission .entry', ele) // beware of .alert-featuredsub!
    for (var i = 0, len = entries.length; i < len; i++) {
      if ((typeof entries[i] !== 'undefined') && (!entries[i].classList.contains('lcTagged'))) {
        entries[i].className += 'lcTagged'
        this.titleLA = entries[i].querySelector('A.title')
        if (this.titleLA !== null) {
          var thisLink = $(this.titleLA).attr('href')
                    // check if it's a relative path (no http://)
          if (!(thisLink.match(/^http/i))) {
            thisLink = 'https://' + doc.domain + thisLink
          }
                    // console.log("thisLink -- " + thisLink);
          var thisComments = (thisComments = entries[i].querySelector('.comments')) && thisComments.href
                    // console.log("thisComments -- " + thisComments);
          var thisUL = $('ul.flat-list', entries[i])
          var singleClickLI = el('li')
          var singleClickLink = el('a', {
            className: 'VESSingleClick'
          })
          singleClickLink.setAttribute('thisLink', thisLink)
          singleClickLink.setAttribute('thisComments', thisComments)
          if (thisLink != thisComments) {
            singleClickLink.innerHTML = '[l+c]'
          } else if (!(this.options.hideLEC.value)) {
            singleClickLink.innerHTML = '[l=c]'
          }
          add(singleClickLI, singleClickLink)
          add(thisUL, singleClickLI)
          singleClickLink.addEventListener('click', function (e) {
            e.preventDefault()
            if (e.button != 2) {
                            // check if it's a relative link (no http://voat.co) because chrome barfs on these when creating a new tab...
              var thisLink = this.getAttribute('thisLink')
              if (Modules.singleClick.options.openOrder.value == 'commentsfirst') {
                if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
                                    // console.log('open comments');
                  window.open(this.getAttribute('thisComments'))
                }
                window.open(this.getAttribute('thisLink'))
              } else { // Modules.singleClick.options.openOrder.value == 'linkfirst'
                window.open(this.getAttribute('thisLink'))
                if (this.getAttribute('thisLink') != this.getAttribute('thisComments')) {
                                    // console.log('open comments');
                  window.open(this.getAttribute('thisComments'))
                }
              }
            }
          }, true)
        }
      }
    }
  }
}

Modules.userTags = {
  moduleID: 'userTags',
  moduleName: 'User Tags',
  category: 'Users',
  description: 'Tag Voat users in posts and comments.',
  options: {
    hardIgnore: {
      type: 'boolean',
      value: false,
      description: 'When on, the ignored user\'s entire post is hidden, not just the title.'
    }
        // new options format:
        // 'Hard Ignore': [false, 'When on, the ignored user\'s entire post is hidden, not just the title.'],
  },
  isEnabled: function () {
    return Utils.getModulePrefs(this.moduleID)
  },
  isMatchURL: function () {
    return Utils.isMatchURL(this.moduleID)
  },
  include: [
    'all'
  ],
    // exclude: [],
  beforeLoad: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
            // load CSS
    }
  },
  usernameSelector: 'p.tagline a.author, .sidecontentbox a.author, div.md a[href^="/u/"], div.md a[href^="/user/"]',
  go: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
      this.tags = null
      if (typeof tags !== 'undefined') {
        this.tags = safeJSON(tags, 'userTags.tags', true)
      }
      this.applyTags()
    }
  },
  applyTags: function (ele) {
    ele = ele || doc
  },
  applyTag: function (authorObj) {
    var userObject = [],
      thisTag = null,
      thisColor = null,
      thisIgnore = null,
      thisAuthor, thisPost, thisComment

    if ((authorObj) && (!($(authorObj).hasClass('userTagged'))) && (typeof authorObj !== 'undefined') && (authorObj !== null)) {
      if (authorObj.getAttribute('data-username')) {
        thisAuthor = authorObj.getAttribute('data-username')
      }
      noTag = false
      if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
        noTag = true
        thisAuthor = thisAuthor.substr(3)
      }
      thisAuthor = thisAuthor.toLowerCase()
      if (!noTag) {
        $(authorObj).addClass('userTagged')
        if (typeof userObject[thisAuthor] === 'undefined') {
          if (this.tags && this.tags[thisAuthor]) {
            if (typeof this.tags[thisAuthor].tag !== 'undefined') {
              thisTag = this.tags[thisAuthor].tag
            }
            if (typeof this.tags[thisAuthor].color !== 'undefined') {
              thisColor = this.tags[thisAuthor].color
            }
            if (typeof this.tags[thisAuthor].ignore !== 'undefined') {
              thisIgnore = this.tags[thisAuthor].ignore
            }
          }
          userObject[thisAuthor] = {
            tag: thisTag,
            color: thisColor,
            ignore: thisIgnore
          }
        }
        var tag = el('span', {
          className: 'VESUserTag',
          alt: thisAuthor,
          textContent: '+'
        })
        after(authorObj, tag)
      }
    }
  },
  createTagDialog: function () {

  },
  closeTagDialog: function () {

  },
  saveUserTag: function () {

  },
  ignoreComment: function () {

  },
  ignoreUser: function () {
  }
}

Modules.voatingBooth = {
  moduleID: 'voatingBooth',
  moduleName: 'Voating Booth',
  description: 'UI enhancements for Voat.',
  options: {
    fullVoat: {
      type: 'boolean',
      value: false,
      description: 'Make Voat use the full screen width?'
    },
    pinHeader: {
      type: 'enum',
      values: [{
        name: 'None',
        value: 'none'
      }, {
        name: 'Subverse Bar only',
        value: 'sub'
      }, {
        name: 'Full Header',
        value: 'header'
      }],
      value: 'none',
      description: 'Pin header elements to the page top, even when scrolling.'
    }
        // new options format:
        // 'Full Voat': [false, 'Make Voat use the device\'s full width'],
        // 'Pin Header': ['none', 'Pin Voat elements to the page top when scrolling.', ['none', 'sub', 'header']]
  },
  include: [
    'all'
  ],
  isEnabled: function () {
    return Utils.getModulePrefs(this.moduleID)
  },
  isMatchURL: function () {
    return Utils.isMatchURL(this.moduleID)
  },
  beforeLoad: function () {
    if ((this.isEnabled()) && (this.isMatchURL())) {
      if (this.options.fullVoat.value) {
        var css = '#header-container { padding-left: 10px; padding-right: 10px }'
        css += '#header-banner { max-width: initial }'
        css += 'body > #container { margin-left: 10px; margin-right: 10px; max-width: initial }'
        Utils.addCSS(css)
      }
      switch (this.options.pinHeader.value) {
        case 'header':
          $(doc.body).addClass('pinHeader-header')
          break
        case 'sub':
          $(doc.body).addClass('pinHeader-sub')
          break
        default:
          break
      }
    }
  },
  go: function () {
    if ((this.isEnabled()) && this.isMatchURL()) {
      switch (this.options.pinHeader.value) {
        case 'header':
          this.pinHeader()
          break
        case 'sub':
          this.pinSubverseBar()
          break
        default:
          break
      }
    }
  },
  pinHeader: function () {
    var header = id('header')
    if (header === null) {
      return
    }

    var spacer = el('div')
    spacer.id = 'VESPinnedHeaderSpacer'

    var css = '#sr-header-area { left: 0; right: 0 }'
    spacer.style.height = $('#header').outerHeight() + 'px'

    before(header.nextSibling, spacer)

    css += 'body > #container { margin-top: 10px }'
    css += '#header { position: fixed }'
    css += '#header { left: 0; right: 0 }'
    css += '#sr-more-link: { position: fixed }'
    Utils.addCSS(css)
    cli.log(css)
    cli.log(Utils.css)
  },
  pinSubverseBar: function () {
        // Make the subverse bar at the top of the page a fixed element

    var sb = id('sr-header-area')
    if (sb === null) {
      return
    }
    var header = id('header')

        // add a dummy <div> inside the header to replace the subreddit bar (for spacing)
    var spacer = el('div', {
      style: {
        paddingTop: window.getComputedStyle(sb, null).paddingTop,
        paddingBottom: window.getComputedStyle(sb, null).paddingBottom,
        height: window.getComputedStyle(sb, null).height
      }
    })

        // window.setTimeout(function(){
        // add the spacer; take the subreddit bar out of the header and put it above
    header.insertBefore(spacer, sb)
    doc.body.insertBefore(sb, header)

    var css = '#header-bottom-left { margin-top: 19px; }'
    css += 'div#sr-header-area {position: fixed; z-index: 10000 !important; left: 0; right: 0; }'
        // this.pinCommonElements(sm);
    css += '#sr-more-link: {position: fixed;}'
    Utils.addCSS(css)
  }
};

(function () {
    /**
        VES needs to go through and first load ALL of the modules' defaults in order
        to make sure that no new options (after an update) are left out of storage.
        This will also account for when VES is run for the first time.
        After all the defaults are loaded, extend the loaded defaults and replace
        all the values with whatever the user's settings are (from localStorage).
        THEN we can start preloading the modules and running them.
    **/

  testLocalStorage()

  var VES = { // for the extension itself
    init: function () {
      Utils.resetModulePrefs()

            /*
                This is where we load options. To make sure we get everything,
                check the saved configs and see if we're running a newer version
                of VES than we had previously. If it's newer, load the old
                stuff, extend it with the new, and load the old stuff again.
                Then look at the defaults for the list of all modules, and load
                them if the user has them enabled.
            */

            // load a user's saved settings
      return get(Storage, function (items) { // get saved Settings
                // extend and replace the loaded defaults
        extend(Storage, items)

                // start loading the modules once <head> can be found
        return asap(function () {
          return doc.head
        }, VES.loadModules)
      })
    },
    loadModules: function () {
      var module
            // if there's preloading needed, do it
      for (module in Modules) {
        if (typeof Modules[module] === 'object') {
          if (typeof Modules[module].beforeLoad === 'function') {
            Modules[module].beforeLoad()
          }
        }
      }
            // run the modules' .go() function ASAP
            // often, the document body is not available yet, so wait
      asap(function () {
        return doc.body
      }, function () {
        for (module in Modules) {
          if (typeof Modules[module] === 'object') {
            try {
              Modules[module].go()
            } catch (e) { // if one module breaks don't kill everything
              cli.log('\"' + Modules[module].moduleName + '\" initialization crashed!')
              cli.log(e.name + ': ' + e.message)
            }
          }
        }
      })
            // inject the CSS from all the modules
      Utils.applyCSS(Utils.css, 'VESStyles')
    }
  }
  VES.init()
}).call(this)
