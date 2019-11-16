
/*
tob be used by CLI...
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
*/
var _ = require('lodash');

var Parser = require('./parser/parser');
var utils = require('./parser/utils');

//plugins to be used by templates
var plugins = {
  marked: require('marked'),
  beautify: require('js-beautify')
};


/////////////////////////////////////////////////////////////////////////////////////
//	CONFIG LOADING
var CONFIG = {};

var LOAD_CONFIG = function(){
  
  var data = utils.readFile('system-docs.json');
  console.log(typeof(data));
  CONFIG = JSON.parse(data);
  //console.log(CONFIG);
  RUN();
  
};


/////////////////////////////////////////////////////////////////////////////////////
//	TEMPLATES LOADING + RENDERING

var TEMPLATES = {};

var LOAD_TEMPLATES = function(callback){
  
  return Promise.all([
    
    utils.readFileGlobs(SETTINGS.templates, function(data, file) {
      
      var template;
      //compile template
      try{
        template = _.template(data);
        console.log(file);
      }
      catch(e){
        throw new Error('Error processing template "'+file+'": '+e);
      }
      
      //create id based on filename w/o extension
      var id = file.split('/').pop().slice(0, -4);
      
      //add it to collection
      TEMPLATES[id] = template;
      
    })
    
  ]).then(function(){ RUN() })
  .catch(function(err){ throw err });

};


var getCtxData = function(data){
  var base = {
    render: render,
    renderDoclet: renderDoclet,
    config: SETTINGS,
    plugins: plugins,
    utils: utils
  };
  return Object.assign(data || {}, base);
};

var render = function(tplId, data){
  try{
    return TEMPLATES[tplId](getCtxData(data));
  }
  catch(e){
    throw new Error('Error rendering template: '+tplId+ ' -> '+e );
  }
};

var resolveDocTemplate = function(doc){
  return TEMPLATES[doc.type+'--'+doc.id] || TEMPLATES[doc.type] || TEMPLATES['doc'];
};
var renderDoclet = function(doc, force, depth){
  
  if(!doc || !doc.type)
    throw new Error('invalid doclet!');
  
  //do not render doclets with the @package flag except its a sysdoc
  if(doc.package && !force && !doc.sysdoc)
    return '';
    
  var tpl = resolveDocTemplate(doc);
  var result;
  
  try{
    result = tpl(getCtxData({
      doc: doc,
      depth: depth || 1
    }));
  }
  catch(e){
    throw new Error('Error rendering template: '+doc.type+':'+doc.name+ ' -> '+e );
  }
  
  //additional treatment if @sysdoc
  if(doc.sysdoc){
    var source = generateSysDocSource(doc);
    if(doc.sysdoc.type==='data'){
      var json = plugins.beautify.js(JSON.stringify(generateSysDocObject(doc)));
      result = TEMPLATES['sysdoc']({ source: source, json: json });
    }
    else if(doc.sysdoc.type==='comment'){
      result = TEMPLATES['sysdoc']({source:source});
    }
    else{
      result = '<div class="styl-doc__example">'+result+'</div>' + TEMPLATES['sysdoc']({source:source});
    }
  }
  
  return result;

};

// WARNING: does not work properly
// Any tag after a blacklisted tag also gets ignored...
var generateSysDocSource = function(doc){

  var whitelist = doc.sysdoc.whitelist;
  var blacklist = doc.sysdoc.blacklist;
  
  blacklist.push('sysdoc');
  
  var shouldIgnoreLine = function(str){
    
    var ignore = -1, i, z, len;
    
    if(str.indexOf('@')!==0) return ignore;
    
    if(whitelist.length){
      i = 1; z = 0; len = whitelist.length;
      while(i && z<len){
        if(str.indexOf('@'+whitelist[z])===0)
          i = 0;
        z++;
      }
      ignore = i;
    }else if(blacklist.length){
      i = 0; z = 0; len = blacklist.length;
      while(!i && z<len){
        if(str.indexOf('@'+blacklist[z])===0)
          i = 1;
        z++;
      }
      if(i===1) ignore = i;
    }
    
    return ignore;
  };
  
  var cleanSource = function(src){
    var result = '/**\n';
    var parts = src.split('\n');
    var ignore = false;
    for(var i=0; i<parts.length;i++){
      var shouldIgnore = shouldIgnoreLine(parts[i]);
      ignore = (shouldIgnore===0)? false : (shouldIgnore===1)? true : ignore;
      if(!ignore){
        result+= ' * '+ parts[i] +'\n';
      }
    }
    return result + ' */';
  };
  
  var source = cleanSource(doc.metadata.source) || '';

  _.each(doc.children, function(child){
    source+= '\n\n'+ cleanSource(child.metadata.source);
  });
  
  return source;

};

