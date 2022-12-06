"use strict";

// GenericViewer just displays message fields and values in a table.
// It can be used on any ROS type.

class EnvironmentViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
    this.dataGoal = [];
    this.circleGoal = [];
    this.dataAgent = [];
    this.dataOdorSource = [];
    this.circleOdorSource = [];
    this.dataPolygon = [];
    this.dataInside_grid = [];
    this.xlimits = [];
    this.ylimits = [];
    this.distGoal = 0.0;
    this.status = [];

    this.viewer = $('<div></div>')
      .css({
        'font-size': '11pt', 
      })
      .appendTo(this.card.content);

    this.envPlotId = "envPlot-" + Math.floor(Math.random() * 10000);

    this.envPlot = $('<div class="envPlot" id="' + this.envPlotId + '"></div>')
      .addClass('card-envPlot')
      // .css({
      //   "height": "450px",
      //   "width": "100%",
      //   "background-color": "yellow";
      //   // "padding-left: 0px;

      // })
      .appendTo(this.viewer);

    this.scatterEcharts = echarts.init(document.getElementById(this.envPlotId), 'infographic', {width: 'auto'});
    var option;

    setInterval(()=> {
      option = {
        grid: {
          left: '5%',
          top: '2%',
          right: '2%',
          bottom: '10%'
        },
        animation: false,
        xAxis: {
          min: Math.round(this.xlimits[0]),
          max: Math.round(this.xlimits[1]),
          inverse: true
        },
        yAxis: {
          min: Math.round(this.ylimits[0]),
          max: Math.round(this.ylimits[1])
        },
        series: [
          // Odor Source Pose
          {
            symbolSize: 20,
            type: 'scatter',
            symbol: 'rect',
            data: [
              [this.dataOdorSource[1], this.dataOdorSource[0]]
            ],
            itemStyle: {
              color: "#ff0000",
              opacity: 1
            }
          },
          // Goal Pose
          {
            symbolSize: 3,
            type: 'scatter',
            data: this.circleGoal,
            itemStyle: {
              color: "#0009ff",
            },
            markPoint: {
              symbol: 'circle',
              symbolSize: 10,
              data: [
                {coord: [this.dataGoal[0], this.dataGoal[1]]}
              ]
            }
          },
          // boundary 
          {
            symbolSize: 10,
            type: 'scatter',
            markLine: {
              lineStyle: {
                type: 'solid',
                width: 5,
                color: "#346500"
              },
              animation: false,
              symbolSize: 1,
              data: [
                [
                  {coord: this.dataPolygon[0]},
                  {coord: this.dataPolygon[1]}
                ],
                [
                  {coord: this.dataPolygon[1]},
                  {coord: this.dataPolygon[2]}
                ],
                [
                  {coord: this.dataPolygon[2]},
                  {coord: this.dataPolygon[3]}
                ],
                [
                  {coord: this.dataPolygon[3]},
                  {coord: this.dataPolygon[4]}
                ],
                [
                  {coord: this.dataPolygon[4]},
                  {coord: this.dataPolygon[5]}
                ],
                [
                  {coord: this.dataPolygon[5]},
                  {coord: this.dataPolygon[6]}
                ],
                [
                  {coord: this.dataPolygon[6]},
                  {coord: this.dataPolygon[7]}
                ],
                [
                  {coord: this.dataPolygon[7]},
                  {coord: this.dataPolygon[8]}
                ],
                [
                  {coord: this.dataPolygon[8]},
                  {coord: this.dataPolygon[9]}
                ],
                [
                  {coord: this.dataPolygon[9]},
                  {coord: this.dataPolygon[10]}
                ],
                [
                  {coord: this.dataPolygon[10]},
                  {coord: this.dataPolygon[11]}
                ],
                [
                  {coord: this.dataPolygon[11]},
                  {coord: this.dataPolygon[12]}
                ],
                [
                  {coord: this.dataPolygon[12]},
                  {coord: this.dataPolygon[0]}
                ]
              ]
            }
          },
          // inside grid points
          {
            symbolSize: 10,
            type: 'scatter',
            data: this.dataInside_grid
          },
          // Agent Pose and line to Goal
          {
            symbolSize: 30,
            type: 'scatter',
            symbol: 'circle',
            data: [
              [this.dataAgent[0], this.dataAgent[1]]
            ],
            itemStyle: {
              color: "#000000",
              opacity: 0.8
            },
            markLine: {
              lineStyle: {
                type: 'line',
                width: 3,
                color: "#000000"
              },
              animation: false,
              data: [
                [
                  {coord: [this.dataAgent[0], this.dataAgent[1]]},
                  {coord: [this.dataGoal[0], this.dataGoal[1]]}
                ],
              ]
            }
          }
        ]
      };

      option && this.scatterEcharts.setOption(option);
    }, 200);

  }

  onData(data) {
    this.card.title.text("Distance: " + (Math.round(this.distGoal * 100) / 100) + " m");

    if(this.status[0] == 1){
      this.card.status.text("Status: Ready!");
    }
    else if(this.status[0] == 0){
      this.card.status.text("Status: Off!");
      this.dataGoal = [];
      this.circleGoal = [];
    }

    if (data._topic_name == "/environmentPlot/pos_odorsource") {
      this.dataOdorSource[0] = data.data[0];
      this.dataOdorSource[1] = data.data[1];
      this.dataOdorSource[2] = data.data[2];

      this.circleOdorSource = Array.from(Array(36), () => new Array(2));

      let j = 0;
      for(let i=0; i < 360; i+=10){
        this.circleOdorSource[j][0] = data.data[2] * Math.cos(i * (Math.PI/180)) + data.data[0];
        this.circleOdorSource[j][1] = data.data[2] * Math.sin(i * (Math.PI/180)) + data.data[1];
        j = j+1;
       }
    }
    else if (data._topic_name == "/environmentPlot/pos_goal") {
      this.dataGoal[0] = data.data[0];
      this.dataGoal[1] = data.data[1];
      this.dataGoal[2] = data.data[2];

      this.circleGoal = Array.from(Array(36), () => new Array(2));

      let j = 0;
      for(let i=0; i < 360; i+=10){
        this.circleGoal[j][0] = data.data[2] * Math.cos(i * (Math.PI/180)) + data.data[0];
        this.circleGoal[j][1] = data.data[2] * Math.sin(i * (Math.PI/180)) + data.data[1];
        j = j+1;
       }
    }
    else if (data._topic_name == "/environmentPlot/pos_agent") {
      this.dataAgent[0] = data.data[0];
      this.dataAgent[1] = data.data[1];
      this.dataAgent[2] = data.data[2];
    }
    else if (data._topic_name == "/environmentPlot/polygon") {
      let odd = data.data.filter((v, i) => i % 2);
      let even = data.data.filter((v, i) => !(i % 2));

      this.dataPolygon = Array.from(Array(odd.length), () => new Array(2));

      for(let i=0; i < odd.length; i++){
        this.dataPolygon[i][0] = odd[i];
        this.dataPolygon[i][1] = even[i];
      }
    }
    else if (data._topic_name == "/environmentPlot/graphLimits") {
      this.xlimits[0] = data.data[0];
      this.xlimits[1] = data.data[1];
      this.ylimits[0] = data.data[2];
      this.ylimits[1] = data.data[3];
    }
    else if (data._topic_name == "/environmentPlot/inside_grid") {
      let odd = data.data.filter((v, i) => i % 2);
      let even = data.data.filter((v, i) => !(i % 2));

      this.dataInside_grid = Array.from(Array(odd.length), () => new Array(2));

      for(let i=0; i < odd.length; i++){
        this.dataInside_grid[i][0] = odd[i];
        this.dataInside_grid[i][1] = even[i];
      }
    }
    else if (data._topic_name == "/environmentPlot/distGoal") {
      this.distGoal = data.data[0];
    }
    else if (data._topic_name == "/environmentPlot/status") {
     this.status[0] = data.data[0];
     this.status[1] = data.data[1];
     this.status[2] = data.data[2];
    }
  }
}

EnvironmentViewer.friendlyName = "Environment View";

EnvironmentViewer.supportedTypes = [
  "environmentPlot",
];

Viewer.registerViewer(EnvironmentViewer);