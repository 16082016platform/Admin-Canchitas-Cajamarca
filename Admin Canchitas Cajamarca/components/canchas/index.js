'use strict';

app.canchas = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});
app.localization.registerView('canchas');

// START_CUSTOM_CODE_canchas
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_canchas
(function(parent) {
    var dataProvider = app.data.backendServices,
        /// start global model properties

        processImage = function(img) {

            function isAbsolute(img) {
                if  (img && (img.slice(0,  5)  ===  'http:' || img.slice(0,  6)  ===  'https:' || img.slice(0,  2)  ===  '//'  ||  img.slice(0,  5)  ===  'data:')) {
                    return true;
                }
                return false;
            }

            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (!isAbsolute(img)) {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        /// end global model properties

        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('canchasModel'),
                dataSource;

            if (model) {
                dataSource = model.get('dataSource');
            } else {
                parent.set('canchasModel_delayedFetch', paramFilter || null);
                return;
            }

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },

        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'canchas',
                dataProvider: dataProvider
            },
            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    /// start flattenLocation property
                    flattenLocationProperties(dataItem);
                    /// end flattenLocation property

                }
            },
            error: function(e) {

                if (e.xhr) {
                    var errorText = "";
                    try {
                        errorText = JSON.stringify(e.xhr);
                    } catch (jsonErr) {
                        errorText = e.xhr.responseText || e.xhr.statusText || 'An error has occurred!';
                    }
                    alert(errorText);
                }
            },
            schema: {
                model: {
                    fields: {
                        'celular': {
                            field: 'celular',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
        },
        /// start data sources
        /// end data sources
        canchasModel = kendo.observable({
            _dataSourceOptions: dataSourceOptions,
            fixHierarchicalData: function(data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    if ($.type(source) !== 'object') {
                        return;
                    }

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function(e) {
                var dataItem = e.dataItem || canchasModel.originalItem;

                app.mobileApp.navigate('#components/canchas/details.html?uid=' + dataItem.uid);

            },
            editClick: function() {
                var uid = this.originalItem.uid;
                app.mobileApp.navigate('#components/canchas/edit.html?uid=' + uid);
            },
            detailsShow: function(e) {
                var uid = e.view.params.uid,
                    dataSource = canchasModel.get('dataSource'),
                    itemModel = dataSource.getByUid(uid);

                canchasModel.setCurrentItemByUid(uid);

                /// start detail form show
                /// end detail form show
            },
            setCurrentItemByUid: function(uid) {
                var item = uid,
                    dataSource = canchasModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.celular) {
                    itemModel.celular = String.fromCharCode(160);
                }

                /// start detail form initialization

                itemModel.fotoImage = processImage(itemModel.foto);

                /// end detail form initialization

                canchasModel.set('originalItem', itemModel);
                canchasModel.set('currentItem',
                    canchasModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function(linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get('currentItem.' + linkChunks[1]);
                }
                return linkChunks[0] + this.get('currentItem.' + linkChunks[1]);
            },
            /// start masterDetails view model functions
            /// end masterDetails view model functions
            currentItem: {}
        });

    parent.set('editItemViewModel', kendo.observable({
        /// start edit model properties
        /// end edit model properties
        /// start edit model functions
        /// end edit model functions
        editFormData: {},
        onShow: function(e) {
            var that = this,
                itemUid = e.view.params.uid,
                dataSource = canchasModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid),
                fixedData = canchasModel.fixHierarchicalData(itemData);

            /// start edit form before itemData
            /// end edit form before itemData

            this.set('itemData', itemData);
            this.set('editFormData', {
                telefono: itemData.telefono,
                celular: itemData.celular,
                contacto: itemData.contacto,
                nombre: itemData.nombre,
                /// start edit form data init
                /// end edit form data init
            });

            /// start edit form show

            app.showFileUploadName('edit-item-view');
            /// end edit form show

        },
        linkBind: function(linkString) {
            var linkChunks = linkString.split(':');
            return linkChunks[0] + ':' + this.get('itemData.' + linkChunks[1]);
        },
        onSaveClick: function(e) {
            var that = this,
                editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = canchasModel.get('dataSource');

            /// edit properties
            itemData.set('telefono', editFormData.telefono);
            itemData.set('celular', editFormData.celular);
            itemData.set('contacto', editFormData.contacto);
            itemData.set('nombre', editFormData.nombre);
            /// start edit form data save
            /// end edit form data save

            function editModel(data) {
                /// start edit form data prepare

                if (data && data.fotoIndex) {
                    itemData.set('foto', data.fotoIndex.Id);
                }

                /// end edit form data prepare

                dataSource.one('sync', function(e) {
                    /// start edit form data save success
                    /// end edit form data save success

                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
                app.clearFormDomData('edit-item-view');
            };
            /// start edit form save

            var totalUploadFields = 0,
                uploaded = [];

            var fotoReader = new FileReader(),
                fotoField = $("#foto")[0].files[0];
            if (fotoField) {
                totalUploadFields++;
                fotoReader.onload = function() {
                    var file = {
                        "Filename": fotoField.name,
                        "ContentType": fotoField.type,
                        "base64": fotoReader.result.split(',')[1]
                    };

                    dataProvider.files.create(file,
                        successEdit.bind(this, "fotoIndex"),
                        function(error) {
                            alert(JSON.stringify(error));
                        });
                };
            }

            if (!fotoField) {
                successEdit("foto", {});
            } else {
                fotoReader.readAsDataURL(fotoField);
            }
            /// end edit form save

            /// start edit form save handler
            if (totalUploadFields === 0) {
                editModel();
            }

            function successEdit(fileName, data) {
                uploaded[fileName] = data.result;
                uploaded.length++;

                if (uploaded.length == totalUploadFields) {
                    editModel(uploaded);
                }
            }
            /// end edit form save handler
        },
        onCancel: function() {
            /// start edit form cancel
            /// end edit form cancel
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('canchasModel', canchasModel);
            var param = parent.get('canchasModel_delayedFetch');
            if (typeof param !== 'undefined') {
                parent.set('canchasModel_delayedFetch', undefined);
                fetchFilteredData(param);
            }
        });
    } else {
        parent.set('canchasModel', canchasModel);
    }

    parent.set('onShow', function(e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper'),
            dataSourceOptions = canchasModel.get('_dataSourceOptions'),
            dataSource;

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        dataSource = new kendo.data.DataSource(dataSourceOptions);
        canchasModel.set('dataSource', dataSource);
        fetchFilteredData(param);
    });

})(app.canchas);

// START_CUSTOM_CODE_canchasModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_canchasModel