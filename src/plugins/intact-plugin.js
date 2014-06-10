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
    var _this = this;
    this.id = Utils.genId('CellMapsConfigurationPanel');


    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.vertexAttributeManager;
    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });
    this.cellMaps.networkViewer.on('select:vertices', function () {
        if (_this.mode === 'selected') {
            _this.textArea.setValue(_this.getSelectedNetworkVerticesText());
        }
    });

    this.speciesSelected = "hsapiens";
    this.attributeNameSelected;
    this.mode;

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


    this.uploadField = $('<input type="file" style="visibility:hidden" />');
    $(this.uploadField).change(function (e) {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            var content = evt.target.result;
            _this.listFileText = content;
            _this.textArea.setValue(_this.listFileText);
        };
        reader.readAsText(file);

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
                boxLabel: 'List from text',
                checked: true,
                inputValue: 'text'
            },
            {
                boxLabel: 'List from file',
                inputValue: 'file'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = this.getValue();
                _this.mode = value.from;
                console.log(value);
                _this.uploadButton.hide();
                switch (newValue.from) {
                    case 'network':
                        _this.textArea.setValue(_this.getNetworkVerticesText());
                        _this.textArea.setReadOnly(true);
                        break;
                    case 'selected':
                        _this.textArea.setValue(_this.getSelectedNetworkVerticesText());
                        _this.textArea.setReadOnly(true);
                        break;
                    case 'file':
                        _this.uploadButton.show();
                        _this.textArea.setValue(_this.listFileText);
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

    this.uploadButton = Ext.create('Ext.button.Button', {
        text: 'Upload local file',
        hidden: true,
        handler: function () {
            $(_this.uploadField).click();
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
        border: 1,
        flex: 1,
        margin: '0 10 0 0'
    });

    this.window = Ext.create('Ext.window.Window', {
        title: "IntAct",
        closable: false,
        minimizable: true,
        collapsible: true,
        layout: 'fit',
        items: {
            border: false,
            height: 400,
            width: 600,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        {
                            xtype: 'container',
                            width: 200,
                            padding: 10,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                speciesCombo,
                                attributeCombo,
                                this.selectRadioGroup,
                                this.uploadButton
                            ]
                        },
                        {
                            xtype: 'container',
                            flex: 1,
                            padding: 5,
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                this.textArea
                            ]
                        }
                    ]
                },
                this.progress
            ],
            bbar: {
                defaults: {
                    width: 100
                },
                items: [
                    this.progress,
                    {
                        text: 'Close',
                        handler: function (bt) {
                            bt.up('window').hide();
                        }
                    },
                    {
                        text: 'Search',
                        handler: function () {
                            _this.retrieveData();
                        }
                    }
                ]
            }
        },
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
    var _this = this;
    this.attributeManager = this.cellMaps.networkViewer.network.vertexAttributeManager;
    this.attributeStore.loadData(this.attributeManager.attributes);
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });
};

IntActPlugin.prototype.getNetworkVerticesText = function () {
    var values = this.attributeManager.getValuesByAttribute(this.attributeNameSelected);
    var queries = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        queries.push(v.value);
    }
    return queries.join('\n');
};

IntActPlugin.prototype.getSelectedNetworkVerticesText = function () {
    var values = this.attributeManager.getSelectedValuesByAttribute(this.attributeNameSelected);
    var queries = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        queries.push(v.value);
    }
    return queries.join('\n');
};


IntActPlugin.prototype.retrieveData = function () {
    var _this = this;


    var queryStr = this.textArea.getValue().split('\n').toString();
    if (queryStr.length <= 0) {
        return;
    }

    _this.progress.updateProgress(0.1, 'Requesting data');
    CellBaseManager.get({
        species: this.speciesSelected,
        category: 'network',
        subCategory: 'protein',
//        query: queries.toString(),
        resource: 'all',
        params: {
            interactor: queryStr,
            include: "interactorA.id,interactorB.id"
        },
        success: function (data) {
//            var verticesMap = {};
//            var edgesMap = {};
            console.log(data)
            var interactions = data.response.result;
            _this.progress.updateProgress(0.4, 'Processing data');

            var graph = _this.cellMaps.networkViewer.network.graph;
            for (var j = 0; j < interactions.length; j++) {
                var interaction = interactions[j];
                var sourceName = interaction.interactorA.id;
                var edgeName = 'pp';
                var targetName = interaction.interactorB.id;

                /** create source vertex **/
                var sourceVertex = new Vertex({
                    id: sourceName
                });
                graph.addVertex(sourceVertex);

                /** create target vertex **/
                var targetVertex = new Vertex({
                    id: targetName
                });
                graph.addVertex(targetVertex);

                /** create edge **/
                var edgeId = sourceName + '_' + edgeName + '_' + targetName;
                var edge = new Edge({
                    id: edgeId,
                    relation: edgeName,
                    source: graph.getVertexById(sourceName),
                    target: graph.getVertexById(targetName),
                    weight: 1,
                    directed: true
                });
                graph.addEdge(edge);
            }
            _this.cellMaps.networkViewer.refreshNetwork();
            _this.progress.updateProgress(1, 'Complete!');
            _this.cellMaps.networkViewer.setLayout('Force directed');
        }
    });
};

