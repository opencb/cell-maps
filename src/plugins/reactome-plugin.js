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

function ReactomePlugin(args) {
    var _this = this;
    this.id = Utils.genId('ReactomePlugin');

    this.cellMaps = args.cellMaps;

    this.nodeNameIdDic = {};
    this.nodeIdNameDic = {};
    this.pathwayComponents = {};
    this.reusedNodes = {};

    this.cellbase_host = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
    this.cellbase_version = "v3";
}

ReactomePlugin.prototype.show = function () {
    this.window.show();
};

ReactomePlugin.prototype.draw = function () {
    var _this = this;

    this.speciesSelected = "hsapiens", this.pathwaySelected;
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
        width: 400,
//        labelWidth: 60,
//        fieldLabel: 'Species',
        value: this.speciesSelected,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        store: speciesStore,
        listeners: {
            change: function (combo, newValue, oldValue) {
                _this.speciesSelected = newValue;
                renderTree();
            }
        }
    });

    var searchTb = Ext.create('Ext.form.field.Text', {
        emptyText: "search text",
//        fieldLabel: 'Search',
//        labelWidth: 60,
        listeners: {
            change: function (event, newValue, oldValue, eOpts) {
                if (newValue.length > 0) searchBtn.enable();
                else searchBtn.disable();
            }
        }
    });

    var searchBtn = Ext.create('Ext.button.Button', {
        text: "Go",
        disabled: true,
        listeners: {
            click: function (btn, event, eOpts) {
                _this.tree.setLoading(true);
                _this.tree.collapseAll();
                var rootNode = _this.tree.getRootNode();

                //remove style for each node
                rootNode.cascadeBy(function (node) {
                    var nodeText = node.get("text");
                    if (!(nodeText instanceof Array)) {
                        var newText = nodeText.replace('<span style="color:red">', '').replace('</span>', '');
                        node.set("text", newText);
                    }
                });

                var searchText = searchTb.getValue();
                var searchBy = searchRadioGrp.getChecked()[0].inputValue;

                $.ajax({
                    url: _this.cellbase_host + "/" + _this.cellbase_version + "/" + _this.speciesSelected + "/network/reactome-pathway/search?by=" + searchBy + "&text=" + searchText + "&onlyIds=true",
                    dataType: 'json',
                    success: function (res) {
                        var data = res.response;
                        var json = JSON.parse(data);

                        for (var i = 0, len = json.length; i < len; i++) {
                            var child = rootNode.findChild("name", json[i].name, true);
//    					child.set("checked", true);
//    					child.expand();
                            child.set("text", '<span style="color:red">' + child.get("text") + "</span>");
                            _this.tree.expandPath(child.getPath("name"), "name");
                        }
                        _this.tree.setLoading(false);
                    }});
            }
        }
    });

    var searchRadioGrp = Ext.create('Ext.form.RadioGroup', {
        layout: 'hbox',
        defaults: {
            width: 80
        },
        items: [
            { boxLabel: 'Pathway', name: 'rb', inputValue: 'pathway', checked: true},
            { boxLabel: 'Other', name: 'rb', inputValue: 'other'}
        ]
    });


    this.window = Ext.create('Ext.window.Window', {
        title: "Reactome plugin",
        height: 500,
        width: 600,
        closable: false,
        minimizable: true,
        maximizable: true,
        constrain: true,
        collapsible: true,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [
            {
                title: 'Search',
                width: 170,
                border: 0,
                bodyPadding: 10,
                style: {
                    borderRight: '1px solid lightgray'
                },
                items: [
                    {
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [speciesCombo, searchTb, searchRadioGrp, searchBtn]
                    },
//                    {
//                        xtype: 'container',
//                        layout: {
//                            type: 'hbox',
//                            align: 'stretch'
//                        },
//                        items: [speciesCombo]
//                    },
                ]
            }
        ],
        listeners: {
            minimize: function () {
                this.hide();
            }
        }
    });


    var check = function (data) {
        for (var i = 0; i < data.length; i++) {
            var p = data[i];

            if (p["children"].length > 0) {
                p["icon"] = Utils.images.pathwayParent;
                p["expanded"] = false;
                check(p["children"]);
            } else {
                p["icon"] = Utils.images.pathway;
                p["leaf"] = true;
                delete p["children"];
            }
        }

    };

    function renderTree() {
        _this.window.setLoading(true);
        $.ajax({
            url: _this.cellbase_host + "/" + _this.cellbase_version + "/" + _this.speciesSelected + "/network/reactome-pathway/tree",
            dataType: 'json',
            success: function (res) {
                var data = res.response;
                var json = JSON.parse(data.replace(/subPathways/g, "children"));
                json.sort(function (a, b) {
                    return a.displayName[0].localeCompare(b.displayName[0]);
                });
                check(json);
//                var json = JSON.parse(data.replace(/\"subPathways\" : \[ \]/g, "\"leaf\":true").replace(/subPathways/g, "children"));

                _this._createTreePanel(json);

                _this.window.setLoading(false);
            }});
    }

    renderTree();

};

