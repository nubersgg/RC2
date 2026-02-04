const svg = document.getElementById("canvas");

let nodes = [];
let wires = [];
let dragNode = null;
let dragOffset = {x:0,y:0};
let dragWire = null;

// ---------- NODE CREATION ----------
function spawnGate(type){ createNode(type, 2, 1); }
function spawnInput(type){ createNode(type, 0, 1); }

function createNode(type, inputs, outputs){
  const x = 100 + Math.random()*400;
  const y = 80 + Math.random()*300;

  const g = document.createElementNS(svg.namespaceURI,"g");
  g.setAttribute("transform",`translate(${x},${y})`);

  const body = document.createElementNS(svg.namespaceURI,"rect");
  body.setAttribute("width",100);
  body.setAttribute("height",40 + inputs*10);
  body.setAttribute("class","gate");

  const label = document.createElementNS(svg.namespaceURI,"text");
  label.setAttribute("x",50);
  label.setAttribute("y",14);
  label.setAttribute("text-anchor","middle");
  label.setAttribute("class","text");
  label.textContent = type;

  g.append(body,label);

  const inPorts = [];
  for(let i=0;i<inputs;i++){
    const c = document.createElementNS(svg.namespaceURI,"circle");
    c.setAttribute("cx",0);
    c.setAttribute("cy",30+i*12);
    c.setAttribute("r",5);
    c.classList.add("port","input","off");
    g.appendChild(c);
    inPorts.push(c);
  }

  const out = document.createElementNS(svg.namespaceURI,"rect");
  out.setAttribute("x",94);
  out.setAttribute("y",30);
  out.setAttribute("width",10);
  out.setAttribute("height",10);
  out.classList.add("port","output","off");
  g.appendChild(out);

  svg.appendChild(g);

  const node = { type, g, inPorts, out, value:false };
  nodes.push(node);

  // drag node
  g.addEventListener("mousedown",e=>{
    if(e.target.classList.contains("port")) return;
    dragNode = node;
    const t = g.getCTM();
    dragOffset.x = e.clientX - t.e;
    dragOffset.y = e.clientY - t.f;
  });

  // start wire
  out.addEventListener("mousedown",e=>{
    e.stopPropagation();
    const p = getMousePos(e);
    dragWire = { from:node, line:createLine(p.x,p.y) };
  });

  return node;
}

// ---------- WIRES ----------
function createLine(x,y){
  const l = document.createElementNS(svg.namespaceURI,"line");
  l.setAttribute("x1",x); l.setAttribute("y1",y);
  l.setAttribute("x2",x); l.setAttribute("y2",y);
  l.classList.add("wire","off");
  svg.appendChild(l);
  return l;
}

// ---------- MOUSE ----------
svg.addEventListener("mousemove",e=>{
  const p = getMousePos(e);

  if(dragNode){
    dragNode.g.setAttribute("transform",
      `translate(${p.x-dragOffset.x},${p.y-dragOffset.y})`);
  }

  if(dragWire){
    dragWire.line.setAttribute("x2",p.x);
    dragWire.line.setAttribute("y2",p.y);
  }
});

svg.addEventListener("mouseup",e=>{
  dragNode = null;

  if(dragWire){
    const target = document.elementFromPoint(e.clientX,e.clientY);
    if(target && target.classList.contains("input")){
      wires.push({ from:dragWire.from, to:target, line:dragWire.line });
    } else {
      svg.removeChild(dragWire.line);
    }
    dragWire = null;
  }
});

// ---------- LOGIC LOOP ----------
setInterval(()=>{
  for(const n of nodes){
    if(n.type==="BUTTON") n.value=false;
    if(n.type==="AND"){
      n.value = readInputs(n).every(v=>v);
    }
    if(n.type==="OR"){
      n.value = readInputs(n).some(v=>v);
    }
    if(n.type==="NOT"){
      n.value = !readInputs(n)[0];
    }
    updatePort(n.out,n.value);
  }

  for(const w of wires){
    w.line.classList.toggle("on",w.from.value);
    w.line.classList.toggle("off",!w.from.value);
  }
},100);

// ---------- HELPERS ----------
function readInputs(n){
  return n.inPorts.map(p=>{
    const w = wires.find(w=>w.to===p);
    return w ? w.from.value : false;
  });
}

function updatePort(p,on){
  p.classList.toggle("on",on);
  p.classList.toggle("off",!on);
}

function getMousePos(e){
  const pt = svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
