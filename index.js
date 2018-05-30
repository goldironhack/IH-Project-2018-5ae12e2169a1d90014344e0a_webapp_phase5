const NEIGHBORHOOD_NAMES = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const DISTRICTS_SHAPES = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";
const SAFETY_DATA = "https://data.cityofnewyork.us/api/views/h8ws-giaa/rows.json?accessType=DOWNLOAD";
const AFFORDABILITY_DATA = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";

var map;
var school = {lat: 40.7291, lng: -73.9965};
var infoWindow;
var states = ["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"];
var statesVR = ["MN", "BX", "BK", "QN", "SI"];
var arrayBoroughs = [];
var arrayNeighborhood = [];
var arraySafety = [];
var arrayAffordability = [];
var topDistances = [];

function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: school
    });
  centerMarker = new google.maps.Marker({
    position: school,
    map: map
  });
  infoWindow = new google.maps.InfoWindow;

  //Poligonos de distritos
    map.data.loadGeoJson(DISTRICTS_SHAPES);

    map.data.setStyle({
      fillColor: 'gray',
      strokeWeight: 2,
      fillOpacity: 3
    });

    map.data.addListener('mouseover', function(event) {
      map.data.overrideStyle(event.feature, {strokeWeight: 5});
    });

    map.data.addListener('mouseout', function(event) {
      map.data.overrideStyle(event.feature, {strokeWeight: 2});
    });

    map.data.addListener('click', showArrays);
}


function showArrays(event) {
  var vertices = event.feature.getGeometry();
  var boro = event.feature.f.BoroCD;
  var digits = boro.toString().split('');
  var contentString;
  var distanceToSchool;

if (arrayBoroughs.length == 0) {
  distanceToSchool = "press Distance for calculate";
}else {
  for (var i = 0; i < arrayBoroughs.length; i++) {
    if (arrayBoroughs[i].boro == boro) {
      distanceToSchool = arrayBoroughs[i].distance;
    }
  }
}

  switch(digits[0]) {
    case "1":
     contentString = '<b> Borough: ' + states[0] + " " + digits[1] + digits[2] + '</b><br>'
     + '<b> Distance to School(km):  </b>' + distanceToSchool + '<br>' + '<b> Neighborhoods: </b><br>';
        break;
    case "2":
     contentString = '<b> Borough: ' + states[1] + " " + digits[1] + digits[2] + '</b><br>'
     + '<b> Distance to School(km):  </b>' + distanceToSchool + '<br>' + '<b> Neighborhoods: </b><br>';
        break;
    case "3":
     contentString = '<b> Borough: ' + states[2] + " " + digits[1] + digits[2] + '</b><br>'
     + '<b> Distance to School(km):  </b>' + distanceToSchool + '<br>' + '<b> Neighborhoods: </b><br>';
        break;
    case "4":
     contentString = '<b> Borough: ' + states[3] + " " + digits[1] + digits[2] + '</b><br>'
      + '<b> Distance to School(km):  </b>' + distanceToSchool + '<br>' + '<b> Neighborhoods: </b><br>';
        break;
    case "5":
     contentString = '<b> Borough: ' + states[4] + " " + digits[1] + digits[2] + '</b><br>' /*+
        'Clicked location: <br>' + event.latLng.lat() + ',' + event.latLng.lng() +
        '<br>'*/ + '<b> Distance to School(km):  </b>' + distanceToSchool + '<br>' + '<b> Neighborhoods: </b><br>';
        break;
  }

  var dataNeighborhood = $.get(NEIGHBORHOOD_NAMES, function(){
    console.log(vertices.getType());
    if (vertices.getType() == 'Polygon') {
      var poly = new google.maps.Polygon({
          paths: vertices.getAt(0).getArray(),
          map: map,
          clickable: false,
          strokeWeight: 2,
          fillOpacity: 3
        });
      for (var j = 0; j < dataNeighborhood.responseJSON.data.length; j++) {
        //lat long a partir de expresion regular
        var dataRow = dataNeighborhood.responseJSON.data[j][9];
        dataRow = dataRow.split(/[POINT (,)]+/);
        dataRow = dataRow.slice(1,dataRow.length-1);
        var latlng = new google.maps.LatLng(parseFloat(dataRow[1]),parseFloat(dataRow[0]));
        var inVertices =
                  google.maps.geometry.poly.containsLocation(latlng, poly) ?
                  dataNeighborhood.responseJSON.data[j][10] + '<br>' : '';
        contentString += inVertices;
      }
    }else {
      for (var i = 0; i < vertices.getLength(); i++) {
        var poly = new google.maps.Polygon({
            paths: vertices.getAt(i).getAt(0).getArray(),
            map: map,
            clickable: false,
            strokeWeight: 2,
            fillOpacity: 3
          });
        for (var j = 0; j < dataNeighborhood.responseJSON.data.length; j++) {
          //lat long a partir de expresion regular
          var dataRow = dataNeighborhood.responseJSON.data[j][9];
          dataRow = dataRow.split(/[POINT (,)]+/);
          dataRow = dataRow.slice(1,dataRow.length-1);
          var latlng = new google.maps.LatLng(parseFloat(dataRow[1]),parseFloat(dataRow[0]));
          var inVertices =
                    google.maps.geometry.poly.containsLocation(latlng, poly) ?
                    dataNeighborhood.responseJSON.data[j][10] + '<br>' : '';
          contentString += inVertices;
        }
      }
    }
  })
    .done(function(){
      infoWindow.setContent(contentString);
    })
      .fail(function(error){
          console.error(error);
    });

  infoWindow.setContent(contentString);
  infoWindow.setPosition(event.latLng);

  infoWindow.open(map);
}

