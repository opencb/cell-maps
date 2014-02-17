NumberAttributeWidget.prototype = new VisualAttributeWidget();

function NumberAttributeWidget(args) {
    VisualAttributeWidget.prototype.constructor.call(this, args);

    this.id = Utils.genId('NumberAttributeWidget');
};


NumberAttributeWidget.prototype.createControl = function (changeFunction) {
    return  Ext.create('Ext.form.field.Number', {
        width: 65,
        value: this.defaultValue,
        maxValue: this.maxValue,
        minValue: this.minValue,
        step: this.step,
        margin: '0 10 0 0',
        listeners: {
            change: {
                buffer: 100,
                fn: function (field, newValue) {
                    if (newValue != null) {
                        changeFunction(newValue);
                    }
                }
            }
        }
    });
}

NumberAttributeWidget.prototype.createGridColumns = function () {
    return [
        {
            text: 'Display ' + this.displayAttribute,
            dataIndex: 'visualParam',
            menuDisabled: true,
            width: 130,
            editor: {
                xtype: 'numberfield',
                maxValue: this.maxValue,
                minValue: this.minValue,
                step: this.step
            }
        }
    ];
}

NumberAttributeWidget.prototype.createGridListeners = function () {
    return;
}

NumberAttributeWidget.prototype.getNormalizedValue = function (first, second, value) {
    var _this = this;

    var firstNormalized = parseFloat(first.norm);
    var secondNormalized = parseFloat(second.norm);

    var firstCont = parseFloat(first.cont);
    var secondCont = parseFloat(second.cont);

    var continousDiff = secondCont - firstCont;
    var normalizedDiff = secondNormalized - firstNormalized;

    var v = value - firstCont;

    var normalizedValue = (v * normalizedDiff / continousDiff) + firstNormalized;

    return normalizedValue;
}

NumberAttributeWidget.prototype.updateLegend = function (items) {
    return;
}

/* Private Methods */