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

function TopologicalStudyPlugin(args) {
    var _this = this;
    this.id = Utils.genId('TopologicalStudyPlugin');


    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.edgeAttributeManager;
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

TopologicalStudyPlugin.prototype.show = function () {
    this.window.show();
};

TopologicalStudyPlugin.prototype.draw = function () {
    var _this = this;

    var attributeCombo = Ext.create('Ext.form.field.ComboBox', {
//        labelAlign: 'top',
        labelWidth: 125,
        margin: '0 0 0 50',
        fieldLabel: 'Select edge weight',
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
        labelWidth: 175,
        fieldLabel: 'Consider network as directed',
        width: 300,
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
        labelWidth: 175,
        fieldLabel: 'Consider network as weighted',
        width: 300,
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
        text: 'Click run to start the analysis...',
        border: 1,
        flex:1,
        margin: '0 10 0 0'
    });

    this.globalResult = Ext.create('Ext.Component', {
        margin: '15 3 10 3',
        html: ''
    });

    this.resultContainer = Ext.create('Ext.panel.Panel', {
        hidden: true,
        title:'Results',
        header: {
            baseCls: 'header-form'
        },
        border: false,
        padding: 10,
        bodyPadding: 10,
        layout: {
            type: 'vbox',
            align: 'center'
        },
        items: [
            {
                xtype: 'box',
                padding: 3,
                html: 'Topology results are available as node attributes'
            },
            {
                xtype: 'button',
                text: 'Show node attributes',
                handler: function () {
                    _this.cellMaps.vertexAttributeEditWidget.show();
                }
            },
            this.globalResult
        ]
    });

    this.window = Ext.create('Ext.window.Window', {
        title: "Network analysis: Topological study",
//        height: 200,
        width: 350,
        closable: false,
        minimizable: true,
        collapsible: true,
        overflowY: 'auto',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        bodyStyle: {
            fontFamily: 'Oxygen',
            backgroundColor: 'white'
        },
        items: [
            {
                xtype: 'panel',
                title: 'Input parameters',
                header: {
                    baseCls: 'header-form'
                },
                border: false,
                flex: 1,
                padding: 10,
                bodyPadding: 10,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.directedRadioGroup,
                    this.weightedRadioGroup,
                    attributeCombo
                ]
            },
            this.resultContainer
        ],
        buttons: [
            this.progress,
            {
                text: 'Close',
                handler: function (bt) {
                    bt.up('window').hide();
                }
            },
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

TopologicalStudyPlugin.prototype.retrieveData = function () {
    var _this = this;

    _this.resultContainer.hide()

    this.progress.updateProgress(0.1, 'Requesting data');

    var sif;
    if (this.weightedRadioGroup.getValue().weighted === 'T') {
        sif = this.cellMaps.networkViewer.getAsSIFCustomRelation('\t', this.attributeNameSelected);
    } else {
        sif = this.cellMaps.networkViewer.getAsSIF();
    }

    var data = {
        sif: sif,
        directed: this.directedRadioGroup.getValue().directed,
        weighted: this.weightedRadioGroup.getValue().weighted
    }


    $.ajax({
        type: "POST",
        url: OpencgaManager.getUtilsUrl() + '/network/topological-study',
        data: data,
        dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
        success: function (data, textStatus, jqXHR) {
            console.log('success')
            console.log(data.response);
            if (typeof data.response.error === 'undefined') {
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    dataSource: new StringDataSource(data.response.local),
                    handlers: {
                        'data:load': function (event) {
                            _this.progress.updateProgress(0.4, 'processing data');
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "Degree";
                            json.attributes[2].name = "Betweenness";
                            json.attributes[3].name = "Closeness centrality";
                            json.attributes[4].name = "Clustering coefficient";
                            console.log(json)
                            _this.progress.updateProgress(0.7, 'creating attributes');
                            _this.cellMaps.networkViewer.importVertexWithAttributes({content: json});
                            _this.progress.updateProgress(1, 'Topology information retrieved successfully');
                            _this.resultContainer.show()
                        }
                    }
                });
                _this.globalResult.update(Utils.htmlTable(data.response.global));
            } else {
                _this.progress.updateProgress(0, data.response.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error')
        }
    });
};