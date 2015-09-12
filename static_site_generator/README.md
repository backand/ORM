# Installation 

## Node.js Packages

	npm install

## Jekyll

    cd ..
    sudo gem install jekyll
    /usr/bin/jekyll new static_site
    cd static_site
    mkdir node_modules
    npm install bower
    bower install simple-jekyll-search
    cp ../static_site_generator/search.json .

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


    

