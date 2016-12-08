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
