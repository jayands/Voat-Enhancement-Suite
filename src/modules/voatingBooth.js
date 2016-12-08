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
    Duplication
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
}
