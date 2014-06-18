/*
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of Cell Browser.
 *
 * Cell Browser is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * Cell Browser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Cell Browser. If not, see <http://www.gnu.org/licenses/>.
 */

ReactomeFIMicroarrayForm.prototype = new GenericFormPanel();

function ReactomeFIMicroarrayForm(args) {
    args.analysis = 'reactome-fi.default';
    args.title = 'Reactome FI microarray analysis';
    args.border = false;
    args.buttonConfig = {
        width: 100,
        height: undefined
    };
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("ReactomeFIMicroarrayForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

}

ReactomeFIMicroarrayForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }

    if (this.paramsWS['abs'] !== 'on') {
        delete this.paramsWS['abs']
    }
};


ReactomeFIMicroarrayForm.prototype.getPanels = function () {
    return [
        this._getExampleForm(),
        this._getForm()
    ];
};


ReactomeFIMicroarrayForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample();
                    Utils.msg("Example 1", "Loaded");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: 'Gene list'

            }
        ]
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example1],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};

ReactomeFIMicroarrayForm.prototype._getForm = function () {
    var _this = this;

    this.distanceCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: 150,
        margin: '20 0 0 0',
        name: 'corrDist',
        fieldLabel: 'Distance',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Pearson correlation', value: 'c'},
                {name: 'Euclidean distance', value: 'e'},
                {name: 'City Block distance', value: 'b'},
                {name: 'absolute value of the correlation', value: 'a'},
                {name: 'uncentered correlation', value: 'u'},
                {name: 'absolute uncentered correlation', value: 'x'},
                {name: 'Spearman\'s rank correlation', value: 's'},
                {name: 'Kendall\'s tau', value: 'k'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        value: 'Pearson correlation',
        queryMode: 'local',
        forceSelection: true,
        value:'c',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });

    var absCheckbox = Ext.create('Ext.form.field.Checkbox', {
        labelWidth: 150,
        fieldLabel: 'Absolute correlation value',
        name: 'abs',
        checked: true
    });


    var inflationNumber = Ext.create('Ext.form.field.Number', {
        fieldLabel: 'Inflation',
        labelWidth: 150,
        name: 'inflation',
        value: 5,
        maxValue: 5,
        minValue: 1.2,
        step: 0.1
    });

    var minSizeNumber = Ext.create('Ext.form.field.Number', {
        labelWidth: 150,
        fieldLabel: 'Minimum size',
        name: 'modSize',
        value: 7,
        minValue: 0,
        step: 1
    });
    var minAvgCorrelationNumber = Ext.create('Ext.form.field.Number', {
        labelWidth: 150,
        fieldLabel: 'Min. average correlation',
        name: 'corrThreshold',
        value: 0.25,
        step: 0.01
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input parameters",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 10,
        items: [
            this.createOpencgaBrowserCmp({
                fieldLabel: 'Expression matrix (normalized)',
                dataParamName: 'eFile',
                id: this.id + 'eFile',
                mode: 'fileSelection',
                allowedTypes: ['txt'],
                allowBlank: false
            }),
            this.distanceCombo,
            absCheckbox,
            inflationNumber,
            minSizeNumber,
            minAvgCorrelationNumber
        ]
    });
    return formBrowser;
};


ReactomeFIMicroarrayForm.prototype.loadExample = function () {
    this.clean();

    Ext.getCmp(this.id + 'eFile').setValue('NejmLogRatioNormGlobalZScore_070111.txt');
    Ext.getCmp(this.id + 'eFile' + 'hidden').setValue('example_NejmLogRatioNormGlobalZScore_070111.txt');

    Ext.getCmp(this.id + 'jobname').setValue("Example");
    Ext.getCmp(this.id + 'jobdescription').setValue("Example");
};