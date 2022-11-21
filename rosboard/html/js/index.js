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
let localStorageSubsName = "subsPage1";

if(window.location.pathname === "/index_page_1.html"){
  localStorageSubsName = "subsPage2";
}
else if(window.location.pathname === "/" || window.location.pathname === "/index.html"){
  localStorageSubsName = "subsPage1";
}

if (window.localStorage && window.localStorage[localStorageSubsName]) {
  // window.localStorage.clear();
  if (window.location.search && window.location.search.indexOf("reset") !== -1) {
    subscriptions = {};
    updateStoredSubscriptions();
    window.location.href = "?";
  } 
  else {
    try {
      subscriptions = JSON.parse(window.localStorage[localStorageSubsName]);
    } catch (e) {
      console.log(e);
      subscriptions = {};
    }
  }
}

let $grid = null;
$(() => {
  $grid = $('.grid').masonry({
    columnWidth: '.grid-size',
    itemSelector: '.card',
    percentPosition: true
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
    window.localStorage[localStorageSubsName] = JSON.stringify(storedSubscriptions);
  }
}

function newCard(cardType) {
  if(cardType == "default"){
    // creates a new card, adds it to the grid, and returns it.
    let card = $("<div></div>").addClass('card')
      .appendTo($('.grid'));
    return card;
  }
  else if(cardType == "environmentPlot"){
    // creates a new card, adds it to the grid, and returns it.
    let card = $("<div></div>")
      .addClass('card card_environmentPlot')
      .appendTo($('.grid'));
    return card;
  }

}

let onOpen = function () {
  for (let subsIdx in subscriptions) {
    if(subsIdx == "/environmentPlot__0"){
      initSubscribeEnvironment({ topicName: subsIdx, topicType: "environmentPlot" });
    }
    else{
      console.log("Re-subscribing to " + subsIdx);
      initSubscribe({ topicName: subsIdx, topicType: subscriptions[subsIdx].topicType, friendlyName: subscriptions[subsIdx].friendlyName, dataIdx: subscriptions[subsIdx].dataIdx });
    } 
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
    // console.log(msg._topic_name);
    if(msg._topic_name == topics[key]){
      for(let i=0; i < subsGroup[topics[key]].length; i++){
        subscriptions[subsGroup[topics[key]][i]].viewer.update(msg);
      }
      break;
    }
  }
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
    } 
    else {
      if(fullTopicName == "/environmentPlot") {
        $('<a></a>')
          .addClass("mdl-navigation__link")
          .css({
            "padding-left": "12pt",
            "margin-left": 0,
            opacity: 0.5,
          })
          .click(() => { initSubscribeEnvironment({ topicName: fullTopicName, topicType: "environmentPlot" }); })
          .text(subTree.name)
          .appendTo(subEl);
      }
      else {
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
    let topicFromCookies = topicName.split("__");

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
            let aux = subsGroup[topics[key]][i].split("__");

            if(idx == aux[1]){
              console.log("SubIdx: " + idx + " already exist!");
              idx = Math.floor(Math.random() * 1e6);
            }
          }
          idSub = topicName + "__" + idx;
          control=1;
          break;
        }
      }
    }
  }
  else{
    idSub = topicName + "__0";
    control=1; 
  }

  if(control == 0){
    idSub = topicName + "__0";
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
    let card = newCard("default");
    let viewer;

    if(topicName === "/compass" || topicName === "/environmentPlot/heading"){
      viewer = Viewer.getViewerForClass(topicType, "Compass");
    }
    else if(topicName === "/environmentPlot/distGoal"){
      viewer = Viewer.getViewerForClass(topicType, "Two Information View");
    }
    else if(topicName === "/rosbagAction"){
      viewer = Viewer.getViewerForClass(topicType, "Rosbag");
    }
    else if(topicName === "/Wind" || topicName === "/Wind2"){
      viewer = Viewer.getViewerForClass(topicType, "WindRose");
    }
    else{
      viewer = Viewer.getViewerForClass(topicType, friendlyName);
    }
    

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

function initSubscribeEnvironment({ topicName, topicType, friendlyName = "default", dataIdx = 0 }) {
  // creates a subscriber for topicName
  // and also initializes a viewer (if it doesn't already exist)
  // in advance of arrival of the first data
  // this way the user gets a snappy UI response because the viewer appears immediately
  let idSub;
  let control = 0;
  subsGroup = getSubscritors(subscriptions);

  if(!jQuery.isEmptyObject(subsGroup)){
    let topics = Object.keys(subsGroup);
    let topicFromCookies = topicName.split("__");

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
            let aux = subsGroup[topics[key]][i].split("__");

            if(idx == aux[1]){
              console.log("SubIdx: " + idx + " already exist!");
              idx = Math.floor(Math.random() * 1e6);
            }
          }
          idSub = topicName + "__" + idx;
          control=1;
          break;
        }
      }
    }
  }
  else{
    idSub = topicName + "__0";
    control=1; 
  }

  if(control == 0){
    idSub = topicName + "__0";
  }

  if (!subscriptions[idSub]) {
      subscriptions[idSub] = {
        topicType: "environmentPlot",
        dataIdx: 0,
        friendlyName: "default"
      }
    }

  currentTransport.subscribe({ topicName: topicName + "/pos_odorsource" });
  currentTransport.subscribe({ topicName: topicName + "/pos_goal" });
  currentTransport.subscribe({ topicName: topicName + "/pos_agent" });
  currentTransport.subscribe({ topicName: topicName + "/inside_grid" });
  currentTransport.subscribe({ topicName: topicName + "/polygon" });
  currentTransport.subscribe({ topicName: topicName + "/graphLimits" });
  currentTransport.subscribe({ topicName: topicName + "/distGoal" });

  if (!subscriptions[idSub].viewer) {
    let card = newCard("environmentPlot");
    let viewer = Viewer.getViewerForClass(topicType, friendlyName);

    try {
      subscriptions[idSub].viewer = new viewer(card, idSub, topicName);
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
  if(subsIdx == "/environmentPlot__0"){
    if(subsGroup[topicName + "/pos_odorsource"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/pos_odorsource" });
    }
    if(subsGroup[topicName + "/pos_goal"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/pos_goal" });
    }
    if(subsGroup[topicName + "/pos_agent"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/pos_agent" });
    }
    if(subsGroup[topicName + "/inside_grid"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/inside_grid" });
    }
    if(subsGroup[topicName + "/polygon"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/polygon" });
    }
    if(subsGroup[topicName + "/graphLimits"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/graphLimits" });
    }
    if(subsGroup[topicName + "/distGoal"].length == 1){
      currentTransport.unsubscribe({ topicName: topicName + "/distGoal" });
    }
  }
  else if(subsGroup[topicName].length == 1){
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
    // let aux = key.split("__")[0];
    // rosTopicName[aux] = [];

    let keyParsed = key.split("__");
    let topic = keyParsed[0];
    
    for(let i=1; i<keyParsed.length-1; i++){
      topic = topic + "__" + keyParsed[i];
    }

    if(topic == "/environmentPlot"){
      rosTopicName[topic + "/pos_odorsource"] = [];
      rosTopicName[topic + "/pos_goal"] = [];
      rosTopicName[topic + "/pos_agent"] = [];
      rosTopicName[topic + "/polygon"] = [];
      rosTopicName[topic + "/inside_grid"] = [];
      rosTopicName[topic + "/graphLimits"] = [];
      rosTopicName[topic + "/distGoal"] = [];
    }
    else{
      rosTopicName[topic] = [];
    }
  });

  Object.keys(subs).forEach(function (key, i) {
    let keyParsed = key.split("__");
    let topic = keyParsed[0];
    
    for(let i=1; i<keyParsed.length-1; i++){
      topic = topic + "__" + keyParsed[i];
    }

    // let aux = key.split("_")[0];
    if(topic == "/environmentPlot"){
      rosTopicName[topic + "/pos_odorsource"].push(key);
      rosTopicName[topic + "/pos_goal"].push(key);
      rosTopicName[topic + "/pos_agent"].push(key);
      rosTopicName[topic + "/polygon"].push(key);
      rosTopicName[topic + "/inside_grid"].push(key);
      rosTopicName[topic + "/graphLimits"].push(key);
      rosTopicName[topic + "/distGoal"].push(key);
    }
    else{
      rosTopicName[topic].push(key);
    }
  });

  return rosTopicName;
}

function updateSubscritors(){
  subsGroup = getSubscritors(subscriptions);
}
