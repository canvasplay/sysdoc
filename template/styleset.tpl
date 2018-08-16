<div class="styl-doc styl-doc--styleset" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__header', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>

  
  <%
    var styles = _.filter(doc.children, function(d){ return d.type==='style' } );
    _.each(styles, function(style){
  %>
  
    <%
      var fsize = style.data['font-size'];
      var ffamily = style.data['font-family'];
      var flineHeight = style.data['line-height'];
      var fstyle = style.data['font-style'];
      var fweight = style.data['font-weight'];
      var selector = style.selector || 'div';
      var htmlTag = (selector.indexOf('.')>0)? selector.split('.')[0] : selector;
      var cssClass = (selector.substr(htmlTag.length).split('.').join(' ')).trim();
      var classAttr = (cssClass)? ' class="'+cssClass+'"' : '';
      var htmlCode = '<'+ htmlTag + classAttr +'>'+ style.name +'</'+ htmlTag +'>';
      
      var styleAttr = Object.keys(style.data).map(function(k){ return k+':'+style.data[k]+';'}).join('');
      
    %>
    <div style="<%= styleAttr %>"><%= style.name %></div>
    <div class="styl-doc__details">
      <%= ffamily %> - <%= fstyle %><br>
      <%= fweight %>, <%= fsize %>/<%= flineHeight %>
    </div>
    <br>
  <% }) %>

</div>