function setMapDistance() {
  var gauge = loadLiquidFillGauge("fillgauge1", 0);
  var regExp = RegExp('^[1-5][2-9]');
  tableReference = $("#mainTableBody")[0];
  tableReference.innerHTML = "";
  var newRow, cDistance, cBorough;
  newRow = tableReference.insertRow(tableReference.rows.length);
  cBorough = newRow.insertCell();
  cDistance = newRow.insertCell();
  cBorough.innerHTML = "<th onclick = 'sortTable(0)'>  <b> Borough </b></th>";
  cDistance.innerHTML = "<th onclick= sortTable(0)> <b> Mean Distance to School </b> </th>";

  map.data.forEach(function(feature) {
      var boro = feature.getProperty('BoroCD');
      var digits = boro.toString().split('');
      if (!regExp.test(boro)) {
        let centers = [];
        feature.getGeometry().forEachLatLng(function(path) {

          let distance = Distance(path.lat(), path.lng(), 40.7291, -73.9965);

          centers.push(distance);
        });
        centers.sort((a, b) => a - b);
        let media = (parseFloat(centers[(centers.length - 1) >> 1]) + parseFloat(centers[centers.length >> 1])) / 2;
        //arrayBoroughs[boro] = media.toFixed(3);
        arrayBoroughs.push({"boro": boro, "distance":media.toFixed(3), "feature": feature});
        gauge.update((arrayBoroughs.length*100)/59);
      }
  });
    var color;
    //var distanceKeys = Object.keys(arrayBoroughs);
    arrayBoroughs.sort(function (a, b) {return a.distance - b.distance;});

    for (var i = 0; i < 10; i++) {
      var digits = arrayBoroughs[i].boro.toString().split('');
      newRow = tableReference.insertRow(tableReference.rows.length);
      cBorough = newRow.insertCell();
      cDistance = newRow.insertCell();
      cBorough.innerHTML = states[digits[0] - 1] + " " + digits[1] + digits[2];
      cDistance.innerHTML = arrayBoroughs[i].distance + " Km";
          map.data.overrideStyle(arrayBoroughs[i].feature, {
              fillColor: 'red',
              strokeWeight: 2,
              fillOpacity: 5
            });
    }

    for (var i = 10; i < 35; i++) {
      map.data.overrideStyle(arrayBoroughs[i].feature, {
          fillColor: 'yellow',
          strokeWeight: 2,
          fillOpacity: 5
        });
    }

    for (var i = 35; i < arrayBoroughs.length; i++) {
      map.data.overrideStyle(arrayBoroughs[i].feature, {
          fillColor: 'green',
          strokeWeight: 2,
          fillOpacity: 5
        });
    }
    console.log(arrayBoroughs);
}

