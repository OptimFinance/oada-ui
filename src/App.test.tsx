/**
 * App Component Tests
 * 
 * This module contains tests for the main App component of the application.
 * It verifies that the App component renders correctly within the Redux store context
 * and checks for the presence of expected UI elements.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

/**
 * Basic render test for the App component
 * 
 * This test verifies that:
 * 1. The App component renders without crashing
 * 2. The component is properly wrapped in the Redux Provider
 * 3. The component contains expected text content
 */
test('renders learn react link', () => {
  const { getByText } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(getByText(/learn/i)).toBeInTheDocument();
});
