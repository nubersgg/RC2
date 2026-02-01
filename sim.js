const svg = document.getElementById("canvas");
let gates = [];
let wires = [];
let draggingGate = null;
let dragOffset = {x:0,y:0};
let draggingWire = null;

// --- SPAWN GATE ---
function spawnGate(type){
  const x = 100 + Math.random()*400;
  const y = 100 + Math.random()*200;
  const gate = createGate(x,y,type);
  gates.push(gate);
}

// --- CREATE GATE ---
function createGate(x,y,type){
  const g = document.createElementNS(svg.namespaceURI,"g");
  g.setAttribute("transform",`translate(${x},${y})`);

  // Gate body
  const body = document.createElementNS(svg.namespaceURI,"rect");
  body.setAttribute("width",100);
  body.setAttribute("height",50);
  body.setAttribute("class","gate");

  // Input ports (1-2 depending on gate type)
  const input1 = document.createElementNS(svg.namespaceURI,"circle");
  input1.setAttribute("cx",0);
  input1.setAttribute("cy",15);
  input1.setAttribute("r",6);
  input1.setAttribute("class","port input off");

  const input2 = document.createElementNS(svg.namespaceURI,"circle");
  input2.setAttribute("cx",0);
  input2.setAttribute("cy",35);
  input2.setAttribute("r",6);
  input2.setAttribute("class","port input off");

  // Output port
  const output = document.createElementNS(svg.namespaceURI,"rect");
  output.setAttribute("x",88);
  output.setAttribute("y",20);
  output.setAttribute("width",12);
  output.setAttribute("height",12);
  output.setAttribute("class","port output off");

  // Gate name text
  const gateText = document.createElementNS(svg.namespaceURI,"text");
  gateText.setAttribute("x",50);
  gateText.setAttribute("y",12);
  gateText.setAttribute("text-anchor","middle");
  gateText.setAttribute("class","gateText");
  gateText.textContent = type;

  // Optional mode input (for Delay, etc.)
  let modeText=null;
  let modeButton=null;
  if(type==="DELAY"){
    modeText = document.createElementNS(svg.namespaceURI,"text");
    modeText.setAttribute("x",50);
    modeText.setAttribute("y",48);
    modeText.setAttribute("text-anchor","middle");
    modeText.setAttribute("class","modeText");
    modeText.textContent = "Pink";
    g.appendChild(modeText);

    modeButton = document.createElementNS("http://www.w3.org/1999/xhtml","button");
    modeButton.style.position="absolute";
    modeButton.style.left=(x+10)+"px";
    modeButton.style.top=(y+60)+"px";
    modeButton.textContent="Change Mode";
    document.body.appendChild(modeButton);

    let modes=["Pink","Blue","Yellow"];
    let idx=
