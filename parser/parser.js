var utils = require("./utils");
var mdtoc = require("markdown-toc");

var parseComments = require("comment-parser/parser.js");
var parseCommentsOptions = {
  dotted_names: false,
};

let ACCESS = {
  ALL: "all",
  PUBLIC: "public",
  PRIVATE: "private",
};

// these key properties are used internally by the parser,
// flaging them as reserved tags we prevent data overwriting
var reservedTags = [
  "id",
  "index",
  "link",
  "children",
  "file",
  "line",
  "source",
  "metadata",
];

/*
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
  'src',
  'sysdoc'
];
*/

var reservedNames = ["index", "global"];

var DocletParser = function (opts) {
  this.options = opts;

  return this;
};

DocletParser.prototype.parse = function (str, isRoot) {
  //raw parse comments in str using comment-parser
  var comments = parseComments(str, parseCommentsOptions);

  //process comments
  var doclets = this.processComments(comments, null);

  if (isRoot) doclets = this.postProcessComments(doclets);

  //return processed comments
  return doclets;
};

DocletParser.prototype.parseFile = function (url, isRoot) {
  //read file contents sync
  var contents = utils.readFile(url);

  //raw parse comments in file using comment-parser
  var comments = parseComments(contents, parseCommentsOptions);

  //process comments
  var doclets = this.processComments(comments, url);

  if (isRoot) {
    doclets = this.postProcessComments(doclets);
  }

  //return processed comments
  return doclets;
};

DocletParser.prototype.parseFiles = function (files) {
  var doclets = [];

  for (var i = 0; i < files.length; i++) {
    //read file contents sync
    var docs = this.parseFile(files[i]);

    //add comments to collection
    doclets = doclets.concat(docs);
  }

  doclets = this.postProcessComments(doclets);

  //return processed comments
  return doclets;
};

DocletParser.prototype.processComments = function (comments, url) {
  //declare resulting doclets collection
  var doclets = [];

  //process parsed comment objects
  for (var i = 0; i < comments.length; i++) {
    var c = comments[i];

    //add original file url for reference
    if (url) c.file = url;

    //process comment
    var doc = this.processDoclet(c);

    //force result to an array
    var docs = !doc ? [] : Array.isArray(doc) ? doc : [doc];

    //assign ids and indexes
    for (var n = 0; n < docs.length; n++) {
      var d = docs[n];

      //set id based on name or generate a generic "unique" one
      d.id = d.name
        ? utils.slugify(d.name)
        : Math.floor(Math.random() * Math.pow(10, 15));

      //set index based on its position in collection
      d.metadata.index = doclets.length + n;
    }

    //add them to collection
    doclets = doclets.concat(docs);
  }

  //return resulting doclets
  return doclets;
};

DocletParser.prototype.postProcessComments = function (doclets) {
  //resolve doclets hierarchy
  doclets = this.resolveDocletHierachy(doclets);

  //filter by access type
  doclets = this.filterByAccessType(doclets);

  //return resulting doclets
  return doclets;
};

DocletParser.prototype.processDoclet = function (doc) {
  //create doclet's base object
  var o = {
    description: doc.description,
    metadata: {
      source: doc.source,
      file: doc.file,
      line: doc.line,
    },
  };

  //no tags? generic type and done!
  if (!doc.tags.length) {
    o.type = "doc";
    return o;
  }

  //process tags one by one
  while (o && doc.tags && doc.tags.length) {
    //shift the first tag
    var t = doc.tags.shift();

    //force lowercase tags
    t.tag = (t.tag + "").toLowerCase();

    //ignore reserved tags
    if (reservedTags.indexOf(t.tag) >= 0) {
    } else {
      var autotyping = false;

      // already untyped?
      if (!o.type) {
        // Try auto-typing...
        if (reservedTypes.indexOf(t.tag) === -1) {
          o.type = t.tag;
          autotyping = true;
        }
        // use generic type
        else {
          o.type = "doc";
        }
      }

      //custom processing when autotyping
      if (autotyping) o = TagProcessors.name(this, t, o);
      //process the tag
      else o = (TagProcessors[t.tag] || TagProcessors._)(this, t, o);
    }
  }

  //process ignore bool flag
  if (o && o.ignore && !o.sysdoc) o = null;

  return o ? (DocProcessors[o.type] || DocProcessors._)(this, o) : o;
};

