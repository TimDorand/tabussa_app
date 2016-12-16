import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/jquery-ui.css';
import '/imports/library/touch-punch';

/*  INIT VARIABLE  */

// infos cocktail en cours
var id_cocktail;
var cocktailVisits;
var cocktailBonus;
var cocktailMalus;
var totalBonusMalus;
var ratioLikes;
var ingredient={};

// init de toutes les boissons de l'appli
var drinks = []; // tableau des brevages uniquement ['vodka', 'rhum']
var allDrinks = []; // tableau des brevages entiers [{'id':'81', 'name':'vodka', 'color':'blue', 'type':'alcool'}, {}, {}, ... ]


//boissons du cocktail en cours
var mycocktail = []; //id seulement pour suggestions
var mycocktaildetail = []; //infos des boissons du cocktail


 /*-------------------------------------------------------------------*/
// CONTENU - TABLE DES MATIERES
/*-------------------------------------------------------------------*/

/*
* 1. Récupération des ingrédients
* 2. Listing des ingrédients
* 3. Ajout d'un nouvel ingrédient dans le cocktail
* 4. Récupération des suggestions et ajout au click sur la liste
* 5. Réinitialisation du cocktail
* 6. Envoi d'un like
* 7. Envoi d'un dislike
* 8. Récupération des infos du dernier cocktail envoyé et les suggestions
* 9. Génération du visuel du cocktial
* 10. Initialisation du message utilisateur
*  */



NProgress.start();
// Do something, like loading...
NProgress.done();

/*-------------------------------------------------------------------*/
// Touch handler
/*-------------------------------------------------------------------*/


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


/*-------------------------------------------------------------------*/
// 1. Récupération de tous les ingrédients
/*-------------------------------------------------------------------*/





HTTP.call( 'POST', 'http://theo-hinfray.fr/IIM/tabussa/api/drinks', {

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
    }
});




//auto complete
$( function() { // input de recherche des tags

    $( "#ingredientName" ).autocomplete({
        source: drinks
    });
} );



/*-------------------------------------------------------------------*/
// 2. Listing des ingrédients du cocktail
/*-------------------------------------------------------------------*/


Ingredients = new Mongo.Collection('ingredients');

Template.ingredients.helpers({
    'ingredients': function(){
        return Ingredients.find();
    }});




/*-------------------------------------------------------------------*/
// 3. Ajout d'un nouvel ingredient dans le cocktail
/*-------------------------------------------------------------------*/


Template.addIngredients.events({
    'submit form': function (event) {
        event.preventDefault();

        var ingredientName = $('[name="ingredientName"]').val();
        //get input
        $('[name="ingredientName"]').val('');
        addIngredientToCocktail(ingredientName);
        }


});

/*-------------------------------------------------------------------*/
// 4. Récupération des suggestions et ajout au click sur la liste
/*-------------------------------------------------------------------*/


Template.suggestions.events({

    'click .suggestion_single': function(event) {
        event.preventDefault();

        //console.log(event.currentTarget.textContent);

        var ingredientName = event.currentTarget.textContent;

        addIngredientToCocktail(ingredientName);

    }
});


/*-------------------------------------------------------------------*/
// Listing des suggestions
/*-------------------------------------------------------------------*/

Suggestions = new Mongo.Collection('suggestions');

Template.suggestions.helpers({
    'suggestions': function(){
        return Suggestions.find();
    }});



/*------------------------------------------------------------*/
// 5. Reinitialisation de tout
/*-------------------------------------------------------------------*/

Template.ingredients.events({
    'click #clearAll': function(event){
        event.preventDefault();
        $('.couleur').html("");

        Ingredients._collection.remove({});
        Suggestions._collection.remove({});
        CocktailInfo._collection.remove({});
        MessageUser._collection.remove({});
        MessageUser._collection.insert({ message: "Oouai ! Cul sec !" });

        mycocktail = [];
        mycocktaildetail = [];


    }
});

/*------------------------------------------------------------*/
// 6. Envoi d'un like et d'un dislike
/*-------------------------------------------------------------------*/


Template.cocktail.events({
    'click .like2': function(event){
        event.preventDefault();
        console.log(id_cocktail);

        HTTP.call( 'POST', 'http://theo-hinfray.fr/IIM/tabussa/api/bonus', {
            data: {
                "id": id_cocktail
            }

        }, function( error, response ) {
            if ( error ) {
                console.log( error );
            } else {
                var get_obj=JSON.parse(response.content);
                cocktailMalus=get_obj.malus;
                cocktailBonus=get_obj.bonus;
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "C'est vrai que c'est bon... +1 !" });
                //on refait le ratio like
                totalBonusMalus = parseInt(cocktailBonus)+parseInt(cocktailMalus);
                ratioLikes = 100*parseInt(cocktailBonus)/totalBonusMalus;
                CocktailInfo._collection.remove({});
                CocktailInfo._collection.insert({
                    id:id_cocktail,
                    visits: cocktailVisits,
                    bonus: cocktailBonus,
                    malus: cocktailMalus,
                    ratioLikes: ratioLikes
                });
                moveProgressBar();


            }
        });
    }


});

