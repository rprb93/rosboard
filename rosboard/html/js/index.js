"use strict";

// importJsOnce("js/Viewer.js");
// importJsOnce("js/viewers/meta/Space2DViewer.js");
// importJsOnce("js/viewers/meta/Space3DViewer.js");

// importJsOnce("js/viewers/ImageViewer.js");
// importJsOnce("js/viewers/LogViewer.js");
// importJsOnce("js/viewers/ProcessListViewer.js");
// importJsOnce("js/viewers/MapViewer.js");
// importJsOnce("js/viewers/LaserScanViewer.js");
// importJsOnce("js/viewers/GeometryViewer.js");
// importJsOnce("js/viewers/PolygonViewer.js");
// importJsOnce("js/viewers/DiagnosticViewer.js");
// importJsOnce("js/viewers/TimeSeriesPlotViewer.js");
// importJsOnce("js/viewers/PointCloud2Viewer.js");
// importJsOnce("js/viewers/JoystickController.js");
// importJsOnce("js/viewers/Button.js");
// importJsOnce("js/viewers/CompassViewer.js");
// importJsOnce("js/viewers/WindRoseViewer.js");

// // GenericViewer must be last
// importJsOnce("js/viewers/GenericViewer.js");

// importJsOnce("js/transports/WebSocketV1Transport.js");

var snackbarContainer = document.querySelector('#demo-toast-example');

let subscriptions = {};
let subsGroup = new Object();

if (window.localStorage && window.localStorage.subscriptions) {
  // window.localStorage.clear();
  if (window.location.search && window.location.search.indexOf("reset") !== -1) {
    subscriptions = {};
    updateStoredSubscriptions();
    window.location.href = "?";
  } else {
    try {
      subscriptions = JSON.parse(window.localStorage.subscriptions);
    } catch (e) {
      console.log(e);
      subscriptions = {};
    }
  }
}

let $grid = null;
$(() => {
  $grid = $('.grid').masonry({
    itemSelector: '.card',
    gutter: 10,
    percentPosition: true,
  });
});

setInterval(() => {
  $grid.masonry("reloadItems");
  $grid.masonry();
}, 500);

setInterval(() => {
  if (currentTransport && !currentTransport.isConnected()) {
    console.log("attempting to reconnect ...");
    currentTransport.connect();
  }
}, 5000);

function updateStoredSubscriptions() {
  if (window.localStorage) {
    let storedSubscriptions = {};
    for (let subsIdx in subscriptions) {
      storedSubscriptions[subsIdx] = {
        topicType: subscriptions[subsIdx].topicType,
        friendlyName: subscriptions[subsIdx].friendlyName,
        dataIdx: subscriptions[subsIdx].dataIdx
      };
    }
    window.localStorage['subscriptions'] = JSON.stringify(storedSubscriptions);
  }
}

function newCard() {
  // creates a new card, adds it to the grid, and returns it.
  let card = $("<div></div>").addClass('card')
    .appendTo($('.grid'));
  return card;
}

let onOpen = function () {
  for (let subsIdx in subscriptions) {
    console.log("Re-subscribing to " + subsIdx);
    initSubscribe({ topicName: subsIdx, topicType: subscriptions[subsIdx].topicType, friendlyName: subscriptions[subsIdx].friendlyName, dataIdx: subscriptions[subsIdx].dataIdx });
  }
}

let onSystem = function (system) {
  if (system.hostname) {
    console.log("hostname: " + system.hostname);
    $('.mdl-layout-title').text("ROSboard: " + system.hostname);
  }

  if (system.version) {
    console.log("server version: " + system.version);
    versionCheck(system.version);
  }
}

let onMsg = function (msg) {
  let topics = Object.keys(subsGroup);
  for(let key in topics){
    if(msg._topic_name == topics[key]){
      for(let i=0; i < subsGroup[topics[key]].length; i++){
        subscriptions[subsGroup[topics[key]][i]].viewer.update(msg);
      }
      break;
    }
  }



  // if (!subscriptions[msg._topic_name]) {
  //   console.log("Received unsolicited message", msg);
  // } else if (!subscriptions[msg._topic_name].viewer) {
  //   console.log("Received msg but no viewer", msg);
  // } else {
  //   subscriptions[msg._topic_name].viewer.update(msg);
  // }
}

let currentTopics = {};
let currentTopicsStr = "";

