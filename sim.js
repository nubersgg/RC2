const svg = document.getElementById("canvas");
let gates = [];
let wires = [];
let draggingGate = null;
let offset = {x:0,y:0};
let draggingWire = null;

// Spawn a gate on canvas
function spawnGate(type) {
  const x = 100 + Math.random()*400;
  const y = 100 + Math.random()*200;
  const gate = createGate(x, y, type);
  gates.push(gate);
}

// Create a gate with input/output ports
function createGate(x, y, type) {
  const g = document.createElementNS(svg.namespaceURI,"g");
  g.setAttribute("transform",`translate(${x},${y})`);

  const body = document.createElementNS(svg.namespaceURI,"rect");
  body.setAttribute("width",80);
  body.setAttribute("height",40);
  body.setAttribute("class","gate");

  // input circle
  const input = document.createElementNS(svg.namespaceURI,"circle");
  input.setAttribute("cx",0);
  input.setAttribute("cy",20);
  input.setAttribute("r",6);
  input.setAttribute("class","port input off");

  // output square
  const output = document.createElementNS(svg.namespaceURI,"rect");
  output.setAttribute("x",74);
  output.setAttribute("y",14);
  output.setAttribute("width",12);
  output.setAttribute("height",12);
  output.setAttribute("class","port output off");

  g.appendChild(body);
  g.appendChild(input);
  g.appendChild(output);
  svg.appendChild(g);

  // Drag gate
  g.addEventListener("mousedown",(e)=>{
    if(e.target.classList.contains("port")) return; // ignore ports
    draggingGate = g;
    offset.x = e.offsetX;
    offset.y = e.offsetY;
  });

  // Start wire from output
  output.addEventListener("mousedown",(e)=>{
    e.stopPropagation();
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    draggingWire = document.createElementNS(svg.namespaceURI,"line");
    draggingWire.setAttribute("x1",p.x);
    draggingWire.setAttribute("y1",p.y);
    draggingWire.setAttribute("x2",p.x);
    draggingWire.setAttribute("y2",p.y);
    draggingWire.setAttribute("class","wire off");
    svg.appendChild(draggingWire);
  });

  return { g, input, output, type, x, y };
}

// Mouse move: drag gate or wire
svg.addEventListener("mousemove",(e)=>{
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

  if(draggingGate){
    draggingGate.setAttribute("transform",`translate(${svgPt.x-offset.x},${svgPt.y-offset.y})`);
  }
  if(draggingWire){
    draggingWire.setAttribute("x2",svgPt.x);
    draggingWire.setAttribute("y2",svgPt.y);
  }
});

// Mouse up: stop dragging
svg.addEventListener("mouseup",(e)=>{
  draggingGate = null;
  if(draggingWire){
    // Check if we ended on an input port
    const target = document.elementFromPoint(e.clientX,e.clientY);
    if(target && target.classList.contains("input")){
      // snap wire end to port
      const bbox = target.getBBox();
      draggingWire.setAttribute("x2",bbox.x+bbox.width/2);
      draggingWire.setAttribute("y2",bbox.y+bbox.height/2);
      wires.push(draggingWire);
    } else {
      // cancel wire
      svg.removeChild(draggingWire);
    }
    draggingWire = null;
  }
});