function Distance(lat1,lng1,lat2,lng2) {
rad = function(x) {return x*Math.PI/180;}
var R = 6378.137;
var dLat = rad( lat2 - lat1 );
var dLong = rad( lng2 - lng1 );
var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
var d = R * c;
return d.toFixed(3);
}

function setMapSafety() {
  var gauge = loadLiquidFillGauge("fillgauge1", 0);
  var regExp = RegExp('^[1-5][2-9]');
  tableReference = $("#mainTableBody")[0];
  tableReference.innerHTML = "";
  var newRow, cInsidents, cBorough;
  newRow = tableReference.insertRow(tableReference.rows.length);
  cBorough = newRow.insertCell();
  cInsidents = newRow.insertCell();
  cBorough.innerHTML = "<b> Borough </b>";
  cInsidents.innerHTML = "<b> Total Crimes </b>";

    var dataSafety = $.get(SAFETY_DATA, function(){
      var dataSimple = dataSafety.responseJSON.data;
      map.data.forEach(function(feature) {
        var count = 0;
        var vertices = feature.getGeometry();
        var boro = feature.getProperty('BoroCD');
        var digits = boro.toString().split('');
        var regExp = RegExp('^[1-5][2-9]');
        if (!regExp.test(boro)) {
          if (vertices.getType() == 'Polygon') {
            var poly = new google.maps.Polygon({
                paths: vertices.getAt(0).getArray(),
                map: map,
                clickable: false
              });
            for (var j = 0; j < dataSimple.length; j++) {
              var latlng = new google.maps.LatLng(parseFloat(dataSimple[j][29]),parseFloat(dataSimple[j][30]));
              google.maps.geometry.poly.containsLocation(latlng, poly) ? count++ : '';
            }
              }else {
                for (var i = 0; i < vertices.getLength(); i++) {
                  var poly = new google.maps.Polygon({
                      paths: vertices.getAt(i).getAt(0).getArray(),
                      map: map,
                      clickable: false
                    });
                    for (var j = 0; j < dataSimple.length; j++) {
                      var latlng = new google.maps.LatLng(parseFloat(dataSimple[j][29]),parseFloat(dataSimple[j][30]));
                      google.maps.geometry.poly.containsLocation(latlng, poly) ? count++ : '';
                    }
                }
              }
              arraySafety.push({"boro": boro, "crimes":count, "feature": feature});
              gauge.update((arraySafety.length*100)/59);
        }
      });
    })
      .done(function(){
        var color;
        arraySafety.sort(function (a, b) {return a.crimes - b.crimes;});

            for (var i = 0; i < 10; i++) {
              var digits = arraySafety[i].boro.toString().split('');
              newRow = tableReference.insertRow(tableReference.rows.length);
              cBorough = newRow.insertCell();
              cInsidents = newRow.insertCell();
              cBorough.innerHTML = states[digits[0] - 1] + " " + digits[1] + digits[2];
              cInsidents.innerHTML = arraySafety[i].crimes;
                  map.data.overrideStyle(arraySafety[i].feature, {
                      fillColor: 'red',
                      strokeWeight: 2,
                      fillOpacity: 5
                    });
            }

            for (var i = 10; i < 35; i++) {
              map.data.overrideStyle(arraySafety[i].feature, {
                  fillColor: 'yellow',
                  strokeWeight: 2,
                  fillOpacity: 5
                });
            }

            for (var i = 35; i < arraySafety.length; i++) {
              map.data.overrideStyle(arraySafety[i].feature, {
                  fillColor: 'green',
                  strokeWeight: 2,
                  fillOpacity: 5
                });
            }
        console.log(arraySafety);
      })
        .fail(function(error){
            console.error(error);
      });
}

