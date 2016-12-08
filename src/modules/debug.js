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
