import './styles.less';
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Articles from './articles/collection'
import Marionette from 'backbone.marionette';
import Row from './row/view.js'

//Application class
const Matrix = Marionette.Application.extend({
    articles: null,      //articles collection

    //Sets up search results collection
    onBeforeStart: function (app, options) {
        this.articles = new Articles([], {
            url: options.rootUrl + options.apiPath + options.articlesPath,
            rootProp: 'MedlineCitationSet'
        });
    },

    //Fills the matrix with data incrementally, as the articles are processed one by one.
    onStart: function (app, options) {
        const authors = this.articles.model.prototype.authors;
        const matrixEl = document.body.querySelector('.matrix');
        const columnsEl = matrixEl.querySelector('.columns');
        const rowsEl = matrixEl.querySelector('.rows');

        new Row({
            el: columnsEl,
            collection: authors,
            childViewOptions: {isColumn: true}
        }).render();
        new Row({
            el: rowsEl,
            collection: authors,
            articles: this.articles
        }).render();
        this.articles.fetch({success: () => {
            columnsEl.classList.add('loaded')
        }});
    }
});

//Instance with app-wide options
const matrix = new Matrix().start({
    rootUrl: '',                            //Root URL for web service's endpoints
    apiPath: '/assets',                     //Path to JSON endpoints
    articlesPath: '/articles.json'          //Endpoint for articles
});