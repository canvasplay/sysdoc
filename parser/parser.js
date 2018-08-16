var utils = require('./utils');
var mdtoc = require('markdown-toc');

var parseComments = require('comment-parser');
var parseCommentsOptions = {
  dotted_names: false
};


// these key properties are used internally by the parser,
// flaging them as reserved tags we prevent data overwriting
var reservedTags = [
  'id',
  'index',
  'link',
  'children',
  'file',
  'line',
  'source',
  'metadata'
];

// this looks like a list of custom tag parsers...
// why dont just keys in TagParsers object...?
var reservedTypes = [
  'parent',
  'content',
  'data',
  'package',
  'ignore',
  'nofollow',
  'example',
  'description',
  'name',
  'type',
  'src'
];

var reservedNames = [
  'index',
  'global'
];

var DocletParser = function(opts){
  
  this.options = opts;
  
  console.log(Object.keys(TagProcessors).sort() );
  
  return this;
  
};

DocletParser.prototype.parse = function(str, isRoot){
  
  //raw parse comments in str using comment-parser
  var comments = parseComments(str, parseCommentsOptions);
  
  //process comments
  var doclets = this.processComments(comments, null, isRoot);
  
  //return processed comments
  return doclets;
  
};

DocletParser.prototype.parseFile = function(url, isRoot){
  
  //read file contents sync
  var contents = utils.readFile(url);

  //raw parse comments in file using comment-parser
  var comments = parseComments(contents, parseCommentsOptions);
  
  //process comments
  var doclets = this.processComments(comments, url, isRoot);
  
  //return processed comments
  return doclets;

};

DocletParser.prototype.processComments = function(comments, url, isRoot){
  
  //declare resulting doclets collection
  var doclets = [];
  
  //process parsed comment objects
  for (var i=0; i<comments.length;i++){
    
    var c = comments[i];
      
    //add original file url for reference
    if(url) c.file = url;
    
    //process comment
    var doc = this.processDoclet(c);
    
    //force result to an array
    var docs = (!doc)? [] : (Array.isArray(doc))? doc : [doc];
    
    //assign ids and indexes
    for(var n=0; n<docs.length; n++){
      
      var d = docs[n];
      
      //set id based on name or generate a generic "unique" one
      d.id = (d.name)? utils.slugify(d.name) : Math.floor(Math.random()*Math.pow(10, 15));
      
      //set index based on its position in collection
      d.metadata.index = doclets.length + n;
      
    }
    
    //add them to collection
    doclets = doclets.concat(docs);

  }

  //resolve doclets hierarchy only if is a root call
  if(isRoot)
    doclets = this.resolveDocletHierachy(doclets);

  //return resulting doclets
  return doclets;

};

DocletParser.prototype.processDoclet = function(doc){

  //create doclet's base object
  var o = {
    description: doc.description,
    metadata: {
      source: doc.source,
      file: doc.file,
      line: doc.line
    }
  };
  
  //no tags? generic type and done!
  if(!doc.tags.length){
    o.type = 'doc';
    return o;
  }
  
  //process tags one by one
  while(o && doc.tags && doc.tags.length){
    
    //shift the first tag
    var t = doc.tags.shift();
    
    //force lowercase tags
    t.tag = (t.tag+'').toLowerCase();
    
    //ignore reserved tags
    if(reservedTags.indexOf(t.tag)>=0){}
    
    else{
      
      var autotyping = false;
      
      // already untyped?
      if(!o.type){
        
        // Try auto-typing...
        if(reservedTypes.indexOf(t.tag)===-1){
          o.type = t.tag;
          autotyping = true;
        }
        // use generic type
        else{
          o.type = 'doc';
        }
        
      }
      
      //custom processing when autotyping
      if(autotyping) o = TagProcessors['name'](this,t,o);
      
      //process the tag
      else o = (TagProcessors[t.tag] || TagProcessors._)(this, t, o);
      
    }
    
  }
  
  return (o)? (DocProcessors[o.type] || DocProcessors._)(this, o) : o;
  
};

DocletParser.prototype.resolveDocletHierachy = function(doclets){
  
  //parent ref
  var ref;

  //resolve all doclets' parent property iterative
  for (var i=0; i<doclets.length; i++){
    
    var doc = doclets[i];
    
    //explicit parent definition?
    var explicitParent = (doc.parent)? true : false;
    
    //resolve parent doclet
    var parent = (explicitParent)? utils.getDocletParent(doc, doclets) || '' : ref;
    
    //set parent
    doc.parent = (!parent)? '' : utils.getDocPathName(parent);
    
    //if parent was resolved by explicit definition use this doc as new parent ref
    if(explicitParent) ref = doc;
    
  }
  
  return doclets;
  
}



