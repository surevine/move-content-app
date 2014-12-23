var jiveWrapper = {

    getCurrentPlaceId : function () {
        var deferred = Q.defer();
        var JIVE_GROUP_IDENTIFIER = 700;
        var JIVE_SPACE_IDENTIFIER = 14;
        osapi.jive.core.container.getLaunchContext(function (selection) {
            var containerId = selection.jive.content.id;
            var containerType = selection.jive.content.type == "osapi.jive.core.Group" ? JIVE_GROUP_IDENTIFIER : JIVE_SPACE_IDENTIFIER;

            osapi.jive.corev3.places.get({entityDescriptor: [containerType, containerId]})
                .execute(function (osapiResponse) {
                    deferred.resolve(osapiResponse.list[0].placeID);
                });
        });
        return deferred.promise;
    },

    getContent : function (placeId, contentTypesToDisplay, itemsPerPage, paginationIndex) {
        var deferred = Q.defer();
        osapi.jive.corev3.contents.get({
            "place": opensocial.getEnvironment()['jiveUrl'] + "/api/core/v3/places/" + placeId,
            "type": contentTypesToDisplay.join(","),
            "startIndex": paginationIndex,
            "count": itemsPerPage
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
        var content_url = opensocial.getEnvironment()['jiveUrl'] + "/api/core/v3/contents/" + contentId

        function hasInactiveCollaborator(response) {
            return response.error.code == "peopleNotActiveAccount";
        }

        osapi.jive.corev3.contents.get({"uri": content_url}).execute(function (content) {
            content.parent = opensocial.getEnvironment()['jiveUrl'] + "/api/core/v3/places/" + targetPlaceId;
            content.categories = [];
            content.update({"minor": "true"}).execute(function (response) {
                if (response.error) {
                    if(hasInactiveCollaborator(response)){
                        delete content.authors; // removing all authors instead of checking which one was inactive
                        content.update({"minor": "true"}).execute(function (resp) {
                            if (resp.error)
                                deferred.reject(resp.error)
                            else
                                deferred.resolve();
                        })
                    } else {
                        deferred.reject(response.error)
                    }
                }
                else
                    deferred.resolve();
            })
        });
        return deferred.promise;
    }
}


