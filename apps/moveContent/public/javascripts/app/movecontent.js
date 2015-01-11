var validator = Validator();
var SUPPORTED_CONTENT_TYPES = ["document", "discussion", "file", "idea", "poll", "video", "event"];
var isBlogsView = true;
var itemsPerPage;
var sourcePlaceUrl;
var targetPlaceUrl;
var sourcePlaceBlogUrl;
var targetPlaceBlogUrl;


var displayTargetPlacePicker = function () {
    var setTargetPlaceNameAndUrl = function (place) {
        targetPlaceUrl = place.resources.self.ref;
        targetPlaceBlogUrl = place.resources.blog.ref;
        messageHandler.resetMessage();
        viewHandler.displayTargetPlaceName(place.name);
    }

    osapi.jive.corev3.search.requestPicker({
        excludeContent : true,
        excludePeople : true,
        success : function(place) {
            setTargetPlaceNameAndUrl(place)
        }
    });
}

var processMoveContent = function () {
    var moveSelectedContentToTargetPlace = function(){
        var selectedContentIds = viewHandler.getSelectedContentIds()
        var deferred = Q.defer();
        validator.validateSelectedPlacesAndContent(sourcePlaceUrl, targetPlaceUrl, selectedContentIds)
            .then(
            function(){
                var documentSuccessCount = 0;
                viewHandler.disableAllButtonsWhileProcessingContent();

                _.forEach(selectedContentIds, function(contentId){
                        jiveWrapper.updateContentParentPlace(contentId, isBlogsView?targetPlaceBlogUrl:targetPlaceUrl)
                            .then(function(){
                                documentSuccessCount = documentSuccessCount + 1;
                                messageHandler.displayInfoMessage(" Successfully moved "+ documentSuccessCount + " out of " + selectedContentIds.length);
                                viewHandler.displayContentSuccessRow(contentId);
                                if(_.last(selectedContentIds) == contentId)
                                    deferred.resolve();
                            },
                            function(err){
                                console.log("Error while moving document:"+contentId +" ",err)
                                viewHandler.displayContentErrorRow(contentId, err);
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
        viewHandler.resetContentList();
        messageHandler.resetMessage();
        viewHandler.setupMoveContentView();
    }

    var getContentTypesToDisplay = function(){
        if(isBlogsView)
            return ["post"]
        var contentTypes = []
        _.forEach(SUPPORTED_CONTENT_TYPES, function(contentType){
            if(viewHandler.isContentTypeChecked(contentType))
                contentTypes.push(contentType)
        })
        return contentTypes;
    }

    var setupCurrentGroupURL = function() {
        var deferred = Q.defer();
        jiveWrapper.getCurrentPlaceUrl().then(function (placeData) {
            sourcePlaceUrl = placeData.placeUrl;
            sourcePlaceBlogUrl = placeData.placeBlogUrl;
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
            paginationJSON.nextIndex = (paginationIndex + itemsPerPage).toString();
        if (data.links && data.links.previous)
            paginationJSON.prevIndex = (paginationIndex - itemsPerPage).toString() ;
        viewHandler.setupPaginationLinks(paginationJSON)
    }

    setAppView()
    setupCurrentGroupURL().then(function(){
        itemsPerPage = viewHandler.itemsPerPage()
        console.log("items ", itemsPerPage);

        if(!paginationIndex)
            paginationIndex=0;

        jiveWrapper.getContent(isBlogsView?sourcePlaceBlogUrl:sourcePlaceUrl, getContentTypesToDisplay(), itemsPerPage, paginationIndex)
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

var setupForBlog = function(){
    isBlogsView = true;
    viewHandler.setContentTypeButtonsWithHandlers([], refreshContent);
    refreshContent()
}

var setupForOtherContent = function(){
    isBlogsView = false;
    viewHandler.setContentTypeButtonsWithHandlers(SUPPORTED_CONTENT_TYPES, refreshContent);
    refreshContent()
}

$(document).ready(function(){
    $("#move-other-content-tab").click(setupForOtherContent);
    $("#move-blog-posts-tab").click(setupForBlog);
    $("#moveContent").click(processMoveContent);
    $("#target_place_picker").click(displayTargetPlacePicker);
    $("#refreshContent").click(refreshContent);
    $("#itemsPerPageOption").change(refreshContent);
    $("#selectAllContent").change(viewHandler.selectAllContent);
    displayContentInCurrentPlace()
});
