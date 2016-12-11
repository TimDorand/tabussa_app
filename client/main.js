import { Template } from 'meteor/templating';

import './main.html';
import '/imports/library/jquery-ui.js';
import '/imports/library/jquery-ui.css';
import '/imports/library/touch-punch';



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

/*
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
*/


/*-------------------------------------------------------------------*/
// 1. Récupération de tous les ingrédients
/*-------------------------------------------------------------------*/

var drinks = []; // tableau des brevages uniquement ['vodka', 'rhum']
var allDrinks = []; // tableau des brevages entiers [{'id':'81', 'name':'vodka', 'color':'blue', 'type':'alcool'}, {}, {}, ... ]
var allCocktails = [];


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
    }
});

HTTP.call( 'POST', 'http://timothee-dorand.fr/tabussa/API/cocktails', {

}, function( error, response ) {
    if ( error ) {
        console.log( error );
    } else {
        var arrayCocktails = JSON.parse(response.content);
        /*{"id":"2","visits":"12","created_at":"2016-11-15 17:43:55","id_drink1":"81","id_drink2":"82","id_drink3":"84","id_drink4":"85","id_drink5":"0","id_drink6":"0","id_drink7":"0","id_drink8":"0","id_drink9":"0","id_drink10":"0","bonus":"0","malus":"0"},*/
        for(i=0; i < arrayCocktails.length; i++){
            allCocktails.push(arrayCocktails[i]);
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


var mycocktail = [];
var mycocktaildetail = [];
var ingredient = {};

/*-------------------------------------------------------------------*/
// 3. Ajout d'un nouvel ingredient dans le cocktail
/*-------------------------------------------------------------------*/


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
            Ingredients._collection.insert({
                name: ingredientName,
                color: ingredientColor
            });
            new_boisson_cocktail();
            myCocktailSuggestions(mycocktail);

        }else{
            console.log('pas d ingredient trouve');
            MessageUser._collection.remove({});
            MessageUser._collection.insert({ message: "Désolé, ça n'existe pas..." });
        }

    },
});

/*-------------------------------------------------------------------*/
// 4. Récupération des suggestions et ajout au click sur la liste
/*-------------------------------------------------------------------*/


Template.suggestions.events({

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

        new_boisson_cocktail();

        $('#cocktailInfoRating').html("");

        myCocktailSuggestions(mycocktail);

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

        Ingredients._collection.remove({});
        Suggestions._collection.remove({});
        CocktailInfo._collection.remove({});
        MessageUser._collection.remove({});
        MessageUser._collection.insert({ message: "Oouai ! Cul sec !" });

        mycocktail = [];


    }
});

/*------------------------------------------------------------*/
// 6. Envoi d'un like
/*-------------------------------------------------------------------*/

var id_cocktail;
Template.cocktail.events({
    'click .like2': function(event){
        event.preventDefault();

        /*URL : API/bonus
         Utiliser la méthode POST en envoyant un tableau de type
         $_POST["id"]="id_cocktail";

         Il faut récupérer le tableau de tous les cocktails créé

         Vous allez recevoir un tableau JSON avec les likes mis à jour*/



        for(i=0; i < allCocktails.length; i++){
            if(mycocktail[0] == allCocktails[i].id_drink1) {
                // console.log('le premier ingrédient est bien ' + mycocktail[0]);
                if (allCocktails[i].id_drink2 != 0) {
                    // console.log(allCocktails[i].id + 'il y a un deuxième ingrédient');



                    for(i=0; i < allCocktails.length; i++){
                        if(mycocktail[1] == allCocktails[i].id_drink2) {
                            // console.log('le 2ème ingrédient est bien ' + mycocktail[1]);
                            if (allCocktails[i].id_drink3 != 0) {
                                // console.log(allCocktails[i].id + 'il y a un 3ème ingrédient');





                            }else{
                                // console.log(allCocktails[i].id + 'il n\'y a pas de troisième ingrédient');
                                id_cocktail = allCocktails[i].id;
                            }
                        }
                    }

                    } else {
                    // console.log(allCocktails[i].id + 'il n\'y a pas de deuxième ingrédient');
                    id_cocktail = allCocktails[i].id;
                }
            }

        }

        console.log(id_cocktail);





            HTTP.call( 'POST', 'http://timothee-dorand.fr/tabussa/API/bonus', {
            data: {
                "id": id_cocktail
            }

        }, function( error, response ) {
            if ( error ) {
                console.log( error );
            } else {
                console.log(response);
                MessageUser._collection.remove({});
                MessageUser._collection.insert({ message: "C'est vrai que c'est bon... +1 !" });

                /*
                arrayDrinks = JSON.parse(response.content);
                for(i=0; i < arrayDrinks.length; i++){
                    drinks.push(arrayDrinks[i].name);
                    if(arrayDrinks[i].color){
                        drinks.push(arrayDrinks[i].color);
                    }

                    allDrinks.push(arrayDrinks[i]);
                }*/
                // console.log(drinks);
                // console.log(allDrinks);

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

var cocktailVisits;
var cocktailBonus;
var cocktailMalus;
var totalBonusMalus;
var ratioLikes;


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

            if(cocktailBonus = null){
                ratioLikes = 100;
            }

            CocktailInfo._collection.remove({});
            CocktailInfo._collection.insert({
                visits: cocktailVisits,
                bonus: cocktailBonus,
                malus: cocktailMalus,
                ratioLikes: ratioLikes
            });

            console.log(ratioLikes);



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


/*-------------------------------------------------------------------*/
// 9. Génération du cocktail visuel
/*-------------------------------------------------------------------*/

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



/*-------------------------------------------------------------------*/
// Nouveau message du petit bonhomme
/*-------------------------------------------------------------------*/

MessageUser = new Mongo.Collection('messageUser');

Template.messageUser.helpers({
    'messageUser': function(){
        return MessageUser.find();
    }});
    MessageUser._collection.insert({ message: "Bon, tu met quelque chose dans ton verre ?" });

