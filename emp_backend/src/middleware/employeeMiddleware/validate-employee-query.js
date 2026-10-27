const { z } = require("zod");

const pageQuery = z.preprocess(
  (value) => (value === undefined ? "1" : value),
  z
    .string()
    .regex(/^\d+$/, "Page must be a positive whole number")
    .transform(Number)
    .pipe(z.number().int().min(1))
);

const limitQuery = z.preprocess(
  (value) => (value === undefined ? "10" : value),
  z
    .string()
    .regex(/^-?\d+$/, "Limit must be a whole number")
    .transform(Number)
    .pipe(
      z.union([
        z.literal(-1),
        z.number().int().min(1).max(100),
      ])
    )
);

const optionalTextQuery = z.preprocess(
    (value) => {
        if (typeof value === "string" && value.trim() === "") {
            return undefined;
        }

        return value;
    },
    z.string().trim().min(1).max(100).optional()
);

const employeeQuerySchema = z
    .object({
        page: pageQuery,
        limit: limitQuery,
        department: optionalTextQuery,
        search: optionalTextQuery,

        sortBy: z
      .enum(["name", "email", "department", "salary", "createdAt"])
      .default("createdAt"),

    sortOrder: z
      .enum(["asc", "desc"])
      .default("desc"),
    })
    .strict();

const validateEmployeeQuery = (req, res, next) => {
    const result = employeeQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid query parameters",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    // Store the parsed, validated values separately.
    req.employeeQuery = result.data;

    next();
};

module.exports = validateEmployeeQuery;