/**
 * Tag Processors
 */

var TagProcessors = {};

// ARRAY FRIENDLY?
// p.e. @example, @data, ...
// convert processed tag value into array if defined multiple times
// currently all non-custom tags are array friendly as default...

var processTagValueAsArrayFriendly = function(o, value, key){
  if(!o[key]) o[key] = value;
  else if(!Array.isArray(o[key])) o[key] = [o[key], value];
  else o[key].push(value);
  return o;
};

// BOOL FLAG?
// p.e. @nofollow, @base, ...
// If the tag is defined just set define a property with that name and true as value

var processTagAsBoolFlag = function(parser, tag, o){
  o[tag.tag] = true;
  return o;
};

TagProcessors._ = function(parser, tag, o){
  
  //pick default tag data
  var value = {
    'type': tag.type,
    'name': tag.name,
    'description': tag.description
  };

  return processTagValueAsArrayFriendly(o, value, tag.tag);
  
};

TagProcessors.ignore = function(parser, tag, o){
  return;
};

TagProcessors.sysdoc = function(parser, tag, o){
  var options = (tag.name + ' ' + tag.description).split(',');
  var whitelist = [];
  var blacklist = [];
  for(var i=0; i<options.length;i++){
    var opt = options[i].trim();
    if(opt){
      if(opt.indexOf('!')===0)
        blacklist.push(opt.substr(1));
      else
        whitelist.push(opt);
    }
  };
  o.sysdoc = {
    type: (tag.type==='data')? 'data' : 'source',
    whitelist: whitelist,
    blacklist: blacklist
  }
  return o;
};

TagProcessors.package = function(parser, tag, o){
  if (parser.options.ignorePackage) return o;
  else return processTagAsBoolFlag(parser, tag, o);
};

TagProcessors.nofollow = processTagAsBoolFlag;
TagProcessors.base = processTagAsBoolFlag;

TagProcessors.parent = function(parser, tag, o){
  o.parent = utils.slugify(tag.name);
  return o;
};

TagProcessors.type = function(parser, tag, o){
  if(reservedTypes.indexOf(tag.name)>=0)
    throw new Error('Invalid Type: "@type '+tag.name+'" in '+o.metadata.file+':'+o.metadata.line);
  o.type = tag.name;
  return o;
};
  
TagProcessors.name = function(parser, tag, o){
  var name = (tag.name+' '+tag.description).trim();
  if(reservedNames.indexOf(utils.slugify(name))>=0)
    throw new Error('Invalid Name: @name '+name+'" in '+o.metadata.file+':'+o.metadata.line);
  o.name = name;
  return o;
};
  
TagProcessors.description = function(parser, tag, o){
  o.description = ('' + o.description + ' ' + tag.name + ' ' + tag.description).trim();
  return o;
};

TagProcessors.selector = function(parser, tag, o){
  o.selector = (tag.name+tag.description).trim();
  return o;
};

TagProcessors.data = function(parser, tag, o){
  
  var key = tag.type;
  if(!key) return o;
  
  var value = (tag.name+tag.description).trim();
  if(value.indexOf(',')>=0)
    value = value.split(',').map((t)=>{ return t.trim() });
    
  if(!o.data)
    o.data = {};
    
  if(!o.data[key])
    o.data[key] = value;
  else{
    var v1 = (Array.isArray(o.data[key]))? o.data[key] : [o.data[key]];
    var v2 = (Array.isArray(value))? value : [value];
    o.data[key] = v1.concat(v2);
  }

  return o;
};

TagProcessors.value = function(parser, tag, o){
  
  //get value
  var value = (tag.name+tag.description).trim();
  
  //get type
  var type = tag.type || resolveValueType(value);
  
  //ignore tag if type was not resolved
  if(!type) return o;
  
  //initialize value object if required
  if(!o.value) o.value = {};
    
  //write value by type, overwrite if exsisting
  o.value[type] = value;

  return o;
};

TagProcessors.content = function(parser, tag, o){
  
  var content;
  
  //check for target url as name
  var isUrl = utils.isUrl(tag.description || tag.name);
  
  if(isUrl){
    
    //resolve target file url
    var url = utils.resolveUrl(tag.description || tag.name, o.metadata.file, parser.options);
    
    //get file contents
    var contents = utils.readFile(url);

    var type = (url+'').split('.').pop();
    
    content = {
      type: (url+'').split('.').pop() || tag.type,
      value: contents
    }

  }
  else{
    
    content = {
      type: tag.type,
      value: (tag.name + ' ' + tag.description).trim()
    }
    
  }
  
  return processTagValueAsArrayFriendly(o, content, tag.tag);
  
};

