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

    $('<button id=btAction00>Button</button>')
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
    
    $('<button id=btAction01>Button</button>')
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


    // let button_1 = 0.0;
    // let button_2 = 0.0;
    
    let btActionRosbag = 0.0;
    document.getElementById("btAction00").onmousedown = function() {
      // btActionRosbag = 1.0;
      // currentTransport.update_rosbag({btActionRosbag});
    };
    document.getElementById("btAction01").onmouseup = function() {
      // btAction = 0.0;
      // currentTransport.update_rosbag({btActionRosbag});
    };

    // document.getElementById("button_2").onmousedown = function() {
    //   button_2 = 1.0;
    //   currentTransport.update_button({button_1, button_2});
    // };
    // document.getElementById("button_2").onmouseup = function() {
    //   button_2 = 0.0;
    //   currentTransport.update_button({button_1, button_2});
    // };



  }

  onData(msg) {
  }
}

ButtonViewer.friendlyName = "Button";

ButtonViewer.supportedTypes = [
  "std_msgs/msg/Empty",
];

ButtonViewer.maxUpdateRate = 10.0;

Viewer.registerViewer(ButtonViewer);
