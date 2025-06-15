import { useState } from "react";
import { decode } from "he";
import { clsx } from "clsx";
import "./App.css";

const numQuestions = 5;

const BASE_URL = `https://opentdb.com/api.php?amount=${numQuestions}`;

function App() {
  const [quizQuest, setQuizQuest] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStart, setGameStart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  function startGame() {
    setGameStart(true);
    getData();
  }

  function resetGame() {
    setShowResults(false);
    setCorrectAnswers(0);
    setQuizQuest([]);
    setGameStart(false);
  }

  function handleCheckAnswers() {
    const allAnswered = quizQuest.every((q) => q.selected_answer);

    setCorrectAnswers(
      quizQuest
        .map((q) => q.selected_answer === q.correct_answer)
        .filter((ans) => ans === true).length
    );

    console.log(correctAnswers);

    if (!allAnswered) {
      alert("Please answer all questions before checking.");
      return;
    } else {
      setShowResults(true);
    }
  }

  function handleChange(questionIndex, answer) {
    setQuizQuest((prevQuiz) =>
      prevQuiz.map((question, index) => {
        if (index === questionIndex) {
          return {
            ...question,
            selected_answer: answer,
          };
        } else {
          return question;
        }
      })
    );
  }

  async function getData() {
    setIsLoading(true);
    const res = await fetch(BASE_URL);
    const data = await res.json();

    const quizArr = data.results.map((question) => {
      const arr = [decode(question.correct_answer)];
      question.incorrect_answers.forEach((answer) => arr.push(decode(answer)));
      const shuffledArr = shuffle(arr);
      return {
        question: decode(question.question),
        answers: shuffledArr,
        correct_answer: decode(question.correct_answer),
        selected_answer: null,
      };
    });

    setQuizQuest(quizArr);
    setIsLoading(false);
  }

  const renderQuestions = quizQuest.map((question, index) => (
    <div className="question-card" key={index}>
      <div className="question">{question.question}</div>
      <div className="answers">
        {question.answers.map((answer, i) => (
          <div className="answer" key={i}>
            <input
              id={answer + i}
              name={question.question}
              type="radio"
              disabled={showResults}
              checked={question.selected_answer === answer}
              onChange={() => handleChange(index, answer)}
            />
            <label
              htmlFor={answer + i}
              className={clsx(
                {
                  correct: showResults && answer === question.correct_answer,
                  wrong:
                    showResults &&
                    answer === question.selected_answer &&
                    answer !== question.correct_answer,
                },
                "answerLabel"
              )}
            >
              {answer}
            </label>
          </div>
        ))}
      </div>
    </div>
  ));

  return (
    <div className="questions">
      {gameStart ? (
        isLoading ? (
          <h2>Questions Loading...</h2>
        ) : (
          renderQuestions
        )
      ) : (
        <div className="start-screen">
          <h1>Quizzical</h1>
          <p>Do you have all the answers to our questions?</p>
          <button onClick={startGame}>Start Quiz</button>
        </div>
      )}
      {showResults ? (
        <div className="reset-game">
          <p>
            You scored {correctAnswers}/{numQuestions} correct answers
          </p>{" "}
          <button className="ingame-btn" onClick={resetGame}>
            Play again
          </button>
        </div>
      ) : (
        gameStart && (
          <button className="ingame-btn" onClick={handleCheckAnswers}>
            Check answers
          </button>
        )
      )}
    </div>
  );
}

export default App;
