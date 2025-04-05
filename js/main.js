/** Responsive Navbar **/

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

/** Smooth Scrolling**/
$(document).on("click", 'a[href^="#"]', function (event) {
  event.preventDefault();
  $("html, body").animate(
    {
      scrollTop: $($.attr(this, "href")).offset().top,
    },
    500
  );
});

/** Main Diagnostic Quiz Function **/

(function () {
  var NumberOfQuestion = 200; // total number of question for the whole exam
  var totalTime = 120 * 60; // total time for the whole exam (converting to seconds)
  var currentTime = parseInt(sessionStorage.getItem("examTime")) || totalTime; // current time
  var timerDisplay = $("#timer");
  var examEnded = false; // Variable to track if the exam has ended

  var questionCounter =
    parseInt(sessionStorage.getItem("questionCounter")) || 0; //Tracks question number
  var selections = JSON.parse(sessionStorage.getItem("selections")) || []; //Array containing user choices
  var quiz = $("#quiz"); //Quiz div object
  var defaultQuestionContent;
  defaultQuestionContent = $("#content").text();

  // Function to update session storage
  const updateSessionStorage = () => {
    sessionStorage.setItem("questionCounter", JSON.stringify(questionCounter));
    sessionStorage.setItem("selections", JSON.stringify(selections));
  };

  // Function to start the timer
  function startTimer() {
    if (examEnded) return;

    // Get the last stored timestamp
    var storedStartTime = parseInt(sessionStorage.getItem("examStartTime"));

    if (!storedStartTime) {
      // Store the current timestamp if not set
      storedStartTime = Date.now();
      sessionStorage.setItem("examStartTime", storedStartTime);
    }

    var timer = setInterval(function () {
      if (examEnded) {
        clearInterval(timer);
        return;
      }

      // Calculate the elapsed time since the exam started
      var elapsedTime = Math.floor((Date.now() - storedStartTime) / 1000); // Convert ms to seconds
      currentTime = Math.max(totalTime - elapsedTime, 0);

      var hours = Math.floor(currentTime / 3600);
      var minutes = Math.floor((currentTime % 3600) / 60);
      var seconds = currentTime % 60;

      // Format and display the timer
      timerDisplay.text(
        `${hours < 10 ? "0" : ""}${hours}:${
          minutes < 10 ? "0" : ""
        }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
      );

      // 60-minute mark
      if (currentTime === 60 * 60) {
        swal(
          "Time Check!",
          "You have 60 minutes left. Stay focused and manage your time well!",
          "info"
        );
      }

      // 30-minute mark
      if (currentTime === 30 * 60) {
        swal(
          "Time Check!",
          "You have 30 minutes left. Stay focused and manage your time well!",
          "info"
        );
      }

      // 15-minute mark
      if (currentTime === 15 * 60) {
        swal(
          "Final Quarter!",
          "Only 15 minutes remaining. Prioritize your remaining questions!",
          "info"
        );
      }

      // 5-minute warning
      if (currentTime === 5 * 60) {
        swal(
          "Almost there!",
          "You have 5 minutes remaining. Finish strong!",
          "info"
        );
      }

      // 1-minute warning
      if (currentTime === 1 * 60) {
        swal(
          "Final stretch!",
          "You have 1 minute remaining. Wrap it up!",
          "warning"
        );
      }

      // Time is up
      if (currentTime <= 0) {
        clearInterval(timer);
        examEnded = true;
        swal("Time's up!", "Your time for this quiz has expired.", "error");

        // Hide the quiz and show the final score
        $("#quiz").empty();
        $("#next").hide();
        $("#prev").hide();
        $("#start").show();

        var scoreElem = displayScore();
        $("#quiz").append(scoreElem);
      }
    }, 1000);
  }

  // Ensure timer continues when tab is changed
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      startTimer(); // Restart the timer when user returns
    }
  });

  // Start the timer when the quiz loads
  $(document).ready(function () {
    startTimer();
  });

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
      swal("Please make a selection.", "Choose the best option.", "warning");
    } else {
      questionCounter++;
      updateSessionStorage();
      displayNext();
    }
  });

  // Click handler for the 'prev' button
  $("#prev").on("click", function (e) {
    e.preventDefault();

    if (quiz.is(":animated")) {
      return false;
    }
    choose();
    questionCounter--;
    updateSessionStorage();
    displayNext();
  });

  // Click handler for the 'Start Over' button
  $("#start").on("click", function (e) {
    e.preventDefault();

    if (quiz.is(":animated")) {
      return false;
    }

    // Reset variables
    questionCounter = 0;
    selections = [];
    examEnded = false; // Allow timer to run again
    currentTime = totalTime; // Set the exam time (adjust as needed)
    updateSessionStorage();

    // Display the first question
    displayNext();

    // Restart the timer
    startTimer();

    // Hide the start button
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
      input =
        '<label><input tabindex="0"  data-focusable type="radio" name="answer" value=' +
        i +
        " />";
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
    updateSessionStorage();
  }

  $(document).keydown(function (e) {
    // Prevent non-alphabet keys (like arrow keys, etc.)
    if (e.keyCode >= 37 && e.keyCode <= 40) {
      return; // Do nothing if it's an arrow key
    }

    if (e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior

      const focusableElements = Array.from(
        document.querySelectorAll("[data-focusable]")
      ).filter((el) => el.offsetParent !== null);
      const activeElement = document.activeElement;
      let currentIndex = focusableElements.indexOf(activeElement);
      if (currentIndex === -1 || currentIndex >= focusableElements.length - 1) {
        currentIndex = -1;
      }

      // ✅ If nothing is focused, focus the first element and return
      if (currentIndex === -1) {
        focusableElements[0].focus();
        return;
      }

      let nextIndex;
      if (e.shiftKey) {
        // Shift + Tab (reverse)
        nextIndex =
          (currentIndex - 1 + focusableElements.length) %
          focusableElements.length;
      } else {
        // Tab (forward)
        nextIndex = (currentIndex + 1) % focusableElements.length;
      }

      focusableElements[nextIndex].focus(); // Set focus to the next element
    }

    // ✅ Handle Enter key (completely separate block)
    if (e.key === "Enter" || e.keyCode === 13) {
      const focusableElements = Array.from(
        document.querySelectorAll("[data-focusable]")
      ).filter((el) => el.offsetParent !== null); // Only visible elements

      const activeElement = document.activeElement;

      // Case 1: If a focusable element is active, simulate click
      if (focusableElements.includes(activeElement)) {
        activeElement.click(); // Click on focused element
        return; // Stop here if something was clicked
      }

      // Case 2: Fallback logic (quiz logic)
      if (questionCounter >= questions.length) {
        $("#start").click(); // Simulate click on 'Start Over'
      } else {
        var options = $("input[name='answer']:checked");
        if (options.length === 0) {
          swal(
            "Please make a selection.",
            "Choose the best answer before continuing.",
            "warning"
          );
        } else {
          $("#next").click(); // Simulate click on 'Next'
        }
      }
    }

    // Get the key pressed (convert it to uppercase for consistency)
    var key = e.key.toUpperCase();

    // Only proceed if the key pressed is a letter between 'A' and 'Z'
    if (key >= "A" && key <= "Z") {
      // Calculate which option to select based on the key
      var optionIndex = key.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, etc.

      // Get all radio inputs for the current question
      var options = $("input[name='answer']");

      // Only select if the index is within the number of options
      if (optionIndex < options.length) {
        // Set the radio input as checked
        options.eq(optionIndex).prop("checked", true);

        // Update the selection for the current question
        selections[questionCounter] = optionIndex;
      }
    }

    if (e.key === " " || e.keyCode === 32) {
      // Dismiss the SweetAlert
      swal.close();
    }

    // Remove the focus from the currently focused element when any other key (except for Tab) is pressed
    if (e.key !== "Tab") {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.offsetParent !== null) {
        // Remove focus from the currently focused element
        focusedElement.blur();
      }
    }
  });

  // Displays next requested element
  function displayNext() {
    quiz.fadeOut(function () {
      $("#question").remove();

      if (questionCounter < questions.length) {
        var question = questions[questionCounter];

        // Show 'image' defined in question object
        if (typeof question.image !== "undefined") {
          $("#image img").attr("src", question.image);
          $("#image").show();
        } else {
          $("#image").hide();
        }

        if (typeof question.audio !== "undefined") {
          $("#audio").show();
          $("#audio audio").attr("src", "audio/" + question.audio);
          //$("#audio audio")[0].play();
        } else {
          $("#audio").hide();
          $("#audio audio").stop();
        }

        // Show 'content' defined in question object
        if (typeof question.content === "undefined") {
          $("#content").text(defaultQuestionContent);
        } else {
          $("#content").text(question.content);
        }

        // Show 'qType' defined in question object
        if (typeof question.qType === "undefined") {
          $("#qType").text(defaultQuestionContent);
        } else {
          $("#qType").text(question.qType);
        }

        var nextQuestion = createQuestionElement(questionCounter);
        quiz.append(nextQuestion).fadeIn();

        // Update the progress bar width and progress text
        var progress = (questionCounter / NumberOfQuestion) * 100; // Assuming there are 200 questions
        $("#progress-bar").css("width", progress + "%");
        $("#progress-text").text(progress.toFixed(2) + "%");

        if (!isNaN(selections[questionCounter])) {
          $("input[value=" + selections[questionCounter] + "]").prop(
            "checked",
            true
          );
        }

        // Controls display of 'prev' button
        if (questionCounter >= 1) {
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

        // Set progress to 100% when the quiz is complete
        $("#progress-bar").css("width", "100%");
        $("#progress-text").text("100%");
      }
    });
  }

  // Computes score and returns a paragraph element to be displayed
  function displayScore() {
    currentTime = 0; // Ensure timer is set to 0
    examEnded = true; // Mark the exam as ended
    questionCounter = NumberOfQuestion; //Sets the exam to the last question
    sessionStorage.removeItem("examStartTime"); // Removes the stored exam start time from session storage
    updateSessionStorage();

    // Update the timer display to show 0:00
    timerDisplay.text("00:00");

    // Call results generation
    generateResultsPage();

    var score = $("<p>", {
      id: "question",
    });

    var numCorrect = 0;
    for (var i = 0; i < Math.min(selections.length, questions.length); i++) {
      if (selections[i] === questions[i].correctAnswer) {
        numCorrect++;
      }
    }

    score.append(
      "You got " +
        numCorrect +
        " questions out of " +
        questions.length +
        " right."
    );
    return score;
  }

  function getScore() {
    let numCorrect = 0;

    for (let i = 0; i < selections.length; i++) {
      if (selections[i] === questions[i].correctAnswer) {
        numCorrect++;
      }
    }

    return numCorrect;
  }

  // Computes score and returns a paragraph element to be displayed

  function generateResultsPage() {
    // Calculate score

    const score = getScore();

    const totalQuestions = questions.length;

    // Start building HTML content

    let html = `

              <!DOCTYPE html>

              <html>

              <head>

                  <title>Quiz Results</title>

                  <style>

                    

                      body {

                            font-family: Arial, sans-serif;

                            margin: 0 auto;

                            padding: 20px;

                            max-width: 800px; /* Ensures a neat layout on standard screens */

                            background-color: #f4f7fa;

                        }

                        

                        /* Basic styling for the results page */

                        .results-page {

                           font-family: Arial, sans-serif;

                           margin: 20px;}

                              

                        .score {

                           font-size: 20px;

                           margin-bottom: 40px; /* space before the next page */

                        }

                        .score h1 {

                            font-family: 'Impact', sans-serif; 

                            font-size: 36px;  /* Adjust the size as needed */

                            font-weight: bold; /* Optional: Makes the text bold */

                            color: #333; /* Optional: Set a color for the text */

                            text-align: center; /* Centers the text */

                        }



                        .question {

                            margin-bottom: 30px;

                            padding: 15px;

                            background-color: #fff;

                            border: 1px solid #ddd;

                            border-radius: 10px;

                            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

                            display: block;

                            page-break-inside: avoid; /* Prevent page breaks inside the question */

                        }


                        .question h3 {

                            font-size: 20px;

                            color: #333;

                        }


                        .question p {

                            font-size: 16px;

                            color: #555;

                            line-height: 1.5;

                        }


                        /* General image styling for questions during the test and results page */

                        .question-image {

                          width: 100%; /* Adjust to the width of the container */

                          max-width: 300px; /* Set a max width to prevent overly large images */

                          height: auto; /* Maintain aspect ratio */

                          object-fit: cover; /* Ensure the image fills the area without distortion */

                          margin: 10px 0; /* Optional: Adds spacing around the image */

                        }


                        .choice {

                            padding: 10px;

                            margin: 5px 0;

                            border-radius: 5px;

                            background-color: #f8f9fa;

                            border: 1px solid #ddd;

                            display: flex;

                            align-items: center;

                            font-size: 16px;

                            color: #333;

                        }


                        .choice input {

                            margin-right: 10px;

                            transform: scale(1.2);

                        }


                        .correct {

                            background-color: #d4edda;

                            border: 2px solid #28a745;

                        }


                        .incorrect {

                            background-color: #f8d7da;

                            border: 2px solid #dc3545;

                        }


                        .explanation {

                            background-color: #f8f9fa;

                            border: 1px solid #e2e6ea;

                            padding: 10px;

                            margin-top: 10px;

                            font-size: 14px;

                            color: #444;

                            border-radius: 5px;

                            page-break-inside: avoid; /* Prevent page break inside the explanation */

                        }


                        .explanation strong {

                            font-weight: bold;

                        }

                        /* CSS to scale images to a fixed size */

                        .quiz-image {

                          width: 200px; /* You can adjust the width as needed */

                          height: auto; /* Automatically adjust the height to maintain the aspect ratio */

                          object-fit: cover; /* Ensure images fit within the box without distortion */

                          margin: 10px 0; /* Optional: Add some space around the image */

                        }

                        /* For print */

                        @media print {

                            body {

                                max-width: none; /* Make content stretch across the full page */

                                padding: 10px;

                            }


                            .quiz-image {

                                width: 100px; /* Set the width smaller for print */

                                height: auto;

                                object-fit: cover;

                            }


                            .question-image {

                                width: 100%; /* Resize for print */

                                max-width: 200px; /* Smaller size for print */

                                height: auto; /* Ensure aspect ratio is maintained */

                                object-fit: cover;

                                page-break-inside: avoid; /* Prevent page breaks inside the image */

                              }


                            /* Optional: You can also control the layout of other elements for print */

                            .question {

                                page-break-after: always; /* Ensure each question starts on a new page */

                              }

                      

                            .choices {

                                padding-left: 20px;

                            }


                            .choice {

                                font-size: 14px; /* Smaller font size for printing */

                                margin: 5px 0;

                            }


                            .explanation {

                                font-size: 12px; /* Smaller explanation text for print */

                                margin-top: 15px;

                            }


                            /* Optional: Remove background colors and shadows for printing */

                            .question, .choice, .explanation {

                                background-color: white;

                                box-shadow: none;

                            }


                             .score {

                                page-break-after: always; /* forces a page break after the score page */

                                font-weight: bold;

                                color: green;

                                font-size: 24px;

                              }


                              .score h1 {

                                font-family: 'Impact', sans-serif; 

                                font-size: 36px;  /* Adjust the size as needed */

                                font-weight: bold; /* Optional: Makes the text bold */

                                color: #333; /* Optional: Set a color for the text */

                                text-align: center; /* Centers the text */

                            }

                        }

                  </style>

              </head>

              <body>

                <div class="results-page">

                  <div class="score">

                    <h1>TOEIC 1 Test Results</h1>

                    You scored ${score} out of ${totalQuestions}

                  </div>

          `;

    // Generate results for each question

    questions.forEach((question, index) => {
      const userAnswer = selections[index];

      const isCorrect = userAnswer === question.correctAnswer;

      // Start question div

      html += `

                  <div class="question">

                      <h3>Question ${index + 1}: ${
        question.qType || "Question"
      }</h3>

                      <p>${question.question}</p>

              `;

      // Add image if exists

      if (question.image) {
        html += `<img src="${question.image}" alt="Question Image" class="question-image">`;
      }

      // Add audio if exists

      if (question.audio) {
        html += `

                      <audio controls>

                          <source src="audio/${question.audio}" type="audio/mpeg">

                          Your browser does not support the audio element.

                      </audio>

                  `;
      }

      // Generate choices

      html += `<div class="choices">`;

      question.choices.forEach((choice, choiceIndex) => {
        let choiceClass = "";

        if (choiceIndex === question.correctAnswer) {
          choiceClass = "correct"; // Always highlight correct answer in green
        }

        if (choiceIndex === userAnswer) {
          choiceClass += isCorrect ? " correct" : " incorrect";
        }

        html += `

                      <div class="choice ${choiceClass}">

                          ${choice}

                      </div>

                  `;
      });

      html += `</div>`;

      // Add explanation if the answer was incorrect

      if (question.explanation) {
        html += `

                      <div class="explanation">

                          <strong>Explanation:</strong> ${question.explanation}

                      </div>

                  `;
      }

      html += `</div>`; // Close question div
    });

    // Close HTML

    html += `

              <div style="text-align: center; margin-top: 20px;">

                  <button onclick="window.print()">Print Results</button>

              </div>

              </body>

              </html>

          `;

    // Open results in a new window

    const resultsWindow = window.open("", "_blank");

    resultsWindow.document.write(html);

    resultsWindow.document.close();
  }
})();
