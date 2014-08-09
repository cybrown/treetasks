var TaskNotFoundError = module.exports = function () {
    Error.apply(this, arguments);
    this.statusCode = 404;
};
TaskNotFoundError.prototype = Object.create(Error.prototype);
