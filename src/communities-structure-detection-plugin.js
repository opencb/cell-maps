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

function CommunitiesStructureDetectionPlugin(args) {
    var _this = this;
    this.id = Utils.genId('CommunitiesStructureDetectionPlugin');


    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.nodeAttributeManager;
    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });
//    this.cellMaps.networkViewer.on('select:vertices', function () {
//        if (_this.mode === 'selected') {
//            _this.textArea.setValue(_this.getSelectedNetworkVerticesText());
//        }
//    });

    this.attributeNameSelected;
}

CommunitiesStructureDetectionPlugin.prototype.show = function () {
    this.window.show();
};

CommunitiesStructureDetectionPlugin.prototype.draw = function () {
    var _this = this;

    this.methodCombo = Ext.create('Ext.form.field.ComboBox', {
        width: 200,
        labelWidth: 100,
        fieldLabel: 'Select method',
        id: this.id + "methodCombo",
        store: ['infomap', 'walktrap', 'edge.betweenness'],
        queryMode: 'local',
        forceSelection: true,
        editable: false,
        name: 'method',
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(1));
            }
        }
    });

    var attributeCombo = Ext.create('Ext.form.field.ComboBox', {
//        labelAlign: 'top',
        fieldLabel: 'Node attribute',
        store: this.attributeStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        hidden: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.attributeNameSelected = value;
                }
            }
        }
    });


    var directedItems = [
        {
            id: this.id + 'undirected',
            inputValue: 'F',
            boxLabel: 'No',
            checked: true
        },
        {
            id: this.id + 'directed',
            inputValue: 'T',
            boxLabel: 'Yes',
            checked: false
        }
    ];
    this.directedRadioGroup = Ext.create('Ext.form.RadioGroup', {
//        layout: 'vbox',
        fieldLabel: 'Directed',
        width: 250,
        defaults: {
            name: 'directed'
        },
        items: directedItems
    });

    var weightedItems = [
        {
            id: this.id + 'unweighted',
            inputValue: 'F',
            boxLabel: 'No',
            checked: true
        },
        {
            id: this.id + 'weighted',
            inputValue: 'T',
            boxLabel: 'Yes',
            checked: false
        }

    ];
    this.weightedRadioGroup = Ext.create('Ext.form.RadioGroup', {
//        layout: 'vbox',
        fieldLabel: 'Weighted',
        width: 200,
        defaults: {
            name: 'weighted'
        },
        items: weightedItems,
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                console.log(newValue);
                if (newValue['weighted'] === 'T') {
                    attributeCombo.show();
                } else {
                    attributeCombo.hide();
                }
            }
        }
    });

    this.progress = Ext.create('Ext.ProgressBar', {
        text: 'Click search to retrieve data...',
        width: 200,
        border: 1,
        margin: 3
    });

    this.resultContainer = Ext.create('Ext.container.Container', {
        hidden: true,
        xtype: 'container',
        padding: 3,
        items: [
            {
                xtype: 'box',
                padding: 3,
                html: 'Community dectection results are available as node attribute <span style="font-weight: bold">Community id</span>',
            },
            {
                xtype: 'button',
                text: 'Show node attributes',
                handler: function () {
                    _this.cellMaps.nodeAttributeEditWidget.show();
                }
            },
            {
                xtype: 'button',
                text: 'Apply as color',
                enableToggle: true,
                pressed: false,
                margin:'0 0 0 5',
                toggleHandler: function () {
                    if (this.pressed) {
                        _this.cellMaps.configuration.nodeColorAttributeWidget.applyVisualSet("Community color", "String");
                    } else {
                        _this.cellMaps.configuration.nodeColorAttributeWidget.removeVisualSet();
                    }
                }
            }
        ]
    });

    this.window = Ext.create('Ext.ux.Window', {
        title: "Network analysis: Communities structure detection",
        taskbar: Ext.getCmp(this.cellMaps.networkViewer.id + 'uxTaskbar'),
        bodyStyle: {backgroundColor: 'white'},
        width: 330,
        closable: false,
        minimizable: true,
        collapsible: true,
        overflowY: 'auto',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'container',
                flex: 1,
                padding: 10,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.methodCombo,
                    this.directedRadioGroup,
                    this.weightedRadioGroup,
                    attributeCombo
                ]
            },
            this.resultContainer
        ],
        buttons: [
            this.progress,
            '->',
            {
                text: 'Run',
                handler: function () {
                    _this.retrieveData();
                }
            },
        ],
        listeners: {
            minimize: function () {
                this.hide();
            }
        }
    });
    /**/
};

CommunitiesStructureDetectionPlugin.prototype.retrieveData = function () {
    var _this = this;

    _this.resultContainer.hide()

    this.progress.updateProgress(0.1, 'Requesting data');

    var sif = this.cellMaps.networkViewer.getAsSIF();
//    console.log(sif)

    var data = {
        sif: sif,
        directed: this.directedRadioGroup.getValue().directed,
        weighted: this.weightedRadioGroup.getValue().weighted,
        method: this.methodCombo.getValue()
    }


    $.ajax({
        type: "POST",
        url: OpencgaManager.getUtilsUrl() + '/network/community',
        data: data,
        dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
        success: function (data, textStatus, jqXHR) {
            console.log('success')
            console.log('reponse: ' + data.response);
            if (data.response !== 'error') {
                var attributesDataAdapter = new AttributesDataAdapter({
                    dataSource: new StringDataSource(data.response),
                    handlers: {
                        'data:load': function (event) {
                            _this.progress.updateProgress(0.4, 'processing data');
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "Community id";
                            json.attributes[2].name = "Community color";
                            console.log(json)
                            _this.progress.updateProgress(0.7, 'creating attributes');
                            _this.cellMaps.networkViewer.importVertexWithAttributes({content: json});
                            _this.progress.updateProgress(1, 'Community structure detected successfully');
                            _this.resultContainer.show()
                        }
                    }
                });
            } else {
                _this.progress.updateProgress(0, 'Error');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error')
        }
    });
};