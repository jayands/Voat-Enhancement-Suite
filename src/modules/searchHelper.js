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
      //   searchExpando = document.getElementById('searchexpando')
      //   if (searchExpando) {
      //     var searchOptionsHtml = '<label>Sort:<select name="sort"><option value="relevance">relevance</option><option value="new">new</option><option value="hot">hot</option><option value="top">top</option><option value="comments">comments</option></select></label> <label>Time:<select name="t"><option value="all">all time</option><option value="hour">this hour</option><option value="day">today</option><option value="week">this week</option><option value="month">this month</option><option value="year">this year</option></select></label>'
      //     if ($(searchExpando).find('input[name=restrict_sr]').length) { // we don't want to add the new line if we are on the front page
      //       searchOptionsHtml = '<br />' + searchOptionsHtml
      //     }
      //     $(searchExpando).find('#moresearchinfo').before(searchOptionsHtml)
      //   }
      // }
      // if (this.options.addSubmitButton.value) {
      //   searchExpando = document.getElementById('searchexpando')
      //   if (searchExpando) {
      //     Utils.addCSS('#searchexpando .searchexpando-submit { text-align:center; }')
      //     var submitDiv = '<div class="searchexpando-submit"><button type="submit">search</button></div>'
      //     $(searchExpando).append(submitDiv)
      //   }
      // }
      // if (this.options.toggleSearchOptions.value && Utils.regexes.search.test(location.href)) {
      //   Utils.addCSS('.searchpane-toggle-hide { float: right; margin-top: -1em } .searchpane-toggle-show { float: right; } .searchpane-toggle-show:after { content:"\u25BC"; margin-left:2px; }.searchpane-toggle-hide:after { content: "\u25B2"; margin-left: 2px; }')
      //   if (this.options.hideSearchOptions.value || location.hash === '#ves-hide-options') {
      //     $('body').addClass('ves-hide-options')
      //   }
      //   Utils.addCSS('.ves-hide-options .search-summary, .ves-hide-options .searchpane, .ves-hide-options .searchfacets { display: none; } .ves-hide-options .searchpane-toggle-show { display: block; } .searchpane-toggle-show { display: none; }')
      //   $('.content .searchpane').append('<a href="#ves-hide-options" class="searchpane-toggle-hide">hide search options</a>')
      //   $('.content .searchpane ~ .menuarea').prepend('<a href="#ves-show-options" class="searchpane-toggle-show">show search options</a>')
      //   $('.searchpane-toggle-hide').on('click', function () {
      //     $('body').addClass('ves-hide-options')
      //   })
      //   $('.searchpane-toggle-show').on('click', function () {
      //     $('body').removeClass('ves-hide-options')
      //   })
      // }
      // if (this.options.searchByFlair) {
      //   Utils.addCSS('.ves-flairSearch { cursor: pointer; position: relative; } .linkflairlabel.ves-flairSearch a { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }')
      //   $('.sitetable').on('mouseenter', '.title > .linkflairlabel:not(.ves-flairSearch)', function (e) {
      //     var parent = $(e.target).closest('.thing')[0],
      //       srMatch = Utils.regexes.subverse.exec(parent.querySelector('.entry a.subverse')),
      //       subverse = (srMatch) ? srMatch[1] : Utils.currentSubverse(),
      //       flair = e.target.title.replace(/\s/g, '+')
      //     if (flair && subverse) {
      //       var link = document.createElement('a')
      //       link.href = '/r/' + encodeURIComponent(subverse) + '/search?sort=new&restrict_sr=on&q=flair%3A' + encodeURIComponent(flair)
      //       e.target.classList.add('ves-flairSearch')
      //       e.target.appendChild(link)
      //     }
      //   })
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
