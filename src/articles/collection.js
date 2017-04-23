import $ from 'jquery';
import _ from 'underscore';
import Row from '../row/collection';
import Article from '../article/model';

export default Row.extend({
    model: Article,

    //Filters out non-array levels
    parse: function (response) {
        response = Row.prototype.parse.call(this, response);
        return response.Article;
    },
});