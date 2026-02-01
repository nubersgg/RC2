const svg = document.getElementById("canvas");
let gates = [];
let wires = [];
let draggingGate = null;
let offset = {x:0,y:0};
let cableStart = null;

// Spawn a gate on canvas
function spawnGate(type) {
  const x = 100 + Math.random()*400;
  const y = 100 + Math.random()*200;
  const gate = createGate(x, y, type);
  gates.push(gate);
}

// Create a gate
function createGate(x, y, type) {
  const g = document.createElementNS(svg.namespaceURI,"g");
  g.setAttribute("transform",`translate(${x},${y})`);

  const body = document.createElementNS(svg.namespaceURI,"rect");
  body.setAttribute("width",80);
  body.setAttribute("height",40);
  body.setAttribute("class","gate");

  const input = document.createElementNS(svg.namespaceURI,"circle");
  input.setAttribute("cx",0);
  input.setAttribute("cy",20);
  input.setAttribute("r",6);
  input.setAttribute("class","port input off");

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

  // Drag logic
  g.addEventListener("mousedown",(e)=>{
    if(e.target.classList.contains("port")) return; // ignore ports
    draggingGate = g;
    offset.x = e.offsetX;
    offset.y = e.offsetY;
  });

  return { g, input, output, type };
}

// Canvas mouse move for dragging gates or cables
svg.addEventListener("mousemove",(e)=>{
  if(draggingGate){
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    draggingGate.setAttribute("transform",`translate(${svgPt.x-offset.x},${svgPt.y-offset.y})`);
  }
  if(cableStart){
    cableStart.setAttribute("x2", e.clientX);
    cableStart.setAttribute("y2", e.clientY);
  }
});

svg.addEventListener("mouseup",()=>{ draggingGate=null; });

// Example blinking gate
const blinkGate = createGate(600,150,'BLINK');
let blinkState=false;
setInterval(()=>{
  blinkState=!blinkState;
  blinkGate.output.classList.toggle("on",blinkState);
  blinkGate.output.classList.toggle("off",!blinkState);
},1000);
