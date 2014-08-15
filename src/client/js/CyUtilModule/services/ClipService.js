var ClipService = module.exports = function () {
    this.data = null;
    this.type = null;
};

ClipService.prototype.hasData = function (type) {
    return this.type === type;
};

ClipService.prototype.setData = function (data, type) {
    this.type = type;
    this.data = data;
};

ClipService.prototype.getData = function () {
    return this.data;
};

ClipService.prototype.clear = function () {
    this.data = null;
    this.type = null;
};
