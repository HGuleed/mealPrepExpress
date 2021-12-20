var ingredientList = []; // fills with selected ingredient
var nmbOfMeals = 0; // globally scoped integer for number of meals
var favoriteControl = 0; // control integer for favorite vs current recipe card identification
var recipeCardArray = []; // fills with called recipe card objects
var storedRecipeArray = []; // fills with stored recipe card objects

// Welcome page clock 
var clock = document.getElementById("current-day");
clock.textContent = moment().format("h:mm A - D MMM YYYY");

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
    $('.search-btn-bottom').append("<button class='button search is-success is-size-4 py-0 hide' title='Disabled button' disabled><i class='fas fa-search pr-3'></i>Search</button>");
  }
};

// converts ingredientList array to text in ingrListStr for API call -----------------------
var listToString = function (ingredientList) {
  var ingrListStr = ingredientList.toString();
  getFoodApi(ingrListStr);
};

// **ADD YOUR API KEY**
// Search by ingredient call --------------------------------------------------------------
var getFoodApi = function (ingrListStr) {
  foodTest = "https://api.spoonacular.com/recipes/complexSearch?query=all&addRecipeInformation=true&instructionsRequired=true&includeIngredients=" + ingrListStr + "&number=" + nmbOfMeals + "&fillIngredients=true&type=main%20course&sort=max-used-ingredients&apiKey=74930b30746b4ed6824607ad1b62352a";
  fetch(foodTest).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        if (data.results.length > 0) {
          $('.current-msg').remove();
          // returned data is sent to a function for parsing and building recipe card elements
          console.log(data);
          parseRecipeData(data);
          // button functionality once cards are built
          dropDownMenu();
          favoriteButton();
        } else {
          $('.err-msg').text("Error finding a recipe from API, please try again.")
        }
      });
    }
  }).catch(function (error) {
    $('.err-msg').text("Error finding a recipe from API, please try again.")
  });
};

// Gather necessary data from API call ----------------------------------------------------
var parseRecipeData = function (recipe) {
  for (var i = 0; i < recipe.results.length; i++) {
    // recipe card object 
    var recipeCard = {
      recipeTitle: "",
      recId: "",
      recipeImage: "",
      missingIngredients: [],
      missingImages: [],
      usedIngredients: [],
      usedImages: [],
      missingAmounts: [],
      usedAmounts: [],
      recipeSteps: []
    };

    // get recipe title, main image, and missed ingredient count
    var rtitle = recipe.results[i].title;
    var rId = recipe.results[i].id;
    var rImg = recipe.results[i].image;

    // add data to recipe card 
    recipeCard.recipeTitle = rtitle;
    recipeCard.recId = rId;
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
      recipeCard.usedIngredients.push(usedIng);
      recipeCard.usedAmounts.push(usedAmt);
      recipeCard.usedImages.push(usedImg);
    }

    // get all recipe specific instructions
    if (recipe.results[i].analyzedInstructions.length > 0) {
      var recipeInstr = recipe.results[i].analyzedInstructions[0].steps
      for (var h = 0; h < recipeInstr.length; h++) {
        // get recipe steps 
        var recStep = recipeInstr[h].step;

        // add data to recipe card arry
        recipeCard.recipeSteps.push(recStep);
      }
    }
    buildRecipeCard(i, recipeCard);
    recipeCardArray.push(recipeCard);
  }
};

//------------------------------------LOCAL STORAGE-------------------------------------------------------
// save current recipe card from recipeCardArray to local storage
var saveToStorage = function (recipeId, recipeIndex) {
  localStorage.setItem("Recipe Card " + recipeId, JSON.stringify(recipeCardArray[recipeIndex]));
};

// save favorited recipe card from storedRecipeArray to local storage
var saveToStorage2 = function (recipeId, recipeIndex) {
  localStorage.setItem("Recipe Card " + recipeId, JSON.stringify(storedRecipeArray[recipeIndex]));
};

// remove recipe from local storage
var removeFromStorage = function (recipeId) {
  localStorage.removeItem("Recipe Card " + recipeId);
};

// loading recipes from storage
var loadFromStorage = function () {
  // reset array
  storedRecipeArray = [];
  // display msg if no favorites added
  if (localStorage.length > 0) {
    $('.favorite-msg').removeClass('hide').addClass('hide')
  }
  for (var i = 0; i < localStorage.length; i++) {
    var pastRecipe = JSON.parse(localStorage.getItem(localStorage.key(i)));
    if (pastRecipe != null) {
      storedRecipeArray.push(pastRecipe);
    }
  }
};

