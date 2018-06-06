Author-matrix
=============

Tabular representation of author-to-author relationships in the Medline dataset. 
- [Live demo](https://hqcasanova.github.io/author-matrix/).
- [Sample API response)[src/articles.json.]
- Implemented with Marionette v3.2. 
- Tested on Google Chrome v57.

Questions
---------

- **How would you design a test suite for the application?**

As far as I understand the question, it is best to take a three-fold approach, covering early design, code practices and architecture. Also, the strategy's impact will depend on the particular type of tests: unit or integration, state or interaction based. I will try to illustrate all these perspectives by focusing on three specific cases.

Determining exactly all of the application's components should help make unit tests more robust, given that those components are less likely to have hard dependencies. However, there is a lot of room for improvement here. For example, the row view contains a conditional for listening to [article additions](https://github.com/hqcasanova/author-matrix/blob/master/src/row/view.js#L14) that belongs in a child class tailored to the [author's view](https://github.com/hqcasanova/author-matrix/blob/master/src/author/view.js). Maybe a cell view class combined with a collection of cell models used as child views for Marionette's CollectionView instance would be a better match. It would also make extending the app with cell-only interactions, such as clicking on a cell to see the details of the actual articles, far simpler. By extension, this would make cell-related interactive tests much easier in the future. However, since the interface was not a priority and due to my lack of experience with nested collection views in Marionette, I had to drop this line of thought.

In terms of code, every method has been made as deterministic as possible, only allowing object-scoped properties or other methods to be implicit. Nevertheless, in some instances, this has not been fully realised. One such case is the implicit class-wide collection of authors inside the [article class](https://github.com/hqcasanova/author-matrix/blob/master/src/article/model.js#L6). It may well affect unit tests for articles but, at the same time, it may simplify integration tests since there is less to set up by hand. Whether this a price worth paying for less complexity, I am not sure. Ideally, the collection should live outside the article class to avoid unnecessary coupling at testing time. This solution would require creating a custom Collection class that produces a singleton.  

When it comes to architecture, separation between the view and data layers has been guaranteed as much as possible so that testing behaviour does not automatically entail setting up any browser-dependent environment. Particularly in the case of operations concerning an individual author's data, the core of the app. One example is the sharedNum template helper in the [author view](https://github.com/hqcasanova/author-matrix/blob/master/src/author/view.js#L22). A simpler approach would have been doing the intersection between lists of articles there and then. However, that would have directly coupled the row's author model with the view. Instead, a model-specific [getSharedArticles method](https://github.com/hqcasanova/author-matrix/blob/master/src/author/model.js#L24) is created to harbour that intersection so that the data behaviour can be tested separately.

All these things are interrelated and have feedbacks. But, in general, with the kinds of criteria shown above, a minimum standard for tests can be guaranteed. If the question is more about which set of tests are the goal post for considering this app properly tested, I would say those at the data layer. For example, checking that models and collections have the expected attributes after fetch or making sure that the getSharedArticles returns the right array after adding a certain article.

- **What problems do you foresee in scaling your solution to higher numbers of records?**

One of the first hurdles is overcoming the lack of IDs for authors. With higher numbers, collisions between authors with the same full name and initials will be more likely. Moreover, without IDs, authors that have already been processed may be re-processed as new and affect data integrity. Backbone does generate an internal unique identifier or CID but this is done blindly, without taking into consideration the model's data. It assumes that all models will always have their own identification attribute.  

In light of all this, the app uses [base64 encoding](https://github.com/hqcasanova/author-matrix/blob/master/src/authors/collection.js#L50) as a crude form of generating an identifier for each author model. Thus, authors can be [added to the collection](https://github.com/hqcasanova/author-matrix/blob/master/src/authors/collection.js#L21) without fear of duplicating data. Together with Backbone's internal CID and its _byId hash, the hash of authors may be referenced by the "AuthorList" attribute [replaced with pointers](https://github.com/hqcasanova/author-matrix/blob/master/src/article/model.js#L24), eliminating much of the redundancy in the data. This, in turn, enables the implementation of the many-to-many relationship between authors and articles as simple arrays of pointers in both directions. In the case of the author's model, an "Articles" attribute is used to store the pointers toward the authored articles.

In fact, the "Articles" attribute makes it possible to work out the number of articles co-authored by a given author pair (the number appearing in a cell) without traversing once again the whole of the articles collection, again a costly affair with large datasets. The app achieves this by performing an [intersection](https://github.com/hqcasanova/author-matrix/blob/master/src/author/model.js#L31) between the "Articles" attributes of respective authors. In effect, a divide and conquer approach is being applied here, reducing the scope of the problem from the whole range of articles to a subset of them: those penned by the two authors.

This solution is not without drawbacks though. It requires traversing the list of articles in its entirety to obtain final counts for co-authored articles. Before that, the counts do not take into account authors of articles that appear lower in the list. Waiting for the parsing of all articles would inevitably lead to a blank table for a potentially long period of time. To avoid it, the app harnesses Marionette's event system to render the counts and authors incrementally, as new articles are parsed. Albeit a cosmetic solution, it provides, in theory, a measure of last resort when processing times become too high.

Unfortunately, due to time constraints, this event-driven system is not fully optimised, leading to unnecessary operations that will definitely impact the app's scalability. More specifically, re-rendering does not happen at the cell level. Instead, the rows representing the authors whose list of co-authored articles include the article just added [are](https://github.com/hqcasanova/author-matrix/blob/master/src/author/view.js#L40). And every time a row is re-rendered, the counts for the row's author with respect to all the the others authors are recalculated, triggering a significant number of costly intersections when author numbers are large. The solution would be to increase the granularity of the table by implementing a view for each cell and, as mentioned in the previous question, try nested collection views.

Finally, it is worth noting that the average length of the "Articles" array can grow significantly. However, Medline's citation set will always tend to be much larger.