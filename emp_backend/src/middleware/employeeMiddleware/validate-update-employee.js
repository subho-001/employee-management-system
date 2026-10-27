const { z } = require("zod");

const updateEmployeeSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),

    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase())
      .optional(),

    department: z.string().trim().min(1).max(100).optional(),

    salary: z.number().finite().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const validateUpdateEmployee = (req, res, next) => {
  const result = updateEmployeeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee update data",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.body = result.data;
  next();
};

module.exports = validateUpdateEmployee;