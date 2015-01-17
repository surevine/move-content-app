var jiveWrapper = {

    getCurrentPlaceUrl : function () {
        var deferred = Q.defer();
        var JIVE_GROUP_IDENTIFIER = 700;
        var JIVE_SPACE_IDENTIFIER = 14;
        osapi.jive.core.container.getLaunchContext(function (selection) {
            var containerId = selection.jive.content.id;
            var containerType = selection.jive.content.type == "osapi.jive.core.Group" ? JIVE_GROUP_IDENTIFIER : JIVE_SPACE_IDENTIFIER;

            osapi.jive.corev3.places.get({entityDescriptor: [containerType, containerId]})
                .execute(function (osapiResponse) {
                    var placeData = {
                        "placeUrl":osapiResponse.list[0].resources.self.ref,
                        "placeBlogUrl":osapiResponse.list[0].resources.blog.ref
                    }
                    deferred.resolve(placeData);
                });
        });
        return deferred.promise;
    },

    getContent : function (placeUrl, contentTypesToDisplay, itemsPerPage, sortBy, paginationIndex) {
        var deferred = Q.defer();
        osapi.jive.corev3.contents.get({
            "place": placeUrl,
            "type": contentTypesToDisplay.join(","),
            "startIndex": paginationIndex,
            "count": itemsPerPage,
            "sort": sortBy
        }).execute(function (response) {
            if (response.error)
                deferred.reject(response);
            else
                deferred.resolve(response);
        })
        return deferred.promise;
    },

    updateContentParentPlace : function(contentId, targetPlaceId) {
        var deferred = Q.defer();
        osapi.jive.connects.post({
            authz:"signed",
            alias: "moveContentService",
            headers : { "Content-Type" : "application/json" },
            format: 'json',
            "body": {"groupId": targetPlaceId ,"contentId": contentId}
        }).execute(function (response) {
            if (response.error)
                deferred.reject(response);
            else
                deferred.resolve(response);
        });

        return deferred.promise;

    }
}


