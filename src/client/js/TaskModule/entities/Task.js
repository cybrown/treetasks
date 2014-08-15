var ArraySet = require('../../util/ArraySet');

var Task = module.exports = function () {
    this.id = 0;
    this._syncStatus = 0;

    this.description = '';
    this.done = false;
    this.parent = null;
    this.children = new ArraySet();
};
