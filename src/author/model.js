import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

export default Backbone.Model.extend({
    defaults: function () {
        return {
            LastName: '',
            ForeName: '',
            Initials: '',
            Articles: []      //List of pointers to articles whose authors include this model's
        }
    },

    //Updates the list of article pointers and notifies the change manually.
    //NOTE: Backbone only detects shallow changes.
    changeArticlesAttr: function (articleCID) { 
        this.get('Articles').push(articleCID);
        this.trigger('change:Articles', this, articleCID, {});
        this.trigger('change', this, {});
    },

    //Gets the CIDs of the articles shared by the present model's author and a given one.
    getSharedArticles: function (authorCID) {
        const ownArticles = this.get('Articles');
        const author = this.collection._byId[authorCID];

        if (authorCID == this.cid) {
            return ownArticles;
        } else {
            return _.intersection(ownArticles, author.get('Articles'));
        }
    }
});