import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/jquery-ui.css';
import '/imports/library/touch-punch';


NProgress.start();
// Do something, like loading...
NProgress.done();


// Drag cocktail top
/*
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
}*/


$( function() {
    // $( "#draggable3" ).draggable({ axis: "y" });
    $( "#draggable" ).draggable({ axis: "x" });

    // $( "#draggable3" ).draggable({ containment: "#containment-wrapper", scroll: false });
    $( "#draggable4" ).draggable({ containment: "parent" });

    $('#draggable3').resizable({
        maxHeight: 600,
        minHeight: 70,
    });

} );

$(document).ready(function(){
    $(".img-responsive img").load(function() {
        width_socle_verre=$(this).height();
        new_width_socle=width_socle_verre-(width_socle_verre*52/100);
        $('.couleur').width(new_width_socle);

    });
    $('.ui-resizable-handle').mousemove(function () {
        width_socle_verre=$(".img-responsive img").height();
        new_width_socle=width_socle_verre-(width_socle_verre*52/100);
        $('.couleur').width(new_width_socle);
    });
});


// Calling API for all drinks

var drinks = []; // tableau des brevages uniquement ['vodka', 'rhum']
var allDrinks = []; // tableau des brevages entiers [{'id':'81', 'name':'vodka', 'color':'blue', 'type':'alcool'}, {}, {}, ... ]



HTTP.call( 'POST', 'http://timothee-dorand.fr/tabussa/API/drinks', {

}, function( error, response ) {
    if ( error ) {
        console.log( error );
    } else {
        // console.log(response);
        arrayDrinks = JSON.parse(response.content);
        for(i=0; i < arrayDrinks.length; i++){
            drinks.push(arrayDrinks[i].name);
            if(arrayDrinks[i].color){
                drinks.push(arrayDrinks[i].color);
            }

            allDrinks.push(arrayDrinks[i]);
        }
        // console.log(drinks);
        // console.log(allDrinks);

    }
});



$( function() { // input de recherche des tags

    $( "#ingredientName" ).autocomplete({
        source: drinks
    });
} );


// Listing des ingrédients du cocktail

Ingredients = new Mongo.Collection('ingredients');

Template.ingredients.helpers({
    'ingredients': function(){
        return Ingredients.find();
    }});


var mycocktail = [];

Template.addIngredients.events({
    'submit form': function (event) {
        event.preventDefault();

        var ingredientName = $('[name="ingredientName"]').val();

        $('[name="ingredientName"]').val('');

        // A chaque submit on ajoute le nom de l'ingrédient dans un tableau
        for(i=0; i < allDrinks.length; i++) {
            if (ingredientName == allDrinks[i].name) {
                var ingredientId = allDrinks[i].id;
                var ingredientColor = allDrinks[i].color;
                var flagingredient = true;
                $('.couleur').html('<path d="M0 0, L20 0, L15 25, L5 25z" fill="'+ingredientColor+'" />');
            }
        }
        if(flagingredient == true){
            mycocktail.push(ingredientId);
        }else{
            console.log('pas d ingredient trouve');
        }
        Ingredients._collection.insert({
            name: ingredientName,
            color: ingredientColor
        });


        var ratioLikes = (100*cocktailBonus)/(cocktailBonus+cocktailMalus);

        // $('#progesslikes').progress({
        //     percent: ratioLikes
        // });

        myCocktailSuggestions(mycocktail);


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

var cocktailVisits;
var cocktailBonus;
var cocktailMalus;

CocktailInfo = new Mongo.Collection('cocktailInfo');

Template.cocktailInfo.helpers({
    'cocktailInfo': function(){
        return CocktailInfo.find();
    }});

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
            var arrayCocktails = JSON.parse(response.content);
            console.log(arrayCocktails);

            var cocktailSuggestions = arrayCocktails.suggestions;

            // Si y'a des suggestions, on les push dans l'array suggestions et on les affiches
            if(cocktailSuggestions){

                $.each(cocktailSuggestions, function(index, value) {
                    $('#cocktailInfo').val("");
                    Suggestions._collection.insert({ name: value.name });

                });
            }


            cocktailVisits = arrayCocktails.visits;
            cocktailBonus = arrayCocktails.bonus;
            cocktailMalus = arrayCocktails.malus;
            console.log('bonus:'+cocktailBonus+' '+cocktailMalus);
            console.log(cocktailBonus+cocktailMalus);
            var totalBonusMalus = parseInt(cocktailBonus)+parseInt(cocktailMalus);


            var ratioLikes = 100*parseInt(cocktailBonus)/totalBonusMalus;


            CocktailInfo._collection.insert({
                visits: cocktailVisits,
                bonus: cocktailBonus,
                malus: cocktailMalus,
                ratioLikes: ratioLikes
            });

            console.log(ratioLikes);
            // on page load...
            moveProgressBar();
            // on browser resize...
            $(window).resize(function() {
                moveProgressBar();
            });

            // SIGNATURE PROGRESS
            function moveProgressBar() {
                console.log("moveProgressBar");
                var getPercent = ($('.progress-wrap').data('progress-percent') / 100);
                var getProgressWrapWidth = $('.progress-wrap').width();
                var progressTotal = getPercent * getProgressWrapWidth;
                var animationLength = 2500;

                // on page load, animate percentage bar to data percentage length
                // .stop() used to prevent animation queueing
                $('.progress-bar').stop().animate({
                    left: progressTotal
                }, animationLength);
            }


            for (i = 0; i < arrayCocktails.length; i++) {
                suggestions.push(arrayCocktails[i].name);
            }
            console.log('reponse: ');
            console.log(suggestions);

        }
    });
}

