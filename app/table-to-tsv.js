$(function() {
  var domain = 'https://en.wikipedia.org/';
  var delim = '&#9;';
  var table = $('table');
  var tsv = '';
  var tsvP = $('<pre>');

  var year, yearAwarded, author, authorWiki, work, workWiki, pub, pubWiki;
  var maxCells = table.find('tr').eq(0).find('th').length;

  table.find('sup').remove();

  table.find('tr').each(function(i, tr) {
    var cells = $(tr).find('th,td');
    var numCells = cells.length;
    if (numCells > 4) {
      if ($(tr).find('th').eq(0).find('a').length) {
        year = $(tr).find('th').eq(0).find('a').text().trim();
      } else {
        year = $(tr).find('th').eq(0).text().trim();
      }
    }

    if (numCells === 5) {
      yearAwarded = year;
      if (yearAwarded === 'Year') {
        yearAwarded = 'Year awarded';
      }
      tsv += yearAwarded + delim;
    }

    if (numCells === 6) {
      yearAwarded = $(tr).find('th').eq(1).text().trim();
    }

    if (numCells === 4) {
      tsv += year + delim;
      tsv += yearAwarded + delim;
    }

    if (numCells === 1) {
      tsv += year + delim;
      tsv += yearAwarded + delim;
    }

    cells.each(function(i, td) {
      if (numCells === 1) {
        i = i + 1;
      }
      if (numCells === 4) {
        i = i + maxCells - 4;
      }

      var wiki = $(td).find('a').attr('href');
      var colName = table.find('thead tr').eq(0).find('th').eq(i).text().trim();
      var isWinner;

      if (colName === 'Author(s)' || colName === 'Author') {
        $(td).find('.vcard').remove();
        author = $(td).text().trim();
        isWinner = author.indexOf('*') !== -1;

        if (author) {
          if (isWinner) {
            author = author.substring(0, author.length - 1);
          }
          tsv += author + delim;
        } else {
          tsv += colName + delim;
        }

        if (wiki && wiki.length) {
          authorWiki = wiki;
          tsv += domain + wiki + delim;
        } else if (author === colName) {
          tsv += 'Author Wikipedia Entry' + delim;
        } else {
          tsv += delim;
        }

        if (isWinner) {
          tsv += 'Won' + delim;
        } else if (author === colName) {
          tsv += 'Won/Nominated' + delim;
        } else {
          tsv += 'Nominated' + delim;
        }
      } else if (colName === 'Novel' || colName === 'Novelette' || colName === 'Novella' || colName === 'Short story') {
        work = $(td).find('.sorttext').text().trim();
        if (work && work.length) {
          tsv += work + delim;
        } else if ($(td).text().trim() === colName) {
          tsv += 'Work' + delim;
        } else {
          tsv += work = $(td).text().trim();
          tsv += delim;
        }

        if (wiki && wiki.length) {
          workWiki = wiki;
          tsv += domain + wiki + delim;
        } else if ($(td).text().trim() === colName) {
          tsv += 'Work Wikipedia Entry' + delim;
        } else {
          tsv += delim;
        }
      } else if (colName === 'Publisher or publication') {
        pub = $(td).find('.sorttext').text().trim();
        if (pub && pub.length) {
          tsv += pub + delim;
        } else {
          tsv += pub = $(td).text().trim();
          tsv += delim;
        }

        if (wiki && wiki.length) {
          pubWiki = wiki;
          tsv += domain + wiki + delim;
        } else if (pub === colName) {
          tsv += 'Publisher or publication Wikipedia Entry' + delim;
        } else {
          tsv += delim;
        }
      } else if (colName !== 'Ref.') {
        if ($(td).find('a').length) {
          tsv += $(td).find('a').text().trim() + delim;
        } else {
          tsv += $(td).text().trim() + delim;
        }
      }
    });

    if (numCells === 1) {
      tsv += work + delim;
      tsv += domain + workWiki + delim;
      tsv += pub + delim;
      tsv += domain + pubWiki + delim;
    }

    tsv = tsv.substring(0, tsv.length - delim.length);
    tsv += '\n';
  });


  tsvP.append(tsv);
  $('body').append(tsvP);
  table.remove();
});
