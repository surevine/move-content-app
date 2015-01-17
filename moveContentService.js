exports.moveContent = {
    'path' : '/moveContent',
    'verb' : 'post',
    'route': function(req, res) {
        var targetPlaceGroupId = req.body.groupId;
        var contentId = req.body.contentId;

        getContent(contentId).then(function (content) {
            createContentInNewJive(groupId, content).then(function () {
                //return success or failure
            })
        })
    }

};


var getContent = function (contentId) {
    var deferred = Q.defer();
    var oldJiveApiUrl = "" //  https://oldjivebaseUrl/api/core/v3/
    var contentApiUrl = oldJiveApiUrl+"contents/"+contentId
    var contentRequest = {
        'authz': "signed",
        url: contentApiUrl,
        method:'GET',
        'auth': {
            "user":"",
            "pass":""
        }
    }
    request(contentRequest, function (error, response, body) {
        if (error != null) {
            deferred.reject();
        } else {
            var content = JSON.parse(body.replace(/throw.*;/, "").trim())
            deferred.resolve(content)
        }
    });
    return deferred.promise;
}

var createContentInNewJive = function(groupId, content){
    var deferred = Q.defer();
    var newJiveApiUrl = "" //  https://newjivebaseUrl/api/core/v3/
    var postUrlForContentCreationInGroup = newJiveApiUrl+"places/"+groupId+"/contents"

    // if on jive cloud fall release, utilize back dating feature for publishing to new jive instance
    var createContentRequest = {
        'authz': "signed",
        url: postUrlForContentCreationInGroup,
        method:'POST',
        'auth': {
            "user":"",
            "pass":""
        },
        body:data
    };
    request(contentRequest, function (error, response, body) {
        if (error != null) {
            deferred.reject();
        } else {
            deferred.resolve()
        }
    });
    return deferred.promise;
}

