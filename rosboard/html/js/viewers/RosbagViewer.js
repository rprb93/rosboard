"use strict";

class RosbagViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
    this.trRosbagHeader

    this.card.title.text("Control Panel");

    this.viewer = $('<div></div>')
      .css({
        'font-size': '11pt'
        , "filter": "invert(100%) saturate(50%)"
      })
      .appendTo(this.card.content);

    this.buttonId = "button-" + Math.floor(Math.random() * 10000);

    this.button = $('<div class="button" id="' + this.buttonId + '"></div>')
      .css({
        "height": "250px",
        "width": "100%"
      })
      .appendTo(this.viewer);

    this.dataTable = $('<table></table>')
      .addClass('mdl-data-table')
      .addClass('mdl-js-data-table')
      .css({ 'width': '100%', 'table-layout': 'fixed', 'background':'#40404000' })
      .appendTo(this.button);

    this.trRosbagHeader = $('<tr></tr>')
      .appendTo(this.dataTable);

    let thRosbagHeader = $('<th colspan="2"></th>')
      .css({
        'text-align': 'center'
      })
      .text("Rosbag Control")
      .appendTo(this.trRosbagHeader)

    let trRosbagButtons = $('<tr></tr>')
      .css({
        'background': 'd7d7d7'
      })
      .appendTo(this.dataTable);

    let tdRosbagBtStart = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({
        'width': '70%',
        'font-weight': 'bold',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'text-align': 'center'
      })
      .appendTo(trRosbagButtons);

    $('<button id=btRosbagStart><i class="material-icons">play_arrow</i></button>')
      .addClass('mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect')
      .css({
        'width': '100px',
        'height': '100px',
        'min-width': 'initial',
        'background':'#9e9e9e'

      })
      .appendTo(tdRosbagBtStart)

    let tdRosbagBtStop = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({
        'width': '70%',
        'font-weight': 'bold',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'text-align': 'center'
      })
      .appendTo(trRosbagButtons);

    $('<button id=btRosbagStop><i class="material-icons">stop</i></button>')
      .addClass('mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect')
      .css({
        'width': '100px',
        'height': '100px',
        'min-width': 'initial',
        'background':'#9e9e9e'

      })
      .appendTo(tdRosbagBtStop)

    let trStopWatch = $('<tr></tr>')
      .appendTo(this.dataTable);

      

    let btActionRosbag = 0.0;
    document.getElementById("btRosbagStart").onclick = function () {
      btActionRosbag = 1.0;
      currentTransport.update_rosbag(btActionRosbag);
    };

    document.getElementById("btRosbagStop").onclick = function () {
      btActionRosbag = 0.0;
      currentTransport.update_rosbag(btActionRosbag);
    };
  }

  onData(msg) {
    this.card.title.text(msg._topic_name);

    if (msg.data == 0) {
      this.trRosbagHeader.css({
        'background': '#0acab8'
      });
    }
    else if (msg.data == 1) {
      this.trRosbagHeader.css({
        'background': '#f423ff'
      });
    }
  }  
}

RosbagViewer.friendlyName = "Rosbag";

RosbagViewer.supportedTypes = [
  "std_msgs/msg/UInt8"
];

RosbagViewer.maxUpdateRate = 10.0;

Viewer.registerViewer(RosbagViewer);