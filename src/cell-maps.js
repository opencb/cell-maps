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
    this.suiteId = 10;
    this.title = 'Cell Maps';
    this.description = "Systems Biology Visualization";
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
        $(this.div).append('<div id="cm-tool-bar"></div>');
        $(this.div).append('<div id="cm-network-viewer" style="position:relative;"></div>');
        $(this.div).append('<div id="cm-status-bar"></div>');

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

        /* status bar  */
        this.statusBar = this._createStatusBar('status');


        this.nodeAttributeEditWidget = new AttributeEditWidget({
            attrMan: this.networkViewer.network.nodeAttributeManager,
            type: 'Node',
            handlers: {
                'vertices:select': function (event) {
                    _this.networkViewer.networkSvgLayout.selectVerticesByIds(event.vertices)
                }
            }
        });
        this.nodeAttributeFilterWidget = new AttributeFilterWidget({
            attrMan: this.networkViewer.network.nodeAttributeManager,
            type: 'Node',
            handlers: {
                'vertices:select': function (event) {
                    _this.networkViewer.networkSvgLayout.selectVerticesByIds(event.vertices)
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
            handlers: {
                'vertices:select': function (event) {
                    //todo
                }
            }
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
                    var sifNetworkFileWidget = new SIFNetworkFileWidget({
                        handlers: {
                            'okButton:click': function (widgetEvent) {
                                _this.networkViewer.setNetwork(widgetEvent.content);
                                _this.networkViewer.setLayout(widgetEvent.layout);
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
                        "numNodes": _this.networkViewer.getVerticesLength(),
                        handlers: {
                            'okButton:click': function (attrEvent) {
                                _this.networkViewer.importVertexWithAttributes(attrEvent.content);
                            }
                        }
                    });
                    importAttributesFileWidget.draw();
                },
                'editNodeAttributes:click': function (event) {
                    _this.nodeAttributeEditWidget.draw(_this.networkViewer.getSelectedVertices());
                },
                'filterNodeAttributes:click': function (event) {
                    _this.nodeAttributeFilterWidget.draw(_this.networkViewer.getSelectedVertices());
                },
                '': function (event) {
                },
                '': function (event) {
                },
                '': function (event) {
                },
                '': function (event) {
                },
                '': function (event) {
                },
                '': function (event) {
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
            border: false
        });
        networkViewer.draw();
        return networkViewer;
    },
    _createStatusBar: function (targetId) {
        var _this = this;
        var statusBar;
        return  statusBar;
    },
    sessionInitiated: function () {

    },
    sessionFinished: function () {

    },
    setAccountData: function (response) {
        this.accountData = response;
    }
}
