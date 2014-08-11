/*
 * Copyright (c) 2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2013 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of Cell Maps.
 *
 * Cell Maps is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * Cell Maps is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Cell Maps. If not, see <http://www.gnu.org/licenses/>.
 */

function CellMaps(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("CellMaps");

    //set default args
    this.suiteId = "cellmaps";
    this.title = 'Cell Maps';
    this.description = "Systems Biology Visualization";
    this.tools = {
        "reactome-fi.default": true,
        "snow.default": true,
        "network-miner.default": true,
        "fatigo.default": true
    };
    this.version = "2.0.6";
    this.autoRender = true;
    this.border = false;
    this.target;
    this.width;
    this.height;
    this.session;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.accountData = null;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CellMaps.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing Cell Maps");

        //HTML skel
        this.div = $('<div id="' + this.id + '"></div>')[0];

        this.headerWidgetDiv = $('<div></div>')[0];
        $(this.div).append(this.headerWidgetDiv);

        this.toolbarDiv = $('<div style="position:relative;"></div>')[0];
        this.networkViewerDiv = $('<div style="position:relative;"></div>')[0];
        $(this.div).append(this.toolbarDiv);
        $(this.div).append(this.networkViewerDiv);

        this.rightSidebarDiv = $('<div id="rightsidebar-' + this.id + '" style="position:absolute; z-index:50;right:0px;"></div>')[0];
        $(this.networkViewerDiv).append(this.rightSidebarDiv);

        this.configureDiv = $('<div id="configure-' + this.id + '"></div>')[0];
        this.jobsDiv = $('<div id="jobs-' + this.id + '"></div>')[0];
        $(this.configureDiv).css({
            float: 'left'
        });
        $(this.jobsDiv).css({
            float: 'left',
            margin: '0 2px'
        });
        $(this.rightSidebarDiv).append(this.configureDiv);
        $(this.rightSidebarDiv).append(this.jobsDiv);

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }


        //
        //  Children initalization
        //
        /* Header Widget */
        this.headerWidget = this._createHeaderWidget(this.headerWidgetDiv);

        /* ToolBar*/
        this.toolbar = this._createToolBar(this.toolbarDiv);

//        /* network Viewer  */
        this.networkViewer = this._createNetworkViewer(this.networkViewerDiv);


//        /* Side Panel  */
        this.configuration = this._createConfiguration(this.configureDiv);

        /* Job List Widget */
        this.jobListWidget = this._createJobListWidget(this.jobsDiv);

        this.vertexAttributeEditWidget = new AttributeEditWidget({
            attrMan: this.networkViewer.network.vertexAttributeManager,
            type: 'node',
            autoRender: true,
//            handlers: {
//                '': function (event) {
//                }
//            }
        });
        this.vertexAttributeFilterWidget = new AttributeFilterWidget({
            attrMan: this.networkViewer.network.vertexAttributeManager,
            type: 'Vertex',
            handlers: {
                'vertices:select': function (event) {
                    _this.networkViewer.selectVerticesByIds(event.vertices);
                },
                'vertices:deselect': function (event) {
                    //TODO
                },
                'vertices:filter': function (event) {
                    //event.vertices
                    //TODO
                },
                'vertices:restore': function (event) {
                    //TODO
                }
            }
        });

        this.edgeAttributeEditWidget = new AttributeEditWidget({
            attrMan: this.networkViewer.network.edgeAttributeManager,
            type: 'edge',
            autoRender: true,
//            handlers: {
//                '': function (event) {
//                    //todo
//                }
//            }
        });

        this.edgeAttributeFilterWidget = new AttributeFilterWidget({
            attrMan: this.networkViewer.network.edgeAttributeManager,
            type: 'Edge',
            handlers: {
                'vertices:select': function (event) {
                    //event.vertices
                    //TODO
                },
                'vertices:deselect': function (event) {
                    //TODO
                },
                'vertices:filter': function (event) {
                    //event.vertices
                    //TODO
                },
                'vertices:restore': function (event) {
                    //TODO
                }
            }
        });

        /* Edit network */
        this.networkEditWidget = new NetworkEditWidget({
            autoRender: true,
            networkViewer: _this.networkViewer,
            network: _this.networkViewer.network
        });

        /* Configure Layout*/
        this.layoutConfigureWidget = new LayoutConfigureWidget({
            autoRender: true,
            networkViewer: _this.networkViewer
        });

        this.attributeLayoutConfigureWidget = new AttributeLayoutConfigureWidget({
            autoRender: true,
            networkViewer: this.networkViewer
        });


        /* Plugins */
        this.cellbasePlugin = new CellbasePlugin({
            cellMaps: _this
        });

        this.intActPlugin = new IntActPlugin({
            cellMaps: _this
        });

        this.communitiesStructureDetectionPlugin = new CommunitiesStructureDetectionPlugin({
            cellMaps: _this
        });

        this.topologicalStudyPlugin = new TopologicalStudyPlugin({
            cellMaps: _this
        });

