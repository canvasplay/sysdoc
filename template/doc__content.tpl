<%
  if(doc.content){
    var content = (_.isArray(doc.content))? doc.content : [doc.content];
    _.each(content, function(c){
%>
  <div class="styl-doc__content" data-type="<%= c.type %>"><%= plugins.marked(c.value) %></div>
<% })} %>