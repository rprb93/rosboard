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
                , "filter": "invert(100%)"
            })
            .appendTo(this.card.content);

        this.roseId = "rose-" + Math.floor(Math.random() * 10000);

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

        this.size = 10;
        this.data = [
            new Array(this.size).fill(0),
            new Array(this.size).fill(0),
        ];
        this.ptr = 0;
        this.seriesWind = [];


        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        var root = am5.Root.new(this.roseId);

        function arrangeWindDirection(data) {
            let dirN = 0;
            let dirNE = 0;
            let dirE = 0;
            let dirSE = 0;
            let dirS = 0;
            let dirSW = 0;
            let dirW = 0;
            let dirNW = 0;
            let serieDir = [];
            let numElem = data.length;
            let size = 100;


            for (let i = 0; i < numElem; i++) {
                if (data[i] >= 0 && data[i] < 45) {
                    dirN++;
                }
                else if (data[i] >= 45 && data[i] < 90) {
                    dirNE++;
                }
                else if (data[i] >= 90 && data[i] < 135) {
                    dirE++;
                }
                else if (data[i] >= 135 && data[i] < 180) {
                    dirSE++;
                }
                else if (data[i] >= 180 && data[i] < 225) {
                    dirS++;
                }
                else if (data[i] >= 225 && data[i] < 270) {
                    dirSW++;
                }
                else if (data[i] >= 270 && data[i] < 315) {
                    dirW++;
                }
                else if (data[i] >= 315 && data[i] < 360) {
                    dirNW++;
                }
            }

            if (dirN != 0) {
                let aux = {
                    category: "N",
                    value: dirN / size * 100
                };
                serieDir.push(aux);
            }
            if (dirNE != 0) {
                let aux = {
                    category: "NE",
                    value: dirNE / size * 100
                };
                serieDir.push(aux);
            }
            if (dirE != 0) {
                let aux = {
                    category: "E",
                    value: dirE / size * 100
                };
                serieDir.push(aux);
            }
            if (dirSE != 0) {
                let aux = {
                    category: "SE",
                    value: dirSE / size * 100
                };
                serieDir.push(aux);
            }
            if (dirS != 0) {
                let aux = {
                    category: "S",
                    value: dirS / size * 100
                };
                serieDir.push(aux);
            }
            if (dirSW != 0) {
                let aux = {
                    category: "SW",
                    value: dirSW / size * 100
                };
                serieDir.push(aux);
            }
            if (dirW != 0) {
                let aux = {
                    category: "W",
                    value: dirW / size * 100
                };
                serieDir.push(aux);
            }
            if (dirNW != 0) {
                let aux = {
                    category: "NW",
                    value: dirNW / size * 100
                };
                serieDir.push(aux);
            }

            return serieDir;

        }

        function arrangeWindData(data) {
            // agrupar em funcao da intensidade do vento
            var series0_20 = [];
            var series20_50 = [];
            var series50_100 = [];
            var series100_150 = [];
            var series150_200 = [];
            var series200_250 = [];
            var series250_300 = [];
            var series300_350 = [];
            var series350_400 = [];
            var series400_450 = [];
            var series450_plus = [];
            let seriesSpeed = [];

            for (let i = 0; i < data[0].length; i++) {
                if (data[0][i] > 0 && data[0][i] < 0.2) {
                    series0_20.push(data[1][i]);
                }
                else if (data[0][i] >= 0.2 && data[0][i] < 0.5) {
                    series20_50.push(data[1][i]);
                }
                else if (data[0][i] >= 0.5 && data[0][i] < 1.0) {
                    series50_100.push(data[1][i]);
                }
                else if (data[0][i] >= 1.0 && data[0][i] < 1.5) {
                    series100_150.push(data[1][i]);
                }
                else if (data[0][i] >= 1.5 && data[0][i] < 2.0) {
                    series150_200.push(data[1][i]);
                }
                else if (data[0][i] >= 2.0 && data[0][i] < 2.5) {
                    series200_250.push(data[1][i]);
                }
                else if (data[0][i] >= 2.5 && data[0][i] < 3.0) {
                    series250_300.push(data[1][i]);
                }
                else if (data[0][i] >= 3.0 && data[0][i] < 3.5) {
                    series300_350.push(data[1][i]);
                }
                else if (data[0][i] >= 3.5 && data[0][i] < 4.0) {
                    series350_400.push(data[1][i]);
                }
                else if (data[0][i] >= 4.0 && data[0][i] < 4.5) {
                    series400_450.push(data[1][i]);
                }
                else if (data[0][i] >= 4.5) {
                    series450_plus.push(data[1][i]);
                }
            }

            if (series0_20.length != 0) {
                seriesSpeed.push(
                    {
                        velName: "0-20cm/s",
                        serieName: "0_20",
                        value: arrangeWindDirection(series0_20)
                    }
                );
            }
            if (series20_50.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "20_50",
                        value: arrangeWindDirection(series20_50)
                    }
                );
            }
            if (series50_100.length != 0) {
                seriesSpeed.push(
                    {
                        velName: "50-100cm/s",
                        serieName: "50_100",
                        value: arrangeWindDirection(series50_100)
                    }
                );
            }
            if (series100_150.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "100_150",
                        value: arrangeWindDirection(series100_150)
                    }
                );
            }
            if (series150_200.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "150_200",
                        value: arrangeWindDirection(series150_200)
                    }
                );
            }
            if (series200_250.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "200_250",
                        value: arrangeWindDirection(series200_250)
                    }
                );
            }
            if (series250_300.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "250_300",
                        value: arrangeWindDirection(series250_300)
                    }
                );
            }
            if (series300_350.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "300_350",
                        value: arrangeWindDirection(series300_350)
                    }
                );
            }
            if (series350_400.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "350_400",
                        value: arrangeWindDirection(series350_400)
                    }
                );
            }
            if (series400_450.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "400_450",
                        value: arrangeWindDirection(series400_450)
                    }
                );
            }
            if (series450_plus.length != 0) {
                seriesSpeed.push(
                    {
                        serieName: "450_plus",
                        value: arrangeWindDirection(series450_plus)
                    }
                );
            }
            return seriesSpeed;
        }

        // Create chart
        // https://www.amcharts.com/docs/v5/charts/radar-chart/
        var chart = root.container.children.push(am5radar.RadarChart.new(root, {}));

        // Create axes and their renderers
        // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
        var xRenderer = am5radar.AxisRendererCircular.new(root, {
            startAngle: -112.5,
            endAngle: 247.5,
            cellStartLocation: 0.2,
            cellEndLocation: 0.8
        });
        xRenderer.labels.template.setAll({
            radius: 5
        });
        xRenderer.grid.template.setAll({
            location: 0.5
        });
        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0,
            categoryField: "category",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {})
        }));

        var yRenderer = am5radar.AxisRendererRadial.new(root, {});
        yRenderer.labels.template.setAll({
            fontSize: 10
            // minGridDistance: 1
        });
        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
            numberFormat: "#.0'%'",
            extraMax: 0.1
        }));

        // Create series
        // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
        var series = [];
        // let seriesColor = ["#ed1b2e", "#d7d7d8", "#ecb731", "#8ec06c", "#56a0d3", "#7f181b", "#6639b7", "#fff200", "#ed008c", "#ea4c89", "#003265"];
        let seriesColor = ["#8b4513", "#228b22", "#4682b4", "#4b0082", "#ff0000", "#00ff00", "#00ffff", "#0000ff", "#ffff54", "#ff69b4", "#ffe4c4"];
        let seriesField = ["0_20", "20_50", "50_100", "100_150", "150_200", "200_250", "250_300", "300_350", "350_400", "400_450", "450_plus"];

        for (let i = 0; i < seriesField.length; i++) {
            series[seriesField[i]] = chart.series.push(am5radar.RadarColumnSeries.new(root, {
                stacked: false,
                name: seriesField[i],
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                clustered: false,
                categoryXField: "category",
                fill: am5.color(seriesColor[i]),
                stroke: am5.color(seriesColor[i])
            }));
            series[seriesField[i]].set("stroke", root.interfaceColors.get("background"));
            series[seriesField[i]].columns.template.setAll({
                width: am5.p100,
                strokeOpacity: 0.1,
                tooltipText: "{name}: {valueY}%"
            });
        }
        
        var dirCar = [
            {category: "N"},
            {category: "NE"},
            {category: "E"},
            {category: "SE"},
            {category: "S"},
            {category: "SW"},
            {category: "W"},
            {category: "NW"}
        ];
        xAxis.data.setAll(dirCar);

        let legendArrayLeft = [
            { 
                serieName: "0.0 - 0.2m/s",
                color: seriesColor[0]
            },
            { 
                serieName: "0.2 - 0.5m/s",
                color: seriesColor[1]
            },
            { 
                serieName: "0.5 - 1.0m/s",
                color: seriesColor[2]
            },
            { 
                serieName: "1.0 - 1.5m/s",
                color: seriesColor[3]
            },
            { 
                serieName: "1.5 - 2.0m/s",
                color: seriesColor[4]
            },
            { 
                serieName: "2.0 - 2.5m/s",
                color: seriesColor[5]
            }
        ];
        let legendArrayRight = [
            { 
                serieName: "2.5 - 3.0m/s",
                color: seriesColor[6]
            },
            { 
                serieName: "3.0 - 3.5m/s",
                color: seriesColor[7]
            },
            { 
                serieName: "3.5 - 4.0m/s",
                color: seriesColor[8]
            },
            { 
                serieName: "4.0 - 4.5m/s",
                color: seriesColor[9]
            },
            { 
                serieName: "4.5+ m/s",
                color: seriesColor[10]
            }
        ];
        var legendLeft = chart.children.push(am5.Legend.new(root, {
            nameField: "serieName",
            fillField: "color",
            strokeField: "color",
            centerY: am5.p50,
            y: am5.p50,
            centerX:am5.percent(50),
            x: am5.percent(15),
            layout: root.verticalLayout,
        }));
        legendLeft.labels.template.setAll({
            fontSize: 10
        });
        legendLeft.markers.template.setAll({
            width: 10,
            height: 10
        });
        legendLeft.data.setAll(legendArrayLeft);

        var legendRight = chart.children.push(am5.Legend.new(root, {
            nameField: "serieName",
            fillField: "color",
            strokeField: "color",
            centerY: am5.p50,
            y: am5.p50,
            centerX:am5.percent(50),
            x: am5.percent(100),
            // position: "right",
            layout: root.verticalLayout,
        }));
        legendRight.labels.template.setAll({
            fontSize: 10
        });
        legendRight.markers.template.setAll({
            width: 10,
            height: 10
        });
        legendRight.data.setAll(legendArrayRight);

        setInterval(() => {

            let seriesWind = arrangeWindData(this.data);
            try {
                for (let i = 0; i < seriesWind.length; i++) {
                    series[seriesWind[i].serieName].data.setAll(seriesWind[i].value);
                }
            }
            catch (error) {
                console.log(error);
            }
        }, 200);
    }

    onData(msg) {
        this.card.title.text(msg._topic_name);
        // var angle = msg.data[1] * (180 / Math.PI);
        var angle = msg.data[0];
        if (angle < 0) {
            angle = angle + 360;
        }

        this.data[0][this.ptr] = Math.round(msg.data[1] * 100) / 100;
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