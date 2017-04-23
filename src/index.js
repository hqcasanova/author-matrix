import './styles.less';
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Articles from './articles/collection';
import Marionette from 'backbone.marionette';
import Row from './row/view.js'

//Application class
const Matrix = Marionette.Application.extend({
    articles: null,      //articles collection
    authors: null,       //authors collection

    //Sets up data structures. Uses prototype to establish relationships.
    onBeforeStart: function (app, options) {
        this.articles = new Articles([], {
            url: options.rootUrl + options.apiPath + options.articlesPath,
            rootProp: 'MedlineCitationSet'
        });

        //There's a many-to-many relationship between authors and articles.
        //NOTE: to facilitate dynamic updating of authors through the sequential
        //processing of articles, the coupling is implemented in the article => author
        //direction.
        this.authors = this.articles.model.prototype.authors;
    },

    //Sets up view scaffolding around existing markup.
    onStart: function (app, options) {
        const matrixEl = document.body.querySelector('.matrix');
        const columnsEl = matrixEl.querySelector('.columns');
        const rowsEl = matrixEl.querySelector('.rows');

        new Row({
            el: columnsEl,
            collection: this.authors,
            childViewOptions: {isColumn: true}
        }).render();
        new Row({
            el: rowsEl,
            collection: this.authors,
            articles: this.articles
        }).render();

        //Fills the matrix with data incrementally, as the articles are processed one by one.
        this.articles.fetch({success: () => {
            columnsEl.classList.add('loaded')
        }});
    }
});

//Instance with app-wide options
const matrix = new Matrix().start({
    rootUrl: '',                           //Root URL for web service's endpoints
    apiPath: '',                           //Path to JSON endpoints
    articlesPath: 'articles.json'          //Endpoint for articles
});