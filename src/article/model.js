import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Authors from '../authors/collection';

export default Backbone.Model.extend({
    authors: new Authors(
        [], {rootProp: 'AuthorList'}
    ),                          //Class-wide collection of unique authors

    defaults: function () {
        return {
            ArticleTitle: '',
            AuthorList: []      //Pointers to hash entries for each of the article's author
        }
    },

    initialize: function () {
        this.on('add', this.onAdd);
    },

    //Works out list of author pointers
    parse: function (response) {
        response.AuthorList = this.authors.toPointers(response);
        return response;
    },

    //Update each author's list of articles once Backbone's CID for this article has been 
    //worked out (once the article has been added to the collection)
    onAdd: function () {
        this.authors.changeArticles(this.get('AuthorList'), this.cid);
    }
});