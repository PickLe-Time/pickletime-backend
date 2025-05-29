import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

// Update Session
const updateSessionSchema = z.object({
  creationDate: z.date().optional(),
  startTime: z.date(),
  endTime: z.date(),
  userId: z.string().optional(),
});

// Export schemas as Jsons
// Returns all the schemas to register and a ref to refer these schemas
export const { schemas: sessionSchemas, $ref } = buildJsonSchemas({
  updateSessionSchema,
}, { $id: 'sessionSchemas' });
