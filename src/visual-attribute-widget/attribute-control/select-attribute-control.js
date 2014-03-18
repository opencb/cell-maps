SelectAttributeControl.prototype = new AttributeControl();
function SelectAttributeControl(args) {
    AttributeControl.prototype.constructor.call(this, args);

    this.id = Utils.genId('SelectAttributeControl');
};


//Parent methods
SelectAttributeControl.prototype.create = function (changeFunction) {
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
};
SelectAttributeControl.prototype.createGridColumns = function () {
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
};
SelectAttributeControl.prototype.createGridListeners = function () {
    return;
};
SelectAttributeControl.prototype.getNormalizedValue = function () {
    return;
};
SelectAttributeControl.prototype.updateLegend = function (items) {
    return;
};