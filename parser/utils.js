var fs = require('fs');
var fse = require('fs-extra');
var glob = require('glob');

var utils = {};



/**
 * Simple slugify method
 * https://gist.github.com/mathewbyrne/1280286
 */
utils.slugify = function(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

utils.encodedStr = function(rawStr){
  return rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
   return '&#'+i.charCodeAt(0)+';';
  });
};

utils.urlify = function(url){
  return url.toString().toLowerCase()
    .replace(/\//g, '.');
};


utils.getDocletParent = function(doc, doclets){
  return doclets.filter((d)=>{return d.id===doc.parent && d.metadata.index<doc.metadata.index }).pop();
};

utils.getDocPathName = function(doc){
  return (doc.parent)? doc.parent+'.'+doc.id : doc.id;
};

utils.getDocDepth = function(doc){
  return (doc.parent)? doc.parent.split('.').length : 0;
};

utils.isUrl = function(url){

  //clean url input
  url = (url+'').trim();
  
  //absolute url (root relative)
  if(url.indexOf('./')===0)
    return true;
    
  //relative url (file relative)
  if(url.indexOf('/')===0)
    return true;
  
  //custom relative url (settings path)
  if(url.indexOf('$')===0)
    return true;

  return false;
  
};


utils.resolveUrl = function(url, file, opts){
  
  var parts;
  
  //clean url input
  url = (url+'').trim();
  
  //absolute path, relative to root path
  if(url.indexOf('./')===0)
    return opts.rootPath + url.substr(2);
    
  //relative path (to file)
  if(url.indexOf('/')===0){
    parts = (file || '').split('/');
    //get rid of last part, should be the file name
    parts.pop();
    return ( parts.length ? parts.join('/')+'/' : '') + url.substr(1);
  }
  
  //custom path
  if(url.indexOf('$')===0 && opts.customPaths){
    parts = url.split('/');
    var customPathId = parts.shift().substr(1);
    var customPath = opts.customPaths[customPathId];
    if(customPath)
      return customPath + parts.join('/');
  }
  
  return url;
  
};


/**
 * Gets an array of matching filenames for the given set of glob patterns
 * @param {String | Array<String>} patterns
 * @return {Array<String>}
 */
utils.getGlobFiles = function(patterns){

  var result = [], match = [], ignore = [];
  
  //ensure patterns is array
  patterns = (!Array.isArray(patterns) ? [patterns] : patterns);

  //split into match and ignore patterns
  patterns.forEach(function(value){
    if(value.indexOf('!')===0)
      ignore.push(value.substr(1));
    else
      match.push(value);
  });
  
  //do the glob for each match pattern
  match.forEach(function(pattern){
    var files = glob.sync(pattern,{ ignore: ignore });
    result = result.concat(files);
  });
    
  //remove duplicate files
  return result.filter(function(value, index, self){
    return self.indexOf(value) === index;
  });

};


/**
 * Simple readFileSync wrapper
 */
utils.readFile = function(url){
  try{ return fs.readFileSync(url, "utf8") }
  catch(e){ return e.toString() }
};


/**
 * Simple writeFileSync wrapper
 */
utils.writeFile = function(filename, data){
  try{
    fse.outputFileSync(filename, data, 'utf8');
    console.log("The file "+filename+" was saved!");
  }
  catch(err){ console.log(err) }
};

/**
 * Simple copyFileSync wrapper
 */
utils.copyFile = function(src, target){
  try{
    fse.copySync(src, target);
    console.log("The file "+target+" was copied!");
  }
  catch(err){ console.log(err) }
};


/**
 * Asynchronously read a list of glob pattern files and pass the list of files to
 * be read. Maintains file order.
 *
 * @param {string[]} patterns - List of glob pattern files.
 * @param {function} callback - Callback to execute for each read file.
 * @returns {Promise}
 */
utils.readFileGlobs = function readFileGlobs(patterns, callback) {
  patterns = (!Array.isArray(patterns) ? [patterns] : patterns);
  var promises = [];

  patterns.forEach(function(pattern) {

    promises.push(new Promise(function(resolve, reject) {
      glob(pattern, function(err, files) {
        if (err) {
          reject(err);
        }

        if (files.length === 0) {
          console.warn('pattern "' + pattern + '" does not match any file');
        }

        resolve(files);
      });
    }));

  });

  return new Promise(function(resolve, reject) {
    Promise.all(promises).then(function(fileList) {
      promises.length = 0;

      fileList.forEach(function(files) {
        promises.push(utils.readFiles(files, callback));
      });

      Promise.all(promises).then(function() {
        resolve();
      })
      .catch(function(err) {
        reject(err);
      });
    });
  })
  .catch(function(err) {
    throw err;
  });
};


/**
 * Asynchronously read a list of files and call the callback function for each of
 * them. Maintains file order.
 *
 * @param {string[]} patterns - List of glob pattern files.
 * @param {function} callback - Callback to execute for each read file.
 * @returns {Promise}
 */
utils.readFiles = function readFiles(files, callback) {
  if (!files || files.length === 0) {
    return Promise.resolve();
  }

  files = (!Array.isArray(files) ? [files] : files);
  var promises = [];

  files.forEach(function(file) {

    promises.push(new Promise(function(resolve, reject) {
      fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
          reject(err);
        }

        resolve([data, file]);
      });
    }));

  });

  return Promise.all(promises).then(function(files) {
    files.forEach(function(data) {
      callback.apply(null, data);
    });
  })
  .catch(function(err) {
    throw err;
  });
};


utils.color = {};
utils.color.hexToRgb = function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

utils.color.contrast = function(color){
  
  var rgb;
  
  //convert to rgb if hex
  if(color.indexOf('#')===0){
    rgb = this.hexToRgb(color);
    rgb = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
  }
  else{
    rgb = color;
  }

    // Strip everything except the integers eg. "rgb(" and ")" and " "
    rgb = rgb.split(/\(([^)]+)\)/)[1].replace(/ /g, '');

    // map RGB values to variables
    var r = parseInt(rgb.split(',')[0], 10),
        g = parseInt(rgb.split(',')[1], 10),
        b = parseInt(rgb.split(',')[2], 10),
        a;

    // if RGBA, map alpha to variable (not currently in use)
    if (rgb.split(',')[3] !== null) {
        a = parseInt(rgb.split(',')[3], 10);
    }

    // calculate contrast of color (standard grayscale algorithmic formula)
    var contrast = (Math.round(r * 299) + Math.round(g * 587) + Math.round(b * 114)) / 1000;

    return (contrast >= 128) ? 'black' : 'white';
};

module.exports = utils;