let onTopics = function (topics) {

  // check if topics has actually changed, if not, don't do anything
  // lazy shortcut to deep compares, might possibly even be faster than
  // implementing a deep compare due to
  // native optimization of JSON.stringify
  let newTopicsStr = JSON.stringify(topics);
  if (newTopicsStr === currentTopicsStr) return;
  currentTopics = topics;
  currentTopicsStr = newTopicsStr;

  let topicTree = treeifyPaths(Object.keys(topics));

  $("#topics-nav-ros").empty();
  $("#topics-nav-system").empty();

  addTopicTreeToNav(topicTree[0], $('#topics-nav-ros'));

  $('<a></a>')
    .addClass("mdl-navigation__link")
    .click(() => { initSubscribe({ topicName: "_dmesg", topicType: "rcl_interfaces/msg/Log", friendlyName: "default", dataIdx: 0 }); })
    .text("dmesg")
    .appendTo($("#topics-nav-system"));

  $('<a></a>')
    .addClass("mdl-navigation__link")
    .click(() => { initSubscribe({ topicName: "_top", topicType: "rosboard_msgs/msg/ProcessList", friendlyName: "default", dataIdx: 0 }); })
    .text("Processes")
    .appendTo($("#topics-nav-system"));

  $('<a></a>')
    .addClass("mdl-navigation__link")
    .click(() => { initSubscribe({ topicName: "_system_stats", topicType: "rosboard_msgs/msg/SystemStats", friendlyName: "default", dataIdx: 0 }); })
    .text("System stats")
    .appendTo($("#topics-nav-system"));
}

function addTopicTreeToNav(topicTree, el, level = 0, path = "") {
  topicTree.children.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
  topicTree.children.forEach((subTree, i) => {
    let subEl = $('<div></div>')
      .css(level < 1 ? {} : {
        "padding-left": "0pt",
        "margin-left": "12pt",
        "border-left": "1px dashed #808080",
      })
      .appendTo(el);
    let fullTopicName = path + "/" + subTree.name;
    let topicType = currentTopics[fullTopicName];
    if (topicType) {
      $('<a></a>')
        .addClass("mdl-navigation__link")
        .css({
          "padding-left": "12pt",
          "margin-left": 0,
        })
        .click(() => { initSubscribe({ topicName: fullTopicName, topicType: topicType }); })
        .text(subTree.name)
        .appendTo(subEl);
    } else {
      $('<a></a>')
        .addClass("mdl-navigation__link")
        .attr("disabled", "disabled")
        .css({
          "padding-left": "12pt",
          "margin-left": 0,
          opacity: 0.5,
        })
        .text(subTree.name)
        .appendTo(subEl);
    }
    addTopicTreeToNav(subTree, subEl, level + 1, path + "/" + subTree.name);
  });
}

function initSubscribe({ topicName, topicType, friendlyName = "default", dataIdx = 0 }) {
  // creates a subscriber for topicName
  // and also initializes a viewer (if it doesn't already exist)
  // in advance of arrival of the first data
  // this way the user gets a snappy UI response because the viewer appears immediately
  let idSub;
  let control = 0;
  subsGroup = getSubscritors(subscriptions);

  if(!jQuery.isEmptyObject(subsGroup)){
    let topics = Object.keys(subsGroup);
    let topicFromCookies = topicName.split("_");

    if(topicFromCookies.length == 2){
      idSub = topicName;
      topicName = topicFromCookies[0];
      control = 1;
    }
    else{
      for(let key in topics){
        if(topicName == topics[key]){
          let idx = Math.floor(Math.random() * 1e6);
          for(let i=0; i < subsGroup[topics[key]].length; i++){
            let aux = subsGroup[topics[key]][i].split("_");

            if(idx == aux[1]){
              console.log("SubIdx: " + idx + " already exist!");
              idx = Math.floor(Math.random() * 1e6);
            }
          }
          idSub = topicName + "_" + idx;
          control=1;
          break;
        }
      }
    }
  }
  else{
    idSub = topicName + "_0";
    control=1; 
  }

  if(control == 0){
    idSub = topicName + "_0";
  }

  


  if (!subscriptions[idSub]) {
    subscriptions[idSub] = {
      topicType: topicType,
      dataIdx: 0,
      friendlyName: "default"
    }
  }

  currentTransport.subscribe({ topicName: topicName });
  if (!subscriptions[idSub].viewer) {
    let card = newCard();
    let viewer = Viewer.getViewerForClass(topicType, friendlyName);

    try {
      if(topicType === "std_msgs/Float32MultiArray"){
        subscriptions[idSub].viewer = new viewer(card, idSub, topicName, topicType, subscriptions[idSub].dataIdx);
      }
      else{
        subscriptions[idSub].viewer = new viewer(card, idSub, topicName, topicType);
      }
      subscriptions[idSub].friendlyName = viewer.friendlyName;
    } catch (e) {
      console.log(e);
      card.remove();
    }
    $grid.masonry("appended", card);
  }

  updateStoredSubscriptions();

  subsGroup = getSubscritors(subscriptions);
}

