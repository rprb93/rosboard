class WebSocketV1Transport {
    constructor({path, onOpen, onClose, onRosMsg, onTopics, onSystem}) {
      this.path = path;
      this.onOpen = onOpen ? onOpen.bind(this) : null;
      this.onClose = onClose ? onClose.bind(this) : null;
      this.onMsg = onMsg ? onMsg.bind(this) : null;
      this.onTopics = onTopics ? onTopics.bind(this) : null;
      this.onSystem = onSystem ? onSystem.bind(this) : null;
      this.ws = null;

      this.btAction = {};
      //   button00: 0,
      //   button01: 0,
      //   button02: 0,
      //   button10: 0,
      //   button11: 0,
      //   button12: 0,
      //   button20: 0,
      //   button21: 0,
      //   button22: 0
      // };

      this.btActionRosbag;

      this.sendText;

      // this.test = 0;
    }
  
    connect() {
      var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
      let abspath = protocolPrefix + '//' + location.host + this.path;
  
      let that = this;
  
      this.ws = new WebSocket(abspath);
  
      this.ws.onopen = function(){
        console.log("connected");
        if(that.onOpen) that.onOpen(that);
      }
      
      this.ws.onclose = function(){
        console.log("disconnected");
        if(that.onClose) that.onClose(that);
      }
  
      this.ws.onmessage = function(wsmsg) {
        let data = [];
        try {
          // try fast native parser
          data = JSON.parse(wsmsg.data);
        } catch(e) {
          // Python may have included Infinity, -Infinity, NaN
          // fall back to a JSON5 parsers which will deal with these well but is almost 50X slower in Chrome
          data = JSON5.parse(wsmsg.data);
        }

        let wsMsgType = data[0];
  
        if(wsMsgType === WebSocketV1Transport.MSG_PING) {
          this.send(JSON.stringify([WebSocketV1Transport.MSG_PONG, {
            [WebSocketV1Transport.PONG_SEQ]: data[1][WebSocketV1Transport.PING_SEQ],
            [WebSocketV1Transport.PONG_TIME]: Date.now(),
          }]));
        }
        else if(wsMsgType === WebSocketV1Transport.MSG_MSG && that.onMsg) 
          that.onMsg(data[1]);
        else if(wsMsgType === WebSocketV1Transport.MSG_TOPICS && that.onTopics) that.onTopics(data[1]);
        else if(wsMsgType === WebSocketV1Transport.MSG_SYSTEM && that.onSystem) that.onSystem(data[1]);
        else console.log("received unknown message: " + wsmsg.data);

        // this.send(JSON.stringify([WebSocketV1Transport.JOY_MSG, {
        //   ["x"]: that.joystickX.toFixed(3),
        //   ["y"]: that.joystickY.toFixed(3),}]));

        this.send(JSON.stringify([WebSocketV1Transport.BUTTON_MSG, {
          ["00"]: that.btAction["button00"],
          ["01"]: that.btAction["button01"],
          ["02"]: that.btAction["button02"],
          ["10"]: that.btAction["button10"],
          ["11"]: that.btAction["button11"],
          ["12"]: that.btAction["button12"],
          ["20"]: that.btAction["button20"],
          ["21"]: that.btAction["button21"],
          ["22"]: that.btAction["button22"],
        }]));

        this.send(JSON.stringify([WebSocketV1Transport.ROSBAG_MSG, {
          ["action"]: that.btActionRosbag,
        }]));

        this.send(JSON.stringify([WebSocketV1Transport.SENDTEXT_MSG, {
          ["text"]: that.sendText,
        }]));

      }
    }
  
    isConnected() {
      return (this.ws && this.ws.readyState === this.ws.OPEN);
    }
  
    subscribe({topicName, maxUpdateRate = 24.0}) {
      this.ws.send(JSON.stringify([WebSocketV1Transport.MSG_SUB, {topicName: topicName, maxUpdateRate: maxUpdateRate}]));
    }

    unsubscribe({topicName}) {
      this.ws.send(JSON.stringify([WebSocketV1Transport.MSG_UNSUB, {topicName: topicName}]));
    }

    update_joy({joystickX, joystickY}) {
      this.joystickX = joystickX;
      this.joystickY = joystickY;
    }

    update_button(button) {
      if(!this.btAction){
        this.btAction = {
          button00: 0,
          button01: 0,
          button02: 0,
          button10: 0,
          button11: 0,
          button12: 0,
          button20: 0,
          button21: 0,
          button22: 0
        };
      }
      let keys = Object.keys(button);
      let value = this.btAction[keys];

      if(value == 0){
        this.btAction[keys] = 1;
      }
      else{
        this.btAction[keys] = 0;
      }

      if(keys[0] === "button01"){
        if(this.btAction[keys] == 1){
          this.btAction["button00"] = 0;
        }
      }

      if(keys[0] === "button00"){
        if(this.btAction[keys] == 1){
          this.btAction["button01"] = 0;
        }
      }

      if(keys[0] === "button21"){
        if(this.btAction[keys] == 1){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 1;
          this.btAction["button21"] = 1;
        }
      }
      if(keys[0] === "button21"){
        if(this.btAction[keys] == 0){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 1;
          this.btAction["button21"] = 1;
        }
      }

      if(keys[0] === "button20"){
        if(this.btAction[keys] == 1){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 1;
          this.btAction["button21"] = 0;
        }
      }
      if(keys[0] === "button20"){
        if(this.btAction[keys] == 0){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 1;
          this.btAction["button21"] = 0;
        }
      }

      if(keys[0] === "button12"){
        if(this.btAction[keys] == 1){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }
      if(keys[0] === "button12"){
        if(this.btAction[keys] == 0){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 1;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }

      if(keys[0] === "button11"){
        if(this.btAction[keys] == 1){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 0;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }
      if(keys[0] === "button11"){
        if(this.btAction[keys] == 0){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 1;
          this.btAction["button12"] = 0;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }

      if(keys[0] === "button10"){
        if(this.btAction[keys] == 1){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 0;
          this.btAction["button12"] = 0;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }
      if(keys[0] === "button10"){
        if(this.btAction[keys] == 0){
          this.btAction["button10"] = 1;
          this.btAction["button11"] = 0;
          this.btAction["button12"] = 0;
          this.btAction["button20"] = 0;
          this.btAction["button21"] = 0;
        }
      }
    }

    update_rosbag(action){
      this.btActionRosbag = action;
    }

    update_sendText(text){
      this.sendText = text;
    }

  }
  
  WebSocketV1Transport.MSG_PING = "p";
  WebSocketV1Transport.MSG_PONG = "q";
  WebSocketV1Transport.MSG_MSG = "m";
  WebSocketV1Transport.MSG_TOPICS = "t";
  WebSocketV1Transport.MSG_SUB = "s";
  WebSocketV1Transport.MSG_SYSTEM = "y";
  WebSocketV1Transport.MSG_UNSUB = "u";

  WebSocketV1Transport.PING_SEQ= "s";
  WebSocketV1Transport.PONG_SEQ = "s";
  WebSocketV1Transport.PONG_TIME = "t";

  WebSocketV1Transport.JOY_MSG = "j";
  WebSocketV1Transport.BUTTON_MSG = "b";
  WebSocketV1Transport.ROSBAG_MSG = "a";
  WebSocketV1Transport.SENDTEXT_MSG = "c";
