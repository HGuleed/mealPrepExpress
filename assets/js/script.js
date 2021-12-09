let joke =
  "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single";
fetch(joke)
  .then(function (response) {
    if (response.ok) {
      response.json().then(function (jokeData) {
        console.log(jokeData);
      });
    } else {
      alert("ERROR: No response from API");
    }
  })
  .catch(function (error) {
    alert("Unable to connect to API");
    console.log(error);
  });

function displayJoke(jokeData) {
  var jokeInput = document.getElementById("joke");

  jokeInput.textContent = joke;
}
