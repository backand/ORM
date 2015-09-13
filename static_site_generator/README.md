# Jekyll Static Web Site

* Can handle images in markdown.
* Full-text search.
* CSS to be configured in `_sass` folder in static site generated 
* Note that because we generate the site, you should save scss files elsewhere and copy them into _sass when generating the site.
* Assumes the temp folder in repo contains markdown files and images.

# Installation 

## Node.js Packages

	npm install

## Jekyll

    cd ..
    sudo gem install jekyll
    git clone git@github.com:christian-fei/Simple-Jekyll-Search.git
    /usr/bin/jekyll new static_site
    cd static_site
    mkdir node_modules
    npm install bower
    node_modules/bower/bin/bower install simple-jekyll-search
    cp ../static_site_generator/search.json .
    mkdir _plugins
    cp ../Simple-Jekyll-Search/_plugins/simple_search_filter.rb _plugins/

## Configure Search

Edit the file:  `_layouts/default.html`

Place these lines:

		<!-- Html Elements for Search -->
		<div id="search-container">
		<input type="text" id="search-input" placeholder="search...">
		<ul id="results-container"></ul>
		</div>

		<!-- Script pointing to jekyll-search.js -->
		<script src="{{ site.baseurl }}/bower_components/simple-jekyll-search/dest/jekyll-search.js" type="text/javascript"></script>
		<script type="text/javascript">
		SimpleJekyllSearch({
		  searchInput: document.getElementById('search-input'),
		  resultsContainer: document.getElementById('results-container'),
		  json: '/search.json',
		});
		</script>

after the line:

    {% include header.html %}

# Operation

## Build Raw Files for Jekyll

	node_modules/.bin/gulp jekyll

## Build Site

	node_modules/.bin/gulp build

## Serve Site

	node_modules/.bin/gulp serve


    

