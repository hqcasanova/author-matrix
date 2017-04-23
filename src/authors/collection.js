import $ from 'jquery';
import _ from 'underscore';
import Row from '../row/collection';
import Author from '../author/model';

export default Row.extend({
    model: Author,

    //Filters out non-array levels
    parse: function (response) {
        response = Row.prototype.parse.call(this, response);
        return response.Author;
    },

    //Converts authors to a list of pointers. It leverages Backbone's default ID (CID) as 
    //for the hash pointers. 
    //NOTE: By default, Backbone ignores models with existing IDs but will nevertheless 
    //return them as part of the add operation. If the authors are not in the collection's
    //hash, it also adds them.
    toPointers: function (response) {
        return _.pluck(this.add(response, {parse: true}), 'cid');
    },

    //Updates the article list for each of the authors of the present article.
    changeArticles: function (authorCIDs, articleCID) {
        authorCIDs.forEach((authorCID) => {
            this._byId[authorCID].changeArticlesAttr(articleCID);
        });
    },

    //Uses base64 as a quick and dirty form of unique ID for an article if not set.
    //NOTE: models are looked up in the collection before parsing. Hence why parse() is not
    //overwritten here. 
    //TODO: Two authors can have the same name and initials. Find a safer and more efficient
    //alternative if available or make IDs a requirement for authors on the backend.
    modelId: function (attributes) {
        let id = Row.prototype.modelId.call(this, attributes);

        if (!id) {
            id = this.getBase64(attributes);
            attributes.id = id;
        }
        
        return id;
    },

    //Encodes a string to base64. Assuming every full name is unique, it uses the model's 
    //concatenated attributes as the input. 
    //SOURCE: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    getBase64: function (attributes) {
        const message = _.values(attributes).join();

        return btoa(encodeURIComponent(message).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    }
});
