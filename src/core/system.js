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
