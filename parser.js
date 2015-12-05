// load file system module
var fs = require('fs');

var filename = process.argv[2];

if (filename == undefined){
    console.log('No input argument, use default file');
    filename = 'pg45.txt';
}



console.log('loading content from ' + filename);

// read the contents of the file into memory
fs.readFile(filename, function (err, buffer) {
    // If an error occurred, throwing it will
    // display the exception and end our app
    if (err) throw err;

    // buffer is a Buffer, convert to string
    var text = buffer.toString();
    console.log('loading done');

    console.log('start processing content');

    // the stats variable
    var linecount = 0;
    var wordcount = 0;

    // get line count
    var lines = text.split('\n');
    linecount = lines.length;

    // get words count and their number of appearance
    var index = {};
    // save each word to an array
    var wordarr = [];
    // save the trigram to an dictionary
    var trigrams = {};

    lines.forEach(function(line){
        var words = line
                    .replace(/[.,?!;()"-]/g, " ")
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .split(" ");
        // count words
        wordcount += words.length;
        // build index dictionary
        words.forEach(function (word) {
            if (word != ''){
                wordarr.push(word);
                if (!(index.hasOwnProperty(word))){
                    index[word] = 0;
                }
                index[word]++;
            }
        });
    });

    // change dict to array for sort
    var indexarr = [];
    var i = 0
    for (var key of Object.keys(index).sort()){
        indexarr[i] = [key, index[key]];
        i += 1;
    }

    // sort the array
    indexarr = indexarr.sort(function(x,y){
        return y[1] - x[1];
    });

    // get trigram
    for (var j = 0; j < wordarr.length-3; j++){
        var temp = wordarr.slice(j, j+3).join(' ');
        if (!(trigrams.hasOwnProperty(temp))){
            trigrams[temp] = 0;
        }
        trigrams[temp]++;
    }

    // change dict to array for sort
    var trigramsarr = [];
    var i = 0
    for (var key of Object.keys(trigrams).sort()){
        trigramsarr[i] = [key, trigrams[key]];
        i += 1;
    }

    // sort the array
    trigramsarr = trigramsarr.sort(function(x,y){
        return y[1] - x[1];
    });

    // Get Top 11 trigrams
    trigramtop11 = trigramsarr.slice(0,11);

    // Calculate edit distance and sort by distance value
    // create an array to save the result
    var resultstr = [];
    for (var j = 1; j < 11; j++){
        var dis = levenshtein(trigramtop11[0][0], trigramtop11[j][0]);
        var str = "[" + trigramtop11[0][0] + "] vs [" + trigramtop11[j][0] + "]: ";
        resultstr.push([str, dis]);
    }
    resultstr.sort(function(x, y){
        return x[1] - y[1];
    });

    console.log('processing content done');
    console.log('--------statistics--------');

    console.log('Line Count: ' + linecount);
    console.log('Word Count: ' + wordcount);

    console.log('Word Frequency');
    for (var j = 0; j < 10; j++){
        console.log(indexarr[j]);
    }

    console.log('Trigram Frequency');
    for (var j = 0; j < 11; j++){
        console.log(trigramtop11[j]);
    }

    console.log('Edit distance:');
    for (var j = 0; j < 10; j++){
        console.log(resultstr[j][0] + resultstr[j][1]);
    }

    console.log('--------end---------');

    console.log('Creating HTML content');

    var htmlcontent = '<html><head><title>' + filename + ' Analysis Result</title><head>';
    htmlcontent += '<body><h1>' + filename + ' Analysis Result</h1>';
    htmlcontent += '<h2>Line Count: ' + linecount + '</h2>';
    htmlcontent += '<h2>Word Count: ' + wordcount + '</h2>';
    htmlcontent += '<h2>Trigram Frequency (Top 10)</h2><ol>';
    for (var j = 0; j < 10; j++){
        htmlcontent += '<li>' + trigramtop11[j] + '</li>';
    }
    htmlcontent += '</ol><h2>Trigram Edit Distance</h2><ol>';
    for (var j = 0; j < 10; j++){
        htmlcontent += '<li>' + resultstr[j] + '</li>';
    }
    htmlcontent += '</ol><h2>Word Frequency</h2><ul>';
    for (var j = 0; j < indexarr.length; j++){
        htmlcontent += '<li>' + indexarr[j] + '</li>';
    }
    htmlcontent += '</ul></body></html>';


    console.log('')
    console.log('Generating HTML file');
    var filenamearr = filename.split('.');

    fs.writeFile(filenamearr[0] + '-result.html', htmlcontent, function(err){
        if (err){
            return console.error(err);
        }
        console.log('Generation Success');
        console.log('Filename: ' + filenamearr[0] + '-result.hmtl');
        console.log('---------------------');
        console.log('All Job Done');
    });

});


function levenshtein(a, b) {
    var al = a.length + 1;
    var bl = b.length + 1;
    var result = [];
    var temp = 0;
    // create a 2d array
    for (var i = 0; i < al; result[i] = [i++]) {}
    for (var i = 0; i < bl; result[0][i] = i++) {}
    for (i = 1; i < al; i++) {
        for (var j = 1; j < bl; j++) {
            // is up and left the same
            temp = a[i - 1] == b[j - 1] ? 0 : 1;
            // result[i - 1][j] + 1 , left
            // result[i][j - 1] + 1 , up
            // result[i - 1][j - 1] + temp, up left
            result[i][j] = Math.min(result[i - 1][j] + 1, result[i][j - 1] + 1, result[i - 1][j - 1] + temp);
        }
    }
    return result[i-1][j-1];
}

