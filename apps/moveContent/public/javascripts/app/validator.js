var Validator = function () {
    var targetPlaceNotSelected = function (targetPlaceId) {
        return  _.isEmpty(targetPlaceId);
    }

    var sourceAndTargetPlacesAreSame = function (sourcePlaceId,targetPlaceId) {
        return _.isEqual(sourcePlaceId,targetPlaceId)
    };
    var validateSelectedPlacesAndContent = function (sourcePlaceId, targetPlaceId, contentIds) {

        var deferred = Q.defer();
        if (targetPlaceNotSelected(targetPlaceId)) {
            deferred.reject("Please select a target place");
        }
        else if (sourceAndTargetPlacesAreSame(sourcePlaceId,targetPlaceId)) {
            deferred.reject("Target place should not be same as source");
        }
        else if (contentIds.length == 0) {
            deferred.reject("No selected content to move!!!");
        } else {
            deferred.resolve(true);
        }

        return deferred.promise;
    }
    return {
        validateSelectedPlacesAndContent: validateSelectedPlacesAndContent
    }

}