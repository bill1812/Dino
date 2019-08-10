// c.js <-- neterror.js
function decodeUTF16Base64ToString(encoded_text) {
  var data = atob(encoded_text);
  var result = '';
  for (var i = 0; i < data.length; i += 2) {
    result += String.fromCharCode(data.charCodeAt(i) * 256 + data.charCodeAt(i + 1));
  }
  return result;
}

function toggleHelpBox() {
  var helpBoxOuter = document.getElementById('details');
  helpBoxOuter.classList.toggle(HIDDEN_CLASS);
  var detailsButton = document.getElementById('details-button');
  if (helpBoxOuter.classList.contains(HIDDEN_CLASS)) {
    detailsButton.innerText = detailsButton.detailsText;
  } else {
    detailsButton.innerText = detailsButton.hideDetailsText;
  }

  if (mobileNav) {
    document.getElementById('main-content').classList.toggle(HIDDEN_CLASS);
    var runnerContainer = document.querySelector('.runner-container');
    if (runnerContainer) {
      runnerContainer.classList.toggle(HIDDEN_CLASS);
    }
  }
}

function diagnoseErrors() {
  if (window.errorPageController) {
    errorPageController.diagnoseErrorsButtonClick();
  }
}

if (window.top.location != window.location) {
  document.documentElement.setAttribute('subframe', '');
}

function updateForDnsProbe(strings) {
  var context = new JsEvalContext(strings);
  jstProcess(context, document.getElementById('t'));
  onDocumentLoadOrUpdate();
}

function updateIconClass(classList, newClass) {
  var oldClass;

  if (classList.hasOwnProperty('last_icon_class')) {
    oldClass = classList['last_icon_class'];
    if (oldClass == newClass) {
      return;
    }
  }

  classList.add(newClass);
  if (oldClass !== undefined) {
    classList.remove(oldClass);
  }
  classList['last_icon_class'] = newClass;

  if (newClass == 'icon-offline') {
    document.firstElementChild.classList.add('offline');
    new Runner('.interstitial-wrapper');
  } else {
    document.body.classList.add('neterror');
  }
}

function search(baseSearchUrl) {
  var searchTextNode = document.getElementById('search-box');
  document.location = baseSearchUrl + searchTextNode.value;
  return false;
}

function trackClick(trackingId) {
  if (trackingId >= 0 && errorPageController) {
    errorPageController.trackClick(trackingId);
  }
}

function linkClicked(jstdata) {
  trackClick(jstdata.trackingId);
}

function reloadButtonClick(url) {
  if (window.errorPageController) {
    errorPageController.reloadButtonClick();
  } else {
    location = url;
  }
}

function downloadButtonClick() {
  if (window.errorPageController) {
    errorPageController.downloadButtonClick();
    var downloadButton = document.getElementById('download-button');
    downloadButton.disabled = true;
    downloadButton.textContent = downloadButton.disabledText;

    document.getElementById('download-link-wrapper').classList.add(HIDDEN_CLASS);
    document.getElementById('download-link-clicked-wrapper').classList.remove(HIDDEN_CLASS);
  }
}

function detailsButtonClick() {
  if (window.errorPageController) {
    errorPageController.detailsButtonClick();
  }
}

function setUpCachedButton(buttonStrings) {
  var reloadButton = document.getElementById('reload-button');

  reloadButton.textContent = buttonStrings.msg;
  var url = buttonStrings.cacheUrl;
  var trackingId = buttonStrings.trackingId;
  reloadButton.onclick = function (e) {
    e.preventDefault();
    trackClick(trackingId);
    if (window.errorPageController) {
      errorPageController.trackCachedCopyButtonClick();
    }
    location = url;
  };
  reloadButton.style.display = '';
}

var primaryControlOnLeft = true;

function setAutoFetchState(scheduled, can_schedule) {
  document.getElementById('cancel-save-page-button').classList.toggle(HIDDEN_CLASS, !scheduled);
  document.getElementById('save-page-for-later-button').classList.toggle(HIDDEN_CLASS, scheduled || !can_schedule);
}

function savePageLaterClick() {
  errorPageController.savePageForLater();
}

function cancelSavePageClick() {
  errorPageController.cancelSavePage();
  setAutoFetchState(false, true);
}

function toggleErrorInformationPopup() {
  document.getElementById('error-information-popup-container').classList.toggle(HIDDEN_CLASS);
}

function launchOfflineItem(itemID, name_space) {
  errorPageController.launchOfflineItem(itemID, name_space);
}

function launchDownloadsPage() {
  errorPageController.launchDownloadsPage();
}

function getIconForSuggestedItem(item) {
  switch (item.content_type) {
    case 1:
      return 'image-video';
    case 2:
      return 'image-music-note';
    case 0:
    case 3:
      return 'image-earth';
  }
  return 'image-file';
}