let currentTransport = null;

function initDefaultTransport() {
  currentTransport = new WebSocketV1Transport({
    path: "/rosboard/v1",
    onOpen: onOpen,
    onMsg: onMsg,
    onTopics: onTopics,
    onSystem: onSystem,
  });
  currentTransport.connect();
}

function treeifyPaths(paths) {
  // turn a bunch of ros topics into a tree
  let result = [];
  let level = { result };

  paths.forEach(path => {
    path.split('/').reduce((r, name, i, a) => {
      if (!r[name]) {
        r[name] = { result: [] };
        r.result.push({ name, children: r[name].result })
      }

      return r[name];
    }, level)
  });
  return result;
}

let lastBotherTime = 0.0;
function versionCheck(currentVersionText) {
  $.get("https://raw.githubusercontent.com/dheera/rosboard/release/setup.py").done((data) => {
    let matches = data.match(/version='(.*)'/);
    if (matches.length < 2) return;
    let latestVersion = matches[1].split(".").map(num => parseInt(num, 10));
    let currentVersion = currentVersionText.split(".").map(num => parseInt(num, 10));
    let latestVersionInt = latestVersion[0] * 1000000 + latestVersion[1] * 1000 + latestVersion[2];
    let currentVersionInt = currentVersion[0] * 1000000 + currentVersion[1] * 1000 + currentVersion[2];
    if (currentVersion < latestVersion && Date.now() - lastBotherTime > 1800000) {
      lastBotherTime = Date.now();
      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "New version of ROSboard available (" + currentVersionText + " -> " + matches[1] + ").",
        actionText: "Check it out",
        actionHandler: () => { window.location.href = "https://github.com/dheera/rosboard/" },
      });
    }
  });
}

$(() => {
  if (window.location.href.indexOf("rosboard.com") === -1) {
    initDefaultTransport();
  }
});

Viewer.onClose = function (viewerInstance) {
  let subsIdx = viewerInstance.subsIdx;
  let topicName = viewerInstance.topicName;
  let topicType = viewerInstance.topicType;
  if(subsGroup[topicName].length == 1){
    currentTransport.unsubscribe({ topicName: topicName });
  }
  $grid.masonry("remove", viewerInstance.card);
  delete (subscriptions[subsIdx].viewer);
  delete (subscriptions[subsIdx]);
  updateSubscritors();
  updateStoredSubscriptions();
}

Viewer.onSwitchViewer = (viewerInstance, newViewerType) => {
  let subsIdx = viewerInstance.subsIdx;
  let topicName = viewerInstance.topicName;
  let topicType = viewerInstance.topicType;
  if (!subscriptions[subsIdx].viewer === viewerInstance)
    console.error("viewerInstance does not match subscribed instance");

  let card = subscriptions[subsIdx].viewer.card;
  subscriptions[subsIdx].viewer.destroy();
  delete (subscriptions[subsIdx].viewer);
  updateSubscritors();

  subscriptions[subsIdx].viewer = new newViewerType(card, subsIdx, topicName, topicType);
  subscriptions[subsIdx].friendlyName = newViewerType.friendlyName;
  subscriptions[subsIdx].dataIdx = 0;

  updateSubscritors();
  updateStoredSubscriptions();
};

Viewer.onSwitchPlot = (viewerInstance, plotshow) => {
  let subsIdx = viewerInstance.subsIdx;
  if (!subscriptions[subsIdx].viewer === viewerInstance)
    console.error("viewerInstance does not match subscribed instance");

  subscriptions[subsIdx].dataIdx = plotshow;
  updateSubscritors();
  updateStoredSubscriptions();
};

function getSubscritors (subs){
  let rosTopicName = new Object();

  Object.keys(subs).forEach(function (key, i) {
    let aux = key.split("_")[0];
    rosTopicName[aux] = [];
  });

  Object.keys(subs).forEach(function (key, i) {
    let aux = key.split("_")[0];
    rosTopicName[aux].push(key);
  });

  return rosTopicName;
}

function updateSubscritors(){
  subsGroup = getSubscritors(subscriptions);
}
