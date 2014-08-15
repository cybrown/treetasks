/* global Set */

var ArraySet = module.exports = function () {
    Set.apply(this, arguments);
    this._array = null;
};
ArraySet.prototype = Object.create(Set.prototype);

ArraySet.prototype.add = function () {
    this._array = null;
    return Set.prototype.add.apply(this, arguments);
};

ArraySet.prototype.clear = function () {
    this._array = null;
    return Set.prototype.clear.apply(this, arguments);
};

ArraySet.prototype.delete = function () {
    this._array = null;
    return Set.prototype.delete.apply(this, arguments);
};

ArraySet.prototype.toArray = function () {
    var _this = this;
    if (!this._array) {
        this._array = [];
        this.forEach(function (item) {
            _this._array.push(item);
        });
    }
    return this._array;
};