Template.cocktail.events({
    'click .like1': function(event){
        event.preventDefault();
        console.log(id_cocktail);

        HTTP.call( 'POST', 'http://theo-hinfray.fr/IIM/tabussa/api/malus', {
            data: {
                "id": id_cocktail
            }

        }, function( error, response ) {
            if ( error ) {
                console.log( error );
            } else {

                var get_obj=JSON.parse(response.content);
                cocktailMalus=get_obj.malus;
                cocktailBonus=get_obj.bonus;
                console.log(response);
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Beurk... -1 !" });

                //on refait le ratio like
                totalBonusMalus = parseInt(cocktailBonus)+parseInt(cocktailMalus);
                ratioLikes = 100*parseInt(cocktailBonus)/totalBonusMalus;
                CocktailInfo._collection.remove({});
                CocktailInfo._collection.insert({
                    id:id_cocktail,
                    visits: cocktailVisits,
                    bonus: cocktailBonus,
                    malus: cocktailMalus,
                    ratioLikes: ratioLikes
                });
                moveProgressBar();

            }
        });
    }

});

/*-------------------------------------------------------------------*/
// 8. Récupération des infos du dernier cocktail envoyé et les suggestions
/*-------------------------------------------------------------------*/

/* Methode
1) Post array drinks [0 => "id_cocktail_1",1 => 'id_cocktail_2']
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

    HTTP.call('POST', 'http://theo-hinfray.fr/IIM/tabussa/api/cocktail', {
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
            id_cocktail = arrayCocktails.id;
            cocktailVisits = arrayCocktails.visits;
            cocktailBonus = arrayCocktails.bonus;
            cocktailMalus = arrayCocktails.malus;
            totalBonusMalus = parseInt(cocktailBonus)+parseInt(cocktailMalus);
            ratioLikes = 100*parseInt(cocktailBonus)/totalBonusMalus;

            if(cocktailBonus = null){
                ratioLikes = 100;
            }

            CocktailInfo._collection.remove({});
            CocktailInfo._collection.insert({
                id:id_cocktail,
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


            // Message User

            if(cocktailVisits > 300){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Ah d'accord, pas très original..." });
            }else if(ratioLikes < 50){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Pas très bon ça !" });

            }else if(ratioLikes > 50 && ratioLikes < 90){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Ça c'est pas mal !" });

            }else if(ratioLikes > 90){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Oh, mon préféré !" });
            }else if(ratioLikes = "NaN" && cocktailVisits == 1){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Ça alors ! T'es le premier à avoir trouvé ça !" });
            }else if(ratioLikes = "NaN" && cocktailVisits > 0){
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Met le premier like sur celui-la !" });
            }else{
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "Bon, tu met quelque chose dans ton verre ?" });
            }
            for (i = 0; i < arrayCocktails.length; i++) {
                suggestions.push(arrayCocktails[i].name);
            }
        }
    });
}


/*-------------------------------------------------------------------*/
// 9. Génération du cocktail visuel
/*-------------------------------------------------------------------*/

function new_boisson_cocktail(){
    var boisson_svg="";
    nb_boissons=mycocktaildetail.length;
    if(nb_boissons>0){

        var x1;
        var x2;
        var x3=15;
        var x4=5;
        var y1;
        var y2=25;
        for(i=0; i < nb_boissons; i++) {

            if(mycocktaildetail[i].taille==0) {
                x1=x4;
                x2=x3;
                x3=x3+5/nb_boissons*0.6;
                x4=x4-5/nb_boissons*0.6;
                y1=y2;
                y2=y2-25/nb_boissons*0.6;
            }else if(mycocktaildetail[i-1] && mycocktaildetail[i].taille!=0 ){
                x1=x4;
                x2=x3;
                x3=x3+5/nb_boissons*1.4;
                x4=x4-5/nb_boissons*1.4;
                y1=y2;
                y2=y2-25/nb_boissons*1.4;
            }else{
                x1=x4;
                x2=x3;
                x3=x3+5/nb_boissons;
                x4=x4-5/nb_boissons;
                y1=y2;
                y2=y2-25/nb_boissons;
            }
            boisson_svg=boisson_svg+'<path d="M'+x1+' '+y1+', L'+x2+' '+y1+', L'+x3+' '+y2+', L'+x4+' '+y2+'z" fill="'+mycocktaildetail[i].color+'" />';

        }
    }

    $('.couleur').html(boisson_svg);
}


/*-------------------------------------------------------------------*/
// 10. ajout ingrédient dans le tableau
/*-------------------------------------------------------------------*/

function addIngredientToCocktail(ingredientName){
    var flagingredient = false;
    for(i=0; i < allDrinks.length; i++) {
        if (ingredientName == allDrinks[i].name) {
            var ingredientId = allDrinks[i].id;
            var ingredient = {};
            ingredient.id = allDrinks[i].id;
            ingredient.color = allDrinks[i].color;
            ingredient.type = allDrinks[i].type;
            ingredient.taille = allDrinks[i].taille;
            flagingredient = true;
        }
    }

    if(flagingredient == true){

        mycocktail.push(ingredientId);
        mycocktaildetail.push(ingredient);
    }else{
        console.log('pas d ingredient trouve');
    }
    Ingredients._collection.insert({
        name: ingredientName,
        color: ingredient.color
    });
    new_boisson_cocktail();

    myCocktailSuggestions(mycocktail);



}




/*-------------------------------------------------------------------*/
// fonction du changement de la barre de ratio like / dislike
/*-------------------------------------------------------------------*/

// SIGNATURE PROGRESS
function moveProgressBar() {
    console.log(ratioLikes);
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

/*-------------------------------------------------------------------*/
// Nouveau message du petit bonhomme
/*-------------------------------------------------------------------*/

MessageUser = new Mongo.Collection('messageUser');

Template.messageUser.helpers({
    'messageUser': function(){
        return MessageUser.find();
    }});
    MessageUser._collection.insert({ message: "Bon, tu met quelque chose dans ton verre ?" });
