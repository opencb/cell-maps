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
    this.tools = ["reactome-fi.default", "snow.default", "network-miner.default", "fatigo.default"];
    this.version = "2.0.4";
    this.border = false;
    this.resizable = true;
    this.targetId;
    this.width;
    this.height;
    this.resizeTimer = 0;

    //set instantiation args, must be last
    _.extend(this, args);

    this.accountData = null;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CellMaps.prototype = {
    render: function (targetId) {

        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }
        console.log("Initializing Cell Maps");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="cell-browser"></div>')[0];
        $(this.targetDiv).append(this.div);

        $(this.div).append('<div id="cm-header-widget"></div>');
        $(this.div).append('<div id="cm-tool-bar" style="position:relative;"></div>');
        $(this.div).append('<div id="cm-network-viewer" style="position:relative;"></div>');
        $(this.div).append('<div id="cm-status-bar"></div>');


        this.rightSidebarDiv = $('<div id="rightsidebar-' + this.id + '" style="position:absolute; z-index:50;right:0px;"></div>')[0];
        $("#cm-network-viewer").append(this.rightSidebarDiv);

        this.configureDiv = $('<div id="configure-' + this.id + '"></div>')[0];
        this.jobsDiv = $('<div id="jobs-' + this.id + '"></div>')[0];
        $(this.configureDiv).css({
            float: 'left',
            marginRight: '2px'
        });
        $(this.jobsDiv).css({
            float: 'left'
        });
        $(this.rightSidebarDiv).append(this.configureDiv);
        $(this.rightSidebarDiv).append(this.jobsDiv);
        this.width = ($(this.div).width());

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }

        // Resize
        if (this.resizable) {
            $(window).resize(function (event) {
                clearTimeout(_this.resizeTimer);
                _this.resizeTimer = setTimeout(function () {
                    _this.resize();
                }, 500);
            });
        }

        this.rendered = true;
    },
    resize: function () {
        var centerHeight = this._getCenterHeight();
        $('#cm-network-viewer').css({
            height: centerHeight
        });
        this.networkViewer.resize();
        this.headerWidget.setWidth();
        this.toolbar.setWidth();
    },
    _getCenterHeight: function () {
        //header toolbar and status must exists
        return $(window).height() - this.headerWidget.height - this.toolbar.getHeight() - $('#status').height() - 2;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Genome Maps is not rendered yet');
            return;
        }

        /* Header Widget */
        this.headerWidget = this._createHeaderWidget('cm-header-widget');

        this.toolbar = this._createToolBar('cm-tool-bar');


        $('#cm-network-viewer').css({
            height: this._getCenterHeight()
        });

        /* network Viewer  */
        this.networkViewer = this._createNetworkViewer('cm-network-viewer');
        /* Side Panel  */
        this.configuration = this._createConfiguration($(this.configureDiv).attr('id'));
        this.configuration.panel.show();


        /* Job List Widget */
        this.jobListWidget = this._createJobListWidget($(this.jobsDiv).attr('id'));

        /* status bar  */
        this.statusBar = this._createStatusBar('status');


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

