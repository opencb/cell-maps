NumberAttributeWidget.prototype.render = VisualAttributeWidget.prototype.render;
NumberAttributeWidget.prototype.getComponent = VisualAttributeWidget.prototype.getComponent;
NumberAttributeWidget.prototype.defaultValueChanged = VisualAttributeWidget.prototype.defaultValueChanged;
NumberAttributeWidget.prototype.visualSetChanged = VisualAttributeWidget.prototype.visualSetChanged;

NumberAttributeWidget.prototype._createWindow = VisualAttributeWidget.prototype._createWindow;
NumberAttributeWidget.prototype._createComponent = VisualAttributeWidget.prototype._createComponent;

NumberAttributeWidget.prototype._createGrid = VisualAttributeWidget.prototype._createGrid;
NumberAttributeWidget.prototype._getUniqueValues = VisualAttributeWidget.prototype._getUniqueValues;
NumberAttributeWidget.prototype._createUniqueStore = VisualAttributeWidget.prototype._createUniqueStore;
NumberAttributeWidget.prototype._updateUniqueStore = VisualAttributeWidget.prototype._updateUniqueStore;
NumberAttributeWidget.prototype._updateVisualSet = VisualAttributeWidget.prototype._updateVisualSet;


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


/* Private Methods */