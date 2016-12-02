import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/touch-punch';

// Drag cocktail top

function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}
init();

$( function() {
    // $( "#draggable3" ).draggable({ axis: "y" });
    $( "#draggable" ).draggable({ axis: "x" });

    // $( "#draggable3" ).draggable({ containment: "#containment-wrapper", scroll: false });
    $( "#draggable4" ).draggable({ containment: "parent" });

    $('#draggable3').resizable({
        maxHeight: 900,
        minHeight: 100,
    });

} );


// Calling API for all drinks

var drinks = [];

HTTP.call( 'POST', 'http://localhost:8888/tabussa/API/drinks', {

}, function( error, response ) {
    if ( error ) {
        console.log( error );
    } else {
        console.log(response);
        arrayDrinks = JSON.parse(response.content);
        for(i=0; i < arrayDrinks.length; i++){
            drinks.push(arrayDrinks[i].name);
        }
        console.log(drinks);

    }
});



$( function() { // input de recherche des tags

    $( "#tags" ).autocomplete({
        source: drinks
    });
} );