<%
  if(doc.children && doc.children.length){
  _.each(doc.children, function(child){
%>
  <%= renderDoclet(child, false, depth || 2) %>
<% })} %>