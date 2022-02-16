import React, { useState } from 'react';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const EMPTY_CELL = ' ';
const INITIAL_GUESSES = [
  [{ letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }],
  [{ letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }],
  [{ letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }],
  [{ letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }],
  [{ letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }, { letter: EMPTY_CELL, status: 'initialEmpty' }],
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
      setAttempt(attempt + 1);
      setPosition(0);
    }
  }

  function deleteLetter() {
    if (position > 0) {
      let localGuesses = [...guesses];
      let row = localGuesses[attempt];
      let newPosition = position - 1;
      console.log('newPosition', newPosition);
      row[newPosition].letter = EMPTY_CELL;
      setGuesses(localGuesses);
      setPosition(newPosition);
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

  console.log('user object', user);

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
      {guesses.map((row, rowIndex) => (
        <div key={'guesses_' + rowIndex} style={styles.displayGrid}>
          {row.map((item, itemIndex) => (
            <input key={'item_' + itemIndex} size={1} maxLength={1} readOnly disabled value={item.letter} style={styles[item.status]}></input>
          ))}
        </div>
      ))}
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
  userEmail: { fontWeight: 'bold', fontSize: '12px' },
  displayGrid: { margin: 'auto', width: '200px', textAlign: 'center' },
  buttonsGrid: { margin: 'auto', width: '300px', textAlign: 'center' },
  initialEmpty: { backgroundColor: '#ffffff' },
  presentInPlace: { backgroundColor: '#A0FFA0' },
  presentNotInPlace: { backgroundColor: '#edd92b' },
  absent: { backgroundColor: '#c2c2c0' },
  invalid: { backgroundColor: '#FFA0A0' },
  divider: { minHeight: '20px' },
};

export default withAuthenticator(App);