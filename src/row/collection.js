import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

export default Backbone.Collection.extend({
    rootProp: null,     //Root property for the response 

    initialize: function (models = [], options = {}) {
        const hasRootProp = options.hasOwnProperty('rootProp');
        const hasUrl = options.hasOwnProperty('url');
            
        if (hasRootProp) {
            this.rootProp = options.rootProp;
        }
        if (hasUrl) {
            this.url = options.url;
        }
        
    },

    //Strips the response of its root object property
    parse: function (response) {
        if (this.rootProp) {
            return response[this.rootProp];
        } else {
            return response;
        }
        
    }
});