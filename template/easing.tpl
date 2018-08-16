<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">
  
  <%= render('doc__header', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  <%= render('doc__content', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>
  <%= render('doc__downloads', {doc:doc}) %>
  <%= render('doc__children', {doc:doc, depth: (depth)? depth+1 : 2 }) %>
  
  <%
    var timingFn = doc.value.fn;
    var regExp = /\(([^)]+)\)/;
    var values = regExp.exec(timingFn)[1].split(',');
    var c = _.map(values,(v)=>{return parseFloat(v)});
    var c2 = _.map(values,(v)=>{return parseFloat(v)});
    //flip y
    c[1] = 1-c[1];
    c[3] = 1-c[3];
    var d = 'M0,1 C'+c[0]+','+c[1]+' '+c[2]+','+c[3]+' 1,0';
    var d2 = 'M0,1 C'+c[0]+','+c[1]+' '+c[2]+','+c[3]+' 1,0 M1,0 C'+c[2]+','+c[3]+' '+c[0]+','+c[1]+' 0,1';
  %>
  
  <div class="styl-doc__example">
    <svg viewBox="-.1 -.1 1.2 1.2" version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: block; width:200px;height:200px;">
      <path d="M0,1 L1,0" style="stroke-width: .01px; stroke: #dddddd; fill: none;"/>
      <path d="M0,1 L<%= c[0]+','+c[1] %>" style="stroke-width: .01px; stroke: #cccccc; fill: none;"/>
      <path d="M1,0 L<%= c[2]+','+c[3] %>" style="stroke-width: .01px; stroke: #cccccc; fill: none;"/>
      <circle cx="<%= c[0] %>" cy="<%= c[1] %>" r=".02" style="stroke-width: .01px; stroke: #cccccc; fill: white;" />
      <circle cx="<%= c[2] %>" cy="<%= c[3] %>" r=".02" style="stroke-width: .01px; stroke: #cccccc; fill: white;" />
      <path d="<%= d %>" style="stroke-width: .015px; stroke: #1b99ec; fill: none;" id="curve_<%= utils.getDocPathName(doc) %>" />
      
      <!--
      <circle r=".02" fill="red">
        <animateMotion dur="2s" repeatCount="indefinite">
           <mpath xlink:href="#curve_<%= utils.getDocPathName(doc) %>"/>
        </animateMotion>
      </circle>
      -->
      <!--
      <rect style="fill:#000;" width=".02" height=".02" x="0.5" y="0">
        <animateTransform attributeName="transform"
        begin="0s" dur="2s" type="translate" from=".5 1" to=".5 0" repeatCount="indefinite" fill="freeze"
        calcMode="spline"
        values=".5 1;.5 0;"
        keySplines="<%= c2.join(', ') %>" />
      </rect>
      -->
      
    </svg>
    <div class="styl-doc__details"><%= timingFn %></div>
  </div>

</div>