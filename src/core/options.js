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
