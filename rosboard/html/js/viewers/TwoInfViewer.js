"use strict";

// GenericViewer just displays message fields and values in a table.
// It can be used on any ROS type.

class TwoInfViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
    this.distance = 0.0;
    this.velocity = 0.0;

    this.viewerNode = $('<div></div>')
      .css({'font-size': '11pt'})
      .appendTo(this.card.content);

    this.viewerNodeFadeTimeout = null;

    this.expandFields = { };
    this.fieldNodes = { };
    this.dataTable = $('<table></table>')
          .addClass('mdl-data-table')
          .addClass('mdl-js-data-table')
          .css({'width': '100%', 'min-height': '30pt', 'table-layout': 'fixed' })
          .appendTo(this.viewerNode);
    
          let trDistance = $('<tr></tr>')
            .css({"height": "80px"})
            .appendTo(this.dataTable);

          this.tdDistanceHeader = $('<td></td>')
            .addClass('mdl-data-table__cell--non-numeric')
            .css({'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'font-size': "50px"})
            .text("Distance: ")
            .appendTo(trDistance);
          this.tdDistance = $('<td></td>')
            .addClass('mdl-data-table__cell--non-numeric')
            .css({'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'font-size': "50px"})
            .appendTo(trDistance);
          
          let trVelocity = $('<tr></tr>')
            .css({"height": "80px"})
            .appendTo(this.dataTable);

          this.tdVelocityHeader = $('<td></td>')
            .addClass('mdl-data-table__cell--non-numeric')
            .css({'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'font-size': "50px"})
            .text("Velocity: ")
            .appendTo(trVelocity);
          this.tdVelocity = $('<td></td>')
            .addClass('mdl-data-table__cell--non-numeric')
            .css({'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'font-size': "50px"})
            .appendTo(trVelocity);

    super.onCreate();
  }

  onData(msg) {
      this.card.title.text(msg._topic_name);

      this.tdDistance.text((Math.round(msg.data[0] * 100) / 100) + "m");
      this.tdVelocity.text((Math.round(msg.data[1] * 100) / 100) + "m/s");

  }
}

TwoInfViewer.friendlyName = "Two Information View";

TwoInfViewer.supportedTypes = [
  "std_msgs/msg/Float32MultiArray",
];

Viewer.registerViewer(TwoInfViewer);