DocletParser.prototype.resolveDocletHierachy = function (doclets) {
  //parent ref
  var ref;

  //url file ref
  var file;

  //resolve all doclets' parent property iterative
  for (var i = 0; i < doclets.length; i++) {
    var doc = doclets[i];

    //explicit parent definition?
    var explicitParent = doc.parent ? true : false;

    //check for new file
    var newFile =
      doc.metadata.file && doc.metadata.file !== file ? true : false;

    //resolve parent doclet
    var parent = explicitParent
      ? utils.getDocletParent(doc, doclets) || ""
      : newFile
      ? ""
      : ref;

    //set parent
    doc.parent = !parent ? "" : utils.getDocPathName(parent);

    //if parent was resolved by explicit definition use this doc as new parent ref
    if (explicitParent) ref = doc;
    else if (newFile) ref = null;

    //save file for reference
    file = doc.metadata.file;
  }

  return doclets;
};

DocletParser.prototype.filterByAccessType = function (doclets) {
  var type = this.options.accessType || ACCESS.ALL;

  if (type === ACCESS.ALL) return doclets;

  var result = [];

  for (var i = 0; i < doclets.length; i++) {
    var doc = doclets[i];

    if (!doc.access || doc.access === type) {
      if (doc.children && doc.children.length) {
        doc.children = this.filterByAccessType(doc.children);
      }
      result.push(doc);
    }
  }

  return result;
};

/**
 * @section Tag Processors
 * @parent global
 */

var TagProcessors = {};

// ARRAY FRIENDLY?
// p.e. @example, @data, ...
// convert processed tag value into array if defined multiple times
// currently all non-custom tags are array friendly as default...

var processTagValueAsArrayFriendly = function (o, value, key) {
  if (!o[key]) o[key] = value;
  else if (!Array.isArray(o[key])) o[key] = [o[key], value];
  else o[key].push(value);
  return o;
};

// BOOL FLAG?
// p.e. @nofollow, @base, ...
// If the tag is defined just set define a property with that name and true as value

var BoolFlagTagProcessor = function (parser, tag, o) {
  o[tag.tag] = true;
  return o;
};

TagProcessors._ = function (parser, tag, o) {
  //pick default tag data
  var value = {
    type: tag.type,
    name: tag.name,
    description: tag.description,
  };

  if (tag.default) value.default = tag.default;
  if (tag.optional) value.optional = tag.optional;

  return processTagValueAsArrayFriendly(o, value, tag.tag);
};

/**
 * Bool flag used to force comment parser to ignore this doclet.
 * @name @ignore
 */
TagProcessors.ignore = BoolFlagTagProcessor;

/**
 * Defines the access scope of this doclet.
 * Posible values are `all`, `public`, `private`.
 * @name @access
 */
/**
 * Example using access
 * @access public
 * @sysdoc {data}
 */
TagProcessors.access = function (parser, tag, o) {
  o.access = tag.name.trim();
  return o;
};

/**
 * Bool flag used to define the doclet as async.
 * @name @async
 */
TagProcessors.async = BoolFlagTagProcessor;

/**
 * Bool flag used to define the doclet as readonly.
 * @name @readonly
 */
TagProcessors.readonly = BoolFlagTagProcessor;

/**
 * Bool flag used to define the doclet as private.
 * @name @private
 */
TagProcessors.private = BoolFlagTagProcessor;

/**
 * Used to document a doclet itself. Used by sysdoc docs.
 * @name @sysdoc
 */
