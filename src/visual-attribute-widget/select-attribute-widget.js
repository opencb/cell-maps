SelectAttributeWidget.prototype = new VisualAttributeWidget();

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
        forceSelection: true,
        editable: false,
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