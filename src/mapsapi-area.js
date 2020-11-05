ymaps.ready(['util.calculateArea']).then(function () {
    var myMap = new ymaps.Map("map", {
            center: [20.5937, 78.9629],
            zoom: 75,
            controls: ['searchControl', 'zoomControl']
        }, {
            searchControlProvider: 'yandex#search'
        });

        var myPolygon = new ymaps.Polygon([], {},
     {
        editorDrawingCursor: "crosshair",
        editorMaxPoints: 5,
        fillColor: '#00FF00',
        strokeColor: '#0000FF',
        strokeWidth: 5,
        draggable: true
    });

    myPlacemark=null;    

    // Adding the polygon to the map.
    myMap.geoObjects.add(myPolygon);



    // In the mode for adding new vertices, we change the stroke color of the polygon.
    var stateMonitor = new ymaps.Monitor(myPolygon.editor.state);
    stateMonitor.add("drawing", function (newValue) {
        myPolygon.options.set("strokeColor", newValue ? '#FF0000' : '#0000FF');
        console.log(myPolygon.geometry.getCoordinates().length);
        calc();
    });

    myPolygon.events.add('drag', function () {
        calc(); 
    });

    function calc()
    {
        if(myPolygon.geometry.getCoordinates().length==1)
        {
            var area = Math.round(ymaps.util.calculateArea(myPolygon)),
            center = ymaps.util.bounds.getCenter(myPolygon.geometry.getBounds());
            document.getElementById("total").innerHTML=area;
            if (area <= 1e6) {
                area += ' м²';
            } else {
                area = (area / 1e6).toFixed(3) + ' км²';
            }
            myPolygon.properties.set('balloonContent', area);
            if(myPlacemark==null)
            {
            myPlacemark=new ymaps.Placemark(center, {'iconCaption': area}, {preset: 'islands#greenDotIconWithCaption'});    
            myMap.geoObjects.add(myPlacemark);
            }
            else
            {
            myMap.geoObjects.remove(myPlacemark);
            myPlacemark=new ymaps.Placemark(center, {'iconCaption': area}, {preset: 'islands#greenDotIconWithCaption'});    
            myMap.geoObjects.add(myPlacemark);    
            }
        }
        updateTextInput();
    }

    // Turning on the edit mode with the possibility of adding new vertices.
    myPolygon.editor.startDrawing();
    
});

 function updateTextInput() {
          var cr=document.getElementById("cr").value;
          var total=document.getElementById("total").innerHTML;
          document.getElementById("coverageRate").innerHTML=cr;
          var premium=(total*cr*723)/1000000;
          document.getElementById("premiumAmount").innerHTML=premium; 
}