import {
  handleCreateUser, handleGetUsers, handleGetUserByID,
  handleGetSessionsByUser, handlePostSessionsByUser,
  handleUpdateUser, handlePatchUserByID, handleDeleteUser,
  handleGetSettingByUsername, handleUpdateSettingByUsername,
} from './user.controller.js';
import { $ref } from './user.schema.js';

export async function userRoutes(app) {
  // Get all users at /api/users. Requires authentication of logged in user
  app.get(
    '/',
    {
      preHandler: [app.verifyJWT],
    },
    handleGetUsers,
  );
  // Register new user
  app.post(
    '/',
    {
      schema: {
        body: $ref('createUserSchema'),
        response: {
          201: $ref('createUserResponseSchema'),
        },
      },
    },
    handleCreateUser,
  );
  // Get user by id at /api/users/:id. Requires auth
  app.get(
    '/:id',
    {
      preHandler: [app.verifyJWT],
    },
    handleGetUserByID,
  );
  // Update user by id at Put /api/users/:id. Requires auth
  app.put(
    '/:id',
    {
      preHandler: [app.verifyJWT],
      schema: {
        body: $ref('updateUserSchema'),
      },
    },
    handleUpdateUser,
  );
  // Patch user by id at Put /api/users/:id. Uses optional values Requires auth
  app.patch(
    '/:id',
    {
      preHandler: [app.verifyJWT],
      schema: {
        body: $ref('patchUserByIDSchema'),
      },
    },
    handlePatchUserByID,
  );
  // Delete a user given id at /api/users/:id. Requires auth
  app.delete(
    '/:id',
    {
      preHandler: [app.verifyJWT],
    },
    handleDeleteUser,
  );

  // Get all sessions at /api/users/:id/sessions. Requires auth
  app.get(
    '/:id/sessions',
    {
      preHandler: [app.verifyJWT],
    },
    handleGetSessionsByUser,
  );
  // Create new session at /api/users/:id/sessions/. Requires auth
  app.post(
    '/:id/sessions',
    {
      preHandler: [app.verifyJWT],
      schema: {
        body: $ref('createSessionSchema'),
      },
    },
    handlePostSessionsByUser,
  );

  // Get settings at /api/users/:username/settings.
  app.get(
    '/:username/settings',
    handleGetSettingByUsername,
  );
  // Update user settings by username at Put /api/users/:username/settings. Requires auth
  app.put(
    '/:username/settings',
    {
      preHandler: [app.verifyJWT],
      schema: {
        body: $ref('updateUserSettingsSchema'),
      },
    },
    handleUpdateSettingByUsername,
  );

  app.log.info('User routes registered');
}
