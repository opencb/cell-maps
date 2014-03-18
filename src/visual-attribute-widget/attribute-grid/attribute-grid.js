function AttributeGrid(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('AttributeGrid');
    this.attributeManager;
    this.attributeName;
    this.control;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);
};

AttributeGrid.prototype.create = function () {
//abstract method
};