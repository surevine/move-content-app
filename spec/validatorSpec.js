var assert = chai.assert;
var should = chai.should;

describe("Validator Tests", function() {

        it("should fail if source and target places are same", function() {
            var validator = new Validator();
            return assert.isRejected(validator.validateSelectedPlacesAndContent("123","123", []),/Target container should not be same as source/);
        });

        it("should fail if target place not selected", function() {
            var validator = new Validator();
            return assert.isRejected(validator.validateSelectedPlacesAndContent("123","", []),/Please select a target container/);
        });

        it("should fail if no content selected to move", function() {
            var validator = new Validator();
            return assert.isRejected(validator.validateSelectedPlacesAndContent("123","124", []),/No content to move!!!/);
        });
        it("should pass for valid data", function() {
            var validator = new Validator();
            return assert.isFulfilled(validator.validateSelectedPlacesAndContent("123","124", ["111"]));
        });

});