function setMapAffordability() {
  var gauge = loadLiquidFillGauge("fillgauge1", 0);
  var dataAffordability = $.get(AFFORDABILITY_DATA, function(){
    var dataSimple = [];
    var regExp = RegExp('^[1-5][2-9]');
    tableReference = $("#mainTableBody")[0];
    tableReference.innerHTML = "";
    var newRow, cBorough, cQuantity;
    newRow = tableReference.insertRow(tableReference.rows.length);
    cBorough = newRow.insertCell();
    cQuantity = newRow.insertCell();
    cBorough.innerHTML = "<b> Borough </b>";
    cQuantity.innerHTML = "<b> Places Available </b>";
    //Filtrando por Extremely Low Income Units
    for (var i = 0; i < dataAffordability.responseJSON.data.length; i++) {
      if (dataAffordability.responseJSON.data[i][31] > 0) {
        dataSimple.push(dataAffordability.responseJSON.data[i]);
      }
    }
    map.data.forEach(function(feature) {
      var count = 0;
      var boro = feature.getProperty('BoroCD');
      var digits = boro.toString().split('');
      if (!regExp.test(boro)) {
        for (var j = 0; j < dataSimple.length; j++) {
          var rows = dataSimple[j][19].split("-");
          var aux = (statesVR.indexOf(rows[0])+1) + rows[1];
          if (aux == boro) {
          count += parseInt(dataSimple[j][31]);
            }
          }
          arrayAffordability.push({"boro": boro, "places":count, "feature":feature});
          gauge.update((arrayAffordability.length*100)/59);
      }
    });
  })
    .done(function(){
      var color;
      arrayAffordability.sort(function (a, b) {return b.places - a.places;});

          for (var i = 0; i < 10; i++) {
            var digits = arrayAffordability[i].boro.toString().split('');
            newRow = tableReference.insertRow(tableReference.rows.length);
            cBorough = newRow.insertCell();
            cQuantity = newRow.insertCell();
            cBorough.innerHTML = states[digits[0] - 1] + " " + digits[1] + digits[2];
            cQuantity.innerHTML = arrayAffordability[i].places;
                map.data.overrideStyle(arrayAffordability[i].feature, {
                    fillColor: 'red',
                    strokeWeight: 2,
                    fillOpacity: 5
                  });
          }

          for (var i = 10; i < 35; i++) {
            map.data.overrideStyle(arrayAffordability[i].feature, {
                fillColor: 'yellow',
                strokeWeight: 2,
                fillOpacity: 5
              });
          }

          for (var i = 35; i < arrayAffordability.length; i++) {
            map.data.overrideStyle(arrayAffordability[i].feature, {
                fillColor: 'green',
                strokeWeight: 2,
                fillOpacity: 5
              });
          }

      console.log(arrayAffordability);
    })
      .fail(function(error){
          console.error(error);
      })
}

//---------------------------------------D3.js------------------------------------------------


function liquidFillGaugeDefaultSettings(){
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 1000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    };
}

