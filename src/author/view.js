import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import columnTemplate from './column.html';
import rowTemplate from './row.html';

export default Marionette.View.extend({
    options: {
        isColumn: false
    },

    templateContext: function () {
        const currAuthor = this.model;
 
        return {

            //Makes the collection available to each cell
            authors: currAuthor.collection,

            //Gets the number of articles co-authored by this view's author
            sharedNum: function (author) {
                return currAuthor.getSharedArticles(author.cid).length;
            }
        };
    },

    //Uses a different template according to the type of row (heading or body)
    getTemplate: function () {
        if (this.options.isColumn) {
            return columnTemplate;
        } else {
            return rowTemplate;
        }
    },

    //Only re-renders if this view's model represents a co-author in the article whose CID is
    //provided.
    checkCoauthor: function (articleCID) {
        if (this.model.get('Articles').indexOf(articleCID) != -1) {
            this.render();
        }
    },

    //Gets rid of the wrapping div
    //SOURCE: http://stackoverflow.com/a/14679936
    onRender: function () {
        this.$el = this.$el.children();
        this.$el.unwrap();
        this.setElement(this.$el);
    }
});
        