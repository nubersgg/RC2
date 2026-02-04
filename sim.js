const svg = document.getElementById("canvas");

const nodes = [];
const wires = [];

let draggingNode = null;
let dragOffset = {x:0,y:0};
let activeWire = null;

/* =========================
   Gate Definitions
========================= */
const GATES = {
  LEVER: {
    inputs: [],
    outputs: ["OUT"],
    init: () => ({ on:false }),
    logic: (i,s) => [s.on]
  },
  AND: {
    inputs: ["A","B"],
    outputs: ["OUT"],
    logic: i => [i.A && i.B]
  },
  OR: {
    inputs: ["A","B"],
    outputs: ["OUT"],
    logic: i => [i.A || i.B]
  },
  NOT: {
    inputs: ["A"],
    outputs: ["OUT"],
    logic: i => [!i.A]
  }
};

/* =========================
   Utilities
========================= */
function svgPoint(evt){
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function create(tag){
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

/* =========================
   Spawn Gate
========================= */
function spawn(type){
  const def = GATES[type];
  const node = {
    type,
    def,
    state: def.init ? def.init() : {},
    x: 100,
    y: 100,
    inPorts: [],
    outPorts: [],
    g: create("g")
  };

  node.g.classList.add("gate");
  svg.appendChild(node.g);

  const box = create("rect");
  box.setAttribute("width", 80);
  box.setAttribute("height", 40 + def.inputs.length * 10);
  node.g.appendChild(box);

  const label = create("text");
  label.setAttribute("x", 40);
  label.setAttribute("y", 15);
  label.setAttribute("text-anchor", "middle");
  label.textContent = type;
  node.g.appendChild(label);

  def.inputs.forEach((name,i)=>{
    const p = create("circle");
    p.setAttribute("r", 5);
    p.classList.add("port","in");
    node.g.appendChild(p);
    node.inPorts.push({name, el:p, value:false});
  });

  def.outputs.forEach((name,i)=>{
    const p = create("rect");
    p.setAttribute("width",10);
    p.setAttribute("height",10);
    p.classList.add("port","out");
    node.g.appendChild(p);
    node.outPorts.push({name, el:p, value:false});
  });

  if(type === "LEVER"){
    node.g.ondblclick = ()=>{
      node.state.on = !node.state.on;
    };
  }

  node.g.onmousedown = e=>{
    const p = svgPoint(e);
    draggingNode = node;
    dragOffset.x = p.x - node.x;
    dragOffset.y = p.y - node.y;
  };

  nodes.push(node);
  updateNode(node);
}

/* =========================
   Update Node UI
========================= */
function updateNode(n){
  n.g.setAttribute("transform", `translate(${n.x},${n.y})`);

  n.inPorts.forEach((p,i)=>{
    p.el.setAttribute("cx", 0);
    p.el.setAttribute("cy", 30 + i*10);
  });

  n.outPorts.forEach((p,i)=>{
    p.el.setAttribute("x", 70);
    p.el.setAttribute("y", 25 + i*10);
  });
}

/* =========================
   Wires
========================= */
function startWire(port){
  const r = port.el.getBBox();
  activeWire = {
    from: port,
    line: create("line")
  };
  activeWire.line.classList.add("wire");
  activeWire.line.setAttribute("x1", r.x + r.width/2);
  activeWire.line.setAttribute("y1", r.y + r.height/2);
  activeWire.line.setAttribute("x2", r.x + r.width/2);
  activeWire.line.setAttribute("y2", r.y + r.height/2);
  svg.appendChild(activeWire.line);
}

function findInputAt(evt){
  const p = svgPoint(evt);
  for(const n of nodes){
    for(const i of n.inPorts){
      const r = i.el.getBBox();
      if(
        p.x >= n.x + r.x && p.x <= n.x + r.x + r.width &&
        p.y >= n.y + r.y && p.y <= n.y + r.y + r.height
      ) return i;
    }
  }
  return null;
}

/* =========================
   Mouse Events
========================= */
svg.onmousemove = e=>{
  if(draggingNode){
    const p = svgPoint(e);
    draggingNode.x = p.x - dragOffset.x;
    draggingNode.y = p.y - dragOffset.y;
    updateNode(draggingNode);
    updateWires();
  }
  if(activeWire){
    const p = svgPoint(e);
    activeWire.line.setAttribute("x2", p.x);
    activeWire.line.setAttribute("y2", p.y);
  }
};

svg.onmouseup = e=>{
  draggingNode = null;
  if(activeWire){
    const target = findInputAt(e);
    if(target){
      wires.push({from:activeWire.from, to:target, line:activeWire.line});
    } else {
      activeWire.line.remove();
    }
    activeWire = null;
  }
};

/* =========================
   Port Events
========================= */
svg.addEventListener("mousedown", e=>{
  if(e.target.classList.contains("out")){
    const node = nodes.find(n=>n.outPorts.some(p=>p.el===e.target));
    const port = node.outPorts.find(p=>p.el===e.target);
    startWire(port);
    e.stopPropagation();
  }
});

/* =========================
   Logic Loop
========================= */
function updateWires(){
  for(const w of wires){
    const fr = w.from.el.getBBox();
    const to = w.to.el.getBBox();
    const fn = nodes.find(n=>n.outPorts.includes(w.from));
    const tn = nodes.find(n=>n.inPorts.includes(w.to));

    w.line.setAttribute("x1", fn.x + fr.x + fr.width/2);
    w.line.setAttribute("y1", fn.y + fr.y + fr.height/2);
    w.line.setAttribute("x2", tn.x + to.x + to.width/2);
    w.line.setAttribute("y2", tn.y + to.y + to.height/2);
  }
}

setInterval(()=>{
  for(const n of nodes){
    const inputs = {};
    n.inPorts.forEach(p=>inputs[p.name] = p.value || false);
    const out = n.def.logic(inputs, n.state);
    n.outPorts.forEach((p,i)=>{
      p.value = out[i];
      p.el.classList.toggle("active", p.value);
    });
  }

  for(const w of wires){
    w.to.value = w.from.value;
    w.line.classList.toggle("active", w.from.value);
  }
}, 50);