/**
 * Example using sysdoc
 * @sysdoc {comment} type, description, sysdoc
 */
TagProcessors.sysdoc = function (parser, tag, o) {
  var options = (tag.name + " " + tag.description).split(",");
  var whitelist = [];
  var blacklist = [];
  for (var i = 0; i < options.length; i++) {
    var opt = options[i].trim();
    if (opt) {
      if (opt.indexOf("!") === 0) blacklist.push(opt.substr(1));
      else whitelist.push(opt);
    }
  }
  o.sysdoc = {
    type: tag.type,
    whitelist: whitelist,
    blacklist: blacklist,
  };
  return o;
};

/**
 * Serves to define a package.
 * @name @package
 */
/**
 * Example using package.
 * @package
 * @sysdoc {data} type, description, package
 */
TagProcessors.package = function (parser, tag, o) {
  if (parser.options.ignorePackage) return o;
  else return BoolFlagTagProcessor(parser, tag, o);
};

/**
 * Boolflag to stop the comment parser from following child doclets.
 * @name @nofollow
 */
/**
 * Example using nofollow.
 * @nofollow
 * @sysdoc {data} type, description, nofollow
 */
TagProcessors.nofollow = BoolFlagTagProcessor;

/**
 * Flags this doclet as base for other doclets.
 * This does not apply any additional functionality or behaviour.
 * It's up to up to give it a use.
 * @name @base
 */
/**
 * Example using base.
 * @base
 * @sysdoc {data} type, description, base
 */
TagProcessors.base = BoolFlagTagProcessor;

/**
 * Defines the parent doclet.
 * @name @parent
 */
TagProcessors.parent = function (parser, tag, o) {
  o.parent = utils.slugify(tag.name + " " + tag.description);
  return o;
};

/**
 * Defines the doclet type. Can be anything except a reserved tag.
 * @name @type
 */
/**
 * Example using @type
 * @type hello
 * @sysdoc {data}
 */
TagProcessors.type = function (parser, tag, o) {
  if (reservedTypes.indexOf(tag.name) >= 0)
    throw new Error(
      'Invalid Type: "@type ' +
        tag.name +
        '" in ' +
        o.metadata.file +
        ":" +
        o.metadata.line
    );
  o.type = tag.name;
  return o;
};

/**
 * Defines the doclet's name.
 * @name @name
 */
TagProcessors.name = function (parser, tag, o) {
  var name = (tag.name + " " + tag.description).trim();
  if (reservedNames.indexOf(utils.slugify(name)) >= 0)
    throw new Error(
      "Invalid Name: @name " +
        name +
        '" in ' +
        o.metadata.file +
        ":" +
        o.metadata.line
    );
  o.name = name;
  return o;
};

/**
 * Defines the doclet's description.
 * @name @description
 */
TagProcessors.description = function (parser, tag, o) {
  o.description = (
    "" +
    o.description +
    " " +
    tag.name +
    " " +
    tag.description
  ).trim();
  return o;
};

/**
 * Defines the css selector matching the documented chunk.
 * @name @selector
 */
/**
 * Some css module
 * @selector .my-element
 * @sysdoc {data}
 */
TagProcessors.selector = function (parser, tag, o) {
  o.selector = (tag.name + tag.description).trim();
  return o;
};

/**
 * Defines additional data groupped by keys.
 * @name @data
 */
/**
 * This is the main font used in the site
 * @data {family} Roboto, Helvetica Neue, Arial, sans-serif
 * @data {weight} 200, 400, 600, 800
 * @data {style} normal
 * @data {style} italic
 * @data {test} tost
 * @sysdoc {data} type, description, data
 */
TagProcessors.data = function (parser, tag, o) {
  var key = tag.type;
  if (!key) return o;

  var value = (tag.name + tag.description).trim();
  if (value.indexOf(",") >= 0)
    value = value.split(",").map((t) => {
      return t.trim();
    });

  if (!o.data) o.data = {};

  if (!o.data[key]) o.data[key] = value;
  else {
    var v1 = Array.isArray(o.data[key]) ? o.data[key] : [o.data[key]];
    var v2 = Array.isArray(value) ? value : [value];
    o.data[key] = v1.concat(v2);
  }

  return o;
};