ReactomePlugin.prototype._createTreePanel = function (json) {
    var _this = this;
    if (this.window) {
        this.tree = this.window.child('treepanel');
        if (this.tree) {
            this.window.remove(this.tree, false).destroy();
        }
    }

    var selectionType = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Selection',
        labelWidth: 50,
        width: 200,
        items: [
            { boxLabel: 'Single', name: 'st', inputValue: 'single', checked: true},
            { boxLabel: 'Multiple', name: 'st', inputValue: 'multiple'}
        ]
    });

    Ext.define('pathwayModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'text', mapping: 'displayName'},
            {name: 'name', mapping: 'name'},
            {name: 'checked', defaultValue: false, disabled: true}
//	             {name:'children', mapping :'subPathways'}
        ]
    });

    var treeStore = Ext.create('Ext.data.TreeStore', {
        model: 'pathwayModel',
        root: {
            title: 'Pathways',
            expand: true,
            children: json
        }
    });

    this.tree = Ext.create('Ext.tree.Panel', {
        store: treeStore,
        title: 'Pathways',
        flex: 3,
        border: 0,
        rootVisible: false,
        useArrows: true,
        viewConfig: {
            markDirty: false
        },
        tbar: {
            items: [selectionType]
        },
        listeners: {
            itemclick: function (i, record, item, index, e, eOpts) {
                _this.pathwaySelected = record.data.name;
                var selectMode = selectionType.getChecked()[0].inputValue;

                if (selectMode == "multiple") {
                    if (record.data.checked) {
                        _this.removePathway(_this.pathwaySelected);
                    }
                    else {
                        _this.addPathway(_this.speciesSelected, _this.pathwaySelected);
                    }
                }
                else {
                    var itemsChecked = this.getChecked();
                    for (var i = 0; i < itemsChecked.length; i++) {
                        itemsChecked[i].set("checked", false);
                    }
                    _this.loadPathway(_this.speciesSelected, _this.pathwaySelected);
                }
                record.set("checked", !record.data.checked);
            }
        }
    });


    if (this.window) {
        this.window.getLayout().animate = false;
        this.window.insert(1, this.tree);
        this.window.getLayout().animate = true;
    }
};

