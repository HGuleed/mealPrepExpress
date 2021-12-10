var ingredientList = []; // fills with selected ingredient
var nmbOfMeals = 0;

// Welcome page clock 
var clock = document.getElementById("current-day")
clock.textContent = moment().format("h:mm A - D MMM YYYY")

// alters state of the search button -------------------------------------------------------
var searchBtnState = function () {
  // if # of meals AND ingredients have been selected, allow search
  if (nmbOfMeals > 0 && ingredientList.length > 0) {
    $('.search').removeAttr('title');
    $('.search').removeAttr('disabled');
  }
  // if # of meals OR ingredients have NOT been selected, do not allow search
  if (nmbOfMeals == 0 || ingredientList.length == 0) {
    $('.search').remove();
    $('.search-btn').append("<button class='button search is-success is-size-4 py-0 is-fullwidth' title='Disabled button' disabled><i class='fas fa-search pr-3'></i>Search</button>");
    $('.search-btn-bottom').append("<button class='button search is-success is-size-4 py-0 hide' title='Disabled button' disabled><i class='fas fa-search pr-3'></i>Search</button>")
  }
};

// converts ingredientList array to text in ingrListStr for API call -----------------------
var listToString = function (ingredientList) {
  var ingrListStr = ingredientList.toString();
  console.log(ingrListStr);
  getFoodApi(ingrListStr);
};

// **ADD YOUR API KEY**
// Search by ingredient call --------------------------------------------------------------
var getFoodApi = function (ingrListStr) {                                                                                                                                                                        // --------- // 
  foodTest = "https://api.spoonacular.com/recipes/complexSearch?query=all&addRecipeInformation=true&instructionsRequired=true&includeIngredients=" + ingrListStr + "&number=" + nmbOfMeals + "&fillIngredients=true&sort=max-used-ingredients&apiKey=74930b30746b4ed6824607ad1b62352a";                                                                                                                                                                                    // --------- // 
  console.log(foodTest);
  fetch(foodTest).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        // data will go to display page
        console.log(data);
        parseRecipeData(data);
      });
    } else {
      alert("Error: No response from API!");
    }
  }).catch(function (error) {
    alert("Unable to connect to API");
    console.log(error);
  });
};

// Gather necessary data from API call ----------------------------------------------------
var parseRecipeData = function (recipe) {
  for (var i = 0; i < recipe.results.length; i++) {
    // create recipe card object ==========================================================
    recipeCard = {
      recipeTitle: "",
      recipeImage: "",
      missingIngredients: [],
      missingImages: [],
      usedIngrededients: [],
      usedImages: [],
      missingAmounts: [],
      usedAmounts: [],
      recipeSteps: []
    };

    // get recipe title, main image, and missed ingredient count
    var rtitle = recipe.results[i].title;
    var rImg = recipe.results[i].image;

    // add data to recipe card 
    recipeCard.recipeTitle = rtitle;
    recipeCard.recipeImage = rImg;


    // get all recipe specific data for missing ingredients
    var missedIngred = recipe.results[i].missedIngredients;
    for (var j = 0; j < missedIngred.length; j++) {
      // get recipe missed ingredients name, amount, and image
      var missIng = missedIngred[j].name;
      var missAmt = missedIngred[j].original;
      var missImg = missedIngred[j].image;

      // add data to recipe card arry
      recipeCard.missingIngredients.push(missIng);
      recipeCard.missingAmounts.push(missAmt);
      recipeCard.missingImages.push(missImg);
    }

    // get all recipe specific data for used ingredients
    var usedIngred = recipe.results[i].usedIngredients;
    for (var k = 0; k < usedIngred.length; k++) {
      // get recipe used ingredients name, amount, and image
      var usedIng = usedIngred[k].name;
      var usedAmt = usedIngred[k].original;
      var usedImg = usedIngred[k].image;

      // add data to recipe card arry
      recipeCard.usedIngrededients.push(usedIng);
      recipeCard.usedAmounts.push(usedAmt);
      recipeCard.usedImages.push(usedImg);
    }
    
    // get all recipe specific instructions
    var recipeInstr = recipe.results[i].analyzedInstructions[0].steps
    for (var h = 0; h < recipeInstr.length; h++) {
      // get recipe steps 
      var recStep = recipeInstr[h].step;

      // add data to recipe card arry
      recipeCard.recipeSteps.push(recStep);
    }
    saveToStorage(i, recipeCard);
    console.log(recipeCard);
  }
};

// saving searched recipes to local storage 
var saveToStorage = function (i, recipeCard) {
  localStorage.setItem("Recipe Card " + i, JSON.stringify(recipeCard));
};

// loading recipes from storage
var loadFromStorage = function () {
  for (var i = 0; i < localStorage.length; i++) {
    var pastRecipe = JSON.parse(localStorage.getItem("Recipe Card " + i));
    console.log(pastRecipe);
    // buildHistoryPage(pastRecipe);
  }
};

var buildHistoryPage = function (pastRecipe) {
  // take data from storage and build history page elements
};

// ================================ BUTTON LISTENERS =======================================
// ingredient btn listner ------------------------------------------------------------------
$('.ingrBtn').on('click', function () {
  var btnState = $(this).attr('class');
  // clicked btn text, minus spaces, to lower case. 
  var ingredient = $(this).text().replaceAll(" ", "").toLowerCase();

  // when button is first clicked, add ingr, turn solid clr
  if (btnState == "ingrBtn button is-success is-outlined") {
    // adjust CSS
    $(this).removeClass('is-outlined');
    // add data
    console.log(ingredient);
    ingredientList.push(ingredient);
  }

  // when button is clicked again, remove ingr, turn outlined

  if (btnState == "ingrBtn button is-success") {
    // adjust CSS
    $(this).addClass('is-outlined');
    // remove data if it is in the array
    for (let i = 0; i < ingredientList.length; i++) {
      if (ingredientList[i] == ingredient) {
        ingredientList.splice(i, 1);
      }
    }
  }
  console.log(ingredientList);
  // changes state of search button clickable/not clickable 
  searchBtnState();
});

// number of meals button listener, opens modal --------------------------------------------
$('#meal-btns').on('click', function () {
  $("#meal-modal").addClass("is-active");
});

// meal button listener, closes modal ------------------------------------------------------
$('.mealbtn').on('click', function () {
  nmbOfMeals = $(this).text().substring(0, 1)
  $('#meal-modal').removeClass("is-active");
  console.log(nmbOfMeals);
  // changes state of search button clickable/not clickable 
  searchBtnState();
});

// number of meals screen X button closes modal --------------------------------------------
$('.modal-close').on('click', function () {
  $('#meal-modal').removeClass("is-active");
});

// search button listener, queries API -----------------------------------------------------
$('.search-btn').on('click', function () {
  console.log("search clicked!");
  console.log(ingredientList)
  console.log("# of meals: " + nmbOfMeals)
  localStorage.clear()
  listToString(ingredientList);
});

// welcome message listener, start, X, & background closes welcome modal -------------------
$('#modal-background').add('#start-btn').add('.modal-close').on('click', function () {
  $('#welcome-modal').removeClass("is-active");
  $('#welcome-tab').removeClass("is-active");
  $('#ingredient-tab').addClass("is-active");
});

// HOME button brings up welcome modal -----------------------------------------------------
$('#welcome-tab').on('click', function () {
  $('#welcome-modal').addClass("is-active");
  $('#welcome-tab').addClass("is-active");
  $('#ingredient-tab').removeClass("is-active");
});

// HISTORY button brings up previous meals screen ------------------------------------------
$('#history-tab').on('click', function () {
  loadFromStorage();
});
