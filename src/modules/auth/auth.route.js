import {
  handleLogin,
  handleLogout,
  handleGoogleLogin,
  handleRefresh,
} from './auth.controller.js';
import { $ref } from './auth.schema.js';

export async function authRoutes(app) {
  // Login
  app.post(
    '/login',
    {
      schema: {
        body: $ref('loginSchema'),
        response: {
          201: $ref('loginResponseSchema'),
        },
      },
    },
    handleLogin,
  );

  // Logout. Login required.
  app.delete('/logout', handleLogout);

  // Login/Register with Google
  app.post(
    '/google',
    {
      schema: {
        response: {
          201: $ref('loginResponseSchema'),
        },
      },
    },
    handleGoogleLogin,
  );

  //  Gives new access token if refresh token is still valid
  app.post(
    '/refresh',
    handleRefresh,
  );

  app.log.info('Auth routes registered');
}
