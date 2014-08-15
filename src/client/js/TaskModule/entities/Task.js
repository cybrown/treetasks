var ArraySet = require('../../util/ArraySet');

var Task = module.exports = function () {
    this.id = 0;
    this._syncStatus = 0;

    this.description = '';
    this._done = false;
    this.favorite = false;
    this.postrequisites = new ArraySet();
    this.prerequisites = new ArraySet();
};

Object.defineProperty(Task.prototype, 'done', {
    get: function () {
        return this._done;
    },
    set: function (value) {
        var ok = true;
        if (value) {
            this.prerequisites.forEach(function (task) {
                ok = ok && task.done;
            });
        } else {
            this.postrequisites.forEach(function (task) {
                ok = ok && !task.done;
            });
        }
        if (ok) {
            this._done = value;
        }
    }
});
