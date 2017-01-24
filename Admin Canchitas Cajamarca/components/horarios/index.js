'use strict';

app.horarios = kendo.observable({
    onShow: function () { },
    afterShow: function () { }
});
app.localization.registerView('horarios');

// START_CUSTOM_CODE_horarios
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_horarios
(function (parent) {
    var dataProvider = app.data.backendServices,
        /// start global model properties
        /// end global model properties
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('horariosModel'),
                dataSource;

            if (model) {
                dataSource = model.get('dataSource');
            } else {
                parent.set('horariosModel_delayedFetch', paramFilter || null);
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

        flattenLocationProperties = function (dataItem) {
            var propName, propValue,
                isLocation = function (value) {
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
                typeName: 'horarios',
                dataProvider: dataProvider
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    /// start flattenLocation property
                    flattenLocationProperties(dataItem);
                    /// end flattenLocation property

                }
            },
            error: function (e) {

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
                        'Lunes': {
                            field: 'Lunes',
                            defaultValue: ''
                        },
                        'Martes': {
                            field: 'Martes',
                            defaultValue: ''
                        },
                    }
                },
                schema: {
                    total: function (response) {
                        return response.total; // total is returned in the "total" field of the response
                    }
                }
            },
            serverFiltering: true,
        },
        /// start data sources
        /// end data sources
        horariosModel = kendo.observable({
            _dataSourceOptions: dataSourceOptions,
            fixHierarchicalData: function (data) {
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
            itemClick: function (e) {
                var dataItem = e.dataItem || horariosModel.originalItem;

                app.mobileApp.navigate('#components/horarios/details.html?uid=' + dataItem.uid);

            },
            addClick: function () {
                if (horariosModel.dataSource.total() > 0) {
                    alert("Ya tiene asignado un horario. Edite su horario seleccionándolo y luego edite día por día el horario.");
                } else {
                    app.mobileApp.navigate('#components/horarios/add.html');
                }
            },
            editClick: function () {
                //var uid = this.originalItem.uid;
                //app.mobileApp.navigate('#components/horarios/edit.html?uid=' + uid);
            },
            detailsShow: function (e) {
                $("#tablaHorario").hide(0, function () {
                    kendo.mobile.application.showLoading();
                });
                $("#tablaHorario").hide(500, function () {
                    
                });                
                $("#tablaHorario").show(1500, function () {
                    var uid = e.view.params.uid,
                        dataSource = horariosModel.get('dataSource'),
                        itemModel = dataSource.getByUid(uid);

                    horariosModel.setCurrentItemByUid(uid);

                    /// start detail form show
                    /// end detail form show
                    kendo.mobile.application.hideLoading();
                });
                //$("#tablaHorario").show(1000);
            },
            setCurrentItemByUid: function (uid) {
                var item = uid,
                    dataSource = horariosModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.Lunes) {
                    itemModel.Lunes = String.fromCharCode(160);
                }

                /// start detail form initialization
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Lunes[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Lun = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Martes[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Mar = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Miercoles[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Mie = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Jueves[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Jue = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Viernes[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Vie = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Sabado[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Sab = horas;
                var horas = "";
                for (var i = 0; i < 24; i++) {
                    itemModel.Domingo[i] == true ? horas = horas + "<p class='activo'>" + i + "</p>" : horas = horas + "<p>" + i + "</p>";
                }
                itemModel.Dom = horas;
                /// end detail form initialization

                horariosModel.set('originalItem', itemModel);
                horariosModel.set('currentItem',
                    horariosModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function (linkString) {
                console.log(linkString);
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

    parent.set('addItemViewModel', kendo.observable({
        /// start add model properties
        /// end add model properties
        /// start add model functions
        /// end add model functions
        onShow: function (e) {
            this.set('addFormData', {
                hora0: '',
                hora1: '',
                hora2: '',
                hora3: '',
                hora4: '',
                hora5: '',
                hora6: '',
                hora7: '',
                hora8: '',
                hora9: '',
                hora10: '',
                hora11: '',
                hora12: '',
                hora13: '',
                hora14: '',
                hora15: '',
                hora16: '',
                hora17: '',
                hora18: '',
                hora19: '',
                hora20: '',
                hora21: '',
                hora22: '',
                hora23: '',
                /// start add form data init
                /// end add form data init
            });
            /// start add form show
            /// end add form show
        },
        onCancel: function () {
            /// start add model cancel
            /// end add model cancel
        },
        onSaveClick: function (e) {
            var addFormData = this.get('addFormData'),
                filter = horariosModel && horariosModel.get('paramFilter'),
                dataSource = horariosModel.get('dataSource'),
                addModel = {};

            function saveModel(data) {
                /// start add form data save
                var horas = {
                    "0": !!addFormData.hora0,
                    "1": !!addFormData.hora1,
                    "2": !!addFormData.hora2,
                    "3": !!addFormData.hora3,
                    "4": !!addFormData.hora4,
                    "5": !!addFormData.hora5,
                    "6": !!addFormData.hora6,
                    "7": !!addFormData.hora7,
                    "8": !!addFormData.hora8,
                    "9": !!addFormData.hora9,
                    "10": !!addFormData.hora10,
                    "11": !!addFormData.hora11,
                    "12": !!addFormData.hora12,
                    "13": !!addFormData.hora13,
                    "14": !!addFormData.hora14,
                    "15": !!addFormData.hora15,
                    "16": !!addFormData.hora16,
                    "17": !!addFormData.hora17,
                    "18": !!addFormData.hora18,
                    "19": !!addFormData.hora19,
                    "20": !!addFormData.hora20,
                    "21": !!addFormData.hora21,
                    "22": !!addFormData.hora22,
                    "23": !!addFormData.hora23,
                };
                addModel.Lunes = horas;
                addModel.Martes = horas;
                addModel.Miercoles = horas;
                addModel.Jueves = horas;
                addModel.Viernes = horas;
                addModel.Sabado = horas;
                addModel.Domingo = horas;

                /// end add form data save

                dataSource.add(addModel);
                dataSource.one('change', function (e) {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.sync();
                app.clearFormDomData('add-item-view');
            };

            /// start add form save
            /// end add form save
            /// start add form save handler
            saveModel();
            /// end add form save handler
        }
    }));

    parent.set('editItemViewModel', kendo.observable({
        /// start edit model properties
        /// end edit model properties
        /// start edit model functions
        /// end edit model functions
        editFormData: {},
        onShow: function (e) {
            var that = this,
                itemUid = e.view.params.uid,
                dia = e.view.params.dia,
                dataSource = horariosModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid),
                fixedData = horariosModel.fixHierarchicalData(itemData);

            /// start edit form before itemData

            /// end edit form before itemData
            var diaData;
            switch (dia) {
                case 'Lunes':
                    diaData = itemData.Lunes;
                    break;
                case 'Martes':
                    diaData = itemData.Martes;
                    break;
                case 'Miercoles':
                    diaData = itemData.Miercoles;
                    break;
                case 'Jueves':
                    diaData = itemData.Jueves;
                    break;
                case 'Viernes':
                    diaData = itemData.Viernes;
                    break;
                case 'Sabado':
                    diaData = itemData.Sabado;
                    break;
                default:
                    diaData = itemData.Domingo;
                    break;
            }
            this.set('itemData', itemData);
            this.set('editFormData', {
                dia: dia,
                hora0: diaData[0],
                hora1: diaData[1],
                hora2: diaData[2],
                hora3: diaData[3],
                hora4: diaData[4],
                hora5: diaData[5],
                hora6: diaData[6],
                hora7: diaData[7],
                hora8: diaData[8],
                hora9: diaData[9],
                hora10: diaData[10],
                hora11: diaData[11],
                hora12: diaData[12],
                hora13: diaData[13],
                hora14: diaData[14],
                hora15: diaData[15],
                hora16: diaData[16],
                hora17: diaData[17],
                hora18: diaData[18],
                hora19: diaData[19],
                hora20: diaData[20],
                hora21: diaData[21],
                hora22: diaData[22],
                hora23: diaData[23],
                /// end edit form data init
            });

            /// start edit form show
            /// end edit form show
        },
        linkBind: function (linkString) {
            var linkChunks = linkString.split(':');
            return linkChunks[0] + ':' + this.get('itemData.' + linkChunks[1]);
        },
        onSaveClick: function (e) {
            var that = this,
                editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = horariosModel.get('dataSource');

            /// edit properties
            var horas = {
                "0": !!editFormData.hora0,
                "1": !!editFormData.hora1,
                "2": !!editFormData.hora2,
                "3": !!editFormData.hora3,
                "4": !!editFormData.hora4,
                "5": !!editFormData.hora5,
                "6": !!editFormData.hora6,
                "7": !!editFormData.hora7,
                "8": !!editFormData.hora8,
                "9": !!editFormData.hora9,
                "10": !!editFormData.hora10,
                "11": !!editFormData.hora11,
                "12": !!editFormData.hora12,
                "13": !!editFormData.hora13,
                "14": !!editFormData.hora14,
                "15": !!editFormData.hora15,
                "16": !!editFormData.hora16,
                "17": !!editFormData.hora17,
                "18": !!editFormData.hora18,
                "19": !!editFormData.hora19,
                "20": !!editFormData.hora20,
                "21": !!editFormData.hora21,
                "22": !!editFormData.hora22,
                "23": !!editFormData.hora23,
            };
            switch (editFormData.dia) {
                case 'Lunes':
                    itemData.set('Lunes', horas);
                    break;
                case 'Martes':
                    itemData.set('Martes', horas);
                    break;
                case 'Miercoles':
                    itemData.set('Miercoles', horas);
                    break;
                case 'Jueves':
                    itemData.set('Jueves', horas);
                    break;
                case 'Viernes':
                    itemData.set('Viernes', horas);
                    break;
                case 'Sabado':
                    itemData.set('Sabado', horas);
                    break;
                default:
                    itemData.set('Domingo', horas);
                    break;
            }
            /// start edit form data save
            /// end edit form data save

            function editModel(data) {
                /// start edit form data prepare
                /// end edit form data prepare
                dataSource.one('sync', function (e) {
                    /// start edit form data save success
                    /// end edit form data save success

                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function () {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
                app.clearFormDomData('edit-item-view');
            };
            /// start edit form save
            /// end edit form save
            /// start edit form save handler
            editModel();
            /// end edit form save handler
        },
        onCancel: function () {
            /// start edit form cancel
            /// end edit form cancel
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('horariosModel', horariosModel);
            var param = parent.get('horariosModel_delayedFetch');
            if (typeof param !== 'undefined') {
                parent.set('horariosModel_delayedFetch', undefined);
                fetchFilteredData(param);
            }
        });
    } else {
        parent.set('horariosModel', horariosModel);
    }

    parent.set('onShow', function (e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper'),
            dataSourceOptions = horariosModel.get('_dataSourceOptions'),
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
        horariosModel.set('dataSource', dataSource);
        fetchFilteredData(param);
    });

})(app.horarios);

// START_CUSTOM_CODE_horariosModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_horariosModel

function editarDia(dia) {
    var uid = app.horarios.horariosModel.originalItem.uid;
    app.mobileApp.navigate('#components/horarios/edit.html?uid=' + uid + '&dia=' + dia);
}