function loadLiquidFillGauge(elementId, value, config) {
    if(config == null) config = liquidFillGaugeDefaultSettings();

    var gauge = d3.select("#" + elementId);
    var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height")))/2;
    var locationX = parseInt(gauge.style("width"))/2 - radius;
    var locationY = parseInt(gauge.style("height"))/2 - radius;
    var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

    var waveHeightScale;
    if(config.waveHeightScaling){
        waveHeightScale = d3.scale.linear()
            .range([0,config.waveHeight,0])
            .domain([0,50,100]);
    } else {
        waveHeightScale = d3.scale.linear()
            .range([config.waveHeight,config.waveHeight])
            .domain([0,100]);
    }

    var textPixels = (config.textSize*radius/2);
    var textFinalValue = parseFloat(value).toFixed(2);
    var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
    var percentText = config.displayPercent?"%":"";
    var circleThickness = config.circleThickness * radius;
    var circleFillGap = config.circleFillGap * radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = radius - fillCircleMargin;
    var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

    var waveLength = fillCircleRadius*2/config.waveCount;
    var waveClipCount = 1+config.waveCount;
    var waveClipWidth = waveLength*waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    var textRounder = function(value){ return Math.round(value); };
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(1); };
    }
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(2); };
    }

    // Data for building the clip wave area.
    var data = [];
    for(var i = 0; i <= 40*waveClipCount; i++){
        data.push({x: i/(40*waveClipCount), y: (i/(40))});
    }

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
    var gaugeCircleY = d3.scale.linear().range([0,radius]).domain([0,radius]);

    // Scales for controlling the size of the clipping path.
    var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
    var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);

    // Scales for controlling the position of the clipping path.
    var waveRiseScale = d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
        .domain([0,1]);
    var waveAnimateScale = d3.scale.linear()
        .range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
        .domain([0,1]);

    // Scale for controlling the position of the text within the gauge.
    var textRiseScaleY = d3.scale.linear()
        .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
        .domain([0,1]);

    // Center the gauge within the parent SVG.
    var gaugeGroup = gauge.append("g")
        .attr('transform','translate('+locationX+','+locationY+')');

    // Draw the outer circle.
    var gaugeCircleArc = d3.svg.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(radius))
        .innerRadius(gaugeCircleY(radius-circleThickness));
    gaugeGroup.append("path")
        .attr("d", gaugeCircleArc)
        .style("fill", config.circleColor)
        .attr('transform','translate('+radius+','+radius+')');

    // Text where the wave does not overlap.
    var text1 = gaugeGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    // The clipping wave area.
    var clipArea = d3.svg.area()
        .x(function(d) { return waveScaleX(d.x); } )
        .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
        .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
    var waveGroup = gaugeGroup.append("defs")
        .append("clipPath")
        .attr("id", "clipWave" + elementId);
    var wave = waveGroup.append("path")
        .datum(data)
        .attr("d", clipArea)
        .attr("T", 0);

    // The inner circle with the clipping wave attached.
    var fillCircleGroup = gaugeGroup.append("g")
        .attr("clip-path", "url(#clipWave" + elementId + ")");
    fillCircleGroup.append("circle")
        .attr("cx", radius)
        .attr("cy", radius)
        .attr("r", fillCircleRadius)
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    var text2 = fillCircleGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    // Make the value count up.
    if(config.valueCountUp){
        var textTween = function(){
            var i = d3.interpolate(this.textContent, textFinalValue);
            return function(t) { this.textContent = textRounder(i(t)) + percentText; }
        };
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
    if(config.waveRise){
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
            .each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
    }

    if(config.waveAnimate) animateWave();

    function animateWave() {
        wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
        wave.transition()
            .duration(config.waveAnimateTime * (1-wave.attr('T')))
            .ease('linear')
            .attr('transform','translate('+waveAnimateScale(1)+',0)')
            .attr('T', 1)
            .each('end', function(){
                wave.attr('T', 0);
                animateWave(config.waveAnimateTime);
            });
    }

    function GaugeUpdater(){
        this.update = function(value){
            var newFinalValue = parseFloat(value).toFixed(2);
            var textRounderUpdater = function(value){ return Math.round(value); };
            if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                textRounderUpdater = function(value){ return parseFloat(value).toFixed(1); };
            }
            if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
                textRounderUpdater = function(value){ return parseFloat(value).toFixed(2); };
            }

            var textTween = function(){
                var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                return function(t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
            };

            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);

            var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;
            var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);
            var waveRiseScale = d3.scale.linear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
                .domain([0,1]);
            var newHeight = waveRiseScale(fillPercent);
            var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
            var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);
            var newClipArea;
            if(config.waveHeightScaling){
                newClipArea = d3.svg.area()
                    .x(function(d) { return waveScaleX(d.x); } )
                    .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
                    .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
            } else {
                newClipArea = clipArea;
            }

            var newWavePosition = config.waveAnimate?waveAnimateScale(1):0;
            wave.transition()
                .duration(0)
                .transition()
                .duration(config.waveAnimate?(config.waveAnimateTime * (1-wave.attr('T'))):(config.waveRiseTime))
                .ease('linear')
                .attr('d', newClipArea)
                .attr('transform','translate('+newWavePosition+',0)')
                .attr('T','1')
                .each("end", function(){
                    if(config.waveAnimate){
                        wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
                        animateWave(config.waveAnimateTime);
                    }
                });
            waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+waveGroupXPosition+','+newHeight+')')
        }
    }

    return new GaugeUpdater();
}

$(document).ready(function(){
  $("#getDistance").on("click",setMapDistance);
  $("#getSafety").on("click",setMapSafety);
  $("#getAffordability").on("click",setMapAffordability);
})
