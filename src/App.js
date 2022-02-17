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

const BUTTONS = [
  [{ text: 'Q' }, { text: 'W' }, { text: 'E' }, { text: 'R' }, { text: 'T' }, { text: 'Y' }, { text: 'U' }, { text: 'I' }, { text: 'O' }, { text: 'P' },],
  [{ text: 'A' }, { text: 'S' }, { text: 'D' }, { text: 'F' }, { text: 'G' }, { text: 'H' }, { text: 'J' }, { text: 'K' }, { text: 'L' },],
  [{ text: 'Enter' }, { text: 'Z' }, { text: 'X' }, { text: 'C' }, { text: 'V' }, { text: 'B' }, { text: 'N' }, { text: 'M' }, { text: 'Del' },],
];

const MAX_CHARS = 5;
const MAX_ATTEMPTS = 5;

const App = ({ signOut, user }) => {
  const [attempt, setAttempt] = useState(0);
  const [position, setPosition] = useState(0);
  const [guesses, setGuesses] = useState(INITIAL_GUESSES);
  const [gameDataLoaded, setGameDataLoaded] = useState(false);
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    if (!gameDataLoaded) {
      rustyWordletApi.getCurrentGame('1').then(data => {
        console.log('received data', data);
        if (data.guesses && data.guesses.length) {
          let localGuesses = [...guesses];
          data.guesses.forEach((guess, rowIndex) => {
            let len = guess.length;
            let localGuess = localGuesses[rowIndex];
            for (let i = 0; i < len; i++) {
              localGuess[i].letter = guess.charAt(i).toUpperCase();
            }
          });
          setGuesses(localGuesses);
          setAttempt(data.guesses.length);
        }
      });
      setGameDataLoaded(true);
    }
  }, [guesses, gameDataLoaded]);

  function handleClick(letter) {
    console.log('position', position);
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
      rustyWordletApi.checkGuess('1', guess).then(data => {
        console.log('checkGuess:data', data);
        setGameStatus(data.status);
        if (data.status === 'Invalid') {
          processInvalidGuess();
        } else if (data.status === 'PlayerWon') {
          processPlayerWon();
        } else if (data.status === 'GameOver') {
          processGameOver();
        } else if (data.status === 'Evaluated') {
          processEvaluatedGuess(data);
        }
      });
    }
  }

  function processInvalidGuess() {
    let localGuesses = [...guesses];
    localGuesses[attempt].forEach(guessItem => {
      guessItem.status = CELL_STATUS.Invalid;
    });
    setGuesses(localGuesses);
  }

  function processPlayerWon() {
    let localGuesses = [...guesses];
    localGuesses[attempt].forEach(guessItem => {
      guessItem.status = CELL_STATUS.PresentAtCorrectPlace;
    });
    setGuesses(localGuesses);
  }

  function processGameOver() {

  }

  function processEvaluatedGuess(data) {
    let localGuesses = [...guesses];
    data.place_matches.forEach(placeMatch => {
      localGuesses[attempt][placeMatch.index].status = CELL_STATUS[placeMatch.status];
    });
    setGuesses(localGuesses);
    setAttempt(attempt + 1);
    setPosition(0);
  }

  function deleteLetter() {
    if (position > 0) {
      let localGuesses = [...guesses];
      let row = localGuesses[attempt];
      let newPosition = position - 1;
      console.log('newPosition', newPosition);
      row[newPosition].letter = EMPTY_CELL;
      localGuesses[attempt].forEach(item => item.status = CELL_STATUS.InitialEmpty);
      setGuesses(localGuesses);
      setPosition(newPosition);
      setGameStatus('ToBeEvualted');
    }
  }

  function addLetter(letter) {
    if (position < MAX_CHARS) {
      let localGuesses = [...guesses];
      let row = localGuesses[attempt];
      let newPosition = position + 1;
      console.log('newPosition', newPosition);
      row[position].letter = letter;
      setGuesses(localGuesses);
      setPosition(newPosition);
    }
  }

  function newGameHandler() {
    rustyWordletApi.newGame('1').then(data => {
      console.log('newGame', data);
      let localGuesses = [...INITIAL_GUESSES];
      setGuesses(localGuesses);
      setPosition(0);
      setAttempt(0);
      setGameStatus('ToBeEvualted');
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
      <div style={styles.newGameLine}>
        <button onClick={newGameHandler}>New Game</button>
      </div>
      <div style={styles.divider}></div>
      {guesses.map((row, rowIndex) => (
        <div key={'guesses_' + rowIndex} style={styles.displayGrid}>
          {row.map((item, itemIndex) => (
            <input key={'item_' + itemIndex} size={1} maxLength={1} readOnly disabled value={item.letter} style={styles[item.status.style]}></input>
          ))}
        </div>
      ))}
      {gameStatus === 'GameOver' && (
        <div><span style={styles.gameOver}>Game Over</span></div>
      )}
      {gameStatus === 'PlayerWon' && (
        <div><span style={styles.playerWon}>You Won</span></div>
      )}
      <div style={styles.divider}></div>
      {BUTTONS.map((buttonRow, rowIndex) => (
        <div key={'buttonRow_' + rowIndex} style={styles.buttonsGrid}>
          {buttonRow.map((button, buttonIndex) => (
            <button key={'button_' + buttonIndex} onClick={e => handleClick(button.text)}>{button.text}</button>
          ))}
        </div>
      ))}
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
  initialEmpty: { backgroundColor: '#ffffff' },
  presentInPlace: { backgroundColor: '#A0FFA0' },
  presentNotInPlace: { backgroundColor: '#edd92b' },
  notPresent: { backgroundColor: '#c2c2c0' },
  invalid: { backgroundColor: '#FFA0A0' },
  divider: { minHeight: '20px' },
  gameOver: { color: 'red' },
  playerWon: { color: 'green' },
};

export default withAuthenticator(App);