var getFoodApi = function() {
  foodTest = "https://v2.jokeapi.dev/joke/Any";

  fetch(foodTest).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        console.log(data)
      });
    } else {
      alert("Error: no esponse from API!");
    }
  }).catch(function (error) {
    alert("unable to connect to API");
    console.log(error);
  });
}

getfoodApi();