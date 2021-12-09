var ingredientList = []; // fills with selected ingredient and becomes ingrListStr
var nmbOfMeals = 0


var searchBtnState = function () {
  console.log(ingredientList)
  console.log(nmbOfMeals)

  if (nmbOfMeals > 0 && ingredientList.length > 0) {
    $('.search').removeAttr('title')
    $('.search').removeAttr('disabled')
  }
  if (nmbOfMeals == 0 || ingredientList.length == 0) {
    $('.search').remove()
    $('.search-btn').append("<button class='button search is-success is-size-4 py-0' title='Disabled button' disabled><i class='fas fa-search pr-3'></i>Search</button>")
  }
}

// converts ingredientList array to text for API call
var listToString = function (ingredientList) {
  var ingrListStr = ingredientList.toString();
  console.log(ingrListStr);
  getFoodApi(ingrListStr);
};

// **ADD YOUR API KEY**
// Search by ingredient call ------------------------------------------------------
var getFoodApi = function (ingrListStr) {                                                                                                                                                                        // --------- // 
  foodTest = "https://api.spoonacular.com/recipes/complexSearch?query=all&addRecipeInformation=true&instructionsRequired=true&includeIngredients=chicken&number=" + nmbOfMeals + "&fillIngredients=true&sort=min-missing-ingredients&apiKey=74930b30746b4ed6824607ad1b62352a";
  console.log(ingrListStr);                                                                                                                                                                                      // --------- // 
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

// Gather necessary data from API call --------------------------------------------
var parseRecipeData = function (recipe) {
  for (var i = 0; i < recipe.results.length; i++) {
    console.log(recipe.results[i].title);
    console.log(recipe.results[i].image);
    console.log(recipe.results[i].missedIngredientCount);
    console.log(recipe.results[i].usedIngredientCount);
    var missedIngred = recipe.results[i].missedIngredients
    for (var j = 0; j < missedIngred.length; j++) {
      console.log(missedIngred[j].name);
      console.log(missedIngred[j].original);
      console.log(missedIngred[j].image);
    }
    var usedIngred = recipe.results[i].usedIngredients
    for (var k = 0; k < usedIngred.length; k++) {
      console.log(usedIngred[k].name);
      console.log(usedIngred[k].original);
      console.log(usedIngred[k].image);
    }
  }
};

// ingredient btn listner ---------------------------------------------------------
$('.ingrBtn').on('click', function () {
  var btnState = $(this).attr('class');
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
    // remove data

    for (let i = 0; i < ingredientList.length; i++) {
      if (ingredientList[i] == ingredient) {
        ingredientList.splice(i, 1);
      }
    }
  }
  console.log(ingredientList);
  searchBtnState();
});


// number of meals screen X button closes modal --------------------------------------------
$('.modal-close').on('click', function () {
  $('#meal-modal').removeClass("is-active")
});

// meal button listener, closes modal ------------------------------------------------------
$('.mealbtn').on('click', function () {
  nmbOfMeals = $(this).text().substring(0, 1)
  $('#meal-modal').removeClass("is-active")
  console.log(nmbOfMeals)
  searchBtnState();
});

// number of meals button listener, opens modal --------------------------------------------
$('#meal-btn').on('click', function () {
  $("#meal-modal").addClass("is-active")
});

// search button listener, queries API -----------------------------------------------------
$('.search-btn').on('click', function () {
  console.log("search clicked!")
  listToString(ingredientList);
});

// welcome message listener, closes welcome modal ------------------------------------------
$('#modal-background').on('click', function () {
  $('#welcome-modal').removeClass("is-active")
});