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
    this.tools = ["communities-structure-detection.communities-structure-detection"];
    this.version = "2.0.0";
    this.border = true;
    this.resizable = true;
    this.targetId;
    this.width;
    this.height;


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
                if (event.target == window) {
                    if (!_this.resizing) {//avoid multiple resize events
                        _this.resizing = true;
//                        _this.setWidth($(_this.div).width());
                        setTimeout(function () {
                            _this.resizing = false;
                        }, 400);
                    }
                }
            });
        }


        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Genome Maps is not rendered yet');
            return;
        }

        /* Header Widget */
        this.headerWidget = this._createHeaderWidget('cm-header-widget');

        this.cmToolBar = this._createCbToolBar('cm-tool-bar');

        var centerHeight = $(window).height() - this.headerWidget.height - this.cmToolBar.getHeight() - $('#status').height() - 12;

        $('#cm-network-viewer').css({
            height: centerHeight
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


        this.nodeAttributeEditWidget = new AttributeEditWidget({
            attrMan: this.networkViewer.network.nodeAttributeManager,
            type: 'Node',
            autoRender: true,
//            handlers: {
//                '': function (event) {
//                }
//            }
        });
        this.nodeAttributeFilterWidget = new AttributeFilterWidget({
            attrMan: this.networkViewer.network.nodeAttributeManager,
            type: 'Node',
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
            type: 'Edge',
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


        /* Job forms */



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
    _createCbToolBar: function (targetId) {
        var _this = this;
        var cmToolBar = new CmToolBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                'saveJSON:click': function (event) {
                    var content = JSON.stringify(_this.networkViewer.toJSON());
                    event.a.set({
                        href: 'data:text/csv,' + encodeURIComponent(content),
                        download: "network.json"
                    });
                },
                'openJSON:click': function (event) {
                    var networkFileWidget = new NetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.networkViewer.loadJSON(widgetEvent.content);
                                _this.networkViewer.setLayout(widgetEvent.layout);
                            }
                        }
                    });
                    networkFileWidget.draw();
                },
                'openDOT:click': function (event) {
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
                    _this.networkViewer.clean();
                    var sifNetworkFileWidget = new SIFNetworkFileWidget({
                        network: _this.networkViewer.network,
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.networkViewer.drawNetwork();
                                _this.networkViewer.setLayout('Force directed');
                            }
                        }
                    });
                    sifNetworkFileWidget.draw();
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
                'importNodeAttributes:click': function (event) {
                    var importAttributesFileWidget = new ImportAttributesFileWidget({
                        handlers: {
                            'okButton:click': function (attrEvent) {
                                _this.networkViewer.importVertexWithAttributes(attrEvent.content);
                            }
                        }
                    });
                    importAttributesFileWidget.draw();
                },
                'importEdgeAttributes:click': function (event) {
                    var importAttributesFileWidget = new ImportAttributesFileWidget({
                        handlers: {
                            'okButton:click': function (attrEvent) {
                                _this.networkViewer.importEdgesWithAttributes(attrEvent.content);
                            }
                        }
                    });
                    importAttributesFileWidget.draw();
                },
                'editNodeAttributes:click': function (event) {
                    _this.nodeAttributeEditWidget.draw();
                },
                'editEdgeAttributes:click': function (event) {
                    _this.edgeAttributeEditWidget.draw();
                },
                'filterNodeAttributes:click': function (event) {
                    _this.nodeAttributeFilterWidget.draw();
                },


                'cellbase:click': function (event) {
                    _this.cellbasePlugin.show();
                },
//                '': function (event) {
//                },


                'click:reactome': function (event) {
                    var reactome = new ReactomePlugin(_this);
                    reactome.draw();
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
                }
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
                    _this.nodeAttributeEditWidget.checkSelectedFilter();
                },
                'select:edges': function (e) {
                    _this.edgeAttributeEditWidget.checkSelectedFilter();
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
            nodeAttributeManager: this.networkViewer.network.nodeAttributeManager,
            edgeAttributeManager: this.networkViewer.network.edgeAttributeManager,
            handlers: {
                'change:nodeColor': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('color', e.value);
                },
                'change:nodeStrokeColor': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('strokeColor', e.value);
                },
                'change:nodeSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('size', e.value, true);
                },
                'change:nodeStrokeSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('strokeSize', e.value, true);
                },
                'change:nodeShape': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('shape', e.value);
                },
                'change:nodeOpacity': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('opacity', e.value);
                },
                'change:nodeLabelSize': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttribute('labelSize', e.value);
                },
                'change:nodeLabel': function (e) {
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


                'change:nodeDisplayAttribute': function (e) {
                    _this.networkViewer.network.setVerticesRendererAttributeMap(e.diplayAttribute, e.attribute, e.map);
                },
                'change:edgeDisplayAttribute': function (e) {
                    _this.networkViewer.network.setEdgesRendererAttributeMap(e.diplayAttribute, e.attribute, e.map);
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
                'mode': 'view',
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

        return jobListWidget;
    },

    sessionInitiated: function () {

    },
    sessionFinished: function () {
        this.jobListWidget.clean();
        this.accountData = null;
    },
    setAccountData: function (response) {
        this.accountData = response;
//        this.jobListWidget.setAccountData(this.accountData);
    },
    jobItemClick: function (record) {
        var _this = this;
        console.log(record)

    }
}