// build recipe cards from stored data
var displayFavorites = function () {
  for (var i = 0; i < storedRecipeArray.length; i++) {
    buildRecipeCard(i, storedRecipeArray[i]);
  }
  // give button functionality 
  dropDownMenu2();
  favoriteButton2();
  favoriteControl = 0;
};

// =========================================================== RECIPE CARD CREATION ================================================================
var buildRecipeCard = function (i, recipeCard) {

  // recipe card favorite button
  var fButtonContainer = $('<p>').addClass('buttons fav-cont');
  var fIconSpan = $('<span>').addClass('icon is-large');
  // favorite card vs current card button control variance 
  if (favoriteControl > 0) {
    // favorite recipe card class control
    var fButton = $('<button>').addClass('button stored-favorite is-large is-white').attr('id', recipeCard.recId).attr('index', i);
    var rColumn = $('<div>').addClass('favorite-card column');
    var fIcon = $('<i>').addClass('fstar fas fa-star');
    var ibButton = $('<button>').addClass('rDropDown2 button is-fullwidth is-success is-outlined');
  } else {
    // current recipe card clas control
    var fButton = $('<button>').addClass('button favorite is-large is-white').attr('id', recipeCard.recId).attr('index', i);
    var rColumn = $('<div>').addClass('recipe-card column');
    var fIcon = $('<i>').addClass('fstar far fa-star');
    var ibButton = $('<button>').addClass('rDropDown button is-fullwidth is-success is-outlined');
  }

  // recipe card header(r)
  var rColumns = $('.recipe-columns');
  var rCard = $('<div>').addClass('card');
  var rCardHead = $('<header>').addClass('card-header mb-0 title is-4 color-3');
  var rTitle = $('<p>').addClass('card-header-title title-is-4 pt-0 pb-5').text(recipeCard.recipeTitle);
  var rImageDiv = $('<div>').addClass('card-image');
  var rFigure = $('<figure>').addClass('image is 4by3');
  var rMainImg = $('<img>').attr('src', recipeCard.recipeImage).attr('alt', recipeCard.recipeTitle);

  // recipe card ingredients drop down element(ib)
  var ibContainer = $('<div>').addClass('dropdown');
  var ibTrigger = $('<div>').addClass('dropdown-trigger p-5 pb-3');
  var ibTitle = $('<span>').text('Ingredients');
  var ibIconSpan = $('<span>').addClass('icon is-small');
  var ibIcon = $('<i>').addClass('fas fa-angle-down');
  var ibMenu = $('<div>').addClass('dropdown-menu');
  var ibInstructions = $('<div>').addClass('dropdown-content');

  // recipe card ingredients(i)
  var iCardContent = $('<div>').addClass('card-content pt-0');
  var iMedia = $('<div>').addClass('ingredient-img media my-0 pt-2');
  var iMediaLeft = $('<div>').addClass('media-left');
  var iFigure = $('<figure>').addClass('image level is-48x48');
  var iImage = $('<img>').addClass('is-rounded level-item');
  var iMediaContent = $('<div>').addClass('media-content');
  var iTitle = $('<p>').addClass('title is-5');
  var iStatus = $('<p>');

  // recipe card amounts(a)
  var aContainer = $('<div>').addClass('amounts-container card-content py-0');
  var aList = $('<ul>').addClass('content amounts ml-3');
  var aAmount = $('<li>');

  // instruction drop down element(dd)
  var ddContainer = $('<div>').addClass('dropdown');
  var ddTrigger = $('<div>').addClass('dropdown-trigger p-5');
  var ddButton = $('<button>').addClass('rDropDown button is-fullwidth is-success is-outlined');
  var ddTitle = $('<span>').text('Instructions');
  var ddIconSpan = $('<span>').addClass('icon is-small');
  var ddIcon = $('<i>').addClass('fas fa-angle-down');
  var ddMenu = $('<div>').addClass('dropdown-menu');
  var ddInstructions = $('<div>').addClass('dropdown-content p-5 is-size-7');
  var ddStep = $('<p>').addClass('mb-4');

  // build recipe card ---------------------------------------------
  // recipe card favorite button
  fIconSpan.append(fIcon);
  fButton.append(fIconSpan);
  fButtonContainer.append(fButton);
  rCard.append(fButtonContainer);

  // recipe card header
  rCardHead.append(rTitle);
  // add header to recipe card
  rCard.append(rCardHead);

  rFigure.append(rMainImg);
  rImageDiv.append(rFigure);
  // add image to recipe card
  rCard.append(rImageDiv);

  // ingredient drop down button 
  ibButton.append(ibTitle);
  ibIconSpan.append(ibIcon);
  ibButton.append(ibIconSpan);
  ibTrigger.append(ibButton);
  ibContainer.append(ibTrigger);

  // add ingredients to drop down
  ibMenu.append(ibInstructions);

  // loop through missing ingredients and populate card
  for (var i = 0; i < recipeCard.missingIngredients.length; i++) {
    iFigure.append(iImage.attr('src', recipeCard.missingImages[i]));
    iMediaLeft.append(iFigure);
    iMedia.append(iMediaLeft);
    // ingredient status is missing
    iMediaContent.append(iTitle.text(recipeCard.missingIngredients[i]), iStatus.text('missing').addClass('status2 subtitle is-7 px-2 has-background-grey-lighter'));
    iMedia.append(iMediaContent);
    // add missing ingredients to ingredient card content
    iCardContent.append(iMedia.clone());
  }

  // loop through used ingredients and populate card
  for (var i = 0; i < recipeCard.usedIngredients.length; i++) {
    iFigure.append(iImage.attr('src', recipeCard.usedImages[i]).attr('alt', recipeCard.usedIngredients[i]));
    iMediaLeft.append(iFigure);
    iMedia.append(iMediaLeft);
    // ingredient status is in kitchen
    iMediaContent.append(iTitle.text(recipeCard.usedIngredients[i]), iStatus.text('in kitchen').removeClass('status2 subtitle is-7 px-2 has-background-grey-lighter').addClass('status subtitle is-7 px-2 has-text-white has-background-success'));
    iMedia.append(iMediaContent);

    // add used ingredients to ingredient card content
    iCardContent.append(iMedia.clone());
  }

  // add ingredient content to recipe card
  ibInstructions.append(iCardContent);

  // add ingredients to drop down
  ibMenu.append(ibInstructions);
  ibContainer.append(ibMenu);

  // add drop down to recipe card
  rCard.append(ibContainer);

  // add missing and used ingredient amounts
  for (var i = 0; i < recipeCard.missingAmounts.length; i++) {
    aList.append(aAmount.text(recipeCard.missingAmounts[i]).clone());
  }
  for (var i = 0; i < recipeCard.usedAmounts.length; i++) {
    aList.append(aAmount.text(recipeCard.usedAmounts[i]).clone());
  }
  // add amount container to recipe card
  aContainer.append(aList);
  rCard.append(aContainer);

  // build drop down -------------------------------
  // drop down button 
  ddButton.append(ddTitle);
  ddIconSpan.append(ddIcon);
  ddButton.append(ddIconSpan);
  ddTrigger.append(ddButton);
  ddContainer.append(ddTrigger);

  // add steps to instructions 
  for (var i = 0; i < recipeCard.recipeSteps.length; i++) {
    ddInstructions.append(ddStep.text(recipeCard.recipeSteps[i]).clone());
  }

  // add instructions to drop down
  ddMenu.append(ddInstructions);
  ddContainer.append(ddMenu);

  // add drop down to recipe card
  rCard.append(ddContainer);

  // add recipe card to column
  rColumn.append(rCard);

  // add column to parent columns structure
  rColumns.append(rColumn);
};
//-------------------------------------------------------------------------------------------------------------------------------

