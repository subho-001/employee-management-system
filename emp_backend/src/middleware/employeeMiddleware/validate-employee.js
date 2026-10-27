const { z } = require("zod");

const employeeInputSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    department: z.string().trim().min(1).max(100),
    salary: z.number().finite().min(0),
}).strict();

const validateCreateEmployee = (req, res, next) => {
    const result = employeeInputSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid employee data",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),

        })
    }

    req.body = result.data;

    next();
}

module.exports = validateCreateEmployee;