"use strict";

class Button extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {

    this.card.title.text("Control Panel");

    this.viewer = $('<div></div>')
      .css({'font-size': '11pt'
    , "filter": "invert(100%) saturate(50%)"})
      .appendTo(this.card.content);

    this.button = $('<div><button id=button_1>Start</button><button id=button_2>Stop</button></div>')
      .css({
        "height": "250px",
      })
      .appendTo(this.viewer);

    let button_1 = 0.0;
    let button_2 = 0.0;

    document.getElementById("button_1").onmousedown = function() {
      button_1 = 1.0;
      currentTransport.update_button({button_1, button_2});
    };
    document.getElementById("button_1").onmouseup = function() {
      button_1 = 0.0;
      currentTransport.update_button({button_1, button_2});
    };

    document.getElementById("button_2").onmousedown = function() {
      button_2 = 1.0;
      currentTransport.update_button({button_1, button_2});
    };
    document.getElementById("button_2").onmouseup = function() {
      button_2 = 0.0;
      currentTransport.update_button({button_1, button_2});
    };



  }

  onData(msg) {
  }
}

Button.friendlyName = "Button";

Button.supportedTypes = [
    "std_msgs/msg/Empty",
];

Button.maxUpdateRate = 10.0;

Viewer.registerViewer(Button);
