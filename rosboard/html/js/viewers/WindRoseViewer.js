"use strict";

class WindRoseViewer extends Viewer {
    /**
      * Gets called when Viewer is first initialized.
      * @override
    **/
    onCreate() {
        this.viewer = $('<div></div>')
            .css({
                'font-size': '11pt'
                , "filter": "invert(100%) saturate(50%)"
            })
            .appendTo(this.card.content);

        this.roseID = "rose-" + Math.floor(Math.random() * 10000);

        this.compass = $('<div class="compass" id="' + this.roseId + '"></div>')
            .css({
                "height": "250px",
                "width": "100%"
            })
            .appendTo(this.viewer);

        this.dataTable = $('<table></table>')
            .addClass('mdl-data-table')
            .addClass('mdl-js-data-table')
            .css({ 'width': '100%', 'table-layout': 'fixed' })
            .appendTo(this.viewer);

        // let tr = $('<tr></tr>')
        //     .appendTo(this.dataTable);

        // $('<td></td>')
        //     .addClass('mdl-data-table__cell--non-numeric')
        //     .text("data")
        //     .css({ 'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis' })
        //     .appendTo(tr);
        // this.valueField = $('<td></td>')
        //     .addClass('mdl-data-table__cell--non-numeric')
        //     .addClass('monospace')
        //     .css({ 'overflow': 'hidden', 'text-overflow': 'ellipsis' })
        //     .appendTo(tr);

        this.data = [0.0];

        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        var root = am5.Root.new(this.roseId);

        // Generate and set data
        // https://www.amcharts.com/docs/v5/charts/radar-chart/#Setting_data
        var cat = -1;
        var value = 10;

        function generateData() {
            value = Math.round(Math.random() * 10);
            cat++;
            return {
                category: "cat" + cat,
                value: value
            };
        }

        function generateDatas(count) {
            cat = -1;
            var data = [];
            for (var i = 0; i < count; ++i) {
                let aux = generateData();
                console.log(aux);
                data.push(aux);
            }
            return data;
        }
        
        function generateHist(wind) {
            var data = [];

            for(let i = 0; i < wind[0].length; i++){
                if(wind[1][i] >= 0 && wind[1][i] < 45 ){
                    let aux = {
                        category: "N",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 45 && wind[1][i] < 90 ){
                    let aux = {
                        category: "NE",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 90 && wind[1][i] < 135 ){
                    let aux = {
                        category: "E",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 135 && wind[1][i] < 180 ){
                    let aux = {
                        category: "SE",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 180 && wind[1][i] < 225 ){
                    let aux = {
                        category: "S",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 225 && wind[1][i] < 270 ){
                    let aux = {
                        category: "SW",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 270 && wind[1][i] < 315 ){
                    let aux = {
                        category: "W",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
                else if(wind[1][i] >= 315 && wind[1][i] < 360 ){
                    let aux = {
                        category: "NW",
                        value: wind[0][i]
                    };
                    data.push(aux);
                }
            }

            return data;
        }

        // Create chart
        // https://www.amcharts.com/docs/v5/charts/radar-chart/
        var chart = root.container.children.push(am5radar.RadarChart.new(root, {
            panX: false,
            panY: false
            // wheelX: "panX",
            // wheelY: "zoomX"
        }));

        // Create axes and their renderers
        // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
        var xRenderer = am5radar.AxisRendererCircular.new(root, {});
        xRenderer.labels.template.setAll({
            radius: 10
        });

        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0,
            categoryField: "category",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {})
        }));

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5radar.AxisRendererRadial.new(root, {})
        }));

        // Create series
        // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
        for (var i = 0; i < 5; i++) {
            var series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
                stacked: true,
                name: "Series " + i,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                categoryXField: "category"
            }));

            series.set("stroke", root.interfaceColors.get("background"));
            series.columns.template.setAll({
                width: am5.p100,
                strokeOpacity: 0.1,
                tooltipText: "{name}: {valueY}"
            });

            series.data.setAll(generateDatas(12));
            series.appear(1000);
        }

        // var data1 = generateDatas(5);
        this.size = 500;
        this.data = [
            new Array(this.size).fill(0),
            new Array(this.size).fill(0),
        ];
        
        this.ptr = 0;

        // xAxis.data.setAll(data1);

        setInterval(() => {
            let aux = generateHist(this.data);
            xAxis.data.setAll(aux);
            // var newAngle = this.data;
            // chart.animate({
            //     key: "startAngle",
            //     to: newAngle,
            //     duration: 1000,
            //     easing: am5.ease.out(am5.ease.cubic)
            // });
            // chart.animate({
            //     key: "endAngle",
            //     to: newAngle + 360,
            //     duration: 1000,
            //     easing: am5.ease.out(am5.ease.cubic)
            // });
            // axisDataItemN.animate({
            //     key: "value",
            //     to: am5.math.normalizeAngle(-90 - newAngle),
            //     duration: 1000,
            //     easing: am5.ease.out(am5.ease.cubic)
            // });
            // axisDataItemS.animate({
            //     key: "value",
            //     to: am5.math.normalizeAngle(90 - newAngle),
            //     duration: 1000,
            //     easing: am5.ease.out(am5.ease.cubic)
            // });

        }, 2000);
    }

    onData(msg) {
        this.card.title.text(msg._topic_name);
        var angle = 360 - 90 - (msg.data[1] * (180 / Math.PI));
        if (angle < 0) {
            angle = angle + 360;
        }

        this.data[0][this.ptr] = Math.round(msg.data[0] * 100) / 100;
        this.data[1][this.ptr] = Math.round(angle * 100) / 100;
        this.ptr = (this.ptr + 1) % this.size;
    }
}

WindRoseViewer.friendlyName = "WindRose";

WindRoseViewer.supportedTypes = [
    "std_msgs/msg/Float32MultiArray",
];

WindRoseViewer.maxUpdateRate = 10.0;

Viewer.registerViewer(WindRoseViewer);