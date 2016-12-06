import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/jquery-ui.css';
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

var drinks = []; // tableau des brevages uniquement ['vodka', 'rhum']
var allDrinks = []; // tableau des brevages entiers [{'id':'81', 'name':'vodka', 'color':'blue', 'type':'alcool'}, {}, {}, ... ]



HTTP.call( 'POST', 'http://timothee-dorand.fr/tabussa/API/drinks', {

}, function( error, response ) {
    if ( error ) {
        console.log( error );
    } else {
        console.log(response);
        arrayDrinks = JSON.parse(response.content);
        for(i=0; i < arrayDrinks.length; i++){
            drinks.push(arrayDrinks[i].name);
            allDrinks.push(arrayDrinks[i]);
        }
        console.log(drinks);
        console.log(allDrinks);

    }
});



$( function() { // input de recherche des tags

    $( "#ingredientName" ).autocomplete({
        source: drinks
    });
} );


// Listing des ingrédients du cocktail

Ingredients = new Mongo.Collection('ingredients');

// Ingredients._collection.insert({ name: "Vokda" });
// Ingredients._collection.insert({ name: "Pastis" });

Template.ingredients.helpers({
    'ingredients': function(){
        return Ingredients.find();
    }});

var mycocktail = [];

Template.addIngredients.events({
    'submit form': function (event) {
        event.preventDefault();
        var ingredientName = $('[name="ingredientName"]').val();

        // A chaque submit on ajoute le nom de l'ingrédient dans un tableau
        for(i=0; i < allDrinks.length; i++) {
            if (ingredientName == allDrinks[i].name) {
                var ingredientId = allDrinks[i].id;
                var flagingredient = true;
            }
        }
        if(flagingredient == true){
            mycocktail.push(ingredientId);
        }else{
            console.log('pas d ingredient trouve');
        }
        Ingredients._collection.insert({
            name: ingredientName
        });
        myCocktailSuggestions(mycocktail)

    }
});



// Listing des suggestions

Suggestions = new Mongo.Collection('suggestions');



Template.suggestions.helpers({
    'suggestions': function(){
        return Suggestions.find();
    }});

// Récupérer les infos du dernier cocktail envoyé et les suggestions

/* Methode
1) Post array drinks [
    0 => "id_cocktail_1",
    1 => 'id_cocktail_2'
]

2) Récupérer les infos de "Mon cocktail"
3) Récupérer toutes suggestions et les infos de chacune

*/

function myCocktailSuggestions(mycocktail) {

    var suggestions= [];

    HTTP.call('POST', 'http://timothee-dorand.fr/tabussa/API/cocktail', {
        data: {
            "drinks": mycocktail
        }
    }, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log(response);
            arrayCocktails = JSON.parse(response.content);
            for (i = 0; i < arrayCocktails.length; i++) {
                suggestions.push(arrayCocktails[i].name);
            }
            console.log('reponse: ');
            console.log(suggestions);

        }
    });
}

