import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemedSuspense from '../components/ThemedSuspense';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    return <ThemedSuspense />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