/**
 * Defines the typed value for the documented chunk. Value is stored in multiple formats.
 * Only one value per type si allowed. Value type can be defined or auto-resolved based on the given value.
 * The following types are detected automatically:
 * `sass`, `less`, `hex`, `rgba`, `rgb`, `hlsa`, `hls`, `cmyk`, `number` & `string`
 * @name @value
 */
/**
 * Example using the @value tag
 * @value {ms} 150ms
 * @value 150
 * @value $duration-fast
 * @sysdoc {data} type, description, value
 */
TagProcessors.value = function (parser, tag, o) {
  //get value
  var value = (tag.name + tag.description).trim();

  //get type
  var type = tag.type || resolveValueType(value);

  //ignore tag if type was not resolved
  if (!type) return o;

  //initialize value object if required
  if (!o.value) o.value = {};

  //write value by type, overwrite if exsisting
  o.value[type] = value;

  return o;
};

var resolveValueType = function (str) {
  //css preprocessor variables
  if (str.indexOf("$") === 0) return "sass";
  if (str.indexOf("@") === 0) return "less";

  //color formats
  if (str.indexOf("#") === 0) return "hex";
  if (str.indexOf("rgba") === 0) return "rgba";
  if (str.indexOf("rgb") === 0) return "rgb";
  if (str.indexOf("hlsa") === 0) return "hlsa";
  if (str.indexOf("hls") === 0) return "hls";
  if (str.indexOf("cmyk") === 0) return "cmyk";

  //number
  if (!isNaN(str)) return "number";

  //what else...
  return "string";
};

/**
 * Defines additional content for this doclet.
 * @name @content
 */
TagProcessors.content = function (parser, tag, o) {
  var content;

  //check for target url as name
  var isUrl = utils.isUrl(tag.description || tag.name);

  if (isUrl) {
    //resolve target file url
    var url = utils.resolveUrl(
      tag.description || tag.name,
      o.metadata.file,
      parser.options
    );

    //get file contents
    var contents = utils.readFile(url);

    var type = (url + "").split(".").pop();

    content = {
      type: (url + "").split(".").pop() || tag.type || "md",
      value: contents,
    };
  } else {
    content = {
      type: tag.type || "md",
      value: (tag.name + " " + tag.description).trim(),
    };
  }

  return processTagValueAsArrayFriendly(o, content, tag.tag);
};

/**
 * Defines an example for the decumented chunk.
 * @name @example
 */
/**
 * Example using the @example tag
 * @example
 * var x = 0;
 * console.log(x);
 * ----
 * This is the code
 * @sysdoc {data} type, description, example
 */
/**
 * Example using the @example tag
 * @example
 * <div class="my-module">
 *  <span class="my-module__content">Some content</span>
 * </div>
 * @sysdoc {data} type, description, example
 */
TagProcessors.example = function (parser, tag, o) {
  //check for target url as name
  if (utils.isUrl(tag.name)) {
    //resolve target file url
    var url = utils.resolveUrl(tag.name, o.metadata.file, parser.options);

    //get file contents
    var contents = utils.readFile(url);

    //clear tag's name
    tag.name = "";

    //set new content
    tag.description = contents;
  }

  var example = {};

  example.type = tag.type || getTypeByFilename(o.metadata.file) || "html";
  //example.name = tag.name;

  var codeDelimiter = "----";

  var str = (tag.name + " " + tag.description).trim();
  var hasCodeDelimiter = str.indexOf(codeDelimiter) >= 0;

  if (hasCodeDelimiter) {
    var parts = str.split(codeDelimiter);

    example.content = ("" + parts[0]).trim();
    example.code = ("" + parts[1]).trim();
  } else {
    example.content = str;
    example.code = example.content;
  }

  return processTagValueAsArrayFriendly(o, example, tag.tag);
};

var getTypeByFilename = function (filename) {
  return filename.split(".").pop();
};

/**
 * Defines a collection of string tags for the documented code chunk.
 * @name @tags
 */
/**
 * Example using tags
 * @tags foo, bar
 * @tags foo, baz
 * @sysdoc {data} type, description, tags
 */
TagProcessors.tags = function (parser, tag, o) {
  let tags = (tag.name + " " + tag.description).split(",").map((t) => t.trim());
  o[tag.tag] = [...(o[tag.tag] || []), ...tags];
  return o;
};

/**
 * Defines a single or collection of url sources.
 * @name @src
 */
/**
 * Example using src
 * @src https://mysite.com/path/to/file.svg
 * @src {svg} https://mysite.com/path/to/4632575389
 * @sysdoc {data} type, description, src
 */
TagProcessors.src = function (parser, tag, o) {
  var url = (tag.name + tag.description).trim();
  var value = utils.resolveUrl(url, o.metadata.file, parser.options);
  var type = tag.type || (value + "").split(".").pop() || undefined;
  var src = {
    value: value,
    type: type,
  };
  return processTagValueAsArrayFriendly(o, src, tag.tag);
};

/**
 * Defines the parent doclet
 * @name @follow
 */
TagProcessors.follow = function (parser, tag, o) {
  o.follow = parseInt(tag.name);
  return o;
};

//define a calculated list of reserved types based on exsisting tag processors
var reservedTypes = Object.keys(TagProcessors);

/**
 * Especial doclet types.
 * @section Doclet Processors
 * @parent global
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

DocProcessors._ = function (parser, doc) {
  return doc;
};

/**
 * Used to define a section
 * @name @section
 */
DocProcessors.section = function (parser, doc) {
  doc.parent = doc.parent || "global";
  return doc;
};

/**
 * Used to define a module
 * @name @module
 */
DocProcessors.module = DocProcessors.section;

/**
 * Include any file by url in the comment parsing process.
 * Define the file using an string url resource.
 * @name @include
 * @example
 */
DocProcessors.include = function (parser, doc) {
  //do not process if flagged as sysdoc
  if (doc.sysdoc) return doc;

  //get include target url based on doc's name
  var url = utils.resolveUrl(doc.name, doc.metadata.file, parser.options);

  //return processed doclets in url
  return parser.parseFile(url);
};

/**
 * @name @md
 */

DocProcessors.md = function (parser, doc) {
  //get include target url based on doc's name
  var url = utils.resolveUrl(doc.name, doc.metadata.file, parser.options);

  //get file contents
  doc.content = utils.readFile(url);

  //generate table of contents
  var toc = mdtoc(doc.content).json;

  var path = [];
  var items = [];

  for (var i = 0; i < toc.length; i++) {
    var t = toc[i];
    var ref = path[path.length - 1];
    if (!ref) {
      path.push(t);
      items.push(t);
    } else {
      while (ref && t.lvl <= ref.lvl) {
        path.pop();
        ref = path[path.length - 1];
      }
      if (!ref) {
        path.push(t);
        items.push(t);
      } else {
        if (ref.children) ref.children.push(t);
        else ref.children = [t];
        path.push(t);
      }
    }
  }

  var cleanToc = function (t) {
    for (var i = 0; i < t.length; i++) {
      var o = {
        name: t[i].content,
        slug: t[i].slug,
        lvl: t[i].lvl,
      };
      if (t[i].children) {
        o.children = cleanToc(t[i].children);
      }
      t[i] = o;
    }
    return t;
  };

  doc.toc = cleanToc(items);

  //set name based on first item in toc, use id as fallback
  doc.name = doc.toc[0] ? doc.toc[0].name : doc.id;

  //set package flag
  //doc.package = true;

  return doc;
};

module.exports = DocletParser;