TagProcessors.example = function(parser, tag, o){
  
  //check for target url as name
  if(utils.isUrl(tag.name)){
    
    //resolve target file url
    var url = utils.resolveUrl(tag.name, o.metadata.file, parser.options);
    
    //get file contents
    var contents = utils.readFile(url);
    
    //clear tag's name
    tag.name = '';
    
    //set new content
    tag.description = contents;
    
  }
  
  var example = {};
  
  example.type = tag.type || 'html';
  //example.name = tag.name;
  
  var codeDelimiter = '----';
  
  var str = (tag.name+' '+tag.description).trim();
  var hasCodeDelimiter = str.indexOf(codeDelimiter)>=0;
  
  if(hasCodeDelimiter){
    
    var parts = str.split(codeDelimiter);
    
    example.content = (''+parts[0]).trim();
    example.code = (''+parts[1]).trim();
    
  }
  else{
    example.content = str;
    example.code = example.content;
  }
  
  return processTagValueAsArrayFriendly(o, example, tag.tag);
  
};

TagProcessors.tags = function(parser, tag, o){
  o[tag.tag] = (tag.name+' '+tag.description).split(',').map((t)=>{ return t.trim() });
  return o;
};

TagProcessors.alias = TagProcessors.tags;

TagProcessors.src = function(parser, tag, o){
  var url = (tag.name+tag.description).trim();
  var value = utils.resolveUrl(url, o.metadata.file, parser.options);
  var type = (value+'').split('.').pop() || undefined;
  var src = {
    value: value,
    type: type
  };
  return processTagValueAsArrayFriendly(o, src, tag.tag);
};



/**
 * Doclet Processors
 */

// Thinking on abstraction...
// All doc processors should have common behaviors...

// CHILDREN FRIENDLY?
// p.e. @section, @module, ... might be children friendly
// While doclet tree resolution, if looking for a parent for a doclet
// without explicit parent definition, if the parent candidate
// is children friendly would set the child parent relation, if not...
// keep looking for a parent candidate up in the tree...

var DocProcessors = {};
  
DocProcessors._ = function(parser, doc){
  return doc;
};
  
DocProcessors.section = function(parser, doc){
  doc.parent = doc.parent || 'global';
  return doc;
};

DocProcessors.include = function(parser, doc){

  //get include target url based on doc's name
  var url = utils.resolveUrl(doc.name, doc.metadata.file, parser.options);
  
  //return processed doclets in url
  return parser.parseFile(url);
  
};

DocProcessors.md = function(parser, doc){

  //get include target url based on doc's name
  var url = utils.resolveUrl(doc.name, doc.metadata.file, parser.options);
  
  console.log(url);
  //get file contents
  doc.content = utils.readFile(url);
  
  //generate table of contents
  var toc = mdtoc(doc.content).json;
  
  var path = [];
  var items = [];
  
  for(var i=0; i< toc.length;i++){
    var t = toc[i];
    var ref = path[path.length-1];
    if(!ref){
      path.push(t);
      items.push(t);
    }
    else{
      while(ref && t.lvl<=ref.lvl){
        path.pop();
        ref = path[path.length-1];
      }
      if(!ref){
        path.push(t);
        items.push(t);
      }
      else{
        if(ref.children)
          ref.children.push(t);
        else
          ref.children = [t];
        path.push(t);
      }
    }
  }
  
  
  var cleanToc= function(t){
    for(var i=0;i<t.length;i++){
      t[i].name = t[i].content;
      delete t[i].content;
      delete t[i].seen;
      //delete t[i].lvl;
      delete t[i].i;
      if(t[i].children)
        t[i].children = cleanToc(t[i].children);
    }
    return t;
  }
  
  doc.toc = cleanToc(items);
  
  //set name based on first item in toc, use id as fallback
  doc.name = (doc.toc[0])? doc.toc[0].name : doc.id;
  
  //set package flag
  //doc.package = true;
  
  return doc;
  
};


var resolveValueType = function(str){

  //css preprocessor variables
  if(str.indexOf('$')===0) return 'sass';
  if(str.indexOf('@')===0) return 'less';
  
  //color formats
  if(str.indexOf('#')===0) return 'hex';
  if(str.indexOf('rgba')===0) return 'rgba';
  if(str.indexOf('rgb')===0) return 'rgb';
  if(str.indexOf('hlsa')===0) return 'hlsa';
  if(str.indexOf('hls')===0) return 'hls';
  if(str.indexOf('cmyk')===0) return 'cmyk';
  
  //number
  if(!isNaN(str)) return 'number';
  
  //what else...
  
  return 'string';
  
}

module.exports = DocletParser;