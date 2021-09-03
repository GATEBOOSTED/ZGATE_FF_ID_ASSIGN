sap.ui.define([], function () {
    "use strict";
    return {

        highlightRiskState: function (sRiskId) {
            if (sRiskId === "Very High")
                return ("Indication01");
            else if (sRiskId === "High")
                return ("Indication02");
            else if (sRiskId === "Medium")
                return ("Indication03");
            else
                return ("Indication04");
        },

        StateRiskLevel: function (sLvl) {
            if (sLvl === 'Low' || sLvl === 'Medium')
                return ("Warning");
            else if (sLvl === 'High' || sLvl === 'Very High')
                return ("Error");
            else
                return ("Information")
        }
        ,

        VisibilityRiskMC: function (RiskMC) {
            if (RiskMC)
                return true;
            else
                return false
        },

        VisibilityRiskCard: function (RiskCard) {
            if (RiskCard)
                return true;
            else
                return false
        },

        VisibilityFileData: function(AttachmentType){
            if (AttachmentType === "F"){
                return true;
            } else {
                return false;
            }

        },
        
        VisibilityLinkData: function(AttachmentType){
            if (AttachmentType === "F"){
                return false;
            } else {
                return true;
            }

        }


        /*,
                getSnowValueState: function(Snow,isFfIt){
                    debugger;
                    if ( Snow === "" && isFfIt === true ){
                        return "Error";
                    }else{
                        return "None";
                    }
                } */

    }
});