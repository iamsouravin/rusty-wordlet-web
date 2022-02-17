import React, { useState, useEffect } from 'react';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import rustyWordletApi from './model/api';

const EMPTY_CELL = ' ';
const CELL_STATUS = {
  Invalid: { serverStatus: 'Invalid', style: 'invalid' },
  NotPresent: { serverStatus: 'NotPresent', style: 'notPresent' },
  PresentAtIncorrectPlace: { serverStatus: 'PresentAtIncorrectPlace', style: 'presentNotInPlace' },
  PresentAtCorrectPlace: { serverStatus: 'PresentAtCorrectPlace', style: 'presentInPlace' },
  InitialEmpty: { serverStatus: 'InitialEmpty', style: 'initialEmpty' },
};
const INITIAL_GUESSES = [
  [{ letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }],
  [{ letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }],
  [{ letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }],
  [{ letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }],
  [{ letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }, { letter: EMPTY_CELL, status: CELL_STATUS.InitialEmpty }],
];

const GAME_STATUS = {
  Invalid: 'Invalid',
  PlayerWon: 'PlayerWon',
  GameOver: 'GameOver',
  Evaluated: 'Evaluated',
  ToBeEvaluated: 'ToBeEvaluated',
}

const BUTTONS = [
  [{ text: 'Q' }, { text: 'W' }, { text: 'E' }, { text: 'R' }, { text: 'T' }, { text: 'Y' }, { text: 'U' }, { text: 'I' }, { text: 'O' }, { text: 'P' },],
  [{ text: 'A' }, { text: 'S' }, { text: 'D' }, { text: 'F' }, { text: 'G' }, { text: 'H' }, { text: 'J' }, { text: 'K' }, { text: 'L' },],
  [{ text: 'Enter' }, { text: 'Z' }, { text: 'X' }, { text: 'C' }, { text: 'V' }, { text: 'B' }, { text: 'N' }, { text: 'M' }, { text: 'Del' },],
];

const MAX_CHARS = 5;
const MAX_ATTEMPTS = 5;

function clone_guesses(guesses) {
  return JSON.parse(JSON.stringify(guesses));
}

