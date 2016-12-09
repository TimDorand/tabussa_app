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

// Nouvel ingredient dans le cocktail
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
                console.log(mycocktail+1);


            }
        }

        if(flagingredient == true){
            mycocktail.push(ingredientId);
            console.log(mycocktail);
        }else{
            console.log('pas d ingredient trouve');
        }
        var boisson_svg="";
        /*switch(mycocktail.length){
            case 1:

                id=mycocktail[0];
                console.log("id : "+mycocktail[0]);
                boisson_svg='<path d="M0 0, L20 0, L15 25, L5 25z" fill="blue" />';
                break;
            case 2:
                boisson_svg='<path d="M0 0, L20 0, L17.5 12.5, L2.5 12.5z" fill="<blue" />';
                break;
            default:
                break;
        }*/
        var boisson_svg="";
        nb_boissons=mycocktail.length;
        if(nb_boissons>0){
            var x1=0;
            var x2=20;
            var x3=20-5/nb_boissons;
            var x4=5/nb_boissons;
            var y1=0;
            var y2=25/nb_boissons;

            for(i=0; i < nb_boissons; i++) {
                var back = ["#ff0000","blue","red", "white", "green", "black", "yellow"];
                var rand = back[Math.floor(Math.random() * back.length)];
                boisson_svg=boisson_svg+'<path d="M'+x1+' '+y1+', L'+x2+' '+y1+', L'+x3+' '+y2+', L'+x4+' '+y2+'z" fill="'+rand+'" />';
                x1=x1+5/nb_boissons;
                x2=x2-5/nb_boissons;
                x3=x3-5/nb_boissons;
                x4=x4+5/nb_boissons;
                y1=y1+25/nb_boissons;
                y2=y1+25/nb_boissons;
            }
        }

        $('.couleur').html(boisson_svg);


        Ingredients._collection.insert({
            name: ingredientName,
            color: ingredientColor
        });


        var cocktailVisits = "";
        var cocktailBonus = "";
        var cocktailMalus = "";
        var totalBonusMalus = "";
        var ratioLikes = "";

        $('#cocktailInfoRating').html("");

        myCocktailSuggestions(mycocktail);
    },
});


Template.suggestions.events({

// Ajout d'une suggestion au click sur la liste
    'click .suggestion_single': function(event) {
        event.preventDefault();

        console.log(event.currentTarget.textContent);

        var ingredientName = event.currentTarget.textContent;

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
        }

        Ingredients._collection.insert({
            name: ingredientName,
            color: ingredientColor
        });


        var cocktailVisits = "";
        var cocktailBonus = "";
        var cocktailMalus = "";
        var totalBonusMalus = "";
        var ratioLikes = "";

        $('#cocktailInfoRating').html("");

        console.log(mycocktail);
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
            //console.log(error);
        } else {
            //console.log(response);
            var arrayCocktails = JSON.parse(response.content);
            //console.log(arrayCocktails);

            var cocktailSuggestions = arrayCocktails.suggestions;

            // Si y'a des suggestions, on les push dans l'array suggestions et on les affiches
            if(cocktailSuggestions){


                Suggestions._collection.remove({});
                $.each(cocktailSuggestions, function(index, value) {
                    Suggestions._collection.insert({ name: value.name });

                });
            }



            // Calcul du ratio positif

            var cocktailVisits = arrayCocktails.visits;
            var cocktailBonus = arrayCocktails.bonus;
            var cocktailMalus = arrayCocktails.malus;
            var totalBonusMalus = parseInt(cocktailBonus)+parseInt(cocktailMalus);
            var ratioLikes = 100*parseInt(cocktailBonus)/totalBonusMalus;

            if(cocktailBonus == null){
                $('#cocktailInfoProgress').html("");
                ratioLikes = 100;
                    }

            CocktailInfo._collection.remove({});
            CocktailInfo._collection.insert({
                visits: cocktailVisits,
                bonus: cocktailBonus,
                malus: cocktailMalus,
                ratioLikes: ratioLikes
            });


            // on page load...
            moveProgressBar();
            // on browser resize...
            $(window).resize(function() {
                moveProgressBar();
            });

            // SIGNATURE PROGRESS
            function moveProgressBar() {
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
            //console.log('reponse: ');
            //console.log(suggestions);

            // console.log('reponse: ');
            // console.log(suggestions);
        }
    });
}
