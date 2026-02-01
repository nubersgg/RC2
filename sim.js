const svg = document.getElementById("canvas");

// create gate
function createGate(x, y) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${x},${y})`);

  const body = document.createElementNS(svg.namespaceURI, "rect");
  body.setAttribute("width", 80);
  body.setAttribute("height", 40);
  body.setAttribute("class", "gate");

  // input (circle)
  const input = document.createElementNS(svg.namespaceURI, "circle");
  input.setAttribute("cx", 0);
  input.setAttribute("cy", 20);
  input.setAttribute("r", 6);
  input.setAttribute("class", "port input off");

  // output (square)
  const output = document.createElementNS(svg.namespaceURI, "rect");
  output.setAttribute("x", 74);
  output.setAttribute("y", 14);
  output.setAttribute("width", 12);
  output.setAttribute("height", 12);
  output.setAttribute("class", "port output off");

  g.appendChild(body);
  g.appendChild(input);
  g.appendChild(output);
  svg.appendChild(g);

  return { input, output, state: false };
}

// example toggle signal
const gate = createGate(100, 100);

setInterval(() => {
  gate.state = !gate.state;
  gate.output.classList.toggle("on", gate.state);
  gate.output.classList.toggle("off", !gate.state);
}, 1000);
