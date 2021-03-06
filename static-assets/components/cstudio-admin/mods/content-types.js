CStudioAdminConsole.isDirty = false;
CStudioAdminConsole.contentTypeSelected = "";

window.addEventListener("beforeunload", function (e) {
	confirmationMessage = 'If you leave before saving, your changes will be lost.';

	if (!CStudioAdminConsole.isDirty) {
		return undefined;
	}

	(e || window.event).returnValue = confirmationMessage; //Gecko + IE
	return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});


CStudioAuthoring.Module.requireModule(
	"cstudio-forms-engine",
	'/static-assets/components/cstudio-forms/forms-engine.js',
	{  },
	{ moduleLoaded: function() {

		CStudioAdminConsole.Tool.ContentTypes = CStudioAdminConsole.Tool.ContentTypes ||  function(config, el)  {
				this.containerEl = el;
				this.config = config;
				this.types = [];
				return this;
			}

		/**
		 * Overarching class that drives the content type tools
		 */
		YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes, CStudioAdminConsole.Tool, {

			renderWorkarea: function() {
				var workareaEl = document.getElementById("cstudio-admin-console-workarea");

				workareaEl.innerHTML =
					"<div id='content-type-canvas'>" +
					"</div>"+
					"<div id='content-type-tools'>" +
					"</div>";

				var actions = [
					{ name: CMgs.format(langBundle, "openExistingType"), context: this, method: this.onOpenExistingClick },
					{ name: CMgs.format(langBundle, "createNewType"),    context: this, method: this.onNewClick }
				];
				CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
			},

			titleNameValidation: function(formDef) {
				var sections = formDef.sections;
				var datasources = formDef.datasources;
				var idError = [];
				var flagTitleError = false;

				for(var i = 0; i<sections.length; i++){
					for(var j = 0; j<sections[i].fields.length; j++){
						if(!sections[i].fields[j].title || sections[i].fields[j].title == ''){
							flagTitleError = true;
						}
						if ( (!sections[i].fields[j].id || sections[i].fields[j].id == '') && (sections[i].fields[j].title && sections[i].fields[j].title != '')){
							idError.push(sections[i].fields[j].title);
						}
					}
				}

				for(var i = 0; i<datasources.length; i++){
					if(!datasources[i].title || datasources[i].title == ''){
						flagTitleError = true;
					}
					if ( (!datasources[i].id || datasources[i].id == '') && (datasources[i].title && datasources[i].title != '')){
						idError.push(datasources[i].title);
					}
				}

				return {flagTitleError:flagTitleError, idError:idError}
			},

			templateValidation: function(formDef) {
				var properties = formDef.properties,
					flagTemplateError = false;

				for(var i = 0; i<properties.length; i++){
					if(properties[i].name == 'display-template' && properties[i].value != ""){
						flagTemplateError = true;
					}
				}

				return {flagTemplateError:flagTemplateError}
			},


			openExistingItemRender: function(contentType) {
				var _self = this;

				this.loadFormDefinition(contentType, {

					success: function(formDef) {

						// render content type container in canvas
						this.context.renderContentTypeVisualContainer(formDef);

						// render tools on right
						this.context.renderContentTypeTools(this.context.config);

                        _self.loadConfig(contentType, {

                            success: function (config) {
                                // render save bar
                                CStudioAdminConsole.CommandBar.render([{label:CMgs.format(langBundle, "save"), class:"btn-primary", fn: function() {

                                    var saveFn = function(){

										_self.loadConfig(contentType, {
											success: function(currentConfig) {
												var xmlFormDef = CStudioAdminConsole.Tool.ContentTypes.FormDefMain.serializeDefinitionToXml(formDef),
													xmlConfig = CStudioAdminConsole.Tool.ContentTypes.FormDefMain.serializeConfigToXml(currentConfig, formDef),
													configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH;

												var doc = $.parseXML("<xml/>")
												var json = {key1: 1, key2: 2}
												var xml = doc.getElementsByTagName("xml")[0]
												var key, elem

												for (key in json) {
													if (json.hasOwnProperty(key)) {
														elem = doc.createElement(key)
														$(elem).text(json[key])
														xml.appendChild(elem)
													}
												}

												var cb = {
													success: function () {
														var callBack = {
															success: function () {
																CStudioAdminConsole.isDirty = false;
																CStudioAuthoring.Utils.showNotification(CMgs.format(langBundle, "saved"), "top", "left", "success", 48, 197, "saveContentType");
																_self.clearCache();
															},
															failure: function () {
																CStudioAuthoring.Operations.showSimpleDialog(
																	"errorDialog-dialog",
																	CStudioAuthoring.Operations.simpleDialogTypeINFO,
																	CMgs.format(langBundle, "notification"),
																	CMgs.format(langBundle, "saveFailed"),
																	null, // use default button
																	YAHOO.widget.SimpleDialog.ICON_BLOCK,
																	"studioDialog"
																);
															},
															CMgs: CMgs,
															langBundle: langBundle
														};

														var confPath = configFilesPath + '/content-types' + formDef.contentType +
															'/config.xml';

														var url = "/api/1/services/api/1/site/write-configuration.json" +
															"?site=" + CStudioAuthoringContext.site + "&path=" + confPath;

														YAHOO.util.Connect.resetFormState();
														YAHOO.util.Connect.setDefaultPostHeader(false);
														YAHOO.util.Connect.initHeader("Content-Type", "application/xml; charset=utf-8");
														YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(url), callBack, xmlConfig);

													},
													failure: function () {
														CStudioAuthoring.Operations.showSimpleDialog(
															"errorDialog-dialog",
															CStudioAuthoring.Operations.simpleDialogTypeINFO,
															CMgs.format(langBundle, "notification"),
															CMgs.format(langBundle, "saveFailed"),
															null, // use default button
															YAHOO.widget.SimpleDialog.ICON_BLOCK,
															"studioDialog"
														);
													},
													CMgs: CMgs,
													langBundle: langBundle
												};

												var defPath = configFilesPath + '/content-types' + formDef.contentType +
													'/form-definition.xml';

												var url = "/api/1/services/api/1/site/write-configuration.json" +
													"?site=" + CStudioAuthoringContext.site + "&path=" + defPath;

												YAHOO.util.Connect.resetFormState();
												YAHOO.util.Connect.setDefaultPostHeader(false);
												YAHOO.util.Connect.initHeader("Content-Type", "application/xml; charset=utf-8");
												YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(url), cb, xmlFormDef);

												document.getElementById("cstudio-admin-console-command-bar").children[1].value = CMgs.format(langBundle, "close");
											}
										});

                                    }

                                    var validation = _self.titleNameValidation(formDef);
                                    var istemplate = _self.templateValidation(formDef);

                                    if(validation.flagTitleError){
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "errorTitle-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            CMgs.format(langBundle, "notification"),
                                                CMgs.format(langBundle, "saveFailed") + CMgs.format(langBundle, "errorTitle"),
                                            null, // use default button
                                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                            "studioDialog"
                                        );
                                    }else {
                                        if (validation.idError.length > 0) {
                                            CStudioAuthoring.Operations.showSimpleDialog(
                                                "errorName-dialog",
                                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                                CMgs.format(langBundle, "notification"),
                                                    CMgs.format(langBundle, "saveFailed") + CMgs.format(langBundle, "errorName") + validation.idError.toString().replace(/,/g, ", "),
                                                null, // use default button
                                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                                "studioDialog"
                                            );
                                        } else {
                                            if (!istemplate.flagTemplateError) {
                                                var dialogEl = document.getElementById("errTemplates");
                                                if(dialogEl) {
                                                    dialogEl.parentNode.removeChild(dialogEl);
                                                }
                                                var dialog = new YAHOO.widget.SimpleDialog("errTemplates",
                                                    { width: "400px",fixedcenter: true, visible: false, draggable: false, close: false, modal: true,
                                                        text: CMgs.format(formsLangBundle, "noTemplateAssocAdm"), icon: YAHOO.widget.SimpleDialog.ICON_WARN,
                                                        constraintoviewport: true,
                                                        buttons: [ { text:CMgs.format(formsLangBundle, "continueEditing"),  handler:function(){this.hide();}, isDefault:false },
                                                            { text:CMgs.format(formsLangBundle, "save"),  handler:function(){this.hide(); saveFn();}, isDefault:false }]
                                                    });
                                                dialog.setHeader(CMgs.format(formsLangBundle, "cancelDialogHeader"));
                                                dialog.render(document.body);
                                                dialogEl = document.getElementById("errTemplates");
                                                dialogEl.dialog = dialog;
                                                dialogEl.className +=(' studioDialog');
                                                dialogEl.dialog.show();
                                            } else {
                                                saveFn();
                                            }
                                        }
                                    }
                                }
                                },
                                    {label:CMgs.format(langBundle, "cancel"), class:"btn-default", fn: function() {
                                        if(CStudioAdminConsole.isDirty){
                                            CStudioAuthoring.Operations.showSimpleDialog(
                                                "error-dialog",
                                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                                CMgs.format(langBundle, "notification"),
                                                CMgs.format(langBundle, "contentTypeModifiedWarn"),
                                                [ { text:CMgs.format(formsLangBundle, "yes"),  handler:function(){
                                                    CStudioAdminConsole.isDirty = false;
                                                    _self.renderWorkarea();
                                                    this.hide();}, isDefault:false },
                                                { text:CMgs.format(formsLangBundle, "no"),  handler:function(){
                                                    this.hide();
                                                }, isDefault:false }],
                                                YAHOO.widget.SimpleDialog.ICON_WARN,
                                                "studioDialog"
                                            );
                                        }else {
                                            CStudioAdminConsole.isDirty = false;
                                            _self.renderWorkarea();
                                            CStudioAdminConsole.CommandBar.hide();
                                        }
                                    } }]);
                                amplify.publish("/content-type/loaded");

								_self.clearCache();
                            },

                            failure: function() {
                            }
                        });

					},

					failure: function() {
					},

					context: this
				});
			},

			clearCache: function() {
				var serviceUri = "/api/1/services/api/1/site/clear-configuration-cache.json?site="+CStudioAuthoringContext.site;

				var clearCacheCb = {
					success: function() {}
				};

				YConnect.asyncRequest("GET", CStudioAuthoring.Service.createServiceUri(serviceUri), clearCacheCb);
			},

			/**
			 * load form definition from repository
			 * @param formId
			 * 		path to the form you want to render
			 */
			loadFormDefinition: function(formId, cb) {
				CStudioForms.Util.loadFormDefinition(formId, cb);
			},

            /**
             * load Config from repository
             * @param formId
             * 		path to the form you want to render
             */
            loadConfig: function(formId, cb) {
                CStudioForms.Util.loadConfig(formId, cb);
            },

			/**
			 * render canvas and content type
			 */
			renderContentTypeVisualContainer: function(formDef) {
				var canvasEl = document.getElementById("content-type-canvas");
				var visual = new CStudioAdminConsole.Tool.ContentTypes.FormVisualization(formDef, canvasEl);
				CStudioAdminConsole.Tool.ContentTypes.visualization = visual;

				visual.render();
			},

			/**
			 * Allows toggling in the control and datasources panels
			 */
			togglePanel: function(evt){
				var target = evt.currentTarget;
				var targetIcon = YDom.getChildren(target)[0];
				var targetBody = YDom.getNextSibling(target);

				if(YDom.hasClass(targetIcon,"ttClose")){
					YDom.removeClass(targetIcon,"ttClose");
					YDom.addClass(targetIcon,"ttOpen");
					targetBody.style.display = "none";
					targetBody.parentNode.style.paddingBottom =  '0';
				}else{
					YDom.removeClass(targetIcon,"ttOpen");
					YDom.addClass(targetIcon,"ttClose");
					targetBody.style.display = "block";
					targetBody.parentNode.style.paddingBottom =  '8px';
				}

			},

			/**
			 * render tools on the right
			 */
			renderContentTypeTools: function(config) {

				var controls = config.controls.control;
				var datasources = config.datasources.datasource;
                var formSection = config.formSection;
                var repeatSection = config.repeatSection;
				var toolbarEl = document.getElementById("content-type-tools");
                var self = this;

				if(!controls.length) {
					controls = [controls.control];
				}

				if(!datasources.length) {
					datasources = [datasources.datasource];
				}


				toolbarEl.innerHTML =
					"<div id='type-properties-container' class='content-type-tools-panel content-type-tools-panel-first'>" +
					"<h4 id=\"properties-tools-panel\"><span class=\"content-type-tools-panel-icon ttClose \"></span>"+CMgs.format(langBundle, "propertiesExplorer")+"</h4>" +
					"<div id='properties-container'></div>" +
					"</div>" +
					"<div id='basicContentContainer'><a id='basicContent'>"+CMgs.format(langBundle, "basicContentTypeProp")+"</a></div>" +
					"<div class='content-type-tools-panel'>" +
					"<h4 id=\"control-tools-panel\"><span class=\"content-type-tools-panel-icon ttClose \"></span>"+CMgs.format(langBundle, "controls")+"</h4>" +
					"<div id='widgets-container'></div>" +
					"</div>"+
					"<div class='content-type-tools-panel'>" +
					"<h4 id=\"datasources-tools-panel\"><span class=\"content-type-tools-panel-icon ttClose\"></span>"+CMgs.format(langBundle, "datasources")+"</h4>" +
					"<div id='datasources-container'></div>" +
					"</div>";

				YAHOO.util.Event.addListener("properties-tools-panel","click", this.togglePanel,this,true);
				YAHOO.util.Event.addListener("control-tools-panel","click", this.togglePanel,this,true);
				YAHOO.util.Event.addListener("datasources-tools-panel","click", this.togglePanel,this,true);


				var propertiesPanelEl = document.getElementById("properties-container");
				YAHOO.util.Dom.setStyle(propertiesPanelEl,"overflow-x","hidden");
				YAHOO.util.Dom.setStyle(propertiesPanelEl,"overflow-y", "auto");
				var propertySheet = new CStudioAdminConsole.PropertySheet(propertiesPanelEl, CStudioAdminConsole.Tool.ContentTypes.visualization.definition);
				CStudioAdminConsole.Tool.ContentTypes.propertySheet = propertySheet;

				var controlsPanelEl = document.getElementById("widgets-container");

				// add standard section control
				var formContainerEl = document.createElement("div");
				controlsPanelEl.appendChild(formContainerEl);
				YDom.addClass(formContainerEl, "control");
                formContainerEl.innerHTML = CMgs.format(langBundle, "formSection");
				var dd = new DragAndDropDecorator(formContainerEl);
				YDom.addClass(formContainerEl, "control-section");
                var iconEltFormSection = CStudioAuthoring.Utils.createIcon(formSection, "fa-cube");
                formContainerEl.insertBefore(iconEltFormSection, formContainerEl.firstChild);

				// add repeat control
				var repeatContainerEl = document.createElement("div");
				controlsPanelEl.appendChild(repeatContainerEl);
				YDom.addClass(repeatContainerEl, "control");
				repeatContainerEl.innerHTML = CMgs.format(langBundle, "repeatingGroup");
				var dd = new DragAndDropDecorator(repeatContainerEl);
				YDom.addClass(repeatContainerEl, "new-control-type");
				repeatContainerEl.prototypeField = {
					type: "repeat",

					getName: function() {
						return "repeat";
					},
					getSupportedProperties: function() {
						return [ { label: CMgs.format(langBundle, "minOccurs"), name: "minOccurs", type: "string", defaultValue: "0" },
							{ label: CMgs.format(langBundle, "maxOccurs"), name: "maxOccurs", type: "string", defaultValue: "*" }  ];
					},
					getSupportedConstraints: function() {
						return [ ];
					}
				};
                var iconEltRepeatSection = CStudioAuthoring.Utils.createIcon(repeatSection, "fa-cube");
                repeatContainerEl.insertBefore(iconEltRepeatSection, repeatContainerEl.firstChild);

				var linkContainer = document.getElementById("basicContent");

				var formClickFn = function (evt) {
					fieldEvent = false;
					formItemSelectedEvent.fire(this, true);
				};
				YAHOO.util.Event.on(linkContainer, 'click', formClickFn);
				formClickFn();

				// makes me wonder if this control constructor is too 'smart'?
				// basically we dont care about registering these fields in this use case
				var fakeComponentOwner = { registerField: function() {} };
				CStudioAdminConsole.Tool.ContentTypes.types = [];

                var rememberIdxF = function(callback) {
                    return function(idx) {
                        callback(idx);
                    }
                };

				for(var j=0; j<controls.length; j++) {
					try {
						var controlContainerEl = document.createElement("div"),
                        controlName = controls[j].name ? controls[j].name : controls[j];
						controlsPanelEl.appendChild(controlContainerEl);

                        rememberIdxF(function(idx) {
                            var cb = {
                                moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
                                    try {
                                        var tool = new moduleClass("fake", {}, fakeComponentOwner, [], [], []);
                                        CStudioAdminConsole.Tool.ContentTypes.types[tool.getName()] = tool;
                                        YDom.addClass(this.controlContainerEl, "control");
                                        this.controlContainerEl.innerHTML = tool.getLabel();

                                        var dd = new DragAndDropDecorator(this.controlContainerEl);
                                        tool.id = tool.getFixedId();
                                        this.controlContainerEl.prototypeField = tool;
                                        YDom.addClass(this.controlContainerEl, "new-control-type");
                                        var iconElt = CStudioAuthoring.Utils.createIcon(controls[idx], "fa-cube");
                                        this.controlContainerEl.insertBefore(iconElt, this.controlContainerEl.firstChild);
                                    }
                                    catch (e) {
                                    }
                                },

                                context: this,
                                controlContainerEl: controlContainerEl
                            };

                               CStudioAuthoring.Module.requireModule(
                                       "cstudio-forms-controls-" + controlName,
                                       '/static-assets/components/cstudio-forms/controls/' + controlName+ ".js",
                                   { config: controlName },
                                   cb);
                        })(j);
					}
					catch(err) {
						//alert(err);
					}
				}

				var dd = new DragAndDropDecorator("widget");


				var dsourcePanelEl = document.getElementById("datasources-container");

				CStudioAdminConsole.Tool.ContentTypes.datasources = [];

				for(var l=0; l<datasources.length; l++) {
					try {
						var dsourceContainerEl = document.createElement("div"),
                            dsourceName = datasources[l].name ? datasources[l].name : datasources[l];
						dsourcePanelEl.appendChild(dsourceContainerEl);

                        rememberIdxF(function(idx) {
                            var cb = {
                                moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
                                    try {
                                        var datasource = new moduleClass("", {}, [], []);
                                        CStudioAdminConsole.Tool.ContentTypes.datasources[datasource.getName()] = datasource;
                                        YDom.addClass(this.dsourceContainerEl, "datasource");
                                        YDom.addClass(this.dsourceContainerEl, "new-datasource-type");
                                        this.dsourceContainerEl.innerHTML = datasource.getLabel();


                                        var dd = new DragAndDropDecorator(this.dsourceContainerEl);
                                        this.dsourceContainerEl.prototypeDatasource = datasource;
                                        var iconElt = CStudioAuthoring.Utils.createIcon(datasources[idx], "fa-database");
                                        this.dsourceContainerEl.insertBefore(iconElt, this.dsourceContainerEl.firstChild);
                                    }
                                    catch (e) {
                                    }
                                },

                                context: this,
                                dsourceContainerEl: dsourceContainerEl
                            };


                            CStudioAuthoring.Module.requireModule(
                                "cstudio-forms-controls-" + dsourceName,
                                '/static-assets/components/cstudio-forms/data-sources/' + dsourceName + ".js",
                                { config: dsourceName },
                                cb);
                        })(l);
					}
					catch(err) {
						//alert(err);
					}
				}

				var dd = new DragAndDropDecorator("datasource");
			},

			/**
			 * action that is fired when the user clicks on the open existing item in the context nav
			 */
			onOpenExistingClick: function() {
				var path = "/";
				var chooseTemplateCb = {
					success: function(contentTypes) {

						var selectTemplateDialogCb = {
							moduleLoaded: function(moduleName, dialogClass, moduleConfig) {
								dialogClass.showDialog(moduleConfig.contentTypes, path, false, moduleConfig.selectTemplateCb, false);
							}
						}

						var typeSelectedCb = {
							success: function(typeSelected) {
								this.context.openExistingItemRender(typeSelected);
                                CStudioAdminConsole.contentTypeSelected = typeSelected;
							},
							failure: function() {
							},
							context: this.context.context

						};

						var moduleConfig = {
							contentTypes: contentTypes,
							selectTemplateCb: typeSelectedCb
						};

						CStudioAuthoring.Module.requireModule("dialog-select-template",
							"/static-assets/components/cstudio-dialogs/select-content-type.js",
							moduleConfig,
							selectTemplateDialogCb);
					},

					failure: function() {
					},

					context: this
				};

				CStudioAuthoring.Service.getAllContentTypesForSite(
					CStudioAuthoringContext.site, chooseTemplateCb);
			},

			/**
			 * action that is fired when user clicks on new item in context nav
			 */
			onNewClick: function() {

				var dialogLoadedCb = {
					moduleLoaded: function(moduleName, dialogClass, moduleConfig) {
						var cb = {
							success: function(type) {
								this.context.openExistingItemRender(type);
							},
							failure: function() {
							},

							context: moduleConfig.context
						}

						dialogClass.showDialog(cb, moduleConfig.context.config);
					}
				};

				var moduleConfig = {
					context: this.context
				};

				CStudioAuthoring.Module.requireModule("new-content-type-dialog",
					"/static-assets/components/cstudio-dialogs/new-content-type.js",
					moduleConfig,
					dialogLoadedCb);

			}
		});

		var formItemSelectedEvent = new YAHOO.util.CustomEvent("onFormItemSelected");


		/**
		 * class that drives form visualization
		 */
		CStudioAdminConsole.Tool.ContentTypes.FormVisualization = function(formDef, containerEl) {
			this.containerEl = containerEl;
			this.definition = formDef;

			return this;
		}

		CStudioAdminConsole.Tool.ContentTypes.FormVisualization.prototype = {
			/**
			 * render form visualization
			 */
			render: function() {

				var that = this;
				if (CStudioAdminConsole.Tool.ContentTypes.FormDefMain.dragActionTimer) {
					// If the drag action timer is set, changes are still occurring to the form
					// Call the render method again in a few milliseconds
					setTimeout( function() {
						that.render();
					}, 10);
				}
				this.containerEl.innerHTML = "";
				//Remove old subscriptors to prevent garbage
				formItemSelectedEvent.unsubscribeAll();

				var formVisualContainerEl = document.createElement("div");
				YDom.addClass(formVisualContainerEl, "content-type-visual-container");
				this.containerEl.appendChild(formVisualContainerEl);
				this.formVisualContainerEl = formVisualContainerEl;
				var formTarget = new YAHOO.util.DDTarget(formVisualContainerEl);

				var formNameEl = document.createElement("div");
				YDom.addClass(formNameEl, "content-form-name");
				formNameEl.innerHTML = this.definition.title;
				formVisualContainerEl.appendChild(formNameEl);

				var divPropertiesEl = document.createElement("div");
				YDom.addClass(divPropertiesEl, "content-form-link");
				var linkPropertiesEl = document.createElement("a");
				linkPropertiesEl.innerHTML = "Basic Content Type Properties";
				divPropertiesEl.appendChild(linkPropertiesEl);
				formVisualContainerEl.appendChild(divPropertiesEl);

				formVisualContainerEl.definition = this.definition;

				var formClickFn = function (evt) {
					fieldEvent = false;
					formItemSelectedEvent.fire(this);
				};

				var formSelectedFn = function (evt, selectedEl, isBasicLink) {
					if (fieldEvent == true) return;

					var listeningEl = arguments[2];

					if (selectedEl[0] != listeningEl && !isBasicLink) {
						YDom.removeClass(listeningEl, "content-type-visual-form-container-selected");
					}
					else {
						YDom.addClass(listeningEl, "content-type-visual-form-container-selected");
						CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(listeningEl.definition);
					}
				};

				formItemSelectedEvent.subscribe(formSelectedFn, formVisualContainerEl);
				YAHOO.util.Event.on(formVisualContainerEl, 'click', formClickFn);
				YAHOO.util.Event.on(linkPropertiesEl, 'click', formClickFn);

				this.renderSections();

				var datasourcesContainerEl = document.createElement("div");
				YDom.addClass(datasourcesContainerEl, "content-type-datasources-container");
				formVisualContainerEl.appendChild(datasourcesContainerEl);
				datasourcesContainerEl.definition = this.definition;

				var datasourcesNameEl = document.createElement("span");
				YDom.addClass(datasourcesNameEl, "content-section-name");
				datasourcesNameEl.innerHTML = CMgs.format(langBundle, "datasources");
				datasourcesContainerEl.appendChild(datasourcesNameEl);
				var tar = new YAHOO.util.DDTarget(datasourcesContainerEl);

				this.renderDatasources(datasourcesContainerEl);

				var bottomSpacerEl = document.createElement("div");
				bottomSpacerEl.style.minHeight = "100px";
				formVisualContainerEl.appendChild(bottomSpacerEl);

			},

			/**
			 * render data source objects
			 */
			renderDatasources: function(datasourcesContainerEl) {
				var datasources = this.definition.datasources;

				for(var i=0; i<datasources.length; i++) {
					var datasource = datasources[i];
					var datasourceEl = document.createElement("div");
					YDom.addClass(datasourceEl, "content-type-visual-datasource-container");
					datasourcesContainerEl.appendChild(datasourceEl);

					var datasourceNameEl = document.createElement("span");
					YDom.addClass(datasourceNameEl, "content-datasource-name");
					datasourceNameEl.innerHTML = datasource.title;
					datasourceEl.appendChild(datasourceNameEl);

					var datasourceTypeEl = document.createElement("span");
					YDom.addClass(datasourceTypeEl, "content-datasource-type");
					datasourceTypeEl.innerHTML = datasource.type + " ("+ datasource["interface"] +")";
					datasourceEl.appendChild(datasourceTypeEl);

					var dsNameEl = document.createElement("span");
					YDom.addClass(dsNameEl, "content-datasource-variable");
					dsNameEl.innerHTML = datasource.id;
					datasourceEl.appendChild(dsNameEl);


					datasourceEl.datasource = datasource;
					datasource.datasourceContainerEl = datasourceEl;

					var fieldClickFn = function(evt) {
						fieldEvent = true;
						formItemSelectedEvent.fire(this);
						YAHOO.util.Event.stopEvent(evt);

					};

					var fieldSelectedFn = function(evt, selectedEl) {
						var listeningEl = arguments[2];

						if(selectedEl[0] != listeningEl) {
							YDom.removeClass(listeningEl, "content-type-visual-datasource-container-selected");

							// remove delete control
							var deleteEl = YDom.getElementsByClassName("deleteControl", null, listeningEl)[0];

							if(deleteEl) {
								deleteEl.parentNode.removeChild(deleteEl);
							}
						}
						else {
							YDom.addClass(listeningEl, "content-type-visual-datasource-container-selected");
							try {
								CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(listeningEl.datasource);
							}
							catch(errPropRender) {
							}

							// add delete control
							var deleteEl = YDom.getElementsByClassName("deleteControl", null, listeningEl)[0];

							if(!deleteEl) {
								deleteEl = document.createElement("i");
								YDom.addClass(deleteEl, "deleteControl fa fa-times-circle");
								listeningEl.appendChild(deleteEl);

								var deleteFieldFn = function(evt) {
									CStudioAdminConsole.Tool.ContentTypes.FormDefMain.deleteDatasource(this.parentNode.datasource);
									CStudioAdminConsole.Tool.ContentTypes.visualization.render();
									CStudioAdminConsole.Tool.ContentTypes.propertySheet.renderEmpty();
									YAHOO.util.Event.stopEvent(evt);
								};

								YAHOO.util.Event.on(deleteEl, 'click', deleteFieldFn);
							}

						}
					}

					formItemSelectedEvent.subscribe(fieldSelectedFn, datasourceEl);
					YAHOO.util.Event.on(datasourceEl, 'click', fieldClickFn);
				}
			},

			/**
			 * render form visualization (sections)
			 */
			renderSections: function() {
				var sections = this.definition.sections;
				var reSectionTitle = new RegExp(CStudioForms.Util.defaultSectionTitle + " \\d+");

				for(var i=0; i<sections.length; i++) {
					var section = sections[i];
					var sectionContainerEl = document.createElement("div");

					if (!section.title || reSectionTitle.test(section.title)) {
						section.title = CStudioForms.Util.defaultSectionTitle;
						section.timestamp = Number(new Date());	// Save a timestamp to append to the default section name later on
					}

					YDom.addClass(sectionContainerEl, "content-type-visual-section-container");
					this.formVisualContainerEl.appendChild(sectionContainerEl);

					var sectionNameEl = document.createElement("span");
					YDom.addClass(sectionNameEl, "content-section-name");
					sectionNameEl.innerHTML = section.title;
					sectionContainerEl.appendChild(sectionNameEl);


					section.sectionContainerEl	= sectionContainerEl;
					sectionContainerEl.section = section;

					var dd = new DragAndDropDecorator(sectionContainerEl);
					var tar = new YAHOO.util.DDTarget(sectionContainerEl);

					this.renderFields(section);

					var sectionClickFn = function(evt) {
						fieldEvent = false;
						formItemSelectedEvent.fire(this);
						YAHOO.util.Event.stopEvent(evt);
					};

					var sectionSelectedFn = function(evt, selectedEl) {
						var listeningEl = arguments[2];

						if(selectedEl[0] != listeningEl) {
							YDom.removeClass(listeningEl, "content-type-visual-section-container-selected");

							// remove delete control
							// Adding the class delete-control-section to prevent get the delete control of its children
							var deleteEl = YDom.getElementsByClassName("delete-control-section", null, listeningEl)[0];

							if(deleteEl) {
								deleteEl.parentNode.removeChild(deleteEl);
							}

						}
						else {
							YDom.addClass(listeningEl, "content-type-visual-section-container-selected");
							CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(listeningEl.section);

							// add delete control
							var deleteEl = YDom.getElementsByClassName("delete-control-section", null, listeningEl)[0];

							if(!deleteEl) {
								deleteEl = document.createElement("i");
								YDom.addClass(deleteEl, "deleteControl fa fa-times-circle");
								YDom.addClass(deleteEl, "delete-control-section");
								listeningEl.insertBefore(deleteEl, listeningEl.children[0]);

								var deleteFieldFn = function(evt) {
									CStudioAdminConsole.isDirty = true;
									CStudioAdminConsole.Tool.ContentTypes.FormDefMain.deleteSection(this.parentNode.section);
									CStudioAdminConsole.Tool.ContentTypes.visualization.render();
									CStudioAdminConsole.Tool.ContentTypes.propertySheet.renderEmpty();
									YAHOO.util.Event.stopEvent(evt);
								};

								YAHOO.util.Event.on(deleteEl, 'click', deleteFieldFn);
							}
						}
					};

					formItemSelectedEvent.subscribe(sectionSelectedFn, sectionContainerEl);
					YAHOO.util.Event.on(sectionContainerEl, 'click', sectionClickFn);
				}
			},

			/**
			 * render form visualization (fields)
			 */
			renderFields: function(section) {
				var fields = section.fields;

				for(var i=0; i< fields.length; i++) {
					var field = fields[i];

					if(field) {
						if(field.type != "repeat") {
							// trypical case
							this.renderField(section, field);
						}
						else {
							// item is a repeat: this is like a section in that it's a container but
							// needs to sit in and be ordered with fields
							this.renderRepeat(section, field);
						}
					}
				}
			},

			/**
			 * render a field
			 */
			renderRepeat: function(section, field) {

				var fieldContainerEl = document.createElement("div");

				YDom.addClass(fieldContainerEl, "content-type-visual-repeat-container");
				section.sectionContainerEl.appendChild(fieldContainerEl);
				field.fieldContainerEl = fieldContainerEl;
				field.sectionContainerEl = fieldContainerEl;
				field.section = section;
				fieldContainerEl.field = field; // will act like a field
				fieldContainerEl.section = field; // will also act like a section since it can contain fields

				var fieldNameEl = document.createElement("span");
				YDom.addClass(fieldNameEl, "content-field-name");

				var minValue = (field.properties[0] && field.properties[0].value != "") ? field.properties[0].value : "0";
				var maxValue = (field.properties[0] && field.properties[1].value != "") ? field.properties[1].value : "*";

				fieldNameEl.innerHTML = field.title + " "+CMgs.format(langBundle, "repeatingGroup")+" [" + minValue + " ... " +  maxValue + "]";
				fieldContainerEl.appendChild(fieldNameEl);

				var fieldClickFn = function(evt) {
					fieldEvent = true;
					formItemSelectedEvent.fire(this);
					YAHOO.util.Event.stopEvent(evt);

				};

				this.renderFields(field);

				var fieldSelectedFn = function(evt, selectedEl) {
					var listeningEl = arguments[2];

					if(selectedEl[0] != listeningEl) {
						YDom.removeClass(listeningEl, "content-type-visual-repeat-container-selected");

						// remove delete control
						// Adding the class delete-control-repeat to prevent get the delete control of its children
						var deleteEl = YDom.getElementsByClassName("delete-control-repeat", null, listeningEl)[0];

						if(deleteEl) {
							deleteEl.parentNode.removeChild(deleteEl);
						}
					}
					else {
						YDom.addClass(listeningEl, "content-type-visual-repeat-container-selected");
						CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(listeningEl.field);

						// add delete control
						var deleteEl = YDom.getElementsByClassName("delete-control-repeat", null, listeningEl)[0];

						if(!deleteEl) {
							deleteEl = document.createElement("i");
							YDom.addClass(deleteEl, "deleteControl fa fa-times-circle");
							YDom.addClass(deleteEl, "delete-control-repeat");
							listeningEl.insertBefore(deleteEl, listeningEl.children[0]);

							var deleteFieldFn = function(evt) {
								CStudioAdminConsole.isDirty = true;
								CStudioAdminConsole.Tool.ContentTypes.FormDefMain.deleteField(this.parentNode.field);
								CStudioAdminConsole.Tool.ContentTypes.visualization.render();
								CStudioAdminConsole.Tool.ContentTypes.propertySheet.renderEmpty();
								YAHOO.util.Event.stopEvent(evt);
							};

							YAHOO.util.Event.on(deleteEl, 'click', deleteFieldFn);
						}

					}

				};

				formItemSelectedEvent.subscribe(fieldSelectedFn, fieldContainerEl);
				YAHOO.util.Event.on(fieldContainerEl, 'click', fieldClickFn);

				var dd = new DragAndDropDecorator(fieldContainerEl);
				var tar = new YAHOO.util.DDTarget(fieldContainerEl);
			},

			/**
			 * render a field
			 */
			renderField: function(section, field) {

				var fieldContainerEl = document.createElement("div");

				YDom.addClass(fieldContainerEl, "content-type-visual-field-container");
				section.sectionContainerEl.appendChild(fieldContainerEl);
				field.fieldContainerEl = fieldContainerEl;
				field.section = section;
				fieldContainerEl.field = field;

				var fieldNameEl = document.createElement("span");
				YDom.addClass(fieldNameEl, "content-field-name");
				fieldNameEl.innerHTML = field.title;
				fieldContainerEl.appendChild(fieldNameEl);

				var fieldTypeEl = document.createElement("span");
				YDom.addClass(fieldTypeEl, "content-field-type");
				fieldTypeEl.innerHTML = field.type;
				fieldContainerEl.appendChild(fieldTypeEl);

				var fieldNameEl = document.createElement("span");
				YDom.addClass(fieldNameEl, "content-field-variable");
				fieldNameEl.innerHTML = field.id;
				fieldContainerEl.appendChild(fieldNameEl);

				var dd = new DragAndDropDecorator(fieldContainerEl);
				var tar = new YAHOO.util.DDTarget(fieldContainerEl);

				var fieldClickFn = function(evt) {
					fieldEvent = true;
					formItemSelectedEvent.fire(this);
					YAHOO.util.Event.stopEvent(evt);

				};

				var fieldSelectedFn = function(evt, selectedEl) {
					var listeningEl = arguments[2];

					if(selectedEl[0] != listeningEl) {
						YDom.removeClass(listeningEl, "content-type-visual-field-container-selected");

						// remove delete control
						var deleteEl = YDom.getElementsByClassName("deleteControl", null, listeningEl)[0];

						if(deleteEl) {
							deleteEl.parentNode.removeChild(deleteEl);
						}
					}
					else {
						YDom.addClass(listeningEl, "content-type-visual-field-container-selected");
						CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(listeningEl.field);

						// add delete control
						var deleteEl = YDom.getElementsByClassName("deleteControl", null, listeningEl)[0];

						if(!deleteEl) {
							deleteEl = document.createElement("i");
							YDom.addClass(deleteEl, "deleteControl fa fa-times-circle");
							listeningEl.appendChild(deleteEl);

							var deleteFieldFn = function(evt) {
								CStudioAdminConsole.isDirty = true;
								CStudioAdminConsole.Tool.ContentTypes.FormDefMain.deleteField(this.parentNode.field);
								CStudioAdminConsole.Tool.ContentTypes.visualization.render();
								CStudioAdminConsole.Tool.ContentTypes.propertySheet.renderEmpty();
								YAHOO.util.Event.stopEvent(evt);
							};

							YAHOO.util.Event.on(deleteEl, 'click', deleteFieldFn);
							YAHOO.util.Event.stopEvent(evt);
						}

					}

				};

				formItemSelectedEvent.subscribe(fieldSelectedFn, fieldContainerEl);
				YAHOO.util.Event.on(fieldContainerEl, 'click', fieldClickFn);
			}

		}


		/**
		 * drag and drop controls
		 */
		DragAndDropDecorator = function(id, sGroup, config) {

			DragAndDropDecorator.superclass.constructor.call(this, id, sGroup, config);

			this.logger = this.logger || YAHOO;
			var el = this.getDragEl();
			YAHOO.util.Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent

			this.goingUp = false;
			this.lastY = 0;
		};

		YAHOO.extend(DragAndDropDecorator, YAHOO.util.DDProxy, {

			startDrag: function(x, y) {
				// make the proxy look like the source element
				var dragEl = this.getDragEl();
				var clickEl = this.getEl();
				dragEl.innerHTML = clickEl.innerHTML;
			},

			endDrag: function(e) {

				var srcEl = this.getEl();
				var proxy = this.getDragEl();

				// Show the proxy element and animate it to the src element's location
				YAHOO.util.Dom.setStyle(proxy, "visibility", "");
				var a = new YAHOO.util.Motion(
					proxy, {
						points: {
							to: YAHOO.util.Dom.getXY(srcEl)
						}
					},
					0.2,
					YAHOO.util.Easing.easeOut
				);
				var proxyid = proxy.id;
				var thisid = this.id;

				// Hide the proxy and show the source element when finished with the animation
				a.onComplete.subscribe(function() {
					YAHOO.util.Dom.setStyle(proxyid, "visibility", "hidden");
					YAHOO.util.Dom.setStyle(thisid, "visibility", "");
				});
				a.animate();
			},

			onDragDrop: function(e, id) {

				var formDef = CStudioAdminConsole.Tool.ContentTypes.FormDefMain;

				if (YAHOO.util.DDM.interactionInfo.drop.length > 0) {
					//processDrop = true;
					id = YAHOO.util.DDM.interactionInfo.drop[YAHOO.util.DDM.interactionInfo.drop.length-1].id;
				}

				// The position of the cursor at the time of the drop (YAHOO.util.Point)
				var pt = YAHOO.util.DragDropMgr.interactionInfo.point;

				// The region occupied by the source element at the time of the drop
				var region = YAHOO.util.DragDropMgr.interactionInfo.sourceRegion;

				if (region) {
					// Check to see if we are over the source element's location.  We will
					// append to the bottom of the list once we are sure it was a drop in
					// the negative space (the area of the list without any list items)
					if (!region.intersect(pt)) {
						var handled = true;
						var destEl = YAHOO.util.Dom.get(id);
						var destDD = YAHOO.util.DragDropMgr.getDDById(id);
						var srcEl = this.getEl();
						var item = null;

						if(destEl) {
							if(YAHOO.util.Dom.hasClass(srcEl, "control-section")) {
								// new control from toolbar
								if(!YAHOO.util.Dom.hasClass(destEl, "content-type-visual-field-container") &&
									!YAHOO.util.Dom.hasClass(destEl, "content-type-visual-section-container")&&
									!YAHOO.util.Dom.hasClass(destEl, "content-type-datasources-container")) {
									var form = (destEl.section) ? destEl.section.form : destEl.definition;
									item = CStudioAdminConsole.Tool.ContentTypes.FormDefMain.insertNewSection(form);
									handled = true;
								}
							}
							else if(YAHOO.util.Dom.hasClass(srcEl, "new-control-type")) {
								// new control from toolbar
								var form =  null;

								if(destEl.section) {
									form = destEl.section;
								}
								else if(destEl.field) {
									form = destEl.field.section;
								}

								if(form != null) {
									item = CStudioAdminConsole.Tool.ContentTypes.FormDefMain.insertNewField(
										form, srcEl.prototypeField);
									handled = true;
								}
							}
							else if(YAHOO.util.Dom.hasClass(srcEl, "new-datasource-type")) {
								var form =  null;

								if(!YAHOO.util.Dom.hasClass(destEl, "content-type-visual-field-container") &&
									!YAHOO.util.Dom.hasClass(destEl, "content-type-visual-section-container")) {

									if (destEl.definition) {
										form = destEl.definition;
									}
									else if (destEl.field) {
										form = destEl.field.section.form;
									}
									else if (destEl.section) {
										form = destEl.section.form;
									}
								}

								if (form != null) {
									item = CStudioAdminConsole.Tool.ContentTypes.FormDefMain.insertNewDatasource(form, srcEl.prototypeDatasource);
								}
								handled = true;
							}

							if(handled == true) {
								CStudioAdminConsole.Tool.ContentTypes.visualization.render();
								CStudioAdminConsole.Tool.ContentTypes.propertySheet.render(item);
							}

							destDD.isEmpty = false;
							YAHOO.util.DragDropMgr.refreshCache();

						}
					}
				}
			},

			onDrag: function(e) {

				// Keep track of the direction of the drag for use during onDragOver
				var y = YAHOO.util.Event.getPageY(e);

				if (y < this.lastY) {
					this.goingUp = true;
				} else if (y > this.lastY) {
					this.goingUp = false;
				}

				this.lastY = y;
			},

			onDragEnter: function(e, id) {
				var that = this,
					srcEl = this.getEl(),
					destEl = YAHOO.util.Dom.get(id),
					formDef = CStudioAdminConsole.Tool.ContentTypes.FormDefMain,
					func = null;

				if (YDom.isAncestor("content-type-canvas", srcEl) &&
					YDom.isAncestor("content-type-canvas", destEl) &&
					(srcEl !== destEl) && (!YDom.isAncestor(id, srcEl))) {
					// Only process enter events for elements that are not ancestors or the elements themselves.
					// Leave out the proxy elements (only children of content-type-canvas)

					if (YDom.hasClass(srcEl, "content-type-visual-field-container")) {

						if (YDom.hasClass(destEl, "content-type-visual-field-container") ||
							YDom.hasClass(destEl, "content-type-visual-repeat-container") ||
							YDom.hasClass(destEl, "content-type-visual-section-container")) {

							if (YDom.hasClass(destEl, "content-type-visual-field-container")) {
								func = "moveField";
							} else {
								func = "moveInside";
							}
						}

					} else if (YDom.hasClass(srcEl, "content-type-visual-repeat-container")) {

						if (YDom.hasClass(destEl, "content-type-visual-field-container") ||
							YDom.hasClass(destEl, "content-type-visual-repeat-container") ||
							YDom.hasClass(destEl, "content-type-visual-section-container")) {

							// Only let the repeat groups around items that are outside repeats (under a section) or around
							// other repeats
							if ((YDom.hasClass(destEl, "content-type-visual-field-container") && YDom.hasClass(destEl.parentNode, "content-type-visual-section-container")) ||
								YDom.hasClass(destEl, "content-type-visual-repeat-container")) {
								func = "moveField";
							} else if (YDom.hasClass(destEl, "content-type-visual-section-container")) {
								func = "moveInside";
							}
						}

					} else if (YDom.hasClass(srcEl, "content-type-visual-section-container")) {

						if (YDom.hasClass(destEl, "content-type-visual-section-container")) {
							func = "moveField";
						}
					}

					if (func) {
						// Function was set, therefore there must be a valid interaction

						if (!formDef.dragActionTimer) {
							formDef.dragActionTimer = formDef.createDragAction(func, srcEl, destEl, this.goingUp);
						} else {
							if (formDef.isChanging) {
								// drag action timer was set and currently changes are being made to the form definition and the UI
								// call this method again in a few milliseconds
								setTimeout( function() { that.onDragEnter(e, id) }, 10);
							} else {
								// reset drag action timer that was previosly set
								clearTimeout(formDef.dragActionTimer);
								formDef.dragActionTimer = formDef.createDragAction(func, srcEl, destEl, this.goingUp);
							}
						}
					}
				}
			},

			onDragOut: function(e, id) {
				var that = this,
					srcEl = this.getEl(),
					destEl = YAHOO.util.Dom.get(id),
					formDef = CStudioAdminConsole.Tool.ContentTypes.FormDefMain,
					func = null;

				if (YDom.isAncestor("content-type-canvas", srcEl) &&
					YDom.isAncestor("content-type-canvas", destEl) &&
					(srcEl !== destEl) && (srcEl.parentNode === destEl)) {
					// Only process out events for items coming out from repeat groups that contain them
					// Leave out the proxy element (only children of content-type-canvas)

					if (YDom.hasClass(srcEl, "content-type-visual-field-container")) {

						if (YDom.hasClass(destEl, "content-type-visual-repeat-container")) {
							func = "moveOutside";
						}
					}

					if (func) {
						// Function was set, therefore there must be a valid interaction
						if (!formDef.dragActionTimer) {
							formDef.dragActionTimer = formDef.createDragAction(func, srcEl, destEl, this.goingUp);
						} else {
							if (formDef.isChanging) {
								// drag action timer was set and currently changes are being made to the form definition and the UI
								// call this method again in a few milliseconds
								setTimeout( function() { that.onDragOut(e, id) }, 10);
							} else {
								// reset drag action timer that was previosly set
								clearTimeout(formDef.dragActionTimer);
								formDef.dragActionTimer = formDef.createDragAction(func, srcEl, destEl, this.goingUp);
							}
						}
					}
				}
			}


		});


		CStudioAdminConsole.PropertySheet = function(containerEl, form) {
			this.containerEl = containerEl;
			this.form = form;
		}

		/**
		 * property sheet object
		 */
		CStudioAdminConsole.PropertySheet.prototype = {
			/**
			 * Use when an Item is removed to clean the property sheet
			 */
			renderEmpty: function(){
				if(this.containerEl){
					this.containerEl.innerHTML = "";
					YAHOO.util.Dom.setStyle(this.containerEl,"height","auto");
				}
			},

			/**
			 * main render method
			 */
			render: function(item) {

				this.containerEl.innerHTML = "";
				YAHOO.util.Dom.setStyle(this.containerEl,"height","210px");

				try {
					var sheetEl = document.createElement("div");
					this.containerEl.appendChild(sheetEl);

					if(item) {
						if(item.fieldContainerEl && item.type=="repeat") {
							// item is a repeat group field
							this.renderRepeatPropertySheet(item, sheetEl);
						}
						else if(item.fieldContainerEl) {
							// item is a field
							this.renderFieldPropertySheet(item, sheetEl);
						}
						else if(item.sectionContainerEl) {
							// item is a section
							this.renderSectionPropertySheet(item, sheetEl);
						}
						else if(item.datasourceContainerEl) {
							// item is a datasource
							this.renderDatasourcePropertySheet(item, sheetEl);
						}
						else {
							// item is the form
							this.renderFormPropertySheet(item, sheetEl);
						}
					}
				}
				catch(err) {
                    CStudioAuthoring.Operations.showSimpleDialog(
                        "error-dialog",
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(langBundle, "notification"),
                        err,
                        null, // use default button
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        "studioDialog"
                    );
				}
			},

			renderFormPropertySheet: function(item, sheetEl) {

				this.createRowHeading(CMgs.format(langBundle, "formBasics"), sheetEl);
				this.createRowFn(CMgs.format(langBundle, "formTitle"), "title", item.title, "", "string", sheetEl, function(e, el) { item.title = el.value; CStudioAdminConsole.isDirty = true;} );
				this.createRowFn(CMgs.format(langBundle, "description"), "description", item.description, "", "string", sheetEl,  function(e, el) { item.description = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "objectType"), "objectType", item.objectType, "", "readonly", sheetEl,  function(e, el) { item.objectType = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "contentType"), "content-type", item.contentType, "", "readonly", sheetEl,  function(e, el) { item["content-type"] = el.value; CStudioAdminConsole.isDirty = true;});
                this.createRowFn(CMgs.format(langBundle, "previewImage"), "imageThumbnail", item.imageThumbnail && item.imageThumbnail!="undefined" ? item.imageThumbnail : "", "", "image", sheetEl,  function(e, el) { item.imageThumbnail = el.value; CStudioAdminConsole.isDirty = true; });
				this.createRowFn(CMgs.format(langBundle, "config"), "config", "config.xml", item.contentType, "config", sheetEl,  function(e, el) {CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "controller"), "controller", "controller.groovy", item.contentType, "controller", sheetEl,  function(e, el) {CStudioAdminConsole.isDirty = true;});

				for(var i=0; i<item.properties.length; i++) {
					var property = item.properties[i];

					if (property.name == "content-type") {
						continue;   // Do not add content-type as property
					}

					var itemProperty = "";
					for(var j=0; j<item.properties.length; j++) {
						if(item.properties[j].name == property.name) {
							itemProperty = item.properties[j];
							break;
						}
					}

					var updatePropertyFn = function(name, value) {
						var propFound = false;
						for(var l=0; l<item.properties.length; l++) {
							if(item.properties[l].name === name) {
								propFound = true;
								item.properties[l].value = value;
								CStudioAdminConsole.isDirty = true;
								break;
							}
						}

						if(!propFound) {
							item.properties[item.properties.length] = { name: name, value: value };
						}
					}


					var value = (itemProperty.value) ? itemProperty.value : "";
					var propertyLabel = "";
					if(property.label == "Display Template"){
						propertyLabel = "displayTemplate";
					}else if(property.label == "Merge Strategy"){
						propertyLabel = "mergeStrategy";
					}else if(property.label == "Show In Nav"){
						propertyLabel = "showInNav";
					}else if(property.label == "Descriptor Mapper"){
						propertyLabel = "descriptorMapper";
					}else{
						propertyLabel = property.label;
					}
					this.createRowFn(CMgs.format(langBundle,propertyLabel) , property.name, value,  item.defaultValue, property.type,  sheetEl,   function(e, el) {
						updatePropertyFn(el.fieldName, el.value);
					});
				}

			},

			renderDatasourcePropertySheet: function(item, sheetEl) {

				function getSelectedOption(valueArray, isString) {
					var val = null;

					if( isString && typeof valueArray === 'string' ) {
						valueArray = JSON.parse(valueArray);
					}

					[].forEach.call(valueArray, function(obj) {
						if (obj.selected) {
							val = obj.value;
						}
					});
					return val;
				}

				function updateSelected(defaultArray, selectedDefault, selectedValue) {

					var sdobj, svobj;

					if (selectedDefault != selectedValue) {
						// If the selected values are the same in the default array and the value array, then
						// just return the default array; otherwise, update the selected values in the default array.
						for (var idx in defaultArray) {
							if (defaultArray[idx].value == selectedDefault) {
								sdobj = defaultArray[idx];
							}
							if (defaultArray[idx].value == selectedValue) {
								svobj = defaultArray[idx];

							}
						}
						if (svobj) {
							// Only change the selected objects inside the default array if the selected value
							// from the value array exists in the default array; otherwise, leave the default array as is.
							svobj.selected = true;	// Update the selected value in the default array
							sdobj.selected = false;	// Remove original selection in the default array
						}
					}
					return defaultArray;
				}

				var valueSelected, defaultSelected;

				this.createRowHeading(CMgs.format(langBundle, "datasourceBasics"), sheetEl);
				this.createRowFn(CMgs.format(langBundle, "title"), "title", item.title, "", "variable",  sheetEl, function(e, el) {
                    CStudioAdminConsole.isDirty = true;
                    if(YDom.hasClass(el,"property-input-title")) {
						item.title = el.value;
					}else{
						item.id = el.value;
					}
				} );
				this.createRowFn(CMgs.format(langBundle, "name"),  "name", item.id, "", "variable",  sheetEl,  function(e, el) { item.id = el.value; CStudioAdminConsole.isDirty = true;});

				this.createRowHeading(CMgs.format(langBundle, "properties"), sheetEl);
				var type = CStudioAdminConsole.Tool.ContentTypes.datasources[item.type];
				var properties = type.getSupportedProperties();

				for(var i=0; i<properties.length; i++) {
					var property = properties[i];

					// find property value in instance
					var itemProperty = null;//Initialize null to prevent wrong assignments
					for(var j=0; j<item.properties.length; j++) {
						if(item.properties[j].name == property.name) {
							itemProperty = item.properties[j];
							break;
						}
					}

					if (itemProperty !== null) {

						if (!Array.isArray(property.defaultValue)) {
							value = itemProperty.value ? itemProperty.value : "";
						} else {
							// Default value is an array (e.g. key-value-list)
							// Update the value in case the default value has changed
							valueSelected = getSelectedOption(itemProperty.value, true);
							defaultSelected = getSelectedOption(property.defaultValue);

							value = updateSelected(property.defaultValue, defaultSelected, valueSelected);
						}
					} else {
						// The property does not currently exist in the model instance => probably a new property added to the content type
						// Add it to the model instance, using the property's default values
						value = property.defaultValue ? property.defaultValue : "";
						item.properties[item.properties.length] = { name: property.name,
							value: value,
							type: property.type };
					}

					var updatePropertyFn = function(name, value) {
						var propFound = false;
						for(var l=0; l<item.properties.length; l++) {
							if(item.properties[l].name === name) {
								CStudioAdminConsole.isDirty = true;
								propFound = true;
								item.properties[l].value = value;
								break;
							}
						}

						if(!propFound) {
							item.properties[item.properties.length] = { name: name, value: value };
						}
					}

					this.createRowFn(
						property.label,
						property.name,
						value,
						property.defaultValue,
						property.type,
						sheetEl,
						function(e, el) { updatePropertyFn(el.fieldName, el.value); });
				}
			},

			renderSectionPropertySheet: function(item, sheetEl) {

				var reSectionTitle = new RegExp(CStudioForms.Util.defaultSectionTitle + " \\d+");

				if (!item.title || reSectionTitle.test(item.title)) {
					item.title = CStudioForms.Util.defaultSectionTitle;
					item.timestamp = Number(new Date());	// Save a timestamp to append to the default section name later on
				}

				this.createRowHeading(CMgs.format(langBundle, "sectionBasics"), sheetEl);
				this.createRowFn(CMgs.format(langBundle, "title"), "title", item.title,  "", "string", sheetEl, function(e, el) { item.title = el.value; CStudioAdminConsole.isDirty = true;} );
				this.createRowFn(CMgs.format(langBundle, "description"),  "description", item.description, "",  "string", sheetEl,  function(e, el) { item.description = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "defaultOpen"), "defaultOpen", item.defaultOpen, false, "boolean",  sheetEl,  function(e, el) { item.defaultOpen = el.value; CStudioAdminConsole.isDirty = true;});

			},

			renderRepeatPropertySheet: function(item, sheetEl) {

				if(item.id == undefined){item.id = "";}

				this.createRowHeading("Repeat Group Basics", sheetEl);
				this.createRowFn(CMgs.format(langBundle, "title"), "title", item.title, "",  "variable", sheetEl, function(e, el) {
                    CStudioAdminConsole.isDirty = true;
                    if(YDom.hasClass(el,"property-input-title")) {
						item.title = el.value;
					}else{
						item.id = el.value;
					}
				} );
				this.createRowFn(CMgs.format(langBundle, "variableName"), "id", item.id,  "", "variable", sheetEl, function(e, el) { item.id = el.value; CStudioAdminConsole.isDirty = true;});

				this.createRowFn(CMgs.format(langBundle, "iceGroup"), "iceGroup", item.iceId,  "", "string", sheetEl,  function(e, el) { item.iceId = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "description"), "description", item.description, "", "string",  sheetEl,  function(e, el) { item.description = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "minOccurs"), "minOccurs", item.properties[0].value, "", "string",  sheetEl,  function(e, el) { item.properties[0].value = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "maxOccurs"), "maxOccurs", item.properties[1].value, "*", "string",  sheetEl,  function(e, el) { item.properties[1].value = el.value; CStudioAdminConsole.isDirty = true;});
			},

			renderFieldPropertySheet: function(item, sheetEl) {

				this.itemId = item.id;

				this.createRowHeading(CMgs.format(langBundle, "fieldBasics"), sheetEl);
				this.createRowFn(CMgs.format(langBundle, "title"), "title", item.title,  "", "variable", sheetEl, function(e, el) {
                    CStudioAdminConsole.isDirty = true;
                    if(YDom.hasClass(el,"property-input-title")) {
						item.title = el.value;
					}else{
						item.id = el.value;
					}
				} );
				this.createRowFn(CMgs.format(langBundle, "variableName"), "id", item.id,  "", "variable", sheetEl, function(e, el) { item.id = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "iceGroup"), "iceGroup", item.iceId,  "", "string", sheetEl,  function(e, el) { item.iceId = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "description"), "description", item.description, "",  "string", sheetEl,  function(e, el) { item.description = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "defaultValue"), "defaultValue", item.defaultValue, "", "string", sheetEl,  function(e, el) { item.defaultValue = el.value; CStudioAdminConsole.isDirty = true;});
				this.createRowFn(CMgs.format(langBundle, "help"), "help", item.help, "",  "richText",  sheetEl,  function(e, el) { item.help = el.value; CStudioAdminConsole.isDirty = true;});


				//////////////////////
				this.createRowHeading(CMgs.format(langBundle, "properties"), sheetEl);
				var type = CStudioAdminConsole.Tool.ContentTypes.types[item.type];
				var properties = type.getSupportedProperties(),
					property, itemProperty, value;

				for (var i = 0; i < properties.length; i++) {
					// Loop through the properties supported by the content type
					property = properties[i];

					for (var j = item.properties.length - 1; j >= 0; j--) {
						itemProperty = null;

						// Loop through the properties of the corresponding model instance to find the current property value
						if(item.properties[j].name == property.name) {
							itemProperty = item.properties[j];
							break;
						}
					}

					if (itemProperty != null) {
						value = itemProperty.value ? itemProperty.value : "";
					} else {
						// The property does not currently exist in the model instance => probably a new property added to the content type
						// Add it to the model instance, using the property's default values
						value = property.defaultValue ? property.defaultValue : "";
						item.properties[item.properties.length] = { name: property.name,
							value: value,
							type: property.type };
					}

					var updatePropertyFn = function(name, value) {
						for(var l = item.properties.length - 1; l >= 0; l--) {
							if(item.properties[l].name === name) {
								CStudioAdminConsole.isDirty = true;
								item.properties[l].value = (typeof value == "object" && !Array.isArray(value)) ? JSON.stringify(value) : value;
								break;
							}
						}
					}

					this.createRowFn(
						CMgs.format(langBundle, property.label),
						property.name,
						value,
						property.defaultValue,
						property.type,
						sheetEl,
						function(e, el) { updatePropertyFn(el.fieldName, el.value); });
				}

				//////////////////////////////////////////////////////
				this.createRowHeading(CMgs.format(langBundle, "constraints"), sheetEl);

				var constraints = type.getSupportedConstraints();

				for(var i=0; i<constraints.length; i++) {
					var constraint = constraints[i];

					var itemConstraint = null;
					for(var j=0; j<item.constraints.length; j++) {
						if(item.constraints[j].name == constraint.name) {
							itemConstraint = item.constraints[j];
							break;
						}
					}

					var value = "";
					if(itemConstraint && itemConstraint.value) {
						value = itemConstraint.value;
					}

					var updateConstraintFn = function(name, value) {
						var constraintFound = false;
						for(l=0; l<item.constraints.length; l++) {
							if(item.constraints[l].name === name) {
								constraintFound = true;
								CStudioAdminConsole.isDirty = true;
								item.constraints[l].value = value;
								break;
							}
						}

						if(!constraintFound) {
							item.constraints[item.constraints.length] = { name: name, value: value };
						}
					}

					this.createRowFn(
						constraint.label,
						constraint.name,
						value,
						constraint.defaultValue,
						constraint.type,
						sheetEl,
						function(e, el) { updateConstraintFn(el.fieldName, el.value); });
				}
			},

			/**
			 * render a property sheet heading
			 */
			createRowHeading: function(label, containerEl) {
				var propertyHeadingEl = document.createElement("div");
				YAHOO.util.Dom.addClass(propertyHeadingEl, "property-heading");
				containerEl.appendChild(propertyHeadingEl);
				propertyHeadingEl.innerHTML = label;
			},

			/**
			 * render a property sheet row
			 */
			createRowFn: function(label, fName, value, defaultValue, type, containerEl, fn) {

				var itemId = this.itemId;
				var propertyContainerEl = document.createElement("div");
				YAHOO.util.Dom.addClass(propertyContainerEl, "property-wrapper");
				if (label.length > 24){YAHOO.util.Dom.addClass(propertyContainerEl, "large");}
				containerEl.appendChild(propertyContainerEl);

				var labelEl = document.createElement("div");
				YAHOO.util.Dom.addClass(labelEl, "property-label");
				labelEl.innerHTML = label;
				propertyContainerEl.appendChild(labelEl);
				
				var propTypeCb = {
					moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
						try {
							var propControl = new moduleClass(fName, propertyContainerEl, this.self.form, type);
							propControl.render(value, fn, fName, itemId, defaultValue);
						}
						catch (e) {
						}
					},

					self: this
				};

				var propType = type;

				if(type.indexOf("datasource:") != -1) {
					propType = "datasource";
				}

				CStudioAuthoring.Module.requireModule(
					"cstudio-console-tools-content-types-proptype-"+propType,
					'/static-assets/components/cstudio-admin/mods/content-type-propsheet/' + propType + '.js',
					{},
					propTypeCb);
			}
		}

		CStudioAdminConsole.Tool.ContentTypes.PropertyType = {
		};

		CStudioAdminConsole.Tool.ContentTypes.PropertyType.prototype = {
			render: function(value) {
			},

			getValue: function() {
				return "";
			}
		}

		/**
		 * This class does the actual manipulation of the datastructure that is the form
		 * The rendering and UI figure out what to manipulate and in what ways and then call
		 * this class's methods to get the job done.
		 */
		CStudioAdminConsole.Tool.ContentTypes.FormDefMain = {

			isChanging : false,

			dragActionTimer : null,

			createDragAction : function (func, src, dest, goingUp)
			{
				var that = this,
					f = func,
					s = src,
					d = dest,
					gu = goingUp,
					timerDelay = 300;	// 300 milliseconds

				var timer = setTimeout( function()
				{
					that.isChanging = true;
					that[f](s, d, gu, function() {
						YAHOO.util.DragDropMgr.refreshCache();
						that.isChanging = false;
						that.dragActionTimer = null;
					});    // callback at the end to restore isChanging and dragActionTimer values
					that = f = s = d = gu = null;    // avoid mem leaks
				}, timerDelay);

				return timer;
			},

			insertNewDatasource: function(form, datasourcePrototype) {
				CStudioAdminConsole.isDirty = true;
				var newDataSource  =  {
					id: "",
					title: "",
					properties: [],
					type: datasourcePrototype.getName(),
					form: form
				};
				newDataSource["interface"] = datasourcePrototype.getInterface();

				var supportedProps = datasourcePrototype.getSupportedProperties();
				for(var i=0; i<supportedProps.length; i++) {
					var supportedProperty = supportedProps[i];
					//Assign default value if it exists
					var val = (supportedProperty.defaultValue) ? supportedProperty.defaultValue: "";
					newDataSource.properties[newDataSource.properties.length] = { name: supportedProperty.name, value: val };
				}

				form.datasources[form.datasources.length] = newDataSource;

				return newDataSource;
			},

			/**
			 * delete a datasource
			 */
			deleteDatasource: function(datasource) {
				CStudioAdminConsole.isDirty = true;
				var index = this.findDatasourceIndex(datasource);

				datasource.form.datasources.splice(index, 1);
			},

			/**
			 * insert a field
			 */
			insertNewField: function(section, fieldPrototype) {
				CStudioAdminConsole.isDirty = true;
				if(section.type && section.type == "repeat" && fieldPrototype.getName() == "repeat") {
					// you cannot add repeats to repeats at this time
					return;
				}

				var newField =  {
					constraints: [],
					defaultValue: "",
					description: "",
					help: "",
					iceId: "",
					id: fieldPrototype.id,
					properties: [],
					title: "",
					type: fieldPrototype.getName(),
					section: section
				};

				if(fieldPrototype.getName() == "repeat") {
					newField.fields = [];
				}

				var supportedProps = fieldPrototype.getSupportedProperties();
				for(var i=0; i<supportedProps.length; i++) {
					var supportedProperty = supportedProps[i];
					//Assign default value if it exists
					var value = (supportedProperty.defaultValue)? supportedProperty.defaultValue: "";
					newField.properties[newField.properties.length] = { name:supportedProperty.name, value: value, type:supportedProperty.type, defaultValue: supportedProperty.defaultValue };
				}

				var supportedConstraints = fieldPrototype.getSupportedConstraints();
				for(var j=0; j<supportedConstraints.length; j++) {
					var supportedConstraint = supportedConstraints[j];
					newField.constraints[newField.constraints.length] = { name:supportedConstraint.name, value: "",  type:supportedConstraint.type};
				}

				section.fields[section.fields.length] = newField;

				return newField;
			},

			moveField: function (srcEl, destEl, goingUp, callback) {
				CStudioAdminConsole.isDirty = true;
				var src = (srcEl.field) ? srcEl.field : (srcEl.section) ? srcEl.section : null;
				var dest = (destEl.field) ? destEl.field : (destEl.section) ? destEl.section : null;

				if (src && dest) {
					// We make sure the source and destination elements are properly formed
					if (goingUp) {
						YDom.insertBefore(srcEl, destEl); // insert above
						this.moveFieldLogic(src, dest, true);
					} else {
						YDom.insertAfter(srcEl, destEl);
						this.moveFieldLogic(src, dest, false);
					}
				}
				if (typeof callback == "function") {
					callback();
				}
			},

			/**
			 * move a field before or after another field
			 */
			moveFieldLogic: function(srcEl, destEl, before) {
				CStudioAdminConsole.isDirty = true;
				if (srcEl.form) {
					// Moving sections; only section containers have the form attribute
					var srcElIndex = this.findSectionIndex(srcEl);
					srcEl.form.sections.splice(srcElIndex, 1);

					// insert it in to the new section
					var destElIndex = this.findSectionIndex(destEl);
					if (!before) {
						destElIndex++;
					}
					destEl.form.sections.splice(destElIndex, 0, srcEl);
				} else {
					// Moving items or repeat containers
					// Get the source item and remove it from its section
					var srcElIndex = this.findFieldIndex(srcEl);
					srcEl.section.fields.splice(srcElIndex, 1);

					// insert it in to the new section
					var destElIndex = this.findFieldIndex(destEl);
					if (!before) {
						destElIndex++;
					}
					destEl.section.fields.splice(destElIndex, 0, srcEl);
					srcEl.section = destEl.section;
				}

			},

			moveInside: function(srcEl, destEl, goingUp, callback) {
				CStudioAdminConsole.isDirty = true;
				if (goingUp) {
					var lastChild = YDom.getLastChildBy(destEl, function(el) {
						return el.nodeName == "DIV";
					});
					if (lastChild) {
						YDom.insertAfter(srcEl, lastChild);
					} else {
						destEl.appendChild(srcEl);
					}
					this.moveInsideLogic(srcEl.field, destEl.section, false);
				} else {
					var firstChild = YDom.getFirstChildBy(destEl, function(el) {
						return el.nodeName == "DIV";
					});
					if (firstChild) {
						YDom.insertBefore(srcEl, firstChild);
					} else {
						destEl.appendChild(srcEl);
					}
					this.moveInsideLogic(srcEl.field, destEl.section, true);
				}

				if (typeof callback == "function") {
					callback();
				}
			},

			/**
			 * move a field inside a container (repeat or section)
			 */
			moveInsideLogic: function(srcEl, container, insertFirst) {
				CStudioAdminConsole.isDirty = true;
				// Get the source item and remove it from it's section
				var srcElIndex = this.findFieldIndex(srcEl);
				srcEl.section.fields.splice(srcElIndex, 1);

				// insert item in new section
				if (insertFirst) {
					container.fields.splice(0, 0, srcEl);
				} else {
					container.fields[container.fields.length] = srcEl;
				}
				srcEl.section = container;
			},

			moveOutside: function(srcEl, destEl, goingUp, callback) {
				CStudioAdminConsole.isDirty = true;
				if (goingUp) {
					YDom.insertBefore(srcEl, destEl);
					this.moveOutsideLogic(srcEl.field, destEl.section, true);
				} else {
					YDom.insertAfter(srcEl, destEl);
					this.moveOutsideLogic(srcEl.field, destEl.section, false);
				}

				if (typeof callback == "function") {
					callback();
				}
			},

			/**
			 * move a field outside its container (into the container's parent)
			 */
			moveOutsideLogic: function(srcEl, container, insertFirst) {
				CStudioAdminConsole.isDirty = true;
				var srcElIndex = this.findFieldIndex(srcEl),
					containerIndex = this.findFieldIndex(container);

				if (container.section) {
					// We need the container's parent to move the item into

					// Remove field from container
					srcEl.section.fields.splice(srcElIndex, 1);
					if (!insertFirst) {
						containerIndex++;
					}
					// Insert field into container's parent
					container.section.fields.splice(containerIndex, 0, srcEl);
					srcEl.section = container.section;
				}
			},

			/**
			 * insert new section
			 */
			insertNewSection: function(form) {
				CStudioAdminConsole.isDirty = true;
				var section = {
					description: "",
					title: "",
					defaultOpen: false,
					fields: [],
					form: form
				};

				form.sections[form.sections.length] = section;

				return section;
			},

			/**
			 * delete a section
			 */
			deleteField: function(field) {
				CStudioAdminConsole.isDirty = true;
				var index = this.findFieldIndex(field);
				field.section.fields.splice(index, 1);
			},

			/**
			 * delete a section
			 */
			deleteSection: function(section) {
				CStudioAdminConsole.isDirty = true;
				var index = this.findSectionIndex(section);

				section.form.sections.splice(index, 1);
			},


			/**
			 * determine where in the form a datasource is
			 */
			findDatasourceIndex: function(datasource) {
				var index = -1;
				var datasources = datasource.form.datasources;

				for(var i=0; i<datasources.length; i++) {
					if(datasources[i] == datasource) {
						index = i;
						break;
					}
				}

				return index;
			},


			/**
			 * determine where in the section a field is
			 */
			findFieldIndex: function(field) {
				var index = -1;
				if(field && field.section) {
					var fields = field.section.fields;

					for(var i=0; i < fields.length; i++) {
						if(fields[i] === field) {
							index = i;
							break;
						}
					}
				}
				return index;
			},

			/**
			 * determine where in the form a section is
			 */
			findSectionIndex: function(section) {
				var index = -1;
				var sections = section.form.sections;

				for(var i=0; i < sections.length; i++) {
					if(sections[i] == section) {
						index = i;
						break;
					}
				}
				return index;
			},

			/**
			 * render the definition as XML to be saved in the REPO
			 * formatting needs to come out of this and go in a function
			 */
			serializeDefinitionToXml: function(definition) {
				var xml = "<form>\r\n";
				xml += "\t<title>" + CStudioForms.Util.escapeXml(definition.title) + "</title>\r\n" +
					"\t<description>" + CStudioForms.Util.escapeXml(definition.description) + "</description>\r\n" +
					"\t<objectType>" + definition.objectType + "</objectType>\r\n" +
					"\t<content-type>" + definition.contentType + "</content-type>\r\n" +
                    "\t<imageThumbnail>" + definition.imageThumbnail + "</imageThumbnail>\r\n" +
					"\t<properties>";
				for(var i=0; i<definition.properties.length; i++) {
					var property=definition.properties[i];
					if(property && property.name && property.name != "content-type") {
						xml += "\t\t<property>\r\n";
						xml += "\t\t\t<name>"+property.name+"</name>\r\n";
						xml += "\t\t\t<label>"+CStudioForms.Util.escapeXml(property.label)+"</label>\r\n";
						xml += "\t\t\t<value>"+CStudioForms.Util.escapeXml(property.value)+"</value>\r\n";
						xml += "\t\t\t<type>"+property.type+"</type>\r\n";
						xml += "\t\t</property>\r\n";
					}
				}
				xml += "\t</properties>\r\n";


				xml += "\t<sections>";
				for(var j=0; j<definition.sections.length; j++) {
					xml += this.renderSectionToXml(definition.sections[j]);
				}
				xml += "\t</sections>\r\n";
				xml += "\t<datasources>";
				for(var k=0; k<definition.datasources.length; k++) {
					xml += this.renderDatasourceToXml(definition.datasources[k]);
				}
				xml += "\t</datasources>\r\n";


				xml += "</form>\r\n";

				return xml;
			},

            /**
             * render the Config as XML to be saved in the REPO
             * formatting needs to come out of this and go in a function
             */
            serializeConfigToXml: function(config, formDef) {
                var xml = '<content-type name="'+ config.contentType + '" is-wcm-type="true">\r\n';

                xml += "\t<label>" + CStudioForms.Util.escapeXml(config.label) + "</label>\r\n"+
                    "\t<form>" + CStudioForms.Util.escapeXml(config.form) + "</form>\r\n" +
                    "\t<form-path>" + CStudioForms.Util.escapeXml(config["form-path"]) + "</form-path>\r\n" +
                    "\t<model-instance-path>" + CStudioForms.Util.escapeXml(config["model-instance-path"]) + "</model-instance-path>\r\n" +
                    "\t<file-extension>" + CStudioForms.Util.escapeXml( config["file-extension"]) + "</file-extension>\r\n" +
                    "\t<content-as-folder>" + CStudioForms.Util.escapeXml(config["content-as-folder"]) + "</content-as-folder>\r\n" +
                    "\t<previewable>" + CStudioForms.Util.escapeXml(config.previewable) + "</previewable>\r\n";

                if(formDef.imageThumbnail && formDef.imageThumbnail != "" && formDef.imageThumbnail != "undefined") {
                    xml += "\t<noThumbnail>" + CStudioForms.Util.escapeXml("false") + "</noThumbnail>\r\n" +
                           "\t<image-thumbnail>" + formDef.imageThumbnail + "</image-thumbnail>\r\n";
                }else{
                    xml += "\t<noThumbnail>true</noThumbnail>\r\n" +
                           "\t<image-thumbnail></image-thumbnail>\r\n";
				}

				if(config.paths){
					xml+= "\t<paths>\r\n";

					if(config.paths.excludes){
						xml+= "\t\t<excludes>\r\n";

						if(config.paths.excludes.pattern instanceof Array){
							for(var x = 0; x < config.paths.excludes.pattern.length; x++){
								xml+= "\t\t\t<pattern>" + CStudioForms.Util.escapeXml(config.paths.excludes.pattern[x]) + "</pattern>\r\n";
							}
						}else{
							xml+= "\t\t\t<pattern>" + CStudioForms.Util.escapeXml(config.paths.excludes.pattern) + "</pattern>\r\n";
						}

						xml+= "\t\t</excludes>\r\n";
					}
					if(config.paths.includes){
						xml+= "\t\t<includes>\r\n";

						if(config.paths.includes.pattern instanceof Array){
							for(var x = 0; x < config.paths.includes.pattern.length; x++){
								xml+= "\t\t\t<pattern>" + CStudioForms.Util.escapeXml(config.paths.includes.pattern[x]) + "</pattern>\r\n";
							}
						}else{
							xml+= "\t\t\t<pattern>" + CStudioForms.Util.escapeXml(config.paths.includes.pattern) + "</pattern>\r\n";
						}

						xml+= "\t\t</includes>\r\n";
					}

					xml+= "\t</paths>\r\n";
				}

                xml += "</content-type>\r\n";

                return xml;
            },

			/**
			 * render the xml for a section
			 */
			renderSectionToXml: function(section) {
				var sectionTitle = (section.title != CStudioForms.Util.defaultSectionTitle) ? section.title :
				section.title + " " + section.timestamp;
				var xml = "\t\t<section>\r\n" +
					"\t\t\t<title>" + CStudioForms.Util.escapeXml(sectionTitle) + "</title>\r\n" +
					"\t\t\t<description>" + CStudioForms.Util.escapeXml(section.description) + "</description>\r\n" +
					"\t\t\t<defaultOpen>" + section.defaultOpen + "</defaultOpen>\r\n" +
					"\t\t\t<fields>\r\n";
				for(var i=0; i<section.fields.length; i++) {

					if(section.fields[i]) {
						if(section.fields[i].type!="repeat") {
							xml += this.renderFieldToXml(section.fields[i]);
						}
						else {
							xml += this.renderRepeatToXml(section.fields[i]);
						}
					}
				}
				xml +=   "\t\t\t</fields>\r\n" +
					"\t\t</section>\r\n";

				return xml;
			},

			/**
			 * render a field as xml
			 */
			renderFieldToXml: function(field) {
				var xml = "";

				if(field) {
					xml += "\t\t\t\t<field>\r\n" +
						"\t\t\t\t\t<type>" + field.type + "</type>\r\n" +
						"\t\t\t\t\t<id>" + field.id + "</id>\r\n" +
						"\t\t\t\t\t<iceId>" + field.iceId + "</iceId>\r\n" +
						"\t\t\t\t\t<title>" + CStudioForms.Util.escapeXml(field.title) + "</title>\r\n" +
						"\t\t\t\t\t<description>" + CStudioForms.Util.escapeXml(field.description) + "</description>\r\n" +
						"\t\t\t\t\t<defaultValue>" + CStudioForms.Util.escapeXml(field.defaultValue) + "</defaultValue>\r\n" +
						"\t\t\t\t\t<help>" + CStudioForms.Util.escapeXml(field.help) + "</help>\r\n" +
						"\t\t\t\t\t<properties>\r\n";
					for(var i=0; i<field.properties.length; i++) {
						var property = field.properties[i];
						if(property) {
							var value = property.value;
							if(value === "[]") {
								value = "";
							}

							if((typeof value) != "string") {
								value = JSON.stringify(value);
							}

							xml +=  "\t\t\t\t\t\t<property>\r\n"+
								"\t\t\t\t\t\t\t<name>" + property.name + "</name>\r\n" +
								"\t\t\t\t\t\t\t<value>" + CStudioForms.Util.escapeXml(value) + "</value>\r\n" +
								"\t\t\t\t\t\t\t<type>"+property.type+"</type>\r\n"+
								"\t\t\t\t\t\t</property>\r\n";
						}
					}
					xml +=  "\t\t\t\t\t</properties>\r\n" +
						"\t\t\t\t\t<constraints>\r\n";
					for(var j=0; j<field.constraints.length; j++) {
						var constraint = field.constraints[j];
						if(constraint) {
							xml +=  "\t\t\t\t\t\t<constraint>\r\n"+
								"\t\t\t\t\t\t\t<name>" + constraint.name + "</name>\r\n" +
								"\t\t\t\t\t\t\t<value><![CDATA[" + constraint.value + "]]></value>\r\n" +
								"\t\t\t\t\t\t\t<type>"+ constraint.type +"</type>\r\n"+
								"\t\t\t\t\t\t</constraint>\r\n";
						}
					}
					xml +=   "\t\t\t\t\t</constraints>\r\n" +
						"\t\t\t\t</field>\r\n";
				}
				return xml;
			},

			/**
			 * render a repeat as xml
			 */
			renderRepeatToXml: function(repeat) {
				var xml = "";

				if(repeat) {
					var minValue = (repeat.properties[0] && repeat.properties[0].value != "") ? repeat.properties[0].value : "0";
					var maxValue = (repeat.properties[0] && repeat.properties[1].value != "") ? repeat.properties[1].value : "*";

					xml += "\t\t\t\t<field>\r\n" +
						"\t\t\t\t\t<type>" + repeat.type + "</type>\r\n" +
						"\t\t\t\t\t<id>" + repeat.id + "</id>\r\n" +
						"\t\t\t\t\t<iceId>" + repeat.iceId + "</iceId>\r\n" +
						"\t\t\t\t\t<title>" + CStudioForms.Util.escapeXml(repeat.title) + "</title>\r\n" +
						"\t\t\t\t\t<description>" + CStudioForms.Util.escapeXml(repeat.description) + "</description>\r\n" +
						"\t\t\t\t\t<minOccurs>" + minValue + "</minOccurs>\r\n" +
						"\t\t\t\t\t<maxOccurs>" + maxValue + "</maxOccurs>\r\n";

					xml += "\t\t\t\t\t<properties>\r\n";
					for(var i=0; i<repeat.properties.length; i++) {
						var property = repeat.properties[i];
						if(property) {
							xml +=  "\t\t\t\t\t\t<property>\r\n"+
								"\t\t\t\t\t\t\t<name>" + property.name + "</name>\r\n" +
								"\t\t\t\t\t\t\t<value>" + CStudioForms.Util.escapeXml(property.value) + "</value>\r\n" +
								"\t\t\t\t\t\t\t<type>"+property.type+"</type>\r\n"+
								"\t\t\t\t\t\t</property>\r\n";
						}
					}
					xml +=   "\t\t\t\t\t</properties>\r\n";



					xml += "\t\t\t\t\t<fields>\r\n";
					for(var i=0; i<repeat.fields.length; i++) {
						xml += this.renderFieldToXml(repeat.fields[i]);
					}
					xml +=   "\t\t\t\t\t</fields>\r\n" +
						"\t\t\t\t</field>\r\n";

				}
				return xml;
			},

			/**
			 * render a datasource as xml
			 */
			renderDatasourceToXml: function(datasource) {
				var xml = "";

				if(datasource) {
					xml += "\t\t\t\t<datasource>\r\n" +
						"\t\t\t\t\t<type>" + datasource.type + "</type>\r\n" +
						"\t\t\t\t\t<id>" + datasource.id + "</id>\r\n" +
						"\t\t\t\t\t<title>" + CStudioForms.Util.escapeXml(datasource.title) + "</title>\r\n" +
						"\t\t\t\t\t<interface>" + datasource["interface"] + "</interface>\r\n" +
						"\t\t\t\t\t<properties>\r\n";
					for(var i=0; i<datasource.properties.length; i++) {
						var property = datasource.properties[i];
						if(property) {
							var value = property.value;

							if((typeof value) != "string") {
								value = JSON.stringify(value);
							}

							xml +=  "\t\t\t\t\t\t<property>\r\n"+
								"\t\t\t\t\t\t\t<name>" + property.name + "</name>\r\n" +
								"\t\t\t\t\t\t\t<value>" + CStudioForms.Util.escapeXml(value) + "</value>\r\n" +
								"\t\t\t\t\t\t\t\t<type>"+property.type+"</type>\r\n"+
								"\t\t\t\t\t\t</property>\r\n";
						}
					}
					xml +=   "\t\t\t\t\t</properties>\r\n" +
						"\t\t\t\t</datasource>\r\n";
				}
				return xml;
			}
		}

		CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types",CStudioAdminConsole.Tool.ContentTypes);
	}} );
