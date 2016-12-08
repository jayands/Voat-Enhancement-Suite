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
