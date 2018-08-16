<div class="styl-doc styl-doc--font" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__header',{ doc: doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>

  <%
    var family = doc.data.family;
    var styles = (doc.data.style)? (_.isArray(doc.data.style))? doc.data.style : [doc.data.style] : [];
    var weights = (doc.data.weight)? (_.isArray(doc.data.weight))? doc.data.weight : [doc.data.weight] : [];
  %>
  
  <p><code>font-family: <%= family %>;</code></p>
  <% for(var i=0; i<styles.length; i++){ %>
    <div>
    <% for(var ii=0; ii<weights.length; ii++){ %>
      
      <div
        class="styl-doc__example styl-doc__example--sample"
      >
        <div style="font-family: <%= family %>; font-style: <%= styles[i] %>; font-weight: <%= weights[ii] %>; font-size: 4rem;">Aa</div>
        <div class="styl-doc__details">
          <%= styles[i] %><br>
          <%= weights[ii] %>
        </div>
      </div>
      
    <% } %>
    </div>
    <br>
  <% } %>

</div>