const App = ({ signOut, user }) => {
  const [attempt, setAttempt] = useState(0);
  const [position, setPosition] = useState(0);
  const [guesses, setGuesses] = useState(clone_guesses(INITIAL_GUESSES));
  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [gameExists, setGameExists] = useState(false);
  const [word, setWord] = useState('');

  useEffect(() => {
    if (!gameDataLoaded) {
      rustyWordletApi.getCurrentGame(user.username).then(data => {
        console.log('received data', data);
        if (data.guesses && data.guesses.length) {
          let localGuesses = clone_guesses(INITIAL_GUESSES);
          data.guesses.forEach((guess, rowIndex) => {
            guess.forEach(guessed_letter => {
              let cell = localGuesses[rowIndex][guessed_letter.index];
              cell.letter = guessed_letter.letter.toUpperCase();
              cell.status = CELL_STATUS[guessed_letter.status];
            });
          });
          setWord(data.word.toUpperCase());
          setGameExists(true);
          setGuesses(localGuesses);
          setAttempt(data.guesses.length);
          if (data.guesses.length === MAX_ATTEMPTS) {
            setGameStatus(GAME_STATUS.GameOver);
          } else if (localGuesses[data.guesses.length - 1].every(cell => cell.status === CELL_STATUS.PresentAtCorrectPlace)) {
            setGameStatus(GAME_STATUS.PlayerWon);
          } else {
            setGameStatus(GAME_STATUS.ToBeEvaluated);
          }
        } else if (data.guesses.length === 0) {
          setGameExists(true);
          setGuesses(clone_guesses(INITIAL_GUESSES));
          setAttempt(data.guesses.length);
          setGameStatus(GAME_STATUS.ToBeEvaluated);
        }
      }).catch(err => {
        setWord('');
        setGameExists(false);
        setGuesses(clone_guesses(INITIAL_GUESSES));
        setAttempt(0);
        setGameStatus(GAME_STATUS.ToBeEvaluated);
      });
      setGameDataLoaded(true);
    }
  }, [guesses, gameDataLoaded, user.username]);

  function handleClick(letter) {
    if (letter === 'Enter') {
      checkGuess();
    } else if (letter === 'Del') {
      deleteLetter();
    } else {
      addLetter(letter);
    }
  }

  function checkGuess() {
    if (attempt < MAX_ATTEMPTS && position === MAX_CHARS) {
      let guess = guesses[attempt].map(guessItem => guessItem.letter.toLowerCase()).join('');
      rustyWordletApi.checkGuess(user.username, guess).then(data => {
        console.log('checkGuess:data', data);
        setGameStatus(data.status);
        if (data.status === GAME_STATUS.Invalid) {
          processInvalidGuess();
        } else if (data.status === GAME_STATUS.PlayerWon) {
          processPlayerWon();
        } else if (data.status === GAME_STATUS.GameOver) {
          processGameOver(data);
        } else if (data.status === GAME_STATUS.Evaluated) {
          processEvaluatedGuess(data);
        }
      });
    }
  }

  function processInvalidGuess() {
    let localGuesses = clone_guesses(guesses);
    localGuesses[attempt].forEach(guessItem => {
      guessItem.status = CELL_STATUS.Invalid;
    });
    setGuesses(localGuesses);
  }

  function processPlayerWon() {
    let localGuesses = clone_guesses(guesses);
    localGuesses[attempt].forEach(guessItem => {
      guessItem.status = CELL_STATUS.PresentAtCorrectPlace;
    });
    setGuesses(localGuesses);
  }

  function processGameOver(data) {
    let localGuesses = clone_guesses(guesses);
    data.place_matches.forEach(placeMatch => {
      localGuesses[attempt][placeMatch.index].status = CELL_STATUS[placeMatch.status];
    });
    setGuesses(localGuesses);
  }

  function processEvaluatedGuess(data) {
    let localGuesses = clone_guesses(guesses);
    data.place_matches.forEach(placeMatch => {
      localGuesses[attempt][placeMatch.index].status = CELL_STATUS[placeMatch.status];
    });
    setGuesses(localGuesses);
    setAttempt(attempt + 1);
    setPosition(0);
  }

  function deleteLetter() {
    if (position > 0) {
      let localGuesses = clone_guesses(guesses);
      let row = localGuesses[attempt];
      let newPosition = position - 1;
      row[newPosition].letter = EMPTY_CELL;
      localGuesses[attempt].forEach(item => item.status = CELL_STATUS.InitialEmpty);
      setGuesses(localGuesses);
      setPosition(newPosition);
      setGameStatus('ToBeEvualted');
    }
  }

  function addLetter(letter) {
    if (position < MAX_CHARS) {
      let localGuesses = clone_guesses(guesses);
      let row = localGuesses[attempt];
      let newPosition = position + 1;
      row[position].letter = letter;
      setGuesses(localGuesses);
      setPosition(newPosition);
    }
  }

  function newGameHandler() {
    rustyWordletApi.newGame(user.username).then(data => {
      console.log('newGame', data);
      let localGuesses = clone_guesses(INITIAL_GUESSES);
      setWord(data.word.toUpperCase());
      setGameExists(true);
      setGuesses(localGuesses);
      setPosition(0);
      setAttempt(0);
      setGameStatus(GAME_STATUS.ToBeEvaluated);
    });
  }

  return (
    <div style={styles.board}>
      <div style={styles.boardTitle}>
        <h2>Rusty Wordlet</h2>
      </div>
      <div style={styles.userLine}>
        <span style={styles.userEmail}>Hello {user.attributes.email} &nbsp;</span>
        <button onClick={signOut}>Sign out</button>
      </div>
      <div style={styles.divider}></div>
      <div style={styles.newGameLine}>
        <button onClick={newGameHandler} style={styles.newGameButton}>New Game</button>
      </div>
      <div style={styles.divider}></div>
      {gameExists && (
        <>
          {guesses.map((row, rowIndex) => (
            <div key={'guesses_' + rowIndex} style={styles.displayGrid}>
              {row.map((item, itemIndex) => (
                <input key={'item_' + itemIndex} size={1} maxLength={1} readOnly disabled value={item.letter} style={styles[item.status.style]}></input>
              ))}
            </div>
          ))}
          {gameStatus === GAME_STATUS.GameOver && (
            <>
              <div style={styles.gameStatusLine}><span style={styles.gameOver}>Game Over</span></div>
              <div style={styles.gameStatusLine}><span style={styles.gameOver}>Chosen Word: {word}</span></div>
            </>
          )}
          {gameStatus === GAME_STATUS.PlayerWon && (
            <div style={styles.gameStatusLine}><span style={styles.playerWon}>You Won</span></div>
          )}
          {gameStatus !== GAME_STATUS.GameOver && gameStatus !== GAME_STATUS.PlayerWon &&
            (
              <>
                <div style={styles.divider}></div>
                {BUTTONS.map((buttonRow, rowIndex) => (
                  <div key={'buttonRow_' + rowIndex} style={styles.buttonsGrid}>
                    {buttonRow.map((button, buttonIndex) => (
                      <button key={'button_' + buttonIndex} onClick={e => handleClick(button.text)}>{button.text}</button>
                    ))}
                  </div>
                ))}
              </>
            )
          }
        </>
      )}
    </div>
  );
};

const styles = {
  center_align: { margin: 'auto' },
  board: { margin: 'auto', width: '400px' },
  boardTitle: { margin: 'auto', width: '160px', textAlign: 'center' },
  userLine: { margin: 'auto', width: '390px', textAlign: 'center' },
  newGameLine: { margin: 'auto', width: '390px', textAlign: 'center' },
  userEmail: { fontWeight: 'bold', fontSize: '12px' },
  displayGrid: { margin: 'auto', width: '200px', textAlign: 'center' },
  buttonsGrid: { margin: 'auto', width: '300px', textAlign: 'center' },
  initialEmpty: { backgroundColor: '#ffffff', textAlign: 'center' },
  presentInPlace: { backgroundColor: '#A0FFA0', textAlign: 'center' },
  presentNotInPlace: { backgroundColor: '#edd92b', textAlign: 'center' },
  notPresent: { backgroundColor: '#c2c2c0', textAlign: 'center' },
  invalid: { backgroundColor: '#FFA0A0', textAlign: 'center' },
  divider: { minHeight: '20px' },
  gameOver: { color: 'red' },
  playerWon: { color: 'green' },
  gameStatusLine: { margin: 'auto', width: '160px', textAlign: 'center' },
  newGameButton: {},
};

export default withAuthenticator(App);