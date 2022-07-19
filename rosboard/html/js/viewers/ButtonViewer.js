"use strict";

class ButtonViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {

    this.card.title.text("Control Panel");

    this.viewer = $('<div></div>')
      .css({
        'font-size': '11pt'
        , "filter": "invert(100%) saturate(50%)"
      })
      .appendTo(this.card.content);

    this.buttonId = "button-" + Math.floor(Math.random() * 10000);

    this.button = $('<div class="button" id="' + this.compassId + '"></div>')
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

    //==========================================
    let trActionButtons0 = $('<tr></tr>')
      .appendTo(this.dataTable);

    let tdActionBt00 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis',
        'text-align': 'center' 
      })
      .appendTo(trActionButtons0);

    $('<button id=btAction00>Walk</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt00)

    let tdActionBt01 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons0);
    
    $('<button id=btAction01>Stopped</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt01)

    let tdActionBt02 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons0);
    
    $('<button id=btAction02>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt02)

    //=============================================
    let trActionButtons1 = $('<tr></tr>')
      .appendTo(this.dataTable);

    let tdActionBt10 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis',
        'text-align': 'center' 
      })
      .appendTo(trActionButtons1);

    $('<button id=btAction10>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt10)

    let tdActionBt11 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons1);
    
    $('<button id=btAction11>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt11)

    let tdActionBt12 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons1);
    
    $('<button id=btAction12>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt12)

    //=============================================
    let trActionButtons2 = $('<tr></tr>')
      .appendTo(this.dataTable);

    let tdActionBt20 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis',
        'text-align': 'center' 
      })
      .appendTo(trActionButtons2);

    $('<button id=btAction20>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt20)

    let tdActionBt21 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons2);
    
    $('<button id=btAction21>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt21)

    let tdActionBt22 = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .css({ 
        'width': '70%', 
        'font-weight': 'bold', 
        'overflow': 'hidden', 
        'text-overflow': 'ellipsis', 
        'text-align': 'center' 
      })
      .appendTo(trActionButtons2);
    
    $('<button id=btAction22>Button</button>')
    .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
    .appendTo(tdActionBt22)
    
    document.getElementById("btAction00").onclick = function() {
      currentTransport.update_button({button00: 1})
    };
    document.getElementById("btAction01").onclick = function() {
      currentTransport.update_button({button01: 1})
    };
    document.getElementById("btAction02").onclick = function() {
      currentTransport.update_button({button02: 1})
    };
    document.getElementById("btAction10").onclick = function() {
      currentTransport.update_button({button10: 1})
    };
    document.getElementById("btAction11").onclick = function() {
      currentTransport.update_button({button11: 1})
    };
    document.getElementById("btAction12").onclick = function() {
      currentTransport.update_button({button12: 1})
    };
    document.getElementById("btAction20").onclick = function() {
      currentTransport.update_button({button20: 1})
    };
    document.getElementById("btAction21").onclick = function() {
      currentTransport.update_button({button21: 1})
    };
    document.getElementById("btAction22").onclick = function() {
      currentTransport.update_button({button22: 1})
    };
  }

  onData(msg) {
    this.card.title.text(msg._topic_name);

    if (msg.data[1] == 'A') {
      document.getElementById("btAction00").style.background = "#3f51b5"
    }
    else if(msg.data[1] == 'Q') {
      document.getElementById("btAction00").style.background = "#b33fb5"
    }

    if (msg.data[2] == 'A') {
      document.getElementById("btAction01").style.background = "#3f51b5"
    }
    else if(msg.data[2] == 'E') {
      document.getElementById("btAction01").style.background = "#b33fb5"
    }

    if (msg.data[3] == 'A') {
      document.getElementById("btAction02").style.background = "#3f51b5"
    }
    else if(msg.data[3] == 'B') {
      document.getElementById("btAction02").style.background = "#b33fb5"
    }

    if (msg.data[5] == 'A') {
      document.getElementById("btAction10").style.background = "#3f51b5"
    }
    else if(msg.data[5] == 'Q') {
      document.getElementById("btAction10").style.background = "#b33fb5"
    }

    if (msg.data[6] == 'A') {
      document.getElementById("btAction11").style.background = "#3f51b5"
    }
    else if(msg.data[6] == 'E') {
      document.getElementById("btAction11").style.background = "#b33fb5"
    }

    if (msg.data[7] == 'A') {
      document.getElementById("btAction12").style.background = "#3f51b5"
    }
    else if(msg.data[7] == 'B') {
      document.getElementById("btAction12").style.background = "#b33fb5"
    }

    if (msg.data[9] == 'A') {
      document.getElementById("btAction20").style.background = "#3f51b5"
    }
    else if(msg.data[9] == 'Q') {
      document.getElementById("btAction20").style.background = "#b33fb5"
    }

    if (msg.data[10] == 'A') {
      document.getElementById("btAction21").style.background = "#3f51b5"
    }
    else if(msg.data[10] == 'E') {
      document.getElementById("btAction21").style.background = "#b33fb5"
    }

    if (msg.data[11] == 'A') {
      document.getElementById("btAction22").style.background = "#3f51b5"
    }
    else if(msg.data[11] == 'B') {
      document.getElementById("btAction22").style.background = "#b33fb5"
    }
  }
}

ButtonViewer.friendlyName = "Button";

ButtonViewer.supportedTypes = [
  "std_msgs/msg/Empty",
  "std_msgs/msg/UInt8MultiArray"
];

ButtonViewer.maxUpdateRate = 10.0;

Viewer.registerViewer(ButtonViewer);
