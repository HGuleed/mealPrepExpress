var ingredientList = []; // fills with selected ingredient and becomes ingrListStr

// converts ingredientList array to text for API call
var listToString = function (ingredientList) {
  var ingrListStr = ingredientList.toString();
  console.log(ingrListStr);
  getFoodApi(ingrListStr);
};

// **ADD YOUR API KEY**
// Search by ingredient call ------------------------------------------------------
var getFoodApi = function (ingrListStr) {                                                                        // --------- // 
  // foodTest = "https://api.spoonacular.com/recipes/findByIngredients?ingredients="+ingrListStr+"&number=1&apiKey=YOUR_API_KEY";
  console.log(ingrListStr);                                                                                       // --------- // 
  console.log(foodTest);
  fetch(foodTest).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        // data will go to display page
        console.log(data);
      });
    } else {
      alert("Error: No response from API!");
    }
  }).catch(function (error) {
    alert("Unable to connect to API");
    console.log(error);
  });
};

// ingredient btn listner ---------------------------------------------------------
$('.ingrBtn').on('click', function () {
  var btnState = $(this).attr('class');
  var ingredient = "+" + $(this).text();

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
});

// search button listener ---------------------------------------------------------
$('#search-btn').on('click', function () {
  listToString(ingredientList);
});