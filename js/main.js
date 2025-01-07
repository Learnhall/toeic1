document.addEventListener("DOMContentLoaded", (event) => {
  const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  var x = document.getElementById("container");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  });

document.querySelectorAll(".nav-link").forEach((link) =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);




/** Smooth Scrolling**/
$(document).on("click", 'a[href^="#"]', function (event) {
  event.preventDefault();
  $("html, body").animate(
    {
      scrollTop: $($.attr(this, "href")).offset().stop,
    },
    500
  );
});

(function () {

  var questionCounter = 0; //Tracks question number
  var selections = []; //Array containing user choices
  var quiz = $("#quiz"); //Quiz div object
  var defaultQuestionContent;
  defaultQuestionContent = $("#content").text();


//this may be deleted...it has to do with muting page bc of clicking next so the audio from prev question doesnt keep playing//

  // Mute a singular HTML5 element
  // function muteMe(elem) {
  //     elem.muted = true;
  //     elem.pause();
  // }
  //
  // // Try to mute all video and audio elements on the page
  // function mutePage() {
  //     document.querySelectorAll("video, audio").forEach((elem) => muteMe(elem));
  // }



//this may be deleted...it has to do with muting page//



  // Display initial question
  displayNext();

  // Click handler for the 'next' button
  $("#next").on("click", function (e) {
    e.preventDefault();


    // Suspend click listener during fade animation
    if (quiz.is(":animated")) {
      return false;
    }
    choose();

    // If no user selection, progress stopped and pop-up alert
    if (isNaN(selections[questionCounter])) {
      swal("Please make a selection.", "Choose the best answer.", "warning");
    } else {
      questionCounter++;
      displayNext();
    }console.log('the score is: ', getScore())
  });

  // Click handler for the 'prev' button
  $("#prev").on("click", function (e) {
    e.preventDefault();
    // mutePage();

    if (quiz.is(":animated")) {
      return false;
    }
    choose();
    questionCounter--;
    displayNext();
  });

  // Click handler for the 'Start Over' button
  $("#start").on("click", function (e) {
    e.preventDefault();

    if (quiz.is(":animated")) {
      return false;
    }
    questionCounter = 0;
    selections = [];
    displayNext();
    $("#start").hide();
  });

  // Animates buttons on hover
  $(".button").on("mouseenter", function () {
    $(this).addClass("active");
  });
  $(".button").on("mouseleave", function () {
    $(this).removeClass("active");
  });

  // Creates and returns the div that contains the questions and
  // the answer selections
  function createQuestionElement(index) {
    emailCapture();
    var qElement = $("<div>", {
      id: "question",
    });

    var header = $("<h2>Question " + (index + 1) + ":</h2>");
    qElement.append(header);

    var textProblem = $("<p>").append(questions[index].textProblem);
    qElement.append(textProblem);

    var question = $("<p>").append(questions[index].question);
    qElement.append(question);

    var radioButtons = createRadios(index);
    qElement.append(radioButtons);

    return qElement;
  }

  // Creates a list of the answer choices as radio inputs
  function createRadios(index) {
    var radioList = $("<ul>");
    var item;
    var input = "";
    for (var i = 0; i < questions[index].choices.length; i++) {
      item = $("<li>");
      input = '<label><input type="radio" name="answer" value=' + i + " />";
      input += questions[index].choices[i];
      input += "</label>";
      item.append(input);
      radioList.append(item);
    }
    return radioList;
  }

  // Reads the user selection and pushes the value to an array
  function choose() {
    selections[questionCounter] = +$('input[name="answer"]:checked').val();
  }

  // Displays next requested element
  function displayNext() {
    quiz.fadeOut(function () {
      $("#question").remove();

      if (questionCounter < questions.length) {
        var question = questions[questionCounter];

        // Show 'image' defined in question object

        if (typeof question.image !== "undefined") {
          $("#image img").attr("src", "https://ricky-11254.github.io/launch_english_files/" + question.image);
          $("#image").show();
        } else {
          $("#image").hide();
        }

        if (typeof question.audio !== "undefined") {
          $("#audio").show();
          $("#audio audio").attr("src", "https://ricky-11254.github.io/launch_english_files/audio/" + question.audio);
          // $("#audio audio")[0].play();
        } else {
          $("#audio").hide();
          $("#audio audio").stop();
        }

        // Show 'content' defined in question object
        console.log(typeof question.content, defaultQuestionContent);
        if (typeof question.content === "undefined") {
          $("#content").text(defaultQuestionContent);
        } else {
          $("#content").text(question.content);
        }

        // Show 'qType' defined in question object
        console.log(typeof question.qType, defaultQuestionContent);
        if (typeof question.qType === "undefined") {
          $("#qType").text(defaultQuestionContent);
        } else {
          $("#qType").text(question.qType);
        }

        var nextQuestion = createQuestionElement(questionCounter);
        quiz.append(nextQuestion).fadeIn();
        if (!isNaN(selections[questionCounter])) {
          $("input[value=" + selections[questionCounter] + "]").prop(
            "checked",
            true
          );
        }

        // Controls display of 'prev' button
        if (questionCounter === 1) {
          $("#prev").show();
        } else if (questionCounter === 0) {
          $("#prev").hide();
          $("#next").show();
        }
      } else {
        var scoreElem = displayScore();
        quiz.append(scoreElem).fadeIn();
        $("#next").hide();
        $("#prev").hide();
        $("#start").show();
      }
    });
  }

function getScore() {

  var numCorrect = 0;
  for (var i = 0; i < selections.length; i++) {
    if (selections[i] === questions[i].correctAnswer) {
      numCorrect++;
    }
  }
  return numCorrect;
}

  // Computes score and returns a paragraph element to be displayed
  function displayScore() {
    var score = $("<p>", {
      id: "question",
    });

    var numCorrect = getScore();


    score.append(
      "You got " +
        numCorrect +
        " questions out of " +
        questions.length +
        " right."
    );
    return score;
  }
  window.onload = function () {
    emailCapture();
  };

  // Email capture
  function emailCapture() {
    var qy = questionCounter + 1;
    console.log(questionCounter);
    var capt = document.getElementById("capt");

    if (qy % 5 === 0) {
      capt.style.display = "block";
    } else {
      capt.style.display = "none";
    }
  }
})();
});


function pay(){
  let xy = document.getElementById("rlist")
  xy.style.display = "block"
  let cc = document.getElementById("srnav")
  cc.style.display = "block"
  let br = document.getElementById("rnav")
  br.style.display = "none"
}

function cod(){
  let xy = document.getElementById("rlist")
  xy.style.display = "none"
  let br = document.getElementById("srnav")
  br.style.display = "none"
  let hh = document.getElementById("rnav")
  hh.style.display ="block"
}