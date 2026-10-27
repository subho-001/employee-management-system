const Employee = require('../../models/employeeModel/employee.model');
const mongoose = require('mongoose');

const getEmployees = async (req, res, next) => {
    try {
        const { page, limit, department, search, sortBy, sortOrder } = req.employeeQuery;

        const direction = sortOrder === "asc" ? 1 : -1;

        // Use _id as a secondary sort key to make ties more predictable.
        const sort = {
            [sortBy]: direction,
            ...(sortBy !== "_id" ? { _id: direction } : {}),
        };

        const filter = {};

        // Keep your existing department and search filter construction here.

        const isAll = limit === -1;

        const [total, employees] = await Promise.all([
            Employee.countDocuments(filter),

            isAll
                ? Employee.find(filter).sort(sort)
                : Employee.find(filter)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit),
        ]);

        const effectiveLimit = isAll ? total : limit;
        const totalPages = isAll ? (total > 0 ? 1 : 0) : Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            count: employees.length,
            pagination: {
                page: isAll ? 1 : page,
                limit,
                total,
                totalPages,
            },
            data: employees,
        });
    } catch (error) {
        next(error);
    }
};

const createEmployee = async (req, res, next) => {
    try {

        const employee = await Employee.create({
            ...req.body,
            createdBy: req.user.id,
            updatedBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        })

    } catch (error) {
        next(error);
    }
}


const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        // Remove audit fields supplied by the client.
        const { createdBy, updatedBy, ...allowedUpdates } = req.body;

        const employee = await Employee.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...allowedUpdates,
                    updatedBy: req.user.id,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        next(error);
    }
};


const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Employee Id"
            })
        }

        const employee = await Employee.findByIdAndDelete(id)

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee Not Found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Employee Deleted Successfully",
            data: {
                id: employee._id,
            },
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
}