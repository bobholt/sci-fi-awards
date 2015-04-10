(function() {

  var margin = {top: 30, right: 20, bottom: 30, left: 20},
      width = 960 - margin.left - margin.right,
      barHeight = 20,
      barWidth = width * 0.8;

  var i = 0,
      duration = 400,
      root;

  var tree = d3.layout.tree()
      .nodeSize([0, 20]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  queue()
    .defer(d3.tsv, '../data/hugo-novel-retro.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-novel.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-novelette-retro.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-novelette.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-novella-retro.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-novella.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-short-story-retro.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/hugo-short-story.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/nebula-novel.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/nebula-novelette.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/nebula-novella.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/nebula-short-story.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/locus-novel.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/locus-scifi-novel.tsv', normalizeColumnNames)
    .defer(d3.tsv, '../data/locus-fantasy-novel.tsv', normalizeColumnNames)
    .await(analyze);

  function normalizeColumnNames(d) {
    return {
      year: +d.Year,
      yearAwarded: +d['Year awarded'],
      author: d['Author(s)'],
      authorWiki: d['Author Wikipedia Entry'],
      won: d['Won/Nominated'],
      work: d.Work,
      workWiki: d['Work Wikipedia Entry'],
      pub: d['Publisher or publication'],
      pubWiki: d['Publisher or publication Wikipedia Entry']
    } ;
  }

  function addAwardCols(award, category, d, i) {
    var data = _.clone(d);
    data.award = award;
    data.category = category;
    return data;
  }

  function update(source) {

    // Compute the flattened node list. TODO use d3.layout.hierarchy.
    var nodes = tree.nodes(root)[0];

    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("svg").transition()
        .duration(duration)
        .attr("height", height);

    d3.select(self.frameElement).transition()
        .duration(duration)
        .style("height", height + "px");

    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .on("click", click);

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .text(function(d) { return d.key; });

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) {if (!d.y) {d.y = 0;} return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);


    node.transition()
        .duration(duration)
        .attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle values on click.
  function click(d) {
    if (d.values) {
      d._values = d.values;
      d.values = null;
    } else {
      d.values = d._values;
      d._values = null;
    }
    update(d);
  }

  function color(d) {
    return d._values ? "#3182bd" : d.values ? "#c6dbef" : "#fd8d3c";
  }

  function analyze(
    error,
    hugoNovelRetroOrig,
    hugoNovelOrig,
    hugoNoveletteRetroOrig,
    hugoNoveletteOrig,
    hugoNovellaRetroOrig,
    hugoNovellaOrig,
    hugoShortStoryRetroOrig,
    hugoShortStoryOrig,
    nebulaNovelOrig,
    nebulaNoveletteOrig,
    nebulaNovellaOrig,
    nebulaShortStoryOrig,
    locusNovelOrig,
    locusScifiNovelOrig,
    locusFantasyNovelOrig
  ) {
    if (error) {
      console.log(error);
    }

    var hugoNovelRetro = hugoNovelRetroOrig.map(addAwardCols.bind(null, 'Hugo', 'Novel'));
    var hugoNovel = hugoNovelOrig.map(addAwardCols.bind(null, 'Hugo', 'Novel'));
    var hugoNoveletteRetro = hugoNoveletteRetroOrig.map(addAwardCols.bind(null, 'Hugo', 'Novelette'));
    var hugoNovelette = hugoNoveletteOrig.map(addAwardCols.bind(null, 'Hugo', 'Novelette'));
    var hugoNovellaRetro = hugoNovellaRetroOrig.map(addAwardCols.bind(null, 'Hugo', 'Novella'));
    var hugoNovella = hugoNovellaOrig.map(addAwardCols.bind(null, 'Hugo', 'Novella'));
    var hugoShortStoryRetro = hugoShortStoryRetroOrig.map(addAwardCols.bind(null, 'Hugo', 'Short Story'));
    var hugoShortStory = hugoShortStoryOrig.map(addAwardCols.bind(null, 'Hugo', 'Short Story'));

    var nebulaNovel = nebulaNovelOrig.map(addAwardCols.bind(null, 'Nebula', 'Novel'));
    var nebulaNovelette = nebulaNoveletteOrig.map(addAwardCols.bind(null, 'Nebula', 'Novelette'));
    var nebulaNovella = nebulaNovellaOrig.map(addAwardCols.bind(null, 'Nebula', 'Novella'));
    var nebulaShortStory = nebulaShortStoryOrig.map(addAwardCols.bind(null, 'Nebula', 'Short Story'));

    var locusNovel = locusNovelOrig.map(addAwardCols.bind(null, 'Locus', 'Novel'));
    var locusScifiNovel = locusScifiNovelOrig.map(addAwardCols.bind(null, 'Locus', 'Novel'))
    var locusFantasyNovel = locusFantasyNovelOrig.map(addAwardCols.bind(null, 'Locus', 'Novel'))

    var allAwards = d3.merge([
      hugoNovelRetro,
      hugoNovel,
      hugoNoveletteRetro,
      hugoNovelette,
      hugoNovellaRetro,
      hugoNovella,
      hugoShortStoryRetro,
      hugoShortStory,
      nebulaNovel,
      nebulaNovelette,
      nebulaNovella,
      nebulaShortStory,
      locusNovel,
      locusScifiNovel,
      locusFantasyNovel
    ]);

    allAwards.sort(function(a, b) {
      var x = a.author.toLowerCase();
      var y = b.author.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });

    var awardsByAuthorAndWork = d3.nest()
      .key(function(d) { return d.author; })
      .sortKeys(function(a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      })
      .key(function(d) { return d.work; })
      .sortValues(function(a, b) {
        return a.year - b.year;
      })
      .entries(allAwards);

    // var ul = document.getElementsByClassName('authors')[0];

    // var templateString = '<tr>' +
    //     '<td><%= year %></td>' +
    //     '<td><% if (authorWiki && authorWiki.length) { %><a href="<%= authorWiki %>"><% } %><%= author %><% if (authorWiki && authorWiki.length) { %></a><% } %></td>' +
    //     '<td><% if (workWiki && workWiki.length) { %><a href="<%= workWiki %>"><% } %><%= work %><% if (workWiki && workWiki.length) { %></a><% } %></td>' +
    //     '<td><% if (pubWiki && pubWiki.length) { %><a href="<%= pubWiki %>"><% } %><%= pub %><% if (pubWiki && pubWiki.length) { %></a><% } %></td>' +
    //     '<td><%= award %></td>' +
    //     '<td><%= category %></td>' +
    //     '<td><%= won %></td>' +
    //   '</tr>';
    // var templateFunction = _.template(templateString);
    // var list = '';

    // list += templateFunction({
    //   year: 'Year',
    //   author: 'Author(s)',
    //   work: 'Work',
    //   pub: 'Publisher/Publication',
    //   authorWiki: '',
    //   workWiki: '',
    //   pubWiki: '',
    //   award: 'Award',
    //   category: 'Category',
    //   won: 'Won/Nominated'
    // });

    // list = list.replace(/<td/g, '<th');

    // allAwards.forEach(function(author) {
    //   list += templateFunction(author);
    // });

    // ul.innerHTML = list;

    awardsByAuthorAndWork.x0 = 0;
    awardsByAuthorAndWork.y0 = 0;
    update(root = awardsByAuthorAndWork);
  }
}());