// ================================ BUTTON LISTENERS ============================================================================
// ingredient btn listner ------------------------------------------------------------------
$('.ingrBtn').on('click', function () {
  var btnState = $(this).attr('class');
  // clicked btn text, minus spaces, to lower case. 
  var ingredient = $(this).text().replaceAll(" ", "%20").toLowerCase();

  // when button is first clicked, add ingr, turn solid clr
  if (btnState == "ingrBtn button is-success is-outlined") {
    // adjust CSS
    $(this).removeClass('is-outlined');
    // add data
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
  // changes state of search button clickable/not clickable 
  searchBtnState();
});

// number of meals screen X button closes modal --------------------------------------------
$('.modal-close').on('click', function () {
  $('#meal-modal').removeClass("is-active");
});

// search button listener, queries API -----------------------------------------------------
$('.search-btn').on('click', function () {
  // reset recipeCardArray
  recipeCardArray = [];
  // remove previous searched cards and current tab msg
  $('.recipe-card').remove();
  // send chosen ingredients to API url
  listToString(ingredientList);
  // switch to current tab
  $('#current-tab').trigger('click');
});

// welcome message listener, start, X, & background closes welcome modal -------------------
$('#modal-background').add('#start-btn').add('.modal-close').on('click', function () {
  $('#welcome-modal').removeClass("is-active");
  $('#welcome-tab').removeClass("is-active");
  $('#ingredient-tab').addClass('is-active');
});

// ------------------------------------ TAB CONTROL ----------------------------------------------------
// HOME tab brings up welcome modal -----------------------------------------------------
$('#welcome-tab').on('click', function () {
  $('#welcome-modal').addClass("is-active");
  $('#welcome-tab').addClass("is-active");
});

// INGREDIENTS tab brings up ingredients screen
$('#ingredient-tab').on('click', function () {
  $('#ingredients-container').removeClass('hide');
  $('#ingredient-tab').addClass('is-active');
  $('#current-tab').removeClass("is-active");
  $('#favorite-tab').removeClass('is-active');
  $('.favorite-msg').addClass('hide');
  $('.current-msg').addClass('hide');
  $('.recipe-card').addClass('hide');
  $('.favorite-card').remove();
  $('.current-welcome').remove();
});

// CURRENT tab brings up current meals screen ------------------------------------------
$('#current-tab').on('click', function () {
  $('#ingredient-tab').removeClass('is-active');
  $('#ingredients-container').addClass('hide');
  $('#current-tab').addClass('is-active');
  $('#favorite-tab').removeClass('is-active');
  $('.current-msg').removeClass('hide');
  $('.favorite-msg').addClass('hide');
  $('.recipe-card').removeClass('hide');
  $('.favorite-card').remove();
});

// FAVORITE tab brings up current meals screen ------------------------------------------
$('#favorite-tab').on('click', function () {
  $('.favorite-card').remove();
  $('#ingredient-tab').removeClass('is-active');
  $('#current-tab').removeClass("is-active");
  $('#ingredients-container').addClass('hide');
  $('#favorite-tab').addClass('is-active');
  $('.favorite-msg').removeClass('hide');
  $('.current-msg').addClass('hide');
  $('.recipe-card').addClass('hide');
  $('.current-welcome').remove();
  favoriteControl++;
  loadFromStorage();
  displayFavorites();
  if (localStorage.length < 1) {
    $('.favorite-msg').removeClass('hide')
  }
});

// ------------------------------------------- DYNAMIC BUTTON LISTENERS ---------------------------------------------------
// favorite button functionality for current recipe cards, uses data from recipeCardArray----------------------
var favoriteButton = function () {
  $('.favorite').on('click', function () {
    var favoriteState = $(this).children().children().attr('class');
    var recipeId = $(this).attr('id');
    var recipeIndex = $(this).attr('index');

    if (favoriteState == "fstar far fa-star") {
      $(this).children().children().removeClass('far fa-star').addClass('fas fa-star');
      // save the recipe associated with this favorite button by finding its location in the recipeCardArray
      saveToStorage(recipeId, recipeIndex);
    } else {
      $(this).children().children().removeClass('fas fa-star').addClass('far fa-star');
      // remove when unstarring 
      removeFromStorage(recipeId, recipeIndex);
    }
  })
};

// favorite button functionality for stored recipe cards, saves uses data from storedRecipeArray----------------------
var favoriteButton2 = function () {
  $('.stored-favorite').on('click', function () {
    var favoriteState = $(this).children().children().attr('class');
    var recipeId = $(this).attr('id');
    var recipeIndex = $(this).attr('index');

    if (favoriteState == "fstar far fa-star") {
      $(this).children().children().removeClass('far fa-star').addClass('fas fa-star');
      // save the recipe associated with this favorite button by finding its location in the storedRecipeArray
      saveToStorage2(recipeId, recipeIndex);
    } else {
      $(this).children().children().removeClass('fas fa-star').addClass('far fa-star');
      // remove when unstarring
      removeFromStorage(recipeId, recipeIndex);
    }
  });
};

// drop down menu functionality for current recipe cards-----------------------
var dropDownMenu = function () {
  $('.rDropDown').on('click', function () {
    // get class of dropdown div when clicking button
    var dropDownState = $(this).parent().parent().attr('class');
    // trigger the drop down if it is not active, otherwise deactivate  
    if (dropDownState == "dropdown") {
      $(this).parent().parent().addClass('is-active');
      $(this).removeClass('is-outlined');
    } else {
      $(this).parent().parent().removeClass('is-active');
      $(this).addClass('is-outlined');
    }
  });
};

// drop down menu functionality for stored recipe cards -----------------------
var dropDownMenu2 = function () {
  $('.rDropDown2').on('click', function () {
    // get class of dropdown div when clicking button
    var dropDownState = $(this).parent().parent().attr('class');
    // trigger the drop down if it is not active, otherwise deactivate  
    if (dropDownState == "dropdown") {
      $(this).parent().parent().addClass('is-active');
      $(this).removeClass('is-outlined');
    } else {
      $(this).parent().parent().removeClass('is-active');
      $(this).addClass('is-outlined');
    }
  });
};