var generateSysDocObject = function(doc){

  var whitelist = doc.sysdoc.whitelist;
  var blacklist = doc.sysdoc.blacklist;
  
  blacklist.push('sysdoc');
  
  var obj = JSON.parse(JSON.stringify(doc));
  
  var shouldIgnoreProperty = function(str){
    
    var ignore = false, z, len;
    
    if(whitelist.length){
      ignore = true, z = 0; len = whitelist.length;
      while(ignore && z<len){
        if(str===whitelist[z]) ignore = false;
        z++;
      }
    }
    else if(blacklist.length){
      z = 0, len = blacklist.length;
      while(!ignore && z<len){
        if(str===blacklist[z]) ignore = true;
        z++;
      }
    }
    
    return ignore;
  };
  
  var clean = function(obj){
    var keys = Object.keys(obj);
    for(var i=0;i<keys.length;i++){
      var shouldIgnore = shouldIgnoreProperty(keys[i]);
      if(shouldIgnore)
        delete obj[keys[i]];
    }
    if(obj.children){
      var childs = obj.children;
      obj.children = [];
      for(var c=0;c<childs.length;c++){
        obj.children.push(clean(childs[c]));
      }
    }
    return obj;
  };
  
  return clean(obj);

};


/////////////////////////////////////////////////////////////////////////////////////
//	COMMENTS PARSING

var COMMENTS = [];

var PARSE_FILES = function(){
  
  //instance a new parser using the given settings
  var parser = new Parser(SETTINGS);
  
  //find all files to be parsed
  var files = utils.getGlobFiles(SETTINGS.files);

  //do the parsing!
  COMMENTS = parser.parseFiles(files);
  
  RUN();

};

/////////////////////////////////////////////////////////////////////////////////////
//	GENERATE EXAMPLES

var GENERATE_EXAMPLES = function(){

  var docsHavingHtmlExamples = _.filter(COMMENTS, function(d){
    return (d.example && d.example.type === 'html' && !d.sysdoc);
  });
  for(var i=0; i< docsHavingHtmlExamples.length; i++){
    var doc = docsHavingHtmlExamples[i];
    utils.writeFile(SETTINGS.outputPath + 'examples/'+utils.getDocPathName(doc)+'.html', TEMPLATES['index-example'](getCtxData({
      content: doc.example.content
    })));
  }
  
  RUN();
};


/////////////////////////////////////////////////////////////////////////////////////
//	GENERATE SOURCE FILES

var GENERATE_SOURCE_FILES = function(){

  var files = _.map(COMMENTS, function(d){
    return d.metadata.file;
  });

  files = files.filter(function(value, index, self){
    return self.indexOf(value) === index;
  });
  
  for(var i=0; i< files.length; i++){
    var source = utils.readFile(files[i]);
    utils.writeFile(SETTINGS.outputPath + 'sources/'+utils.urlify(files[i])+'.html', TEMPLATES['index-source'](getCtxData({
      source: source
    })));
  }
  
  RUN();
};

/////////////////////////////////////////////////////////////////////////////////////
//	HIERACHICAL COMMENTS TREE

var COMMENTS_TREE = [];

var BUILD_COMMENTS_TREE = function(){

  COMMENTS_TREE = buildDocTree(COMMENTS,'');
  utils.writeFile(SETTINGS.outputPath + 'data2.json', JSON.stringify(COMMENTS_TREE));
  
  RUN();
};

var buildDocTree = function(data, ns){
  var result = [];
  var matching = data.filter((d)=>{ return d.parent === ns });
  for(var i=0; i<matching.length;i++){
    var o = _.cloneDeep(matching[i]);
    var children = buildDocTree(data, utils.getDocPathName(o));
    if(children.length)
      o.children = children;
    result.push(o);
  }
  return result;
}



