var validator = Validator();
var SUPPORTED_CONTENT_TYPES = ["document", "discussion", "file", "idea", "poll"];
var ITEMS_PER_PAGE = 50;
var moveContentSourceId;
var moveContentTargetId;

var displayTargetPlacePicker = function () {
    var setTargetPlaceNameAndId = function (placeName, placeId) {
        moveContentTargetId = placeId;
        messageHandler.resetMessage();
        viewHandler.displayTargetPlaceName(placeName);
    }

    osapi.jive.corev3.places.requestPicker({
        success : function(data) {
            setTargetPlaceNameAndId(data.name, data.placeID)
        }
    });
}

var processMoveContent = function () {
    var moveSelectedContentToTargetPlace = function(){
        var selectedContentIds = viewHandler.getSelectedContentIds()
        var deferred = Q.defer();
        validator.validateSelectedPlacesAndContent(moveContentSourceId, moveContentTargetId, selectedContentIds)
            .then(
            function(){
                var documentSuccessCount = 0;
                viewHandler.disableAllButtonsWhileProcessingContent();

                _.forEach(selectedContentIds, function(contentId){
                        jiveWrapper.updateContentParentPlace(contentId, moveContentTargetId)
                            .then(function(){
                                documentSuccessCount = documentSuccessCount + 1;
                                messageHandler.displayInfoMessage(" Successfully moved "+ documentSuccessCount + " out of " + selectedContentIds.length);
                                viewHandler.displayContentSuccessRow(contentId);
                                if(_.last(selectedContentIds) == contentId)
                                    deferred.resolve();
                            },
                            function(err){
                                console.log("Error while moving document:"+contentId +" ",err)
                                viewHandler.displayContentErrorRow(contentId);
                                if(_.last(selectedContentIds) == contentId)
                                    deferred.resolve();
                            })
                    }
                )

            },
            function(err){
                messageHandler.displayErrorMessage(err)
            })

        return deferred.promise;
    }

    messageHandler.resetMessage()
    moveSelectedContentToTargetPlace().then(
        function () {
            viewHandler.showRefreshContentView()
        }
    );
};

var displayContentInCurrentPlace = function (paginationIndex){
    var setAppView = function(){
        messageHandler.resetMessage();
        viewHandler.setupMoveContentView();
    }

    var getContentTypesToDisplay = function(){
        var contentTypes = []
        _.forEach(SUPPORTED_CONTENT_TYPES, function(contentType){
            if(viewHandler.isContentTypeChecked(contentType))
                contentTypes.push(contentType)
        })
        return contentTypes;
    }

    var setupCurrentGroupId = function() {
        var deferred = Q.defer();
        jiveWrapper.getCurrentPlaceId().then(function (placeId) {
            moveContentSourceId = placeId;
            deferred.resolve();
        })
        return deferred.promise;
    }

    var getContentListJson = function (items) {
        return {
            contentList: _.map(items.list, function(item) {
                return {
                    "contentId": item.contentID,
                    "contentUrl": item.resources.html.ref,
                    "contentTitle": item.subject,
                    "contentAuthor": item.author.displayName,
                    "contentAuthorUrl": item.author.resources.html.ref,
                    "contentUpdatedDate": new Date(item.updated).toDateString()
                }
            })
        }
    };

    var showPaginationLinks = function(data) {
        var paginationJSON = {
        };
        if (data.links && data.links.next)
            paginationJSON.nextIndex = (paginationIndex + ITEMS_PER_PAGE).toString();
        if (data.links && data.links.previous)
            paginationJSON.prevIndex = (paginationIndex - ITEMS_PER_PAGE).toString() ;
        viewHandler.setupPaginationLinks(paginationJSON)
    }

    setAppView()
    setupCurrentGroupId().then(function(){

        if(!paginationIndex)
            paginationIndex=0;

        jiveWrapper.getContent(moveContentSourceId, getContentTypesToDisplay(), ITEMS_PER_PAGE, paginationIndex)
            .then(
            function(data){
                if(data.list.length != 0) {
                    viewHandler.showContent(getContentListJson(data));
                    showPaginationLinks(data);
                    gadgets.window.adjustHeight();
                }
                else {
                    viewHandler.showContent({});
                }
            },
            function(err){
                viewHandler.showContent({});
            })
    })
};

var refreshContent = function(){
    displayContentInCurrentPlace();
}

$(document).ready(function(){
    $("#moveContent").click(processMoveContent);
    $("#target_place_picker").click(displayTargetPlacePicker);
    $("#refreshContent").click(refreshContent);
    $("#selectAllContent").change(viewHandler.selectAllContent);
    viewHandler.setContentTypeButtonsWithHandlers(SUPPORTED_CONTENT_TYPES, refreshContent);
    displayContentInCurrentPlace()
});