ReactomePlugin.prototype.loadPathway = function (speciesSelected, pathwayId) {
    var _this = this;
    //	_this.cellMaps.clearNetwork();
    _this.nodeNameIdDic = {};
    _this.nodeIdNameDic = {};
    _this.pathwayComponents = {};

    this.cellMaps.networkViewer.clean();
    var network = this.cellMaps.networkViewer.network;

    _this.pathwayComponents[pathwayId] = {};

    $.ajax({
        url: this.cellbase_host + "/" + this.cellbase_version + "/" + speciesSelected + "/network/reactome-pathway/" + pathwayId + "/info",
        dataType: 'json',
        success: function (res) {
            network.batchStart();
            var data = res.response;
            var json = JSON.parse(data)[0];

            for (var i = 0, len = json.subPathways.length; i < len; i++) {
                var subPathway = json.subPathways[i];
                var name = subPathway.name;

                var nodeId = _this.addPathwayNode(name, subPathway.displayName[0], speciesSelected, network);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }

            for (var i = 0, len = json.physicalEntities.length; i < len; i++) {
                var physicalEntity = json.physicalEntities[i];
                var name = physicalEntity.name;

                var nodeId = _this.addPhysicalEntity(physicalEntity.name, physicalEntity.type, physicalEntity.params.displayName[0], physicalEntity.params, network);
//			if(nodeId != -1) _this.pathwayComponents[pathwayId].push(nodeId);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }

            for (var i = 0, len = json.interactions.length; i < len; i++) {
                var interaction = json.interactions[i];
                var name = interaction.name;

                var nodeId = _this.addInteraction(interaction, network);
//			if(nodeId != -1) _this.pathwayComponents[pathwayId].push(nodeId);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }
            network.batchEnd();
            _this.cellMaps.networkViewer.drawNetwork();
            _this.cellMaps.networkViewer.setLayout('Force directed');
            network.setVertexLabelByAttribute('Name');
        }});
};


ReactomePlugin.prototype.addPathway = function (speciesSelected, pathwayId) {
    var _this = this;
    _this.pathwayComponents[pathwayId] = {};

    this.cellMaps.networkViewer.clean();
    var network = this.cellMaps.networkViewer.network;

    $.ajax({
        url: this.cellbase_host + "/" + this.cellbase_version + "/" + speciesSelected + "/network/reactome-pathway/" + pathwayId + "/info",
        dataType: 'json',
        success: function (res) {
            var data = res.response;
            var json = JSON.parse(data)[0];

            for (var i = 0, len = json.subPathways.length; i < len; i++) {
                var subPathway = json.subPathways[i];
                var name = subPathway.name;

                var nodeId = _this.addPathwayNode(name, subPathway.displayName[0], speciesSelected, network);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }

            for (var i = 0, len = json.physicalEntities.length; i < len; i++) {
                var physicalEntity = json.physicalEntities[i];
                var name = physicalEntity.name;

                var nodeId = _this.addPhysicalEntity(physicalEntity.name, physicalEntity.type, physicalEntity.params.displayName[0], physicalEntity.params, network);
//			if(nodeId != -1) _this.pathwayComponents[pathwayId].push(nodeId);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }

            for (var i = 0, len = json.interactions.length; i < len; i++) {
                var interaction = json.interactions[i];
                var name = interaction.name;

                var nodeId = _this.addInteraction(interaction, network);
//			if(nodeId != -1) _this.pathwayComponents[pathwayId].push(nodeId);
                _this.pathwayComponents[pathwayId][_this.nodeNameIdDic[name]] = true;
                if (!_this.reusedNodes[name]) _this.reusedNodes[name] = {};
                _this.reusedNodes[name][pathwayId] = true;
            }

            _this.cellMaps.networkViewer.drawNetwork();
            _this.cellMaps.networkViewer.setLayout('neato');
            network.setVertexLabelByAttribute('Name');
        }});
};

ReactomePlugin.prototype.removePathway = function (pathwayId) {
//	console.log(this.reusedNodes);
//	debugger
//	for(var i=0, len=this.pathwayComponents[pathwayId].length; i<len; i++) {
//		var node = this.nodeIdNameDic[this.pathwayComponents[pathwayId][i]];
//		
//		var size = 0, key;
//	    for (key in this.reusedNodes[node]) {
//	        if (this.reusedNodes[node].hasOwnProperty(key)) size++;
//	    }
//	    
//	    if(size > 1) {
//	    	console.log("Node with size > 1: "+node);
//	    }
//		
//		if(size <= 1) {
//			this.cellMaps.removeNode(this.pathwayComponents[pathwayId][i]);
//		}
////		for(var j=0,lenj=this.reusedNodes[node].length; j<lenj; j++) {
////			if(this.reusedNodes[node][j] == pathwayId) {
////				this.reusedNodes[node].splice(j, 1);
////			}
////		}
//		delete this.reusedNodes[node][pathwayId];
//	}

    var network = this.cellMaps.networkViewer.network;

    for (var comp in this.pathwayComponents[pathwayId]) {
        var node = this.nodeIdNameDic[comp];

        var size = 0, key;
        for (key in this.reusedNodes[node]) {
            if (this.reusedNodes[node].hasOwnProperty(key)) size++;
        }

        if (size <= 1) {
            network.removeVertex(network.getVertexById(comp));
        }

        delete this.reusedNodes[node][pathwayId];
    }

    delete this.pathwayComponents[pathwayId];

//    this.cellMaps.refresh(this.cellMaps.networkViewer.networkData);
};

ReactomePlugin.prototype.addPathwayNode = function (name, displayName, species, network) {
//    var args = {};
//    args.name = name;
//    args.type = "pathway";
//    args.metainfo = {
//        "label": displayName,
//        "qtipScope": this,
//        "qtipFn": "qtipScope.loadPathway('" + species + "','" + name + "');",
//        "qtipContent": '<b style="cursor:pointer" class="link">Open pathway</b>'
//    };
//
//    var nodeId = this.cellMaps.addNode(args);
//    if (nodeId != -1) {
//        this.nodeNameIdDic[name] = nodeId;
//        this.nodeIdNameDic[nodeId] = name;
//    }

    if (!network.getVertexById(name)) {
        var vertex = new Vertex({
            id: name
        });
        network.addVertex({
            name: displayName,
            vertex: vertex,
            vertexConfig: new VertexConfig({
                rendererConfig: this.nodeTypes["pathway"]
            })
        });
        this.nodeNameIdDic[name] = vertex.id;
        this.nodeIdNameDic[vertex.id] = name;
    }


};

ReactomePlugin.prototype.addPhysicalEntity = function (name, type, displayName, params, network) {
//    var args = {};
//    args.name = name;
//    args.type = type;
//    args.metainfo = params;
//    args.metainfo.label = displayName;
//
//    var nodeId = this.cellMaps.addNode(args);
//    if (nodeId != -1) {
//        this.nodeNameIdDic[name] = nodeId;
//        this.nodeIdNameDic[nodeId] = name;
//    }
//
//    return nodeId;
//    console.log(type)

    if (!network.getVertexById(name)) {
        var vertex = new Vertex({
            id: name
        });
        network.addVertex({
            name: displayName,
            vertex: vertex,
            vertexConfig: new VertexConfig({
                rendererConfig: this.nodeTypes[type]
            })
        });
        this.nodeNameIdDic[name] = vertex.id;
        this.nodeIdNameDic[vertex.id] = name;
    }
};

ReactomePlugin.prototype.addInteraction = function (interaction, network) {
    var nodeArgs = {};
    var name = interaction.name;
    var displayName = interaction.params.displayName[0];
//    nodeArgs.name = name;
//    nodeArgs.type = "interaction";
//    nodeArgs.metainfo = interaction.params;
//    nodeArgs.metainfo.label = interaction.params.displayName[0];
//
//    var nodeId = this.cellMaps.addNode(nodeArgs);
//    if (nodeId != -1) {
//        this.nodeNameIdDic[name] = nodeId;
//        this.nodeIdNameDic[nodeId] = name;
//    }

    if (!network.getVertexById(name)) {
        var vertex = new Vertex({
            id: name
        });
        network.addVertex({
            name: displayName,
            vertex: vertex,
            vertexConfig: new VertexConfig({
                rendererConfig: this.nodeTypes["interaction"]
            })
        });
        this.nodeNameIdDic[name] = vertex.id;
        this.nodeIdNameDic[vertex.id] = name;
    }

    //TODO completar los tipos de interaccion
//	console.log(interaction.type);

    switch (interaction.type) {
        case "BiochemicalReaction":
            for (var i = 0, len = interaction.params["left"].length; i < len; i++) {
                var leftId = interaction.params["left"][i].id;
//                var edgeArgs = {};
//                edgeArgs.source = this.nodeNameIdDic[leftId];
//                edgeArgs.target = nodeId;
//                edgeArgs.type = "odot";
//                edgeArgs.name = "";
//                edgeArgs.params = {};
//                this.cellMaps.addEdge(edgeArgs);

                var edge = new Edge({
                    name: '',
                    source: network.getVertexById(this.nodeNameIdDic[leftId]),
                    target: network.getVertexById(this.nodeNameIdDic[name])
                });
                network.addEdge({
                    edge: edge,
                    edgeConfig: new EdgeConfig({
                        type: "odot",
                        renderer: new DefaultEdgeRenderer({
                            shape: "odot",
                            size: 2
                        })
                    })
                });

            }

            for (var i = 0, len = interaction.params["right"].length; i < len; i++) {
                var rightId = interaction.params["right"][i].id;
//                var edgeArgs = {};
//                edgeArgs.source = nodeId;
//                edgeArgs.target = this.nodeNameIdDic[rightId];
//                edgeArgs.type = "directed";
//                edgeArgs.name = "";
//                edgeArgs.params = {};
//                this.cellMaps.addEdge(edgeArgs);

                var edge = new Edge({
                    name: '',
                    source: network.getVertexById(this.nodeNameIdDic[name]),
                    target: network.getVertexById(this.nodeNameIdDic[rightId])
                });
                network.addEdge({
                    edge: edge,
                    edgeConfig: new EdgeConfig({
                        type: "directed",
                        renderer: new DefaultEdgeRenderer({
                            shape: "directed",
                            size: 2
                        })
                    })
                });
            }
            break;
        case "TemplateReaction":
            for (var i = 0, len = interaction.params["product-id"].length; i < len; i++) {
                var productId = interaction.params["product-id"][i];
//                var edgeArgs = {};
//                edgeArgs.source = nodeId;
//                edgeArgs.target = this.nodeNameIdDic[productId];
//                edgeArgs.type = "directed";
//                edgeArgs.name = "";
//                edgeArgs.params = {};
//                this.cellMaps.addEdge(edgeArgs);

                var edge = new Edge({
                    name: '',
                    source: network.getVertexById(this.nodeNameIdDic[name]),
                    target: network.getVertexById(this.nodeNameIdDic[productId])
                });
                network.addEdge({
                    edge: edge,
                    edgeConfig: new EdgeConfig({
                        type: "directed",
                        renderer: new DefaultEdgeRenderer({
                            shape: "directed"
                        })
                    })
                });
            }
            break;

        default:
            break;
    }

//    return nodeId;
};

ReactomePlugin.prototype.nodeTypes = {
    undefined: {
    },
    "pathway": {
        shape: "rectangle",
        size: 30,
        color: "#ffffff",
        strokeSize: 6,
        strokeColor: '#ccffcc',
        opacity: 1
    },
    "interaction": {
        shape: "square",
        size: 30,
        color: "#ffffff",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "SmallMolecule": {
        shape: "circle",
        size: 40,
        color: "#ccffcc",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "Complex": {
        shape: "rectangle",
        size: 40,
        color: "#ccffff",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "Protein": {
        shape: "rectangle",
        size: 40,
        color: "#ccffcc",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "PhysicalEntity": {
        shape: "circle",
        size: 40,
        color: "#ccffcc",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "Rna": {
        shape: "rectangle",
        size: 40,
        color: "#ccffcc",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "Dna": {
        shape: "rectangle",
        size: 40,
        color: "#ccffcc",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    },
    "none": {
        shape: "circle",
        size: 45,
        color: "#993300",
        strokeSize: 2,
        strokeColor: '#000000',
        opacity: 1
    }
};