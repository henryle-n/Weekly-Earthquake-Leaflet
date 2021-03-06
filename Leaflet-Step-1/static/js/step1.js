// #############################################################
//                          PREP MAP
// #############################################################

// blank out map so it can be replace if needed.
var container = L.DomUtil.get('map');

if (container) {
    container._leaflet_id = null;
};

// create API link to earthquake data hosted on USGS.gov
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


var colorPane = ['#22FF0A', '#A1FF0A', '#EAFF0A', '#FFD60A', '#FF8C0A', '#FF3B0A'];

// function to return color per earthquake magnitude
var getColor = num => {
    return num > 5 ? colorPane[5] :
        num > 4 ? colorPane[4] :
            num > 3 ? colorPane[3] :
                num > 2 ? colorPane[2] :
                    num > 1 ? colorPane[1] :
                        colorPane[0];
}

// #############################################################
//                    D3 => GET MAP DATA
// #############################################################
// d3 promise to get data from USGS API
d3.json(queryUrl).then(data => {
    // get and send data.features object to createFeatures function
    createFeatures(data.features);
});

// #############################################################
//                    POP-UP FEATURES "on-click"
// #############################################################
function createFeatures(earthquakeData) {

    // Define a function to run once for each feature in the features array
    // bind a popup describing the place and time of each earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            // for state text
            "<p class='state-text'>" + feature.properties.place.split(", ")[1] + "</p>" +
            "<hr>" +

            "<dl>" +
            // for location text
            "<dt class='popUp-title'>Location:</dt>" +
            "<dd class'popUp-val'>" + feature.properties.place.split(", ")[0] + "</dd>" +
            "</dt><br>" +

            // for magnitude text
            "<dt class='popUp-title'>Magnitude:</dt>" +
            "<dd class'popUp-val'>" + feature.properties.mag + " Richter</dd>" +
            "</dt><br>" +

            // for time text
            "<dt class='popUp-title'>Time:</dt>" +
            "<dd class'popUp-val'>" + new Date(feature.properties.time) + " Richter</dd>" +
            "</dt>\
            </dl>"
        );
    }

    console.log("this is earthquake DATA :: ", earthquakeData);


    function pointToLayer(feature, coords) {
        var circleFormat = {
            radius: feature.properties.mag * 2,
            fillColor: getColor(feature.properties.mag),
            color: getColor(feature.properties.mag),
            weight: 1,
            opacity: 0.7,
            fillOpacity: 1
        };
        return L.circleMarker(coords, circleFormat);
    };



    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    // add point to layer to create customized circle markers
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer

    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

// #############################################################
//                        MAP CREATION
// #############################################################
function createMap(earthquakes) {

    var mapBoxURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
    var mapBoxAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    // #############################################################
    //                          BASE MAP
    // #############################################################
    // declare satellite, light, dark, & outdoors layers
    var baseMap = L.tileLayer(mapBoxURL, {
        attribution: mapBoxAttr,
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });


    // #############################################################
    //                          OVERLAYS
    // #############################################################


    // instantiate map onload with satellite base layer and earthquake
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [baseMap, earthquakes]
    });



    // #############################################################
    //                     OVERLAY CONTROL FEATURES
    // #############################################################
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    var overlayMaps = {
        Earthquakes: earthquakes,

    };
    L.control.layers(null, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // #############################################################
    //                LEGENDS AND COLOR SCALES
    // #############################################################
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];
            // labels = ['0-1','1-2', '2-3', '3-4', '4-5', '5+']; no need to use this as the label will be generated from grades!

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}
