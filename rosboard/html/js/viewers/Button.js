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

    this.joyId = "joy-" + Math.floor(Math.random()*10000);
    this.joy = $('<div><button id=button_1>start</button></div>')
      .css({
        "height": "250px",
      })
      .appendTo(this.viewer);

    var button = document.createElement("button");
  }

  onData(msg) {
//    this.card.title.text("buttons panel");
  }
}

Button.friendlyName = "Button";

Button.supportedTypes = [
    "std_msgs/msg/Empty",
];

Button.maxUpdateRate = 10.0;

Viewer.registerViewer(Button);
