import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Author from '../author/view.js'

export default Marionette.CollectionView.extend({
    childView: Author,

    //Updates count of shared articles if articles provided.
    initialize: function (options) {
        const hasArticles = options.hasOwnProperty('articles');

        if (hasArticles) {
            this.listenTo(options.articles, 'add', this.checkCoauthors)
        }
    },

    //Updates publications count for those authors affected by the addition of an article
    checkCoauthors: function (model) {
        this.children.each((authorView) => {
            authorView.checkCoauthor(model.cid);
        });
    }
});