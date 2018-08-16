<div class="styl-doc styl-doc--style" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__pathname', {doc:doc}) %>
  
  <%= render('doc__description', {doc:doc}) %>

  <%
    var fsize = doc.data['font-size'];
    var ffamily = doc.data['font-family'];
    var flineHeight = doc.data['line-height'];
    var fstyle = doc.data['font-style'];
    var fweight = doc.data['font-weight'];
    var selector = doc.selector || 'div';
    var htmlTag = (selector.indexOf('.')>0)? selector.split('.')[0] : selector;
    var cssClass = (selector.substr(htmlTag.length).split('.').join(' ')).trim();
    var classAttr = (cssClass)? ' class="'+cssClass+'"' : '';
    var htmlCode = '<'+ htmlTag + classAttr +'>'+ doc.name +'</'+ htmlTag +'>';
    
    var style = Object.keys(doc.data).map(function(k){ return k+':'+doc.data[k]+';'}).join('');
    
  %>
  <div class="styl-doc__example clearfix">
    <div style="<%= style %>"><%= doc.name %></div>
    <div class="styl-doc__details">
      <%= ffamily %> - <%= fstyle %><br>
      <%= fweight %>, <%= fsize %>/<%= flineHeight %>
    </div>
  </div>
  <pre class="styl-doc__code"><code><%- htmlCode %></code></pre>


</div>