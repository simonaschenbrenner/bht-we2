// React
import React from "react";
import ReactDOM from "react-dom";
import App from './react/App';
// Redux
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from "./modules/RootReducer";
import thunk from "redux-thunk";

// Bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
const initialState = {}
const middlewares = [thunk];
const store = createStore(rootReducer, initialState, applyMiddleware(...middlewares))

ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//
// import reportWebVitals from '../tests/reportWebVitals';
// reportWebVitals();
