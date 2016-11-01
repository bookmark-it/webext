var template = '',
    state = {
      loading: true,
      bookmark: null
    },
    root = null;

function render() {
  bkit_renderTemplate(root, template, state);
  bookmarkMain();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.bookmark) {
    state['loading'] =  false;
    state['bookmark'] = request.data;
    render();
  }
});

chrome.runtime.sendMessage(null, null, null, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      root = bkit_init();

      $.ajax({
        url: chrome.extension.getURL('/templates/bookmark.html'),
        dataType: 'html'
      })
      .done(function(html) {
        chrome.runtime.sendMessage({loaded: true});

        template = Hogan.compile(html);

        render();

        bookmarkMain();
      });
      // ----------------------------------------------------------
    }
  }, 10);
});

function update(e) {
  var $field = $(e.currentTarget),
      name = $field.attr('name'),
      value = $field.val();

  state.bookmark[name] = value;
  sendUpdate();
}

function sendUpdate() {
  chrome.runtime.sendMessage({
    bookmark_update: true,
    data: state.bookmark
  });
}

function addCategory(name) {
  state.bookmark.categories.push({
    name: name
  });
  render();
  sendUpdate();
}

function deleteCategory(name) {
  var categories = state.bookmark.categories,
      catetogy = null,
      index = null;

  for (index in categories) {
    if (categories[index].name === name) {
        state.bookmark.categories.splice(index, 1);
        render();
        sendUpdate();
      return ;
    }
  }
}

function bookmarkMain() {
  $('#bk-it').on('focusout', '.field', update);

  $('#bk-it .categories').tagsinput();

  $('#bk-it .bootstrap-tagsinput input').attr('size', 5);

  $('#bk-it .categories').on('itemAdded', function(event) {
    addCategory(event.item);
    $('#bk-it .bootstrap-tagsinput input').click();
  });

  $('#bk-it .categories').on('itemRemoved', function(event) {
    deleteCategory(event.item);
  });
}