//        //TEST SCROLL BAR
//        var text = "";
//        this.headerWidget.setDescription(text);

        //check login

        /* Edit network */
        this.networkEditWidget = new NetworkEditWidget({
            autoRender: true,
            networkViewer: _this.networkViewer,
            network: _this.networkViewer.network
        });
        this.networkEditWidget.draw();

        /* Configure Layout*/
        this.layoutConfigureWidget = new LayoutConfigureWidget({
            autoRender: true,
            networkViewer: _this.networkViewer
        });
        this.layoutConfigureWidget.draw();

        this.attributeLayoutConfigureWidget = new AttributeLayoutConfigureWidget({
            autoRender: true,
            networkViewer: this.networkViewer
        });
        this.attributeLayoutConfigureWidget.draw();


        /* Plugins */
        this.cellbasePlugin = new CellbasePlugin({
            cellMaps: _this
        });
        this.cellbasePlugin.draw();

        this.intActPlugin = new IntActPlugin({
            cellMaps: _this
        });
        this.intActPlugin.draw();

        this.communitiesStructureDetectionPlugin = new CommunitiesStructureDetectionPlugin({
            cellMaps: _this
        });
        this.communitiesStructureDetectionPlugin.draw();

        this.topologicalStudyPlugin = new TopologicalStudyPlugin({
            cellMaps: _this
        });
        this.topologicalStudyPlugin.draw();

        this.reactomePlugin = new ReactomePlugin({
            cellMaps: _this
        });
        this.reactomePlugin.draw();


        /* Job forms */
        this.reactomeFIMicroarrayForm = new ReactomeFIMicroarrayForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.reactomeFIMicroarrayForm.draw();

        this.snowForm = new SnowForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.snowForm.draw();

        this.networkMinerForm = new NetworkMinerForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            labelWidth: 150,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.networkMinerForm.draw();

        this.fatigoForm = new FatigoForm({
            webapp: _this,
            type: 'window',
            testing: false,
            closable: false,
            minimizable: true,
            headerFormConfig: {
                baseCls: 'header-form'
            }
        });
        this.fatigoForm.draw();

        if ($.cookie('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }
    },
    _createHeaderWidget: function (targetId) {
        var _this = this;
        var headerWidget = new HeaderWidget({
            targetId: targetId,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            suiteId: this.suiteId,
            accountData: this.accountData,
            allowLogin: true,
            chunkedUpload: false,
            handlers: {
                'login': function (event) {
                    Ext.example.msg('Welcome', 'You logged in');
                    _this.sessionInitiated();
                },
                'logout': function (event) {
                    Ext.example.msg('Good bye', 'You logged out');
                    _this.sessionFinished();

                },
                'account:change': function (event) {
                    _this.setAccountData(event.response);

                }
            }
        });
        headerWidget.draw();
        return headerWidget;
    },
    _createToolBar: function (targetId) {
        var _this = this;
        var cmToolBar = new CmToolBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                /* File */
                'saveJSON:click': function (event) {
                    var content = JSON.stringify(_this.networkViewer.toJSON());
                    event.a.set({
                        href: 'data:text/csv,' + encodeURIComponent(content),
                        download: "network.json"
                    });
                },
                'openJSON:click': function (event) {
                    var jsonNetworkFileWidget = new JSONNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.networkViewer.loadJSON(widgetEvent.content);
                                _this.networkViewer.setLayout(widgetEvent.layout);
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
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout('Force directed');
                            }
                        }
                    });
                    sifNetworkFileWidget.draw();
                },
                'click:openXLSX': function (event) {
                    var xlsxNetworkFileWidget = new XLSXNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout('Force directed');
                            }
                        }
                    });
                    xlsxNetworkFileWidget.draw();
                },
                'click:openText': function (event) {
                    var textNetworkFileWidget = new TextNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                var graph = widgetEvent.content;
                                _this.networkViewer.setGraph(graph);
                                _this.networkViewer.setLayout('Force directed');
                            }
                        }
                    });
                    textNetworkFileWidget.draw();
                },
                'savePNG:click': function (event) {
                    var svgEl = _this.networkViewer.networkSvgLayout.getSvgEl();

                    var svgBack = _this.networkViewer.networkSvgLayout.backgroundSvg;
                    // quit the image background
                    var image = svgEl.removeChild(svgBack);

                    var svg = new XMLSerializer().serializeToString(svgEl);

                    // put again the image background
                    $(svgEl).prepend(image);

                    var canvas = $("<canvas/>", {"id": _this.id + "png", "visibility": _this.id + "hidden"}).appendTo("body")[0];
                    canvg(canvas, svg);
                    event.a.set({
                        href: canvas.toDataURL("image/png"),
                        target: "_blank",
                        download: "network.png"
                    });
                    $("#" + _this.id + "png").remove();
                },
                'saveJPG:click': function (event) {
                    var svgEl = _this.networkViewer.networkSvgLayout.getSvgEl();

                    var svgBack = _this.networkViewer.networkSvgLayout.backgroundSvg;
                    // quit the image background
                    var image = svgEl.removeChild(svgBack);

                    var svg = new XMLSerializer().serializeToString(svgEl);

                    // put again the image background
                    $(svgEl).prepend(image);

                    var canvas = $("<canvas/>", {"id": _this.id + "jpg", "visibility": _this.id + "hidden"}).appendTo("body")[0];
                    canvg(canvas, svg);
                    event.a.set({
                        href: canvas.toDataURL("image/jpg"),
                        target: "_blank",
                        download: "network.jpg"
                    });
                    $("#" + _this.id + "jpg").remove();
                },
                'saveSVG:click': function (event) {
                    var svg = new XMLSerializer().serializeToString(_this.networkViewer.networkSvgLayout.getSvgEl());
                    var content = 'data:image/svg+xml,' + encodeURIComponent(svg);
                    event.a.set({
                        href: content,
                        target: "_blank",
                        download: "network.svg"
                    });
                },
                'saveSIF:click': function (event) {
                    var content = _this.networkViewer.getAsSIF();
                    event.a.set({
                        href: 'data:text/tsv,' + encodeURIComponent(content),
                        target: "_blank",
                        download: "network.sif"
                    });
                },
                'click:exportVertexAttributes': function (event) {
                    var content = _this.networkViewer.network.vertexAttributeManager.getAsFile();
                    event.a.set({
                        href: 'data:text/tsv,' + encodeURIComponent(content),
                        target: "_blank",
                        download: "node.attr"
                    });
                },
                'click:exportEdgeAttributes': function (event) {
                    var content = _this.networkViewer.network.edgeAttributeManager.getAsFile();
                    event.a.set({
                        href: 'data:text/tsv,' + encodeURIComponent(content),
                        target: "_blank",
                        download: "edge.attr"
                    });
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
                    _this.reactomePlugin.show();
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
                        _this.networkViewer.loadJSON(JSON.parse(EXAMPLE_1_JSON));
                    }
                    if (event.example == 2) {
                        _this.networkViewer.loadJSON(JSON.parse(EXAMPLE_2_JSON));
                    }
                    if (event.example == 3) {
                        _this.networkViewer.loadJSON(JSON.parse(EXAMPLE_3_JSON));
                        _this.networkViewer.setLayout('Force directed');
                    }
                },
                'click:newsession': function (event) {
                    Ext.Msg.confirm('Start over', 'All changes will be lost. Are you sure?', function (btn, text) {
                        if (btn == 'yes') {
                            _this.networkViewer.clean();
                        }
                    });
                },
                'configuration-button:change': function (event) {
                    if (event.selected) {
                        _this.configuration.panel.show();
                    } else {
                        _this.configuration.panel.hide();
                    }
                },
                'jobs-button:change': function (event) {
                    if (event.selected) {
                        _this.jobListWidget.show();
                    } else {
                        _this.jobListWidget.hide();
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
    _createNetworkViewer: function (targetId) {
        var _this = this;
        var networkViewer = new NetworkViewer({
            targetId: targetId,
            autoRender: true,
            sidePanel: false,
            border: false,
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
        networkViewer.draw();
        return networkViewer;
    },
    _createConfiguration: function (targetId) {
        var _this = this;

        var configuration = new CellMapsConfiguration({
            autoRender: true,
            targetId: targetId,
            vertexAttributeManager: this.networkViewer.network.vertexAttributeManager,
            edgeAttributeManager: this.networkViewer.network.edgeAttributeManager,
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
                    _this.networkViewer.network.setVerticesRendererAttribute('shape', e.value);
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
                }
            }
        });
        return configuration;
    },
    _createStatusBar: function (targetId) {
        var _this = this;
        var statusBar;
        return  statusBar;
    },

    _createJobListWidget: function (targetId) {
        var _this = this;

        var jobListWidget = new JobListWidget({
            'timeout': 4000,
            'suiteId': this.suiteId,
            'tools': this.tools,
            'pagedViewList': {
                'title': 'Jobs',
                'pageSize': 7,
                'targetId': targetId,
                'order': 0,
                'width': 280,
                'height': 625,
                border: true,
                'mode': 'view'
//                headerConfig: {
//                    baseCls: 'home-header-dark'
//                }
            }
        });

        /**Atach events i listen**/
        jobListWidget.pagedListViewWidget.on('item:click', function (data) {
            _this.jobItemClick(data.item);
        });
        jobListWidget.draw();
        jobListWidget.hide();

        return jobListWidget;
    },

    sessionInitiated: function () {
        this.toolbar.getJobsButton().toggle(true).enable();
    },
    sessionFinished: function () {
        this.jobListWidget.clean();
        this.accountData = null;
        this.toolbar.getJobsButton().toggle(false).disable();
    },
    setAccountData: function (response) {
        this.accountData = response;
        this.jobListWidget.setAccountData(this.accountData);
    },
    jobItemClick: function (record) {
        var _this = this;

        if (record.data.visites >= 0) {
            this.networkViewer.setLoading('Loading job...');
            console.log(record);

            var collapseInformation = false;
            var drawIndex = true;
            var title = '';

            var jobId = record.raw.id;
            switch (record.raw.toolName) {
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
            }

            var resultWidget = new ResultWidget({
                title: title,
                type: 'window',
                application: 'cellmaps',
                app: this,
                collapseInformation: collapseInformation,
                drawIndex: drawIndex,
                layoutName: record.raw.toolName
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
                                attribute:'MCN_Type',
                                type:'String',
                                map:{
                                    seedlist:'ellipse',
                                    list:'circle',
                                    external:'square'
                                }
                            });
                            _this.configuration.vertexSizeAttributeWidget.restoreVisualSet({
                                attribute:'MCN_Type',
                                type:'String',
                                map:{
                                    list:30,
                                    seedlist:30,
                                    external:20
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
                                attribute:'MCN_Type',
                                type:'String',
                                map:{
                                    list:'circle',
                                    external:'square'
                                }
                            });
                            _this.configuration.vertexSizeAttributeWidget.restoreVisualSet({
                                attribute:'MCN_Type',
                                type:'String',
                                map:{
                                    list:30,
                                    external:20
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
                            _this.configuration.vertexColorAttributeWidget.applyDirectVisualSet('FI-Module color','String');
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
    }
}
