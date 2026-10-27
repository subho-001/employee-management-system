// coverts errors into consistents JSON responses.

const errorHandler = (err, req, res, next) => {
    //if the response is already started, delegate the error.
    if (res.headersSent) {
        return next(err);
    }

    //set default status and message.
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    // Handle known Mongoose errors.
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this value already exists";
    }

    // Hide unexpected server-error details in production.
    if (statusCode >= 500 && process.env.NODE_ENV === "production") {
        message = "Internal server error";
    }

    // Log errors during development.
    if(process.env.NODE_ENV === "production") {
        cosnole.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
    })
}

module.exports = errorHandler;