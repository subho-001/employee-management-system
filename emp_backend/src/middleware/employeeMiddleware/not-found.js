// handle requests to roues that don't exist

const notFound = (req, res, next)=> {
    const error = new Error(`Request not found ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;

    next(error);
}

module.exports = notFound;

//if someone request a url which I haven't implemented such as /api/employee/abc , it will passes to 404 error to our central error handler.