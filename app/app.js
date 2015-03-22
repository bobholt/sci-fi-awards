(function() {
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
    nebulaShortStoryOrig
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
      nebulaShortStory
    ]);

    allAwards.sort(function(a, b) {
      var x = a.author.toLowerCase();
      var y = b.author.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });

    var awardsByAuthor = d3.nest()
      .key(function(d) { return d.author; })
      .entries(allAwards);

    console.log(_.pluck(awardsByAuthor, 'key'));
    // console.log(awardsByAuthor[awardsByAuthor.length - 1]);
  }
}());