//        this.reactomePlugin = new ReactomePlugin({
//            cellMaps: _this
//        });


        /* Job forms */
        this.reactomeFIMicroarrayForm = new ReactomeFIMicroarrayForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            formBorder: false,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });

        this.snowForm = new SnowForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            formBorder: false,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });

        this.networkMinerForm = new NetworkMinerForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            formBorder: false,
            labelWidth: 150,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });

        this.fatigoForm = new FatigoForm({
            webapp: _this,
            type: 'window',
            width: 650,
            testing: false,
            closable: false,
            minimizable: true,
            formBorder: false,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });

        if ($.cookie('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }

        this.rendered = true;
    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.headerWidget.draw();
        this.toolbar.draw();
        this.networkViewer.draw();
        this.jobListWidget.draw();
        this.jobListWidget.hide();
        this.configuration.draw();
        this.configuration.show();


        this.networkEditWidget.draw();
        this.layoutConfigureWidget.draw();
        this.attributeLayoutConfigureWidget.draw();
        this.cellbasePlugin.draw();
        this.intActPlugin.draw();
        this.communitiesStructureDetectionPlugin.draw();
        this.topologicalStudyPlugin.draw();
//        this.reactomePlugin.draw();
        this.reactomeFIMicroarrayForm.draw();
        this.snowForm.draw();
        this.networkMinerForm.draw();
        this.fatigoForm.draw();


    },
    resize: function (args) {
        this.width = args.width;
        this.height = args.height;

        this.toolbar.setWidth();

        var topOffset = this.headerWidget.getHeight() + this.toolbar.getHeight();
        this.networkViewer.resize({
            width: this.width,
            height: this.height - topOffset
        });
    },
    _createHeaderWidget: function (target) {
        var _this = this;
        var headerWidget = new HeaderWidget({
            target: target,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            suiteId: this.suiteId,
            accountData: this.accountData,
            allowLogin: true,
            chunkedUpload: false,
            homeLink: "http://cellmaps.babelomics.org/",
            helpLink: "http://cellmaps.babelomics.org/",
            tutorialLink: "http://cellmaps.babelomics.org/",
            aboutText: '',
            handlers: {
                'login': function (event) {
                    Utils.msg('Welcome', 'You logged in');
                    _this.sessionInitiated();
                },
                'logout': function (event) {
                    Utils.msg('Good bye', 'You logged out');
                    _this.sessionFinished();

                },
                'account:change': function (event) {
                    _this.setAccountData(event.response);

                },
                'jobs:click': function () {
                    _this.jobListWidget.toggle();
                },
                'about:click': function () {
                    _this.jobListWidget.toggle(false);
                }
            }
        });
        return headerWidget;
    },
    _createNetworkViewer: function (target) {
        var _this = this;

        /* check height */
        var topOffset = this.headerWidget.getHeight() + this.toolbar.getHeight();
        var networkViewer = new NetworkViewer({
            target: target,
            autoRender: true,
            sidePanel: false,
            border: false,
            width: this.width,
            height: this.height - topOffset,
            session: this.session,
            handlers: {
                'select:vertices': function (e) {
                    _this.vertexAttributeEditWidget.checkSelectedFilter();
                },
                'select:edges': function (e) {
                    _this.edgeAttributeEditWidget.checkSelectedFilter();
                },
                'change:vertexAttributes': function (e) {
                    _this.toolbar.setVertexAttributes(e.sender);
                },
                'change:edgeAttributes': function (e) {

                }
            }
        });

        networkViewer.on('change', function () {
            _this.trigger('session:save-request', {sender: _this});
        });

        return networkViewer;
    },
    _createToolBar: function (target) {
        var _this = this;
        var cmToolBar = new CmToolBar({
            target: target,
            autoRender: true,
            handlers: {
                /* File */
                'saveJSON:click': function (event) {
                    var content = JSON.stringify(_this.session);
                    var blob = new Blob([content], {type: "application/json"});
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "network.json";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                'openJSON:click': function (event) {
                    var jsonNetworkFileWidget = new JSONNetworkFileWidget({
                        layoutSelector: false,
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.session.loadJSON(widgetEvent.content);
                                _this.loadSession();
//                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    jsonNetworkFileWidget.draw();
                },
                'openDOT:click': function (event) {
                    //TODO fix
                    var dotNetworkFileWidget = new DOTNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.networkViewer.setNetwork(widgetEvent.content);
                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    dotNetworkFileWidget.draw();
                },
                'openSIF:click': function (event) {
//                    _this.networkViewer.clean();
                    var sifNetworkFileWidget = new SIFNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.configuration.cleanVisualSets();
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    sifNetworkFileWidget.draw();
                },
                'click:openXLSX': function (event) {
                    var xlsxNetworkFileWidget = new XLSXNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.configuration.cleanVisualSets();
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    xlsxNetworkFileWidget.draw();
                },
                'click:openText': function (event) {
                    var textNetworkFileWidget = new TextNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.configuration.cleanVisualSets();
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    textNetworkFileWidget.draw();
                },
                'savePNG:click': function (event) {
                    var svg = new XMLSerializer().serializeToString(_this.networkViewer.networkSvgLayout.getSvgEl());
                    var canvas = document.createElement('canvas');
                    canvg(canvas, svg);

                    var dataURL = canvas.toDataURL("image/png");
                    var data = atob(dataURL.substring("data:image/png;base64,".length));
                    var asArray = new Uint8Array(data.length);
                    //data is a string, so when you pass it to blob, the binary data will be that string in UTF-8 encoding. You want binary data not a string.
                    for (var i = 0, len = data.length; i < len; ++i) {
                        asArray[i] = data.charCodeAt(i);
                    }

                    var blob = new Blob([ asArray.buffer ], {type: "image/png"});
                    var url = URL.createObjectURL(blob);

                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "network.png";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                'saveSVG:click': function (event) {
                    var svg = new XMLSerializer().serializeToString(_this.networkViewer.networkSvgLayout.getSvgEl());
                    var blob = new Blob([svg], {type: "image/svg+xml"});
                    var url = URL.createObjectURL(blob);

                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "network.svg";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                'saveSIF:click': function (event) {
                    var content = _this.networkViewer.getAsSIF();
                    var blob = new Blob([content], {type: "data:text/tsv"});
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "network.sif";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                'click:exportVertexAttributes': function (event) {
                    var content = _this.networkViewer.network.vertexAttributeManager.getAsFile();
                    var blob = new Blob([content], {type: "data:text/tsv"});
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "node.attr";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                'click:exportEdgeAttributes': function (event) {
                    var content = _this.networkViewer.network.edgeAttributeManager.getAsFile();
                    var blob = new Blob([content], {type: "data:text/tsv"});
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = "edge.attr";
                    var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    link.dispatchEvent(event);
                },
                /* Network */
                'click:editNetwork': function (event) {
                    _this.networkEditWidget.show();
                },
                /* Attributes */
                'importVertexAttributes:click': function (event) {
                    var attributeNetworkFileWidget = new AttributeNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (attrEvent) {
                                _this.networkViewer.importVertexWithAttributes(attrEvent.content);
                            }
                        }
                    });
                    attributeNetworkFileWidget.draw();
                },
                'importEdgeAttributes:click': function (event) {
                    var attributeNetworkFileWidget = new AttributeNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (attrEvent) {
                                _this.networkViewer.importEdgesWithAttributes(attrEvent.content);
                            }
                        }
                    });
                    attributeNetworkFileWidget.draw();
                },
                'editVertexAttributes:click': function (event) {
                    _this.vertexAttributeEditWidget.draw();
                },
                'editEdgeAttributes:click': function (event) {
                    _this.edgeAttributeEditWidget.draw();
                },
                'filterVertexAttributes:click': function (event) {
                    _this.vertexAttributeFilterWidget.draw();
                },

                /* Plugins */
                'click:cellbase': function (event) {
                    _this.cellbasePlugin.show();
                },

                'click:reactome': function (event) {
//                    _this.reactomePlugin.show();
                },
                'click:intact': function (event) {
                    _this.intActPlugin.show(_this);
                },
                'click:communitiesStructureDetection': function (event) {
                    _this.communitiesStructureDetectionPlugin.show();
                },
                'click:topologicalStudy': function (event) {
                    _this.topologicalStudyPlugin.show();
                },
                'click:reactimeFIMicroarray': function (event) {
                    _this.reactomeFIMicroarrayForm.show();
                },
                'click:snow': function (event) {
                    _this.snowForm.show();
                },
                'click:networkMiner': function (event) {
                    _this.networkMinerForm.show();
                },
                'click:fatigo': function (event) {
                    _this.fatigoForm.show();
                },

                'example:click': function (event) {
                    if (event.example == 1) {
                        $.ajax({
                            url: './example-files/ppi_histone_network.json',
                            dataType: 'json',
                            success: function (data) {
                                _this.session.loadJSON(data);
                                _this.networkViewer.loadSession();
                            }
                        })
                    }
                    if (event.example == 2) {
                        $.ajax({
                            url: './example-files/reactome_network.json',
                            dataType: 'json',
                            success: function (data) {
                                _this.session.loadJSON(data);
                                _this.networkViewer.loadSession();
                            }
                        })
                    }
                    if (event.example == 3) {
                        $.ajax({
                            url: './example-files/ppi_network.json',
                            dataType: 'json',
                            success: function (data) {
                                _this.session.loadJSON(data);
                                _this.networkViewer.loadSession(data);
                            }
                        })
                    }
                },
                'click:newsession': function (event) {
                    Ext.Msg.confirm('Start over', 'All changes will be lost. Are you sure?', function (btn, text) {
                        if (btn == 'yes') {
                            _this.newSession();
                        }
                    });
                },
                'configuration-button:change': function (event) {
                    if (event.selected) {
                        _this.configuration.show();
                    } else {
                        _this.configuration.hide();
                    }
                },
                /* Selection */
                'click:selectAllVertices': function (event) {
                    _this.networkViewer.selectAllVertices();
                },
                'click:selectVerticesNeighbour': function (event) {
                    _this.networkViewer.selectVerticesNeighbour()
                },
                'click:selectVerticesInvert': function (event) {
                    _this.networkViewer.selectVerticesInvert();
                },
                'click:selectAllEdges': function (event) {
                    _this.networkViewer.selectAllEdges();
                },
                'click:selectEdgesNeighbour': function (event) {
                    _this.networkViewer.selectEdgesNeighbour();
                },
                'click:selectAll': function (event) {
                    _this.networkViewer.selectAll();
                },
                'click:layout': function (event) {
                    _this.networkViewer.setLayout(event.option, event);
                },
                'click:configureLayout': function (event) {
                    _this.layoutConfigureWidget.show();
                },
                'click:configureAttributeLayout': function (event) {
                    _this.attributeLayoutConfigureWidget.show();
                }


//                '': function (event) {
//                },


            }
        });
        return cmToolBar;
    },
    _createConfiguration: function (target) {
        var _this = this;

        var configuration = new CellMapsConfiguration({
            target: target,
            vertexAttributeManager: this.networkViewer.network.vertexAttributeManager,
            edgeAttributeManager: this.networkViewer.network.edgeAttributeManager,
            session: this.session,
            handlers: {
                'change:vertexColor': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('color', e.value);
                },
                'change:vertexStrokeColor': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('strokeColor', e.value);
                },
                'change:vertexSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('size', e.value, true);
                },
                'change:vertexStrokeSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('strokeSize', e.value, true);
                },
                'change:vertexShape': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('shape', e.value, true);
                },
                'change:vertexOpacity': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('opacity', e.value);
                },
                'change:vertexLabelSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('labelSize', e.value);
                },
                'change:vertexLabelPositionX': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('labelPositionX', e.value);
                },
                'change:vertexLabelPositionY': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('labelPositionY', e.value);
                },
                'change:vertexLabel': function (e) {
                    _this.networkViewer.network.setVertexLabelByAttribute(e.value);
                },


                'change:edgeColor': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttribute('color', e.value);
                },
                'change:edgeSize': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttribute('size', e.value);
                },
                'change:edgeShape': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttribute('shape', e.value);
                },
                'change:edgeOpacity': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttribute('opacity', e.value);
                },
                'change:edgeLabelSize': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttribute('labelSize', e.value);
                },
                'change:edgeLabel': function (e) {
                    _this.networkViewer.network.setEdgeLabelByAttribute(e.value);
                },

                'change:vertexDisplayAttribute': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttributeMap(e.displayAttribute, e.attribute, e.map);
                },
                'change:edgeDisplayAttribute': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttributeMap(e.displayAttribute, e.attribute, e.map);
                },

                'change:vertexComplexDisplayAttribute': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttributeListMap(e.args);
                },
                'load:defaults': function (e) {

                }
            }
        });

        return configuration;
    },

    _createJobListWidget: function (target) {
        var _this = this;

        var jobListWidget = new JobListWidget({
            target: target,
            timeout: 4000,
            width: 280,
            height: 625,
            tools: this.tools,
            handlers: {
                'item:click': function (data) {
                    _this.jobItemClick(data.item);
                }
            }
        });

        return jobListWidget;
    },
    toJSON: function () {
        var json = this.networkViewer.toJSON();
        json['vertexDefaults'] = this.configuration.vertexDefaults;
        json['edgeDefaults'] = this.configuration.edgeDefaults;
        json['visualSets'] = this.configuration.getVisualSets();
        return json;
    },
    saveSession: function () {
        this.networkViewer.saveSession();
        this.configuration.saveSession();
    },
    loadSession: function () {
        this.networkViewer.loadSession();
        this.configuration.loadSession();
    },
    newSession: function () {
        localStorage.removeItem("CELLMAPS_SESSION");
        var session = new NetworkSession();
        this.session.loadJSON(session);
        this.loadSession();
    },
    sessionInitiated: function () {


    },
    sessionFinished: function () {
        this.jobListWidget.hide();
        this.accountData = null;
    },
    setAccountData: function (response) {
        console.log(response)
        this.accountData = response;
        this.jobListWidget.setAccountData(this.accountData);
    },
    jobItemClick: function (record) {
        var _this = this;

        if (record.get('visites') >= 0) {
            this.networkViewer.setLoading('Loading job...');
            console.log(record);

            var collapseInformation = false;
            var drawIndex = true;
            var title = '';

            var jobId = record.get('id');

            this.newSession();

            switch (record.get('toolName')) {
                case 'reactome-fi.default':
                    collapseInformation = true;
                    drawIndex = false;
                    this._jobReactomeFIClick(jobId);
                    title = 'Reactome FI';
                    break;
                case 'snow.default':
                    collapseInformation = true;
                    drawIndex = false;
                    this._jobSnowClick(jobId);
                    title = 'Snow';
                    break;
                case 'network-miner.default':
                    collapseInformation = true;
                    drawIndex = false;
                    title = 'Network miner';
                    this._jobNetworkMinerClick(jobId);
                    break;
                case 'fatigo.default':
                    drawIndex = false;
                    title = 'Fatigo';
                    break;
            }

            var resultWidget = new ResultWidget({
                title: title,
                type: 'window',
                application: 'cellmaps',
                app: this,
                collapseInformation: collapseInformation,
                width: 1000,
                height: 600,
                drawInformation: false,
                drawIndex: drawIndex,
                layoutName: record.get('toolName')
            });
            resultWidget.draw($.cookie('bioinfo_sid'), record);

            this.networkViewer.setLoading('');
        }

    },
    _jobNetworkMinerClick: function (jobId) {
        var _this = this;
        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'result_mcn.sif',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var sifNetworkDataAdapter = new SIFNetworkDataAdapter({
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            _this.networkViewer.setGraph(event.graph);
                            _this.networkViewer.setLayout('Force directed');
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });

        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'result_mcn_interactors.txt',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    ignoreColumns: {1: true, 7: true, 8: true},
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "MCN_Type";
                            json.attributes[2].name = "MCN_Rank";
                            json.attributes[3].name = "MCN_Betweenness";
                            json.attributes[4].name = "MCN_Clustering";
                            json.attributes[5].name = "MCN_Connections";
                            _this.networkViewer.network.importVertexWithAttributes({content: json});

                            _this.configuration.vertexShapeAttributeWidget.restoreVisualSet({
                                attribute: 'MCN_Type',
                                type: 'String',
                                map: {
                                    seedlist: 'ellipse',
                                    list: 'circle',
                                    external: 'square'
                                }
                            });
                            _this.configuration.vertexSizeAttributeWidget.restoreVisualSet({
                                attribute: 'MCN_Type',
                                type: 'String',
                                map: {
                                    list: 30,
                                    seedlist: 30,
                                    external: 20
                                }
                            });
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });

    },
    _jobSnowClick: function (jobId) {
        var _this = this;
        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'result_subnetwork1.sif',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                    return;
                }
                _this.networkViewer.clean();
                var sifNetworkDataAdapter = new SIFNetworkDataAdapter({
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            _this.networkViewer.setGraph(event.graph);
                            _this.networkViewer.setLayout('Force directed');
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });

        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'result_mcn_interactors_list1.txt',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    ignoreColumns: {1: true, 3: true, 7: true, 8: true},
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "MCN_Type";
                            json.attributes[2].name = "MCN_Betweenness";
                            json.attributes[3].name = "MCN_Clustering";
                            json.attributes[4].name = "MCN_Connections";
                            _this.networkViewer.network.importVertexWithAttributes({content: json});

                            _this.configuration.vertexShapeAttributeWidget.restoreVisualSet({
                                attribute: 'MCN_Type',
                                type: 'String',
                                map: {
                                    list: 'circle',
                                    external: 'square'
                                }
                            });
                            _this.configuration.vertexSizeAttributeWidget.restoreVisualSet({
                                attribute: 'MCN_Type',
                                type: 'String',
                                map: {
                                    list: 30,
                                    external: 20
                                }
                            });
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });

    },
    _jobReactomeFIClick: function (jobId) {
        var _this = this;
        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'mcl_out.sif',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var sifNetworkDataAdapter = new SIFNetworkDataAdapter({
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            _this.networkViewer.setGraph(event.graph);
                            _this.networkViewer.setLayout('Force directed');
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
                n : resul
            }
        });
        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'mcl_node_attributes.txt',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "FI-Module";
                            json.attributes[2].name = "FI-Module color";
                            _this.networkViewer.network.importVertexWithAttributes({content: json});
                            _this.configuration.vertexColorAttributeWidget.applyDirectVisualSet('FI-Module color', 'String');
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });

        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: jobId,
            async: false,
            filename: 'mcl_edge_attributes.txt',
            zip: false,
            success: function (data) {
                if (data.indexOf("ERROR") != -1) {
                    console.error(data);
                }
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    dataSource: new StringDataSource(data),
                    handlers: {
                        'data:load': function (event) {
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "FI-Correlation";
                            _this.networkViewer.network.importEdgesWithAttributes({content: json});
                        },
                        'error:parse': function (event) {
                            console.log(event.errorMsg);
                        }
                    }
                });
            }
        });
    },
    __iliketomoveit: function () {
        this.networkViewer.setLayout('Force directed (simulation)')
    }
}
