import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Amplify from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure({
  ...awsExports,
  API: {
    endpoints: [
      {
        name: "rustyWordletAPI",
        endpoint: "https://c9l95u1v26.execute-api.ap-south-1.amazonaws.com/dev"
      },
    ]
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
