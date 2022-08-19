"use strict";

class SendTextViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
    this.trRosbagHeader

    this.card.title.text("Send String");

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

    let trSendText = $('<tr></tr>')
      .appendTo(this.dataTable);

    let tdSendTextInput = $('<td></td>')
      .addClass('mdl-textfield mdl-js-textfield')
      .css({
        'width': '90%',
        'height': '100px',
        'padding-top': '38px'
      })
      .appendTo(trSendText);

    $('<input class="mdl-textfield__input" type="text" id="sample1">')
      .css({
        'background':'#000000'
      })
      .appendTo(tdSendTextInput)

    let tdSendTextBtSend = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({
        'width': '30%',
        'font-weight': 'bold',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'text-align': 'center'
      })
      .appendTo(trSendText);

    $('<button id=btSendTextSend><i class="material-icons">send</i></button>')
      .addClass('mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect')
      .css({
        // 'width': '100px',
        // 'height': '100px',
        'min-width': 'initial',
        'background':'#9e9e9e'

      })
      .appendTo(tdSendTextBtSend)

    // let trStopWatch = $('<tr></tr>')
    //   .appendTo(this.dataTable);

    document.getElementById("btSendTextSend").onclick = function () {
      let text = document.getElementById("sample1").value
      currentTransport.update_sendText(text);
    };
  }

  onData(msg) {
    this.card.title.text(msg._topic_name);
  }  
}

SendTextViewer.friendlyName = "SendText";

SendTextViewer.supportedTypes = [
  "std_msgs/msg/String"
];

SendTextViewer.maxUpdateRate = 10.0;

Viewer.registerViewer(SendTextViewer);