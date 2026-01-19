import './axios-override';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import configureStore from './redux/store';
import { AppTrends } from './pages/App';
import './index.css';

export const store = configureStore();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <AppTrends />
  </Provider>,
);