function getSuggestedContentDiv(item, index) {
  var thumbnail = '';
  var extraContainerClasses = [];
  var src = 'src';

  if (item.thumbnail_data_uri) {
    extraContainerClasses.push('suggestion-with-image');
    thumbnail = `<img ${src}="${item.thumbnail_data_uri}">`;
  } else {
    extraContainerClasses.push('suggestion-with-icon');
    iconClass = getIconForSuggestedItem(item);
    thumbnail = `<div><img class="${iconClass}"></div>`;
  }

  var favicon = '';
  if (item.favicon_data_uri) {
    favicon = `<img ${src}="${item.favicon_data_uri}">`;
  } else {
    extraContainerClasses.push('no-favicon');
  }

  if (!item.attribution_base64) {
    extraContainerClasses.push('no-attribution');
  }
  return `
  <div class="offline-content-suggestion ${extraContainerClasses.join(' ')}"
    onclick="launchOfflineItem('${item.ID}', '${item.name_space}')">
      <div class="offline-content-suggestion-texts">
        <div id="offline-content-suggestion-title-${index}" class="offline-content-suggestion-title"></div>
        <div class="offline-content-suggestion-attribution-freshness">
          <div id="offline-content-suggestion-favicon-${index}" class="offline-content-suggestion-favicon">
            ${favicon}
          </div>
          <div id="offline-content-suggestion-attribution-${index}" class="offline-content-suggestion-attribution">
          </div>
          <div class="offline-content-suggestion-freshness">
            ${item.date_modified}
          </div>
          <div class="offline-content-suggestion-pin-spacer"></div>
          <div class="offline-content-suggestion-pin"></div>
        </div>
      </div>
      <div class="offline-content-suggestion-thumbnail">
        ${thumbnail}
      </div>
  </div>`;
}

function offlineContentAvailable(isShown, suggestions) {
  if (!suggestions || !loadTimeData.valueExists('offlineContentList')) {
    return;
  }
  var suggestionsHTML = [];
  for (var index = 0; index < suggestions.length; index++) {
    suggestionsHTML.push(getSuggestedContentDiv(suggestions[index], index));
  }
  document.getElementById('offline-content-suggestions').innerHTML = suggestionsHTML.join('\n');

  for (var index = 0; index < suggestions.length; index++) {
    document.getElementById(`offline-content-suggestion-title-${index}`).textContent = decodeUTF16Base64ToString(suggestions[index].title_base64);
    document.getElementById(`offline-content-suggestion-attribution-${index}`).textContent = decodeUTF16Base64ToString(suggestions[index].attribution_base64);
  }

  var contentListElement = document.getElementById('offline-content-list');
  if (document.dir == 'rtl') {
    contentListElement.classList.add('is-rtl');
  }
  contentListElement.hidden = false;

  if (isShown) {
    toggleOfflineContentListVisibility(false);
  }
}

function toggleOfflineContentListVisibility(updatePref) {
  if (!loadTimeData.valueExists('offlineContentList')) {
    return;
  }
  var contentListElement = document.getElementById('offline-content-list');
  var isVisible = !contentListElement.classList.toggle('list-hidden');

  if (updatePref && window.errorPageController) {
    errorPageController.listVisibilityChanged(isVisible);
  }
}

function onDocumentLoadOrUpdate() {

  var downloadButtonVisible = loadTimeData.valueExists('downloadButton') && loadTimeData.getValue('downloadButton').msg;
  var detailsButton = document.getElementById('details-button');
  var offlineContentVisible = loadTimeData.valueExists('suggestedOfflineContentPresentation');

  if (offlineContentVisible) {
    document.querySelector('.nav-wrapper').classList.add(HIDDEN_CLASS);
    detailsButton.classList.add(HIDDEN_CLASS);

    document.getElementById('download-link').hidden = !downloadButtonVisible;
    document.getElementById('download-links-wrapper').classList.remove(HIDDEN_CLASS);
    document.getElementById('error-information-popup-container').classList.add('use-popup-container', HIDDEN_CLASS);
    document.getElementById('error-information-button').classList.remove(HIDDEN_CLASS);
  }

  var attemptAutoFetch = loadTimeData.valueExists('attemptAutoFetch') && loadTimeData.getValue('attemptAutoFetch');
  var reloadButtonVisible = loadTimeData.valueExists('reloadButton') && loadTimeData.getValue('reloadButton').msg;
  var cacheButtonVisible = false;

  if (loadTimeData.valueExists('cacheButton')) {
    setUpCachedButton(loadTimeData.getValue('cacheButton'));
    cacheButtonVisible = true;
  }

  var reloadButton = document.getElementById('reload-button');
  var downloadButton = document.getElementById('download-button');
  if (reloadButton.style.display == 'none' && downloadButton.style.display == 'none') {
    detailsButton.classList.add('singular');
  }

  var controlButtonDiv = document.getElementById('control-buttons');
  controlButtonDiv.hidden = offlineContentVisible || !(reloadButtonVisible || downloadButtonVisible || attemptAutoFetch || cacheButtonVisible);
}

function onDocumentLoad() {

  if (primaryControlOnLeft) {
    buttons.classList.add('suggested-left');
  } else {
    buttons.classList.add('suggested-right');
  }
  onDocumentLoadOrUpdate();
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);
