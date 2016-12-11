import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/jquery-ui.css';
import '/imports/library/touch-punch';


NProgress.start();
// Do something, like loading...
NProgress.done();


$( function() {
    // $( "#draggable3" ).draggable({ axis: "y" });
    $( "#draggable" ).draggable({ axis: "x" });

    // $( "#draggable3" ).draggable({ containment: "#containment-wrapper", scroll: false });
    $( "#draggable4" ).draggable({ containment: "parent" });

    $('#draggable3').resizable({
        maxHeight: 1200,
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
            }else{
                arrayDrinks[i].color="#f0937f";
            }

            allDrinks.push(arrayDrinks[i]);
        }
        // console.log(drinks);
        // console.log(allDrinks);

    }
});


//auto complete
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
var mycocktaildetail = [];
var ingredient = {};

// Nouvel ingredient dans le cocktail
Template.addIngredients.events({
    'submit form': function (event) {
        event.preventDefault();

        var ingredientName = $('[name="ingredientName"]').val();


        //get input
        $('[name="ingredientName"]').val('');


        addIngredientToCocktail(ingredientName);


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

        //console.log(event.currentTarget.textContent);

        var ingredientName = event.currentTarget.textContent;

        // A chaque submit on ajoute le nom de l'ingrédient dans un tableau
        for(i=0; i < allDrinks.length; i++) {
            if (ingredientName == allDrinks[i].name) {

                var ingredientId = allDrinks[i].id;
                ingredient.id = allDrinks[i].id;
                ingredient.color = allDrinks[i].color;
                var flagingredient = true;
            }
        }
        if(flagingredient == true){
            mycocktail.push(ingredientId);
            mycocktaildetail.push(ingredient);
        }

        Ingredients._collection.insert({
            name: ingredientName,
            color: ingredient.color
        });


        var cocktailVisits = "";
        var cocktailBonus = "";
        var cocktailMalus = "";
        var totalBonusMalus = "";
        var ratioLikes = "";

        $('#cocktailInfoRating').html("");

        myCocktailSuggestions(mycocktail);


    }
});


// Listing des suggestions

Suggestions = new Mongo.Collection('suggestions');

Template.suggestions.helpers({
    'suggestions': function(){
        return Suggestions.find();
    }});



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
            new_boisson_cocktail();
        }
    });
}
function new_boisson_cocktail(){
    var boisson_svg="";
    nb_boissons=mycocktaildetail.length;
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

            boisson_svg=boisson_svg+'<path d="M'+x1+' '+y1+', L'+x2+' '+y1+', L'+x3+' '+y2+', L'+x4+' '+y2+'z" fill="'+mycocktaildetail[i].color+'" />';
            x1=x1+5/nb_boissons;
            x2=x2-5/nb_boissons;
            x3=x3-5/nb_boissons;
            x4=x4+5/nb_boissons;
            y1=y1+25/nb_boissons;
            y2=y1+25/nb_boissons;
        }
    }

    $('.couleur').html(boisson_svg);
}
function addIngredientToCocktail(ingredientName){
    var flagingredient = false;
    for(i=0; i < allDrinks.length; i++) {
        if (ingredientName == allDrinks[i].name) {
            var ingredientId = allDrinks[i].id;
            ingredient.id = allDrinks[i].id;
            ingredient.color = allDrinks[i].color;
            flagingredient = true;
        }
    }

    if(flagingredient == true){
        console.log(ingredient);
        mycocktail.push(ingredientId);
        mycocktaildetail.push(ingredient);
    }else{
        console.log('pas d ingredient trouve');
    }
    console.log(mycocktaildetail);
    var boisson_svg="";
    //new_boisson_cocktail();



    Ingredients._collection.insert({
        name: ingredientName,
        color: ingredient.color
    });
}
