function AttributeControl(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('Control');
    this.defaultValue;

    //set instantiation args, must be last
    _.extend(this, args);


    this.on(this.handlers);
};

AttributeControl.prototype.create = function () {
//abstract method
};
AttributeControl.prototype.createGridColumns = function () {
//abstract method
};
AttributeControl.prototype.createGridListeners = function () {
//abstract method
};
AttributeControl.prototype.getNormalizedValue = function () {
//abstract method
};
AttributeControl.prototype.updateLegend = function (items) {
//abstract method
};

AttributeControl.prototype._interpolate = function (pBegin, pEnd, pStep, pMax) {
    if (pBegin < pEnd) {
        return ((pEnd - pBegin) * (pStep / pMax)) + pBegin;
    } else {
        return ((pBegin - pEnd) * (1 - (pStep / pMax))) + pEnd;
    }
};