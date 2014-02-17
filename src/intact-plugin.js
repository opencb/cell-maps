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

function IntActPlugin(args) {
    this.id = Utils.genId('CellMapsConfigurationPanel');


    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.nodeAttributeManager;

    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });

    this.speciesSelected = "hsapiens";
    this.attributeNameSelected;


    this.listWriteText = "";
    this.listFileText = "";
};

IntActPlugin.prototype.draw = function () {
    var _this = this;
    var speciesStore = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'value' ],
        data: [
            {name: "Homo sapiens", value: "hsapiens"},
//            {name: "Mus musculus", value: "mmusculus"},
//            {name: "Rattus norvegicus", value: "rnorvegicus"},
//            {name: "Bos taurus", value: "btaurus"},
//            {name: "Gallus gallus", value: "ggallus"},
//            {name: "Sus scrofa", value: "sscrofa"},
//            {name: "Canis familiaris", value: "cfamiliaris"},
//            {name: "Drosophila melanogaster", value: "dmelanogaster"},
//            {name: "Caenorhabditis elegans", value: "celegans"},
//            {name: "Saccharomyces cerevisiae", value: "scerevisiae"},
//            {name: "Danio rerio", value: "drerio"},
//            {name: "Schizosaccharomyces pombe", value: "spombe"},
//            {name: "Escherichia coli", value: "ecoli"},
//            {name: "Human immunodeficiency virus 1", value: "hiv-1"},
//            {name: "Influenza A virus", value: "flu-a"},
//            {name: "Clostridium botulinum", value: "cbotulinum"},
//            {name: "Arabidopsis thaliana", value: "athaliana"},
//            {name: "Plasmodium falciparum", value: "pfalciparum"},
//            {name: "Dictyostelium discoideum", value: "ddiscoideum"},
//            {name: "Mycobacterium tuberculosis", value: "mtuberculosis"},
//            {name: "Neisseria meningitidis serogroup B", value: "nmeningitidis"},
//            {name: "Chlamydia trachomatis", value: "ctrachomatis"},
//            {name: "Oryza sativa", value: "osativa"},
//            {name: "Toxoplasma gondii", value: "tgondii"},
//            {name: "Xenopus tropicalis", value: "xtropicalis"},
//            {name: "Salmonella typhimurium", value: "styphimurium"},
//            {name: "Taeniopygia guttata", value: "tguttata"},
//            {name: "Staphylococcus aureus N315", value: "saureus"}
        ]
    });

    var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        fieldLabel: 'Species',
        store: speciesStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (combo, newValue, oldValue) {
                _this.speciesSelected = newValue;
            }
        }
    });

    var attributeCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'top',
        fieldLabel: 'Node attribute',
        store: this.attributeStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
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

    this.selectRadioGroup = Ext.create('Ext.form.RadioGroup', {
//          toolbar.down('radiogroup').getValue() --> {selection: "all"}
        xtype: 'radiogroup',
        fieldLabel: 'Use nodes from',
        labelAlign: 'top',
        defaults: {
            name: 'from',
            margin: '1 0 0 0'
        },
        layout: 'vbox',
        items: [
            {
                boxLabel: 'Network nodes',
                inputValue: 'network'
            },
            {
                boxLabel: 'Network selection',
                inputValue: 'selected'
            },
            {
                boxLabel: 'List from file',
                inputValue: 'file'
            },
            {
                boxLabel: 'List from text',
                checked: true,
                inputValue: 'text'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = this.getValue();
                console.log(value);
                switch (newValue.from) {
                    case 'network':
                        _this.textArea.setValue('network');
                        _this.textArea.setReadOnly(true);
                        break;
                    case 'selected':
                        _this.textArea.setValue('selected');
                        _this.textArea.setReadOnly(true);
                        break;
                    case 'file':
                        _this.textArea.setValue('file');
                        _this.textArea.setReadOnly(true);
                        break;
                    case 'text':
                        _this.textArea.setValue(_this.listWriteText);
                        _this.textArea.setReadOnly(false);
                        break;
                }
            }
        }

    });


    this.textArea = Ext.create('Ext.form.field.TextArea', {
        xtype: 'textarea',
        flex: 1,
        enableKeyEvents: true,
//        readOnly: true,
//            cls: 'dis',
//            style:'normal 6px Ubuntu Mono, arial, verdana, sans-serif',
        value: '',
        listeners: {
            change: function (este) {
                if (este.getValue() != "") {
                    var value = _this.selectRadioGroup.getValue();
                    switch (value.from) {
                        case 'network':
                            break;
                        case 'selected':
                            break;
                        case 'file':
                            break;
                        case 'text':
                            _this.listWriteText = este.getValue();
                            break;
                    }
                } else {

                }
            }
        }
    });

    this.progress = Ext.create('Ext.ProgressBar', {
        text: 'Click search to retrieve data...',
        border:1,
        margin:3
    });

    this.window = Ext.create('Ext.window.Window', {
        title: "IntAct",
        taskbar: Ext.getCmp(this.cellMaps.networkViewer.id + 'uxTaskbar'),
        height: 400,
        width: 600,
        closable: false,
        minimizable: true,
        collapsible: true,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
//        dockedItems: [
//            {
//                xtype: 'toolbar',
//                dock: 'top',
//                items: [speciesCombo]
//            },
//            {
//                xtype: 'toolbar',
//                dock: 'top',
//                items: [attributeCombo]
//            }
//        ],
        items: [
            {
                xtype: 'panel',
                width: 200,
                border: 0,
                bodyPadding: 5,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.selectRadioGroup,
                    this.textArea
                ]
            },
            {
                xtype: 'panel',
                flex: 1,
                border: 0,
                bodyPadding: 5,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    speciesCombo,
                    attributeCombo,
                    this.progress
                ]
            }
        ],
        buttons: [
            {
                text: 'Search',
                handler: function () {
                    _this.retrieveData();
                    _this.progress.updateProgress(0.1, 'Requesting data');
                }
            }
        ],
        listeners: {
            minimize: function () {
                this.hide();
            }
        }
    });
    /**/
};

IntActPlugin.prototype.show = function () {
    this.window.show();
};

IntActPlugin.prototype.updateAttributeStore = function () {
    this.attributeManager = this.cellMaps.networkViewer.network.nodeAttributeManager;
    this.attributeStore.loadData(this.attributeManager.attributes);
};


IntActPlugin.prototype.retrieveData = function () {
    var _this = this;


    var queries = this.textArea.getValue().split('\n');


    CellBaseManager.get({
        species: this.speciesSelected,
        category: 'network',
        subCategory: 'protein',
//        query: queries.toString(),
        resource: 'all',
        params: {
            interactor: queries.toString(),
            include: "interactorA.id,interactorB.id"
        },
        success: function (data) {
            var verticesMap = {};
            var edgesMap = {};
            console.log(data)
            var interactions = data.response.result;
            _this.progress.updateProgress(0.4, 'Processing data');
            for (var j = 0; j < interactions.length; j++) {
                var interaction = interactions[j];
                var sourceName = interaction.interactorA.id;
                var edgeName = 'pp';
                var targetName = interaction.interactorB.id;

                /** create source vertex **/
                if (typeof verticesMap[sourceName] === 'undefined') {
                    var sourceVertex = new Vertex({
                        id: sourceName
                    });
                    _this.cellMaps.networkViewer.network.addVertex({
                        vertex: sourceVertex,
                        vertexConfig: new VertexConfig({
                            renderer: new DefaultVertexRenderer({})
                        })
                    });
                    verticesMap[sourceName] = sourceVertex;
                }
                /** create target vertex **/
                if (typeof verticesMap[targetName] === 'undefined') {
                    var targetVertex = new Vertex({
                        id: targetName
                    });
                    _this.cellMaps.networkViewer.network.addVertex({
                        vertex: targetVertex,
                        vertexConfig: new VertexConfig({
                            renderer: new DefaultVertexRenderer({})
                        })
                    });
                    verticesMap[targetName] = targetVertex;
                }

                /** create edge **/
                var edgeId = sourceName + '_' + edgeName + '_' + targetName;
                if (typeof edgesMap[edgeId] === 'undefined') {
                    var edge = new Edge({
                        id: edgeId,
                        relation: edgeName,
                        source: verticesMap[sourceName],
                        target: verticesMap[targetName],
                        weight: 1,
                        directed: true
                    });
                    _this.cellMaps.networkViewer.network.addEdge({
                        edge: edge,
                        edgeConfig: new EdgeConfig({
                            renderer: new DefaultEdgeRenderer()
                        })
                    });
                    edgesMap[edgeId] = edge;
                }
            }
            _this.cellMaps.networkViewer.refreshNetwork();
            _this.progress.updateProgress(1, 'Complete!');
        }
    });
};

