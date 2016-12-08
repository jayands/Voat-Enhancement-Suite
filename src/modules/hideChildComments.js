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