/////////////////////////////////////////////////////////////////////////////////////
//	RESOLVE DOCLET LINKS

var RESOLVE_LINKS = function(){
  
  for(var i=0; i<COMMENTS_TREE.length; i++){
    resolveDocLinkRecursive(COMMENTS_TREE[i],'index.html');
  }

  RUN();
}

var resolveDocLinkRecursive = function(doc,file){
  
  var pathname = utils.getDocPathName(doc);
  
  if(doc.package){
    file = pathname +'.html';
    //adding an empty hash prevents re-loading the current page
    //just acts as go to top link and we save a server request ;)
    doc.metadata.link = file+'#';
  }
  else{
    doc.metadata.link = file+'#'+pathname;
  }
  
  if(!doc.children)
    return;
    
  for(var i=0; i<doc.children.length; i++){
    resolveDocLinkRecursive(doc.children[i], file);
  }
  
}

/////////////////////////////////////////////////////////////////////////////////////
//	COPY THEME FILES

var COPY_THEME_FILES = function(){
  
  var themePath = SETTINGS.theme;
  var files = [];
  
  //get stylesheets
  files = files.concat(utils.getGlobFiles(themePath+'/**/*.css'));
  
  //get scripts
  files = files.concat(utils.getGlobFiles(themePath+'/**/*.js'));
  
  //copy all found files
  for(var i=0; i< files.length; i++){
    var src = files[i];
    var target = SETTINGS.outputPath + src.substr(themePath.length);
    utils.copyFile(src, target);
  }
  
  
  RUN();
}

/////////////////////////////////////////////////////////////////////////////////////
//	GENERATE HTML DOCS

var GENERATE = function(){
  
  GENERATE_RECURSIVE({
    'id': 'index',
    'type': 'global',
    'parent': '',
    'package': true,
    'name': SETTINGS.title,
    'description': SETTINGS.description || '',
    'content': {
      type: 'md',
      value: (SETTINGS.readme)? utils.readFile(SETTINGS.readme) : ''
    },
    'children': COMMENTS_TREE
  });
  
  RUN();
  
}

var GENERATE_RECURSIVE = function(doc){
  
  if(doc.package && !doc.sysdoc){
    var pathname = utils.getDocPathName(doc);
    utils.writeFile(SETTINGS.outputPath + pathname + '.html', render('index',{
      sections: COMMENTS_TREE,
      doc: doc
    }));
  }
  if(!doc.children) return;
  for(var i=0; i<doc.children.length; i++){
    GENERATE_RECURSIVE(doc.children[i]);
  }

}


var COMPLETE = function(){
  console.log('complete!');
}


/////////////////////////////////////////////////////////////////////////////////////
//	TASK RUNNING

var RUN = function(){
  if(!TASK_QUEUE[0]) return;
  try{ return TASK_QUEUE.shift()() }
  catch(e){ throw(e) }
}

var TASK_QUEUE = [
  //LOAD_CONFIG,
  LOAD_TEMPLATES,
  //PARSE_COMMENTS,
  PARSE_FILES,
  GENERATE_EXAMPLES,
  GENERATE_SOURCE_FILES,
  BUILD_COMMENTS_TREE,
  RESOLVE_LINKS,
  GENERATE,
  COPY_THEME_FILES,
  COMPLETE
];


/////////////////////////////////////////////////////////////////////////////////////
//	SETTINGS

var SETTINGS = {
  files: [
    'fixtures/index.scss'
  ],
  outputPath: 'docs/',
  templates: [
    'template/**/*.tpl',
    'custom/templates/**/*.tpl'
  ],
  title: 'System Docs',
  description: 'Design System Documentation Generator',
  readme: 'fixtures/readme.md',
  rootPath: '',
  customPaths: {
    'test': 'testing/custom/path/',
    'examples': 'test/examples2/'
  },
  version: '1.0.0',
  ignorePackage: false,
  css: [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '../template/styles/styles.css'
  ],
  js: []
  
};


/////////////////////////////////////////////////////////////////////////////////////
//	INIT

//RUN();

module.exports.publish = function(opts) {
  SETTINGS = opts;
  RUN();
}
