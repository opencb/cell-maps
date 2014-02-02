SelectAttributeWidget.prototype.render = VisualAttributeWidget.prototype.render;
SelectAttributeWidget.prototype.getComponent = VisualAttributeWidget.prototype.getComponent;
SelectAttributeWidget.prototype.defaultValueChanged = VisualAttributeWidget.prototype.defaultValueChanged;
SelectAttributeWidget.prototype.visualSetChanged = VisualAttributeWidget.prototype.visualSetChanged;

SelectAttributeWidget.prototype._createWindow = VisualAttributeWidget.prototype._createWindow;
SelectAttributeWidget.prototype._createComponent = VisualAttributeWidget.prototype._createComponent;

SelectAttributeWidget.prototype._createGrid = VisualAttributeWidget.prototype._createGrid;
SelectAttributeWidget.prototype._getUniqueValues = VisualAttributeWidget.prototype._getUniqueValues;
SelectAttributeWidget.prototype._createUniqueStore = VisualAttributeWidget.prototype._createUniqueStore;
SelectAttributeWidget.prototype._updateUniqueStore = VisualAttributeWidget.prototype._updateUniqueStore;
SelectAttributeWidget.prototype._updateVisualSet = VisualAttributeWidget.prototype._updateVisualSet;


function SelectAttributeWidget(args) {
    VisualAttributeWidget.prototype.constructor.call(this, args);

    this.id = Utils.genId('SelectAttributeWidget');
};


SelectAttributeWidget.prototype.createControl = function (changeFunction) {
    return  Ext.create('Ext.form.field.ComboBox', {
        width: 65,
        margin: '0 10 0 0',
        value: this.defaultValue,
        store: this.comboValues,
        listeners: {
            change: function (combo, select) {
                changeFunction(select);
            }
        }
    });
}

SelectAttributeWidget.prototype.createGridColumns = function () {
    return [
        {
            text: 'Display ' + this.displayAttribute,
            dataIndex: 'visualParam',
            width: 130,
            menuDisabled: true,
            editor: {
                xtype: 'combo',
                store: this.comboValues
            }
        }
    ];
}

SelectAttributeWidget.prototype.createGridListeners = function () {
    return;
}


/* Private Methods */