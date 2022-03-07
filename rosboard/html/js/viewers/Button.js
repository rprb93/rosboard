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

    this.button = $('<div><button id=button_1>start</button></div>')
      .css({
        "height": "250px",
      })
      .appendTo(this.viewer);

    document.getElementById("button_1").onclick = function() {
      // ここに#buttonをクリックしたら発生させる処理を記述する
      let joystickX = 1.0;
      let joystickY = 1.0;
      currentTransport.update_joy({joystickX, joystickY});
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
