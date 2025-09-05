const { z } = require('zod');

const { DocumentReference } = require('firebase-admin/firestore');

// const userRef = z.instanceof(DocumentReference);
const userRef = z.union([
  z.instanceof(DocumentReference),
  z.string().regex(/^.+\/.+$/, "userRef must be a Firestore path")
]);


const CreateUserSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.string(),
  warehouseId: z.string().min(1),
  // userInfo: firestoreRef
});

const UpdateUserSchema = z.object({
  phoneNumber: z.string().min(10).max(15).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.string().optional()
});

module.exports = {
    userRef,
    CreateUserSchema,
    UpdateUserSchema
}