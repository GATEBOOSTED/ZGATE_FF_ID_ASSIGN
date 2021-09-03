sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/table/Row",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/model/FilterType",
    "../model/formatter"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, TableRow, MessageBox, MessageToast, Filter, FilterOperator, ValueState, Dialog, DialogType, Button, ButtonType, Text, FilterType, Formatter) {
        "use strict";

        return Controller.extend("GATE.ZGATE_FF_ASS.controller.Main", {

            formatter: Formatter,

            onInit: function () {

                this.dateFormatYYYYMMDD = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyyMMdd" });
                this.dateFormatDDMMYYYY = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });

                // Validity Date : From
                var Today = new Date();
                //this.getView().byId("iValDateFrom").setValue(this.dateFormatDDMMYYYY.format(Today));

                // Validity Date : To
                //var oneYearFromNow = new Date();
                //oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                //oneYearFromNow.setDate(oneYearFromNow.getDate() - 1);
                // this.getView().byId("iValDateTo").setValue(this.dateFormatDDMMYYYY.format(oneYearFromNow));

                var GlobalData = new JSONModel({
                    System: "",
                    IconTabSelectedKey: "1",
                    ReferenceTicket: "",
                    ValDateFrom: this.dateFormatDDMMYYYY.format(Today),
                    ValDateTo: "", //this.dateFormatDDMMYYYY.format(oneYearFromNow),
                    RequestName: "", // this.getView().getModel("i18n").getResourceBundle().getText("DefaultRequestName"),
                    MsgQuickView: "",
                    ReasonCode: "",
                    ReasonCodeButtonVisible: false,
                    isFFIT: false,
                    Comments: "",
                    AttachmentTitle: "",
                    AttachmentType: "F",
                    AttachmentLink: "",
                    AttachmentFileData: "",
                });

                this.getView().setModel(GlobalData, "GlobalData");

            },


            /*    ********************* Bar buttons ******************************** */
            /*handleLanguage: function () {
                if (this.getView().byId("bLanguage").getText() === "FR") {
                    sap.ui.getCore().getConfiguration().setLanguage("FR");
                    this.getView().byId("bLanguage").setText("EN");
                } else {
                    sap.ui.getCore().getConfiguration().setLanguage("EN");
                    this.getView().byId("bLanguage").setText("FR");
                }
            },

            handleBackground: function (oEvent) {
                var BackgroundImage = this.getView().byId("app").getBackgroundImage();
                var SelectedImage = BackgroundImage.split("/");

                var lv_length = SelectedImage.length - 1;

                var ImageID = parseInt(SelectedImage[lv_length].substring(0, 1));

                ImageID += 1;

                if (ImageID === 9) {
                    ImageID = 1;
                }

                var lv_path = this.getView().getModel("imageModel").getData().path + "/img/" + ImageID + ".png"

                this.getView().byId("app").setBackgroundImage(lv_path);
            },

            handleTheme: function (oEvent) {
                if (sap.ui.getCore().getConfiguration().getTheme() === "sap_fiori_3_dark") {
                    sap.ui.getCore().applyTheme("sap_fiori_3");
                } else {
                    sap.ui.getCore().applyTheme("sap_fiori_3_dark");
                }
            },*/

            handleRefresh: function (oEvent) {
                var that = this;
                MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("MsgConfirmRefresh"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {

                        if (sAction === 'YES') {
                            location.reload();
                        }
                    }
                });
            },


            /*    ********************* Header ********************************** */
            onAfterSystemSelection: function () {
                if (this.getView().getModel("GlobalData").getData().System !== "") {


                    this.getOwnerComponent().getModel().callFunction("/CHECK_SYSTEM_CON", {
                        method: 'GET',
                        urlParameters: {
                            Systems: this.getView().byId('sGlobalSystem').getSelectedKey()
                        },
                        success: function (response) {

                            if (response.Type === 'E') {
                                // Error in RFC. Your SAP system is not available.
                                // Please raise a MyService incident to help you identify the root cause of
                                //the issue. (click on the incident icon on top right of the screen)
                                this.getView().setBusy(false);
                                this.getView().byId("sGlobalSystem").focus();
                                this.getView().byId("sGlobalSystem").setValueState("Error");
                                this.getView().byId("bSubmitRequest").setVisible(false);
                                MessageBox.error(response.Message);
                            } else {
                                this.getView().byId("sGlobalSystem").setValueState("None");
                                this.getView().byId("sGlobalSystem").setEnabled(false);
                                this.getView().byId("bSubmitRequest").setVisible(true);
                            }
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        }.bind(this)
                    });

                }
                else {
                    this.getView().byId("sGlobalSystem").setEnabled(true);
                }
            },

            /*    ********************* ICON TAB ******************************** */

            FillReasonCodeList: function () {

                var SelectedFfIdModel = this.getView().getModel("SelectedFfIdModel");

                if (SelectedFfIdModel !== undefined) {

                    var oSelect = this.getView().byId("sReasonCode");
                    var oBinding = oSelect.getBinding("items");
                    var aFilters = [];

                    for (var r = 0; r < SelectedFfIdModel.getData().length; r++) {
                        aFilters.push(new Filter("Connector", FilterOperator.EQ, SelectedFfIdModel.getData()[r].Connector));
                    }
                    oBinding.filter(aFilters, FilterType.Application);
                }

            },

            checkMandatoryFields: function () {
                var Error = "";
                if (this.getView().getModel("GlobalData").getData().System === "") {
                    Error = "X";
                    this.getView().getModel("GlobalData").setProperty("/IconTabSelectedKey", "1");

                    var that = this;
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorEmptySystem"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.getView().byId("sGlobalSystem").setValueState("Error");
                            that.getView().byId("sGlobalSystem").focus();
                        }
                    });

                }
                return Error;

            },

            handleTabBarSelect: function () {
                this.checkMandatoryFields();
            },

            /*    ********************* Shared Functions ==< Drag and drop******* */
            onExit: function () {
                if (this._oDialog_AddUsers) {
                    this._oDialog_AddUsers.destroy();
                    this.getView().setBusy(false);
                }
            },

            getSelectedRowContext: function (sTableId, fnCallback) {

                var oTable = this.getView().byId(sTableId);
                var iSelectedIndex = oTable.getSelectedIndex();

                if (iSelectedIndex === -1) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MsgSelectRow"));
                    return;
                }

                var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
                if (oSelectedContext && fnCallback) {
                    fnCallback.call(this, oSelectedContext, iSelectedIndex, oTable);
                }

                return oSelectedContext;
            },


            /*    ********************* SELECT USER ICON TAB ******************** */
            onAddAddUsersDialog: function () {

                var Error = this.checkMandatoryFields();

                if (Error === "") {
                    this.AvailableUsersModel = null;
                    this.getView().setModel(this.AvailableUsersModel, "AvailableUsersModel");

                    //if (!this._oDialog_AddUsers) {
                    this._oDialog_AddUsers = sap.ui.xmlfragment(this.getView().getId(), "GATE.ZGATE_FF_ASS.view.fragment.AddUsers", this);
                    this.getView().addDependent(this._oDialog_AddUsers);
                    //}

                    this._oDialog_AddUsers.open();
                }

            },

            onDeleteUser: function (oEvent) {

                var Tabix = oEvent.getSource().getParent().getBindingContextPath();
                var CurrentUser = this.getView().getModel("SelectedUsersModel").getObject(Tabix);

                for (var i in this.tab_SelectedUsers) {
                    if (CurrentUser.UserId === this.tab_SelectedUsers[i].UserId) {
                        this.tab_SelectedUsers.splice(i, 1)
                    }
                }

                this.initRiskCheckTab();

                this.SelectedUsersModel = new JSONModel(this.tab_SelectedUsers);
                this.getView().setModel(this.SelectedUsersModel, "SelectedUsersModel");

            },

            onSearchUsers: function (oEvent) {

                sap.ui.core.BusyIndicator.show();

                var tab_filters = new Array;

                var lv_System = new Filter({
                    path: "Connector",
                    operator: FilterOperator.EQ,
                    value1: this.getView().getModel("GlobalData").getData().System
                });
                tab_filters.push(lv_System);

                var lv_FieldValue = new Filter({
                    path: "FieldValue",
                    operator: FilterOperator.EQ,
                    value1: this.getView().byId("iFieldValue").getValue()
                });
                tab_filters.push(lv_FieldValue);

                var lv_FieldName = new Filter({
                    path: "FieldName",
                    operator: FilterOperator.EQ,
                    value1: this.getView().byId("sSearchBy").getSelectedKey()
                });
                tab_filters.push(lv_FieldName);

                this.getOwnerComponent().getModel().read("/UsersSet", {
                    filters: tab_filters,
                    success: function (oData) {
                        this.AvailableUsersModel = new JSONModel(oData);
                        this.getView().setModel(this.AvailableUsersModel, "AvailableUsersModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this)
                })
            },

            onCloseAddUsersDialog: function () {
                if (this._oDialog_AddUsers) {
                    this._oDialog_AddUsers.destroy();
                    this.getView().setBusy(false);
                }
            },

            OnSubmitAddUsersDialog: function () {

                if (this.tab_SelectedUsers === undefined) {
                    this.tab_SelectedUsers = [];
                }

                var AvailableUsersModel = this.getView().getModel("AvailableUsersModel");
                if (AvailableUsersModel !== undefined) {
                    var duplicateItem;
                    for (var r = 0; r < this.AvailableUsersModel.oData.results.length; r++) {
                        if (this.AvailableUsersModel.oData.results[r].Rank) {
                            duplicateItem = false;
                            if (this.tab_SelectedUsers.length !== 0) {
                                for (var s = 0; s < this.tab_SelectedUsers.length; s++) {
                                    if (this.AvailableUsersModel.oData.results[r].UserId === this.tab_SelectedUsers[s].UserId) {
                                        duplicateItem = true;
                                    }
                                }
                            }

                            if (duplicateItem === false) {
                                this.tab_SelectedUsers.push(this.AvailableUsersModel.oData.results[r]);
                            }
                        }
                    }

                    this.initRiskCheckTab();

                    this.SelectedUsersModel = new JSONModel(this.tab_SelectedUsers);
                    this.getView().setModel(this.SelectedUsersModel, "SelectedUsersModel");
                }

                this._oDialog_AddUsers.destroy();
                this.getView().setBusy(false);
            },



            /*    ************ SELECT USER ICON TAB : Manage Drag and Drop User ******* */
            UserConfig: {
                initialRank: 0,
                defaultRank: 1024,
                rankAlgorithm: {
                    Before: function (iRank) {
                        return iRank + 1024;
                    },
                    Between: function (iRank1, iRank2) {
                        // limited to 53 rows
                        return (iRank1 + iRank2) / 2;
                    },
                    After: function (iRank) {
                        return iRank / 2;
                    }
                }
            },

            onUserDragStart: function (oEvent) {

                var oDraggedRow = oEvent.getParameter("target");
                var oDragSession = oEvent.getParameter("dragSession");

                // keep the dragged row context for the drop action
                oDragSession.setComplexData("draggedRowContext", oDraggedRow.getBindingContext("AvailableUsersModel"));
                //oDragSession.setComplexData("draggedRowContext", oDraggedRow.oBindingContexts);
            },

            onUserDropTable1: function (oEvent) {
                var oDragSession = oEvent.getParameter("dragSession");
                var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
                if (!oDraggedRowContext) {
                    return;
                }

                // reset the rank property and update the model to refresh the bindings
                this.AvailableUsersModel.setProperty("Rank", this.UserConfig.initialRank, oDraggedRowContext);
                this.AvailableUsersModel.refresh(true);
            },

            UserMoveToTable1: function () {

                var oTable = this.getView().byId("UserTable2");
                var aSelected = oTable.getSelectedIndices();

                if (aSelected.length == 0) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MsgSelectARow"));
                    return;
                } else if (aSelected.length == 1) {
                    this.getSelectedRowContext("UserTable2", function (oSelectedRowContext, iSelectedRowIndex, oTable2) {
                        // reset the rank property and update the model to refresh the bindings
                        this.AvailableUsersModel.setProperty("Rank", this.UserConfig.initialRank, oSelectedRowContext);
                        this.AvailableUsersModel.refresh(true);

                        // select the previous row when there is no row to select
                        var oNextContext = oTable2.getContextByIndex(iSelectedRowIndex + 1);
                        if (!oNextContext) {
                            oTable2.setSelectedIndex(iSelectedRowIndex - 1);
                        }
                    });
                } else if (aSelected.length > 1) {
                    var oNextContext, iSelectedRowIndex, oSelectedRowContext;
                    for (var i = aSelected.length; i >= 0; i--) {
                        iSelectedRowIndex = aSelected[i];
                        // reset the rank property and update the model to refresh the bindings
                        this.AvailableUsersModel.setProperty("Rank", this.UserConfig.initialRank, oTable.getContextByIndex(aSelected[i]));
                        this.AvailableUsersModel.refresh(true);
                    }
                }

                this.getView().byId("UserTable1").clearSelection();
                this.getView().byId("UserTable2").clearSelection();

            },

            onUserDropTable2: function (oEvent) {
                var oDragSession = oEvent.getParameter("dragSession");
                var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
                if (!oDraggedRowContext) {
                    return;
                }

                var oUserConfig = this.UserConfig;
                var iNewRank = oUserConfig.defaultRank;
                var oDroppedRow = oEvent.getParameter("droppedControl");

                if (oDroppedRow && oDroppedRow instanceof TableRow) {
                    // get the dropped row data
                    var sDropPosition = oEvent.getParameter("dropPosition");
                    var oDroppedRowContext = oDroppedRow.getBindingContext("AvailableUsersModel");
                    var iDroppedRowRank = oDroppedRowContext.getProperty("Rank");
                    var iDroppedRowIndex = oDroppedRow.getIndex();
                    var oDroppedTable = oDroppedRow.getParent();

                    // find the new index of the dragged row depending on the drop position
                    var iNewRowIndex = iDroppedRowIndex + (sDropPosition === "After" ? 1 : -1);
                    var oNewRowContext = oDroppedTable.getContextByIndex(iNewRowIndex);
                    if (!oNewRowContext) {
                        // dropped before the first row or after the last row
                        iNewRank = oUserConfig.rankAlgorithm[sDropPosition](iDroppedRowRank);
                    } else {
                        // dropped between first and the last row
                        iNewRank = oUserConfig.rankAlgorithm.Between(iDroppedRowRank, oNewRowContext.getProperty("Rank"));
                    }
                }

                // set the rank property and update the model to refresh the bindings
                this.AvailableUsersModel.setProperty("Rank", iNewRank, oDraggedRowContext);
                this.AvailableUsersModel.refresh(true);
            },

            UserMoveToTable2: function () {

                var oTable1 = this.getView().byId("UserTable1");
                var oTable2 = this.getView().byId("UserTable2");
                var aSelected = oTable1.getSelectedIndices();
                var iNewRank = this.UserConfig.defaultRank;
                var oFirstRowContext = oTable2.getContextByIndex(0);

                if (aSelected.length == 0) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MsgSelectARow"));
                    return;
                } else if (aSelected.length == 1) {
                    this.getSelectedRowContext("UserTable1", function (oSelectedRowContext) {
                        if (oFirstRowContext) {
                            iNewRank = this.UserConfig.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
                        }
                        this.AvailableUsersModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                        this.AvailableUsersModel.refresh(true);

                    });
                } else if (aSelected.length > 1) {
                    var oSelectedRowContext;
                    for (var i = aSelected.length; i >= 0; i--) {
                        oSelectedRowContext = oTable1.getContextByIndex(aSelected[i]);
                        oFirstRowContext = oTable2.getContextByIndex(0);
                        if (oFirstRowContext) {
                            iNewRank = this.UserConfig.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
                        }
                        this.AvailableUsersModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                        this.AvailableUsersModel.refresh(true);
                    }
                }

                this.getView().byId("UserTable1").clearSelection();
                this.getView().byId("UserTable2").clearSelection();
            },

            /*    ********************* Assign FF ID ICON TAB ******************** */

            onAddFfIdToAssignDialog: function () {

                var Error = this.checkMandatoryFields();

                if (Error === "") {
                    this.AvailableFfIdModel = null;
                    this.getView().setModel(this.AvailableFfIdModel, "AvailableFfIdModel");

                    this._oDialog_AddFfId = sap.ui.xmlfragment(this.getView().getId(), "GATE.ZGATE_FF_ASS.view.fragment.AddFfId", this);
                    this.getView().addDependent(this._oDialog_AddFfId);

                    this._oDialog_AddFfId.open();
                }
            },

            onDeleteFfId: function (oEvent) {

                var Tabix = oEvent.getSource().getParent().getBindingContextPath();
                var CurrentFfId = this.getView().getModel("SelectedFfIdModel").getObject(Tabix);

                for (var i in this.tab_SelectedFfId) {
                    if (
                        CurrentFfId.AppType === this.tab_SelectedFfId[i].AppType &&
                        CurrentFfId.Ffobject === this.tab_SelectedFfId[i].Ffobject &&
                        CurrentFfId.Connector === this.tab_SelectedFfId[i].Connector
                    ) {
                        this.tab_SelectedFfId.splice(i, 1)
                    }
                }

                this.initRiskCheckTab();

                this.FillReasonCodeList();

                this.SelectedFfIdModel = new JSONModel(this.tab_SelectedFfId);
                this.getView().setModel(this.SelectedFfIdModel, "SelectedFfIdModel");

            },

            onDisplayDetailFfIdDialog: function (oEvent) {

                sap.ui.core.BusyIndicator.show();

                var Tabix = oEvent.getSource().getParent().getBindingContextPath();
                var CurrentFfId = this.getView().getModel("SelectedFfIdModel").getObject(Tabix);

                var tab_filters = new Array;

                var lv_System = new Filter({
                    path: "Connector",
                    operator: FilterOperator.EQ,
                    value1: CurrentFfId.Connector
                });
                tab_filters.push(lv_System);

                var lv_FieldValue = new Filter({
                    path: "UserId",
                    operator: FilterOperator.EQ,
                    value1: CurrentFfId.Ffobject
                });
                tab_filters.push(lv_FieldValue);


                this.getOwnerComponent().getModel().read("/FirefighterIdDetailSet", {
                    filters: tab_filters,
                    success: function (oData) {
                        this.FirefighterIdDetailModel = new JSONModel(oData);
                        this.getView().setModel(this.FirefighterIdDetailModel, "FirefighterIdDetailModel");
                        sap.ui.core.BusyIndicator.hide();


                        this._oDialog_DisplayDetailFfId = sap.ui.xmlfragment(this.getView().getId(), "GATE.ZGATE_FF_ASS.view.fragment.DisplayDetailFfId", this);

                        var DialogTitle = this.getView().getModel("i18n").getResourceBundle().getText("lblDetail") + CurrentFfId.Ffobject;

                        this._oDialog_DisplayDetailFfId.setTitle(DialogTitle);

                        this.getView().addDependent(this._oDialog_DisplayDetailFfId);

                        this._oDialog_DisplayDetailFfId.open();

                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this)
                })

            },

            onCloseDisplayDetailFfId: function () {
                if (this._oDialog_DisplayDetailFfId) {
                    this._oDialog_DisplayDetailFfId.destroy();
                    this.getView().setBusy(false);
                }
            },

            onSearchFfId: function (oEvent) {

                sap.ui.core.BusyIndicator.show();

                var tab_filters = new Array;

                var lv_System = new Filter({
                    path: "Connector",
                    operator: FilterOperator.EQ,
                    value1: this.getView().getModel("GlobalData").getData().System
                });
                tab_filters.push(lv_System);

                var lv_FieldValue = new Filter({
                    path: "FieldValue",
                    operator: FilterOperator.EQ,
                    value1: this.getView().byId("iFfFieldValue").getValue()
                });
                tab_filters.push(lv_FieldValue);

                var lv_FieldName = new Filter({
                    path: "FieldName",
                    operator: FilterOperator.EQ,
                    value1: this.getView().byId("sFfSearchBy").getSelectedKey()
                });
                tab_filters.push(lv_FieldName);

                this.getOwnerComponent().getModel().read("/FirefighterIdSet", {
                    filters: tab_filters,
                    success: function (oData) {
                        this.AvailableFfIdModel = new JSONModel(oData);
                        this.getView().setModel(this.AvailableFfIdModel, "AvailableFfIdModel");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        sap.ui.core.BusyIndicator.hide();
                    }.bind(this)
                })

            },

            onCloseFfIdDialog: function () {
                if (this._oDialog_AddFfId) {
                    this._oDialog_AddFfId.destroy();
                    this.getView().setBusy(false);
                }
            },

            OnSubmitAssignFfIdDialog: function () {

                if (this.tab_SelectedFfId === undefined) {
                    this.tab_SelectedFfId = [];
                }

                var AvailableFfIdModel = this.getView().getModel("AvailableFfIdModel");
                if (AvailableFfIdModel !== undefined) {
                    var duplicateItem;

                    for (var r = 0; r < this.AvailableFfIdModel.oData.results.length; r++) {
                        if (this.AvailableFfIdModel.oData.results[r].Rank) {
                            duplicateItem = false;

                            if (this.tab_SelectedFfId.length !== 0) {
                                for (var s = 0; s < this.tab_SelectedFfId.length; s++) {
                                    if (
                                        this.AvailableFfIdModel.oData.results[r].AppType === this.tab_SelectedFfId[s].AppType &&
                                        this.AvailableFfIdModel.oData.results[r].Ffobject === this.tab_SelectedFfId[s].Ffobject &&
                                        this.AvailableFfIdModel.oData.results[r].Connector === this.tab_SelectedFfId[s].Connector
                                    ) {
                                        duplicateItem = true;
                                    }
                                }
                            }

                            if (duplicateItem === false) {
                                this.tab_SelectedFfId.push(this.AvailableFfIdModel.oData.results[r]);
                            }
                        }
                    }

                    this.initRiskCheckTab();

                    this.setFfIdValidityDates();

                    this.SelectedFfIdModel = new JSONModel(this.tab_SelectedFfId);
                    this.getView().setModel(this.SelectedFfIdModel, "SelectedFfIdModel");
                }

                this._oDialog_AddFfId.destroy();
                this.getView().setBusy(false);

                this.FillReasonCodeList();
            },

            CheckSNOWReferenceTicket: function () {

                var ErrorSnow = false;

                if (this.getView().getModel("GlobalData").getData().ReferenceTicket !== "" &&
                    this.getView().getModel("GlobalData").getData().ReferenceTicket.substring(0, 3) !== "INC" &&
                    this.getView().getModel("GlobalData").getData().ReferenceTicket.substring(0, 3) !== "ENH" &&
                    this.getView().getModel("GlobalData").getData().ReferenceTicket.substring(0, 3) !== "PRJ" &&
                    this.getView().getModel("GlobalData").getData().ReferenceTicket.substring(0, 3) !== "DMD" &&
                    this.getView().getModel("GlobalData").getData().ReferenceTicket.substring(0, 4) !== "RITM") {
                    var that = this;
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorSnowFormat"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.getView().byId("iSnowTicket").focus();
                        }
                    });
                    this.getView().byId("iSnowTicket").setValueState("Error")
                    ErrorSnow = true;
                }
                else if (this.tab_SelectedFfId !== undefined) {

                    var lvFfIt = false;
                    for (var s = 0; s < this.tab_SelectedFfId.length; s++) {
                        if (this.tab_SelectedFfId[s].Ffobject.substring(0, 4) === "FFIT") {
                            lvFfIt = true;
                        }
                    }

                    if (this.getView().getModel("GlobalData").getData().ReferenceTicket === "" && lvFfIt === true) {
                        var that = this;
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorSnowEmpty"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.getView().byId("iSnowTicket").focus();
                            }
                        });

                        this.getView().byId("iSnowTicket").setValueState("Error")
                        ErrorSnow = true;
                    }
                    else {
                        this.getView().byId("iSnowTicket").setValueState("None")
                    }

                }
                else {
                    this.getView().byId("iSnowTicket").setValueState("None")
                }

                return ErrorSnow;

            },

            onChangeHeaderDates: function () {

                if (this.getView().getModel("GlobalData").getData().ValDateFrom !== "") {
                    this.getView().byId("iValDateFrom").setValueState("None");
                } else {
                    this.getView().byId("iValDateFrom").focus();
                    this.getView().byId("iValDateFrom").setValueState("Error");
                }

                if (this.getView().getModel("GlobalData").getData().ValDateTo !== "") {
                    this.getView().byId("iValDateTo").setValueState("None");
                } else {
                    this.getView().byId("iValDateTo").focus();
                    this.getView().byId("iValDateTo").setValueState("Error");
                }

                //if (this.getView().getModel("GlobalData").getData().ValDateFrom > this.getView().getModel("GlobalData").getData().ValDateTo) {
                if (this.getView().byId("iValDateFrom").getProperty("dateValue") > this.getView().byId("iValDateTo").getProperty("dateValue")) {
                    this.getView().byId("iValDateFrom").setValueState("Error");
                    this.getView().byId("iValDateTo").setValueState("Error");

                    var that = this;
                    // Please enter the Validity End Date

                    // "Valid From date can't be greater than To Date"
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgDateFromGTValidTo"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.getView().byId("iValDateFrom").focus();
                        }
                    });
                }


                this.setFfIdValidityDates();
            },

            setFfIdValidityDates: function () {

                var DateValidFrom = new Date(this.getView().byId("iValDateFrom").getProperty("dateValue"));

                if (this.tab_SelectedFfId !== undefined) {
                    for (var r = 0; r < this.tab_SelectedFfId.length; r++) {
                        this.tab_SelectedFfId[r].ValidFrom = DateValidFrom;
                        this.tab_SelectedFfId[r].ValidTo = this.getView().byId("iValDateTo").getProperty("dateValue");
                    }
                    this.SelectedFfIdModel = new JSONModel(this.tab_SelectedFfId);
                    this.getView().setModel(this.SelectedFfIdModel, "SelectedFfIdModel");
                }

            },


            /*    ************ Assigh Firefighter ID ICON TAB : Manage Drag and Drop ******* */
            FfIdConfig: {
                initialRank: 0,
                defaultRank: 1024,
                rankAlgorithm: {
                    Before: function (iRank) {
                        return iRank + 1024;
                    },
                    Between: function (iRank1, iRank2) {
                        // limited to 53 rows
                        return (iRank1 + iRank2) / 2;
                    },
                    After: function (iRank) {
                        return iRank / 2;
                    }
                }
            },

            onFfIdDragStart: function (oEvent) {
                var oDraggedRow = oEvent.getParameter("target");
                var oDragSession = oEvent.getParameter("dragSession");

                // keep the dragged row context for the drop action
                oDragSession.setComplexData("draggedRowContext", oDraggedRow.getBindingContext("AvailableFfIdModel"));
                //oDragSession.setComplexData("draggedRowContext", oDraggedRow.oBindingContexts);
            },

            onFfIdDropTable1: function (oEvent) {
                var oDragSession = oEvent.getParameter("dragSession");
                var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
                if (!oDraggedRowContext) {
                    return;
                }

                // reset the rank property and update the model to refresh the bindings
                this.AvailableFfIdModel.setProperty("Rank", this.FfIdConfig.initialRank, oDraggedRowContext);
                this.AvailableFfIdModel.refresh(true);
            },

            FfIdMoveToTable1: function () {

                var oTable = this.getView().byId("FfIdTable2");
                var aSelected = oTable.getSelectedIndices();

                if (aSelected.length == 0) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MsgSelectARow"));
                    return;
                } else if (aSelected.length == 1) {
                    this.getSelectedRowContext("FfIdTable2", function (oSelectedRowContext, iSelectedRowIndex, oTable2) {
                        // reset the rank property and update the model to refresh the bindings
                        this.AvailableFfIdModel.setProperty("Rank", this.FfIdConfig.initialRank, oSelectedRowContext);
                        this.AvailableFfIdModel.refresh(true);

                        // select the previous row when there is no row to select
                        var oNextContext = oTable2.getContextByIndex(iSelectedRowIndex + 1);
                        if (!oNextContext) {
                            oTable2.setSelectedIndex(iSelectedRowIndex - 1);
                        }
                    });
                } else if (aSelected.length > 1) {
                    var oNextContext, iSelectedRowIndex, oSelectedRowContext;
                    for (var i = aSelected.length; i >= 0; i--) {
                        iSelectedRowIndex = aSelected[i];
                        // reset the rank property and update the model to refresh the bindings
                        this.AvailableFfIdModel.setProperty("Rank", this.FfIdConfig.initialRank, oTable.getContextByIndex(aSelected[i]));
                        this.AvailableFfIdModel.refresh(true);
                    }
                }

                this.getView().byId("FfIdTable1").clearSelection();
                this.getView().byId("FfIdTable2").clearSelection();

                /*this.getSelectedRowContext("FfIdTable2", function (oSelectedRowContext, iSelectedRowIndex, oTable2) {
                    // reset the rank property and update the model to refresh the bindings
                    this.AvailableFfIdModel.setProperty("Rank", this.FfIdConfig.initialRank, oSelectedRowContext);
                    this.AvailableFfIdModel.refresh(true);

                    // select the previous row when there is no row to select
                    var oNextContext = oTable2.getContextByIndex(iSelectedRowIndex + 1);
                    if (!oNextContext) {
                        oTable2.setSelectedIndex(iSelectedRowIndex - 1);
                    }
                });*/
            },

            onFfIdDropTable2: function (oEvent) {
                var oDragSession = oEvent.getParameter("dragSession");
                var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
                if (!oDraggedRowContext) {
                    return;
                }

                var oFfIdConfig = this.FfIdConfig;
                var iNewRank = oFfIdConfig.defaultRank;
                var oDroppedRow = oEvent.getParameter("droppedControl");

                if (oDroppedRow && oDroppedRow instanceof TableRow) {
                    // get the dropped row data
                    var sDropPosition = oEvent.getParameter("dropPosition");
                    var oDroppedRowContext = oDroppedRow.getBindingContext("AvailableFfIdModel");
                    var iDroppedRowRank = oDroppedRowContext.getProperty("Rank");
                    var iDroppedRowIndex = oDroppedRow.getIndex();
                    var oDroppedTable = oDroppedRow.getParent();

                    // find the new index of the dragged row depending on the drop position
                    var iNewRowIndex = iDroppedRowIndex + (sDropPosition === "After" ? 1 : -1);
                    var oNewRowContext = oDroppedTable.getContextByIndex(iNewRowIndex);
                    if (!oNewRowContext) {
                        // dropped before the first row or after the last row
                        iNewRank = oFfIdConfig.rankAlgorithm[sDropPosition](iDroppedRowRank);
                    } else {
                        // dropped between first and the last row
                        iNewRank = oFfIdConfig.rankAlgorithm.Between(iDroppedRowRank, oNewRowContext.getProperty("Rank"));
                    }
                }

                // set the rank property and update the model to refresh the bindings
                this.AvailableFfIdModel.setProperty("Rank", iNewRank, oDraggedRowContext);
                this.AvailableFfIdModel.refresh(true);
            },

            FfIdMoveToTable2: function () {
                var oTable1 = this.getView().byId("FfIdTable1");
                var oTable2 = this.getView().byId("FfIdTable2");
                var aSelected = oTable1.getSelectedIndices();
                var iNewRank = this.FfIdConfig.defaultRank;
                var oFirstRowContext = oTable2.getContextByIndex(0);

                if (aSelected.length == 0) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MsgSelectARow"));
                    return;
                } else if (aSelected.length == 1) {
                    this.getSelectedRowContext("FfIdTable1", function (oSelectedRowContext) {
                        if (oFirstRowContext) {
                            iNewRank = this.FfIdConfig.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
                        }
                        this.AvailableFfIdModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                        this.AvailableFfIdModel.refresh(true);

                    });
                } else if (aSelected.length > 1) {
                    var oSelectedRowContext;
                    for (var i = aSelected.length; i >= 0; i--) {
                        oSelectedRowContext = oTable1.getContextByIndex(aSelected[i]);
                        oFirstRowContext = oTable2.getContextByIndex(0);
                        if (oFirstRowContext) {
                            iNewRank = this.FfIdConfig.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
                        }
                        this.AvailableFfIdModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                        this.AvailableFfIdModel.refresh(true);
                    }
                }

                this.getView().byId("FfIdTable1").clearSelection();
                this.getView().byId("FfIdTable2").clearSelection();


                /*this.getSelectedRowContext("FfIdTable1", function (oSelectedRowContext) {
                    var oTable2 = this.getView().byId("FfIdTable2");
                    var oFirstRowContext = oTable2.getContextByIndex(0);

                    // insert always as a first row
                    var iNewRank = this.FfIdConfig.defaultRank;
                    if (oFirstRowContext) {
                        iNewRank = this.FfIdConfig.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
                    }

                    this.AvailableFfIdModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                    this.AvailableFfIdModel.refresh(true);

                    // select the inserted row
                    oTable2.setSelectedIndex(0);
                }); */
            },

            /* ****************************************** */
            /* ****************************************** */
            /* ****************************************** */
            /* ****************************************** */
            /* ****************************************** */
            /* ****************************************** */

            initRiskCheckTab: function () {
                // Need to clear the result of last Risk analysis                            
                var oSummaryModel = this.getView().getModel("reportSummaryUser");
                if (oSummaryModel !== undefined) {
                    oSummaryModel.setData(null);
                }
                this.getView().byId("tRiskCheck").setNoDataText(this.getView().getModel("i18n").getResourceBundle().getText("lblRiskAnalysisNotStarted"));
            },

            /*    ********************* Risk Violations - ICON TAB ******************** */
            launchSoDReport: function (oEvent) {

                if (this.tab_SelectedUsers === undefined || this.tab_SelectedUsers.length === 0) {
                    var that = this;
                    this.getView().byId("iconTabBarNoIcons").setSelectedKey("1");
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorAddUsers"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.onAddAddUsersDialog();
                        }
                    });

                } else if (this.tab_SelectedFfId === undefined || this.tab_SelectedFfId.length === 0) {
                    var that = this;
                    this.getView().byId("iconTabBarNoIcons").setSelectedKey("2");
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorAddFfId"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.onAddFfIdToAssignDialog();
                        }
                    });

                } else {

                    this.getView().setBusy(true);

                    var tab_filters = new Array;

                    for (var r = 0; r < this.tab_SelectedUsers.length; r++) {
                        // Fill User IDs List
                        var lv_User = this.tab_SelectedUsers[r].UserId + ";" + this.tab_SelectedUsers[r].Connector

                        var rec_UserFilter = new Filter({
                            path: "UserIds",
                            operator: FilterOperator.EQ,
                            value1: lv_User
                        });
                        tab_filters.push(rec_UserFilter);
                    }

                    for (var r = 0; r < this.tab_SelectedFfId.length; r++) {
                        // Firefighter IDs List
                        var lv_User = this.tab_SelectedFfId[r].Ffobject + ";" + this.tab_SelectedFfId[r].Connector

                        var rec_UserFilter = new Filter({
                            path: "FfIds",
                            operator: FilterOperator.EQ,
                            value1: lv_User
                        });
                        tab_filters.push(rec_UserFilter);
                    }

                    this.getOwnerComponent().getModel().read("/reportSODUserSet", {
                        filters: tab_filters,
                        success: function (oData) {
                            var lv_reports;
                            for (var r = 0; r < oData.results.length; r++) {
                                if (lv_reports) {
                                    lv_reports = lv_reports + ";" + oData.results[r].ReportId;
                                } else {
                                    lv_reports = oData.results[r].ReportId;
                                }
                            }
                            this.getReportSummary(lv_reports);
                        }.bind(this),
                        error: function (oError) {
                            this.initRiskCheckTab();
                            MessageToast.show(oError.message + " (" + oError.statusText + ")");
                            this.getView().setBusy(false);
                        }.bind(this)
                    })
                }
            },

            getReportSummary: function (sRepid) {

                this.getOwnerComponent().getModel().read("/reportSumUserSet", {
                    urlParameters: { search: sRepid },
                    success: function (oData, oResponse) {
                        if (oData.results.length === 0) {
                            // this.getView().byId("tRiskCheck").setNoDataText(this.getView().getModel("i18n").getResourceBundle().getText("MsgRiskFinishedSucc"));
                        } else {
                            var oModel = new JSONModel(oData);
                            this.getView().setModel(oModel, 'reportSummaryUser');
                            this.getView().getModel("reportSummaryUser").refresh(true);
                        }
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        this.getView().setBusy(false);
                    }.bind(this)
                });

                // SAME AS GLAM REQUEST                
                this.getOwnerComponent().getModel().read("/ReportDetUserSet", {
                    urlParameters: { search: sRepid },
                    success: function (oData, oResponse) {
                        var oModel = new JSONModel(oData);
                        oModel.setSizeLimit(99999999);
                        this.getView().setModel(oModel, 'reportDetailUser');
                        this.getView().byId("tRiskCheck").setNoDataText(this.getView().getModel("i18n").getResourceBundle().getText("MsgRiskFinishedSucc"));
                        this.getView().getModel("reportDetailUser").refresh(true);
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                    }.bind(this)
                });

            },

            /*    ********************* Risk Violations - ICON TAB - Navigation ******************** */
            /*    ********************* SAME AS GLAM REQUEST ******************** */
            navToReportDetailUser: function (oEvent) {
                //DO NOT TOUCH
                var oRisk = oEvent.getSource().getBindingContext("reportSummaryUser").getObject();
                var aFunctions = this.groupRiskByFunction(this.getView().getModel("reportDetailUser").getData().results, oRisk.Riskid);

                //Put in User Mode
                oRisk.ReportType = '01';

                var oAllModel = new JSONModel(this.getView().getModel("reportDetailUser").getData().results);
                this.getOwnerComponent().setModel(oAllModel, 'AllRisks');

                var oRModel = new JSONModel(oRisk);
                this.getOwnerComponent().setModel(oRModel, 'RiskHeader');

                var oFModel = new JSONModel(aFunctions);
                oFModel.setSizeLimit(99999999);
                this.getOwnerComponent().setModel(oFModel, 'RDetails');

                this.getView().byId("myFCL").setLayout("TwoColumnsMidExpanded");

            },

            groupRiskByFunction: function (array, risk) {

                //Filter Risks by RiskId
                var aRisks = array.filter(
                    function (e) {
                        return e.Riskid == risk;
                    }.bind(this)
                );

                //GET BUSINESS ROLES - DISTINCT 
                var lookup = {};
                var items = aRisks;
                var result = [];

                for (var item, i = 0; item = items[i++];) {
                    var comprole = item.Comprole;

                    if (!(comprole in lookup) && comprole.indexOf("[BR]") > -1) {
                        lookup[comprole] = 1;
                        result.push(comprole);
                    }
                }
                var oBRModel = new JSONModel(result);
                this.getOwnerComponent().setModel(oBRModel, 'BRoles');

                // GET TCODES BY FUNC
                const aFunctions = Object.entries(aRisks.reduce(function (acc, curr) {
                    acc[curr.Functid] = (acc[curr.Functid] || []);
                    acc[curr.Functid].push(curr);

                    return acc;
                }, {})).map(function (obj) {
                    return { func: obj[0], data: obj[1] };
                });


                //GET OBJECTS BY TCODE
                for (var i = 0; i < aFunctions.length; i++) {
                    aFunctions[i].transactions = Object.entries(aFunctions[i].data.reduce(function (acc, curr) {

                        acc[curr.Action] = (acc[curr.Action] || []);
                        acc[curr.Action].push(curr);

                        return acc;
                    }, {})).map(function (obj) {
                        for (var i = 0; i < obj[1].length; i++) {
                            var aItem = obj[1].filter(function (oItem) { return oItem.Lastexecutedon !== "0" && oItem.Lastexecutedon !== "0 " });
                            var busRole = obj[1].filter(function (oItem) { return oItem.Comprole.indexOf("[BR]") > -1 });
                            if (busRole.length > 0) {
                                busRole = busRole[0].Comprole;
                            } else {
                                busRole = "";
                            }
                            var sLastExec
                            if (aItem.length > 0 && aItem[0].Lastexecutedon.length > 3) {
                                sLastExec = aItem[0].Lastexecutedon;
                                sLastExec = sLastExec.substring(8, 10) + ':' + sLastExec.substring(10, 12) + ':' + sLastExec.substring(12, 14) + ' ' + sLastExec.substring(6, 8) + '/' + sLastExec.substring(4, 6) + '/' + sLastExec.substring(0, 4);
                            } else {
                                sLastExec = 0;
                            }
                            if (obj[1][i].Comprole.indexOf("[BR]") > -1) {
                                return { tcode: obj[0], data: obj[1], brole: obj[1][i].Comprole, srole: obj[1][i].Role, Lastexecutedon: sLastExec };
                            }
                            else {
                                return { tcode: obj[0], data: obj[1], brole: busRole, srole: obj[1][i].Role, Lastexecutedon: sLastExec };
                            }
                        }
                    });
                    delete aFunctions[i].data;
                }

                return aFunctions;

            },

            //Change to FullScreen Risk Card Details
            handleFullScreen: function () {
                this.getView().byId("myFCL").setLayout("MidColumnFullScreen");
            },
            //Change to Two Columns Risk Card Details
            handleExitFullScreen: function () {
                this.getView().byId("myFCL").setLayout("TwoColumnsMidExpanded");
            },
            //Exit Risk Card Details
            handleClose: function (oEvent) {
                var sRoute = this.getOwnerComponent().getRouter().getHashChanger().getHash();

                this.getView().byId("myFCL").setLayout("OneColumn");
            },

            onRowShiftAction: function (oEvent) {
                var oSource = oEvent.getSource(),
                    oRow = oSource.getParent();

                if (oSource.getSrc() === "sap-icon://expand") {
                    oSource.setSrc("sap-icon://collapse");
                    oRow.getCells()[8].setVisible(true);
                } else {
                    oSource.setSrc("sap-icon://expand");
                    oRow.getCells()[8].setVisible(false);
                }
            },

            onBRliveChange: function (oEvent) {

                var oTables = oEvent.getSource().getParent().getParent().getItems();
                var oTableSearchState = [],
                    sQuery = oEvent.getParameter("newValue");

                if (sQuery && sQuery.length > 0) {
                    var orFilter = [];
                    // orFilter.push(new Filter("DescnBproc", FilterOperator.Contains, sQuery));
                    orFilter.push(new Filter("srole", FilterOperator.Contains, sQuery));
                    orFilter.push(new Filter("brole", FilterOperator.Contains, sQuery));

                    for (var i = 0; i < oTables.length; i++) {
                        oTables[i].getContent()[0].getBinding("items").filter(new Filter(orFilter, false));
                    }
                }
                // oTable.getBinding("items").filter(new Filter(orFilter, false));
            },










            /*    ********************* Risk Card ******************** */

            navToaRiskCard: function (oEvent) {
                var oRisk = oEvent.getSource().getBindingContext("reportSummaryUser").getObject();
                var sPath = "/RiskCardSet(Riskid='" + oRisk.Riskid + "',Bproc='" + oRisk.BusinessProcess + "')";

                this.getView().setBusy(true);

                this.getOwnerComponent().getModel().read(sPath, {
                    success: function (oData) {
                        var oModel = new JSONModel(oData);
                        this.getView().setModel(oModel, 'Risk');
                        this.openRiskCardDialog();
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function (oResponse) {
                        this.getView().setBusy(false);
                        MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("MsgRiskCardNotFound"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK
                            /*onClose: function (sAction) {
                                if (sAction === 'OK') {

                                }
                            }*/
                        });
                    }.bind(this)
                });

                this.getCardRiskDocs(oRisk.Riskid, oRisk.BusinessProcess);
                this.getCardRiskFunctions(oRisk.Riskid);
            },

            //Get Risk Functions
            getCardRiskFunctions: function (sRiskid) {
                this.getOwnerComponent().getModel().read("/FunctionsSet", {
                    urlParameters: {
                        search: sRiskid,
                        "$expand": "FunctionsToGetActions"
                    },
                    success: function (oData, oResponse) {
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, 'RFunctions')
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            //Get Risk Documents
            getCardRiskDocs: function (sRiskid, sBproc) {
                var aFilters = [];
                aFilters.push(new Filter("Bproc", FilterOperator.EQ, sBproc));
                aFilters.push(new Filter("Riskid", FilterOperator.EQ, sRiskid));
                this.getOwnerComponent().getModel().read("/SharepointSet", {
                    filters: aFilters,
                    success: function (oData, oResponse) {
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, 'RDocuments')
                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            openRiskCardDialog: function () {
                if (!this.oDialogRiskCard) {
                    var oView = this.getView();
                    this.oDialogRiskCard = oView.byId("riskCard");
                    this.oDialogRiskCard = sap.ui.xmlfragment(oView.getId(), "GATE.ZGATE_FF_ASS.view.fragment.riskCard",
                        this);
                    this.getView().addDependent(this.oDialogRiskCard);
                }
                this.oDialogRiskCard.open();
            },

            // Event triggered when the user closes the add role dialog
            handleCloseRiskCardDialog: function (oEvent) {
                this.oDialogRiskCard.close();
            },











            /*    ********************* Justification ******************** */

            onDisplayQuickViewReasonCode: function (oEvent) {
                this.openQuickView(oEvent, this.getView().getModel("i18n").getResourceBundle().getText("MsgNoReasonCode"));
            },

            openQuickView: function (oEvent, Msg) {
                var oButton = oEvent.getSource(),
                    oView = this.getView();

                this.getView().getModel("GlobalData").setProperty("/MsgQuickView", Msg);

                if (!this._pQuickView) {
                    this._pQuickView = Fragment.load({
                        id: oView.getId(),
                        name: "GATE.ZGATE_FF_ASS.view.fragment.QuickView",
                        controller: this
                    }).then(function (oQuickView) {
                        oView.addDependent(oQuickView);
                        return oQuickView;
                    });
                }
                this._pQuickView.then(function (oQuickView) {
                    oQuickView.openBy(oButton);
                });
            },


            /*    ********************* attachments ******************** */

            onAddAttachmentsDialog: function () {

                //if (!this._oDialog_AddUsers) {
                this._oDialog_Attachments = sap.ui.xmlfragment(this.getView().getId(), "GATE.ZGATE_FF_ASS.view.fragment.Attachments", this);
                this.getView().addDependent(this._oDialog_Attachments);
                //}

                this._oDialog_Attachments.open();

            },

            onCloseAttachments: function () {
                if (this._oDialog_Attachments) {
                    this._oDialog_Attachments.destroy();
                    this.getView().setBusy(false);
                }

            },

            onSelectAttachmentType: function () {

                var AttachType = this.getView().byId("rbgAttachmentType").getSelectedButton().getProperty("text");

                if (AttachType.substring(0, 1) === "F") {
                    this.getView().getModel("GlobalData").setProperty("/AttachmentType", "L");
                } else {
                    this.getView().getModel("GlobalData").setProperty("/AttachmentType", "F");
                }
            },

            onUpload: function () {

                var that = this;

                if (this.getView().getModel("GlobalData").getData().AttachmentType === "L" &&
                    this.getView().getModel("GlobalData").getData().AttachmentLink === "") {
                    // Please enter a Link

                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorSelectALink"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            that.getView().byId("iAttachmentLink").focus();
                        }
                    });

                } else if (this.getView().getModel("GlobalData").getData().AttachmentType === "F" &&
                    this.getView().byId("fileUploader").getProperty("value") !== undefined &&
                    this.getView().byId("fileUploader").getProperty("value") === "") {
                    // Please select a file
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorSelectAFile"), {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                        }
                    });
                } else {

                    if (this.tab_SelectedAttachments === undefined) {
                        this.tab_SelectedAttachments = [];
                    }

                    if (this.getView().getModel("GlobalData").getData().AttachmentType === "F") {

                        var oFileUploader = this.getView().byId("fileUploader");
                        var domRef = oFileUploader.getFocusDomRef();
                        var file = domRef.files[0];
                        var title = this.getView().getModel("GlobalData").getData().AttachmentTitle;
                        //var that = this;
                        this.file = file;


                        var reader = new FileReader();

                        reader.onload = function (e) {

                            var AttachmentFile = {
                                Icon: "sap-icon://documents",
                                Title: (title !== "" ? title : that.file.name),
                                Url: "",
                                Name: that.file.name,
                                Type: that.file.type,
                                Size: that.file.size,
                                Content: e.currentTarget.result
                            }
                            that.tab_SelectedAttachments.push(AttachmentFile);
                            that.getView().getModel("SelectedAttachmentsModel").refresh(true);
                        }

                        reader.readAsDataURL(file);

                    } else {
                        var AttachmentLink = {
                            Icon: "sap-icon://chain-link",
                            Title: (this.getView().getModel("GlobalData").getData().AttachmentTitle !== "" ? this.getView().getModel("GlobalData").getData().AttachmentTitle : this.getView().getModel("GlobalData").getData().AttachmentLink),
                            Url: this.getView().getModel("GlobalData").getData().AttachmentLink,
                            Name: this.getView().getModel("GlobalData").getData().AttachmentLink,
                            Type: "URL Link",
                            Size: "-",
                            Content: ""
                        }
                        this.tab_SelectedAttachments.push(AttachmentLink);

                    }

                    this.SelectedAttachmentsModel = new JSONModel(this.tab_SelectedAttachments);
                    this.getView().setModel(this.SelectedAttachmentsModel, "SelectedAttachmentsModel");


                    // Init data
                    this.getView().getModel("GlobalData").setProperty("/AttachmentTitle", "");
                    this.getView().getModel("GlobalData").setProperty("/AttachmentType", "F");
                    this.getView().getModel("GlobalData").setProperty("/AttachmentLink", "");
                    this.getView().getModel("GlobalData").setProperty("/AttachmentFileData", "");

                    this._oDialog_Attachments.destroy();
                    this.getView().setBusy(false);

                }
            },

            onDeleteAttachment: function (oEvent) {

                var Tabix = oEvent.getSource().getParent().getBindingContextPath();
                var CurrentAttach = this.getView().getModel("SelectedAttachmentsModel").getObject(Tabix);

                for (var i in this.tab_SelectedAttachments) {
                    if (CurrentAttach.Name === this.tab_SelectedAttachments[i].Name &&
                        CurrentAttach.Title === this.tab_SelectedAttachments[i].Title &&
                        CurrentAttach.Type === this.tab_SelectedAttachments[i].Type &&
                        CurrentAttach.Size === this.tab_SelectedAttachments[i].Size) {
                        this.tab_SelectedAttachments.splice(i, 1)
                    }
                }

                this.SelectedAttachmentsModel = new JSONModel(this.tab_SelectedAttachments);
                this.getView().setModel(this.SelectedAttachmentsModel, "SelectedAttachmentsModel");

            },

            /* handleUploadComplete: function (oEvent) {
 
                 var fileName = oEvent.getSource().getProperty("value");
                 var sResponse = oEvent.getParameter("response");
 
                 if (sResponse) {
                     var sMsg = "";
                     var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
                     if (m[1] == "200") {
                         sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
                         oEvent.getSource().setValue("");
                     } else {
                         sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
                     }
 
                     MessageToast.show(sMsg);
                 }
             }, */

            //* ********************* Footer ******************** */
            onSubmitRequest: function () {

                var ErrorSnow = this.CheckSNOWReferenceTicket();
                var ErrorSystem = this.checkMandatoryFields();

                if (ErrorSnow === false && ErrorSystem === "") {

                    if (this.getView().getModel("GlobalData").getData().ValDateFrom === "") {

                        this.getView().byId("iValDateFrom").setValueState("Error");
                        var that = this;
                        // Please enter the Validity Start Date
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorValidityStartDate"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.getView().byId("iValDateFrom").focus();
                            }
                        });

                    } else if (this.getView().getModel("GlobalData").getData().ValDateTo === "") {
                        this.getView().byId("iValDateTo").setValueState("Error");

                        var that = this;
                        // Please enter the Validity End Date
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorValidityEndDate"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.getView().byId("iValDateTo").focus();
                            }
                        });

                    } else if (this.getView().getModel("GlobalData").getData().ValDateFrom > this.getView().getModel("GlobalData").getData().ValDateTo) {

                        this.getView().byId("iValDateFrom").setValueState("Error");
                        this.getView().byId("iValDateTo").setValueState("Error");

                        var that = this;
                        // Please enter the Validity End Date
                        //MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorValidityEndDate"), {

                        // "Valid From date can't be greater than To Date"
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgDateFromGTValidTo"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.getView().byId("iValDateFrom").focus();
                            }
                        });

                    } else if (this.tab_SelectedUsers === undefined || this.tab_SelectedUsers.length === 0) {
                        // User List empty
                        var that = this;
                        this.getView().byId("iconTabBarNoIcons").setSelectedKey("1");
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorAddUsers"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.onAddAddUsersDialog();
                            }
                        });

                    } else if (this.tab_SelectedFfId === undefined || this.tab_SelectedFfId.length === 0) {
                        // FF ID List empty
                        var that = this;
                        this.getView().byId("iconTabBarNoIcons").setSelectedKey("2");
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorAddFfId"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.onAddFfIdToAssignDialog();
                            }
                        });

                        /*} else if (this.getView().getModel("GlobalData").getData().RequestName === "") {
                            // Request Name empty
                            var that = this;
                            this.getView().byId("iconTabBarNoIcons").setSelectedKey("4");
                            MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorMissingRequestName"), {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
    
                                }
                            }); */

                    } else if (this.getView().getModel("GlobalData").getData().ReasonCode === "") {
                        // Reason Code empty
                        var that = this;
                        this.getView().byId("iconTabBarNoIcons").setSelectedKey("4");
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MsgErrorMissingReasonCode"), {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {

                            }
                        });
                    }
                    else {

                        // create request
                        var that = this;
                        MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("MsgConfirmSubmit"), {
                            actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (sAction) {
                                if (sAction === 'YES') {
                                    that.CreateFfAssignRequest();
                                }
                            }
                        });

                    }

                }

            },

            CreateFfAssignRequest: function () {

                this.getView().setBusy(true);

                var oEntryReq = {};
                oEntryReq.RequestDataToRequestUsersNav = [];

                oEntryReq.Reqtype = "006";
                oEntryReq.Zpi7LicenseDataType = "91";
                oEntryReq.ZrequestName = ""; //this.getView().getModel("GlobalData").getData().RequestName + " " + this.getView().getModel("GlobalData").getData().ReferenceTicket;
                oEntryReq.ZreferenceTicket = this.getView().getModel("GlobalData").getData().ReferenceTicket;


                for (var r = 0; r < this.tab_SelectedUsers.length; r++) {
                    // Fill User IDs List
                    var lv_User = {};
                    lv_User.UserId = this.tab_SelectedUsers[r].UserId;
                    lv_User.Connector = this.tab_SelectedUsers[r].Connector;
                    lv_User.UserType = "A";
                    oEntryReq.RequestDataToRequestUsersNav.push(lv_User);
                }

                for (var r = 0; r < this.tab_SelectedFfId.length; r++) {

                    var DateFrom = this.dateFormatYYYYMMDD.format(this.getView().byId("iValDateFrom").getProperty("dateValue"));
                    var DateTo = this.dateFormatYYYYMMDD.format(this.getView().byId("iValDateTo").getProperty("dateValue"));

                    // Firefighter IDs List
                    var lv_Ffobject = {};
                    lv_Ffobject.UserId = this.tab_SelectedFfId[r].Ffobject;
                    lv_Ffobject.Connector = this.tab_SelectedFfId[r].Connector;
                    lv_Ffobject.UserType = "S";
                    lv_Ffobject.ValidFrom = DateFrom; // this.dateFormatYYYYMMDD.format(this.getView().byId("iValDateFrom").getProperty("dateValue"));
                    lv_Ffobject.ValidTo = DateTo; //this.dateFormatYYYYMMDD.format(this.getView().byId("iValDateTo").getProperty("dateValue"));
                    oEntryReq.RequestDataToRequestUsersNav.push(lv_Ffobject);
                }

                this.getOwnerComponent().getModel().create('/RequestDataSet', oEntryReq, {
                    success: function (oData, oResponse) {
                        var sReqno = oData.Reqno;

                        if (sReqno) {

                            this.onSaveCommentAndAttachments(sReqno);

                            this.getView().setBusy(false);

                            MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("MsgRequestsubSuccess") + " " + sReqno, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if (sAction === 'OK') {
                                        location.reload();
                                    }
                                }
                            });

                        } else {
                            // RFC connection error
                            debugger;
                            var msg = JSON.parse(oResponse.headers["sap-message"]).message;

                            this.getView().setBusy(false);

                            MessageBox.error(msg, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if (sAction === 'OK') {

                                    }
                                }
                            });

                        }

                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.message + " (" + oError.statusText + ")");
                        this.getView().setBusy(false);
                    }.bind(this)
                });

            },

            onSaveCommentAndAttachments: function (sReqno) {

                this.getView().setBusy(true);

                var oEntryReq = {};
                oEntryReq.RequestNoToAttachmentsNav = [];

                oEntryReq.Reqno = sReqno;
                oEntryReq.BusJustif = this.getView().getModel("GlobalData").getData().Comments;
                oEntryReq.SodManaged = "";
                oEntryReq.Other = this.getView().getModel("GlobalData").getData().ReasonCode;

                if (this.tab_SelectedAttachments !== undefined && this.tab_SelectedAttachments.length !== 0) {
                    for (var r = 0; r < this.tab_SelectedAttachments.length; r++) {

                        var lv_Attachment = {};
                        lv_Attachment.Reqno = sReqno;
                        lv_Attachment.FileName = this.tab_SelectedAttachments[r].Name;
                        lv_Attachment.Title = this.tab_SelectedAttachments[r].Title;
                        lv_Attachment.FileType = this.tab_SelectedAttachments[r].Type;
                        lv_Attachment.FileSize = this.tab_SelectedAttachments[r].Size.toString();
                        lv_Attachment.FileContent = this.tab_SelectedAttachments[r].Content;
                        lv_Attachment.Url = this.tab_SelectedAttachments[r].Url;
                        oEntryReq.RequestNoToAttachmentsNav.push(lv_Attachment);
                    }
                }

                this.getOwnerComponent().getModel().create('/RequestNoSet', oEntryReq, {
                    success: function (oData, oResponse) {
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            }


        });
    });
