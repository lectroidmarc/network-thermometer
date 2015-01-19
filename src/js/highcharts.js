/**
 *
 */

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

var makeTempGauges = function (current) {
  makeTempGuage('#temperature_g', (current.temperature !== '') ? parseFloat(current.temperature) : 0, 'Temperature', 32, 120, '°');
  makeTempGuage('#humidity_g', (current.humidity !== '') ? parseFloat(current.humidity) : 0, 'Humidity', 0, 100, '%');
};

var makeTempGuage = function (element, value, title, min, max, suffix) {
  min = min || 0;
  max = max || 200;

  $(element).highcharts({
    chart: {
      type: 'solidgauge'
    },
    credits: {
      enabled: false
    },
    pane: {
      center: ['50%', '85%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true
        }
      }
    },
    title: null,
    tooltip: {
      enabled: false
    },
    yAxis: {
      min: min,
      max: max,
      stops: [
        [0.3, '#00ccff'],  // pale blue
        [0.5, '#cccc00'],  // yellow greenish
        [0.7, '#ffcc00'],   // orangeish
        [0.9, '#ff3300']   // redish
      ],
      lineWidth: 0,
      minorTickInterval: null,
      tickPositions: [min, max],
      tickWidth: 0,
      title: {
        text: title,
        y: -70
      },
      labels: {
        y: 15
      }
    },
    series: [{
      data: [value],
      dataLabels: {
        formatter: function () {
          return '<div class="temp">' + Highcharts.numberFormat(this.y,0) + suffix + '</div>';
        }
      }
    }]
  });
};

var makeGraph = function (element, data) {
  $(element).highcharts({
    chart: {
      borderColor: '#ccc',
      borderRadius: 4,
      borderWidth: 1,
      type: 'line',
      zoomType: 'x'
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },
    title: null,
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        second: '%l:%M:%S %P',
        minute: '%l:%M %P',
        hour: '%l:%M %P'
      }
    },
    yAxis: [
      {
        min: 32,
        title: {
          text: 'Temperature (°F)'
        }
      },
      {
        min: 0,
        title: {
          text: 'Humidity (%)'
        },
        opposite: true
      }
    ],
    series: [
      {
        name: 'Temperature',
        data: getDataArray('temperature'),
        tooltip: {
          valueSuffix: '°F'
        }
      },
      {
        name: 'Humidity',
        data: getDataArray('humidity'),
        tooltip: {
          valueSuffix: '%'
        },
        color: '#ebc03f',
        yAxis: 1
      }
    ]
  });

  function getDataArray (key) {
    var returnArray = [];

    for (var x = data.length - 1; x >= 0; x--) {
      var timestamp = Date.parse(data[x].timestamp);
      var number = parseFloat(data[x][key]);

      returnArray.push([
        timestamp,
        (isNaN(number)) ? null : number
      ]);

      // Block out sections where there appears to be an outage
      if (x > 0) {
        var next_timestamp = Date.parse(data[x-1].timestamp);

        if (next_timestamp - timestamp > 17 * 60 * 1000) { // 15 minute heartbeat, with some wiggle room
          returnArray.push([
            Date.parse((timestamp + next_timestamp) / 2),
            null
          ]);
        }
      }
    }

    return returnArray;
  }
};

var updateGraph = function (element, data) {
  var chart = $(element).highcharts();

  for (var x = data.length - 1; x >= 0; x--) {
    chart.series[0].addPoint(getDataAndTimestamp('temperature', x), true, true);
    chart.series[1].addPoint(getDataAndTimestamp('humidity', x), true, true);
  }

  function getDataAndTimestamp (key, index) {
    var timestamp = Date.parse(data[index].timestamp);
    var number = parseFloat(data[index][key]);

    return [
      timestamp,
      (isNaN(number)) ? null : number
    ];
  }
};
