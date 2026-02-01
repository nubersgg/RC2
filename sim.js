const svg = document.getElementById("canvas");

function spawnGate(type) {
  const gate = createGate(200, 100 + Math.random() * 200);
  gate.type = type;
}

function createGate(x, y) {
  const g = document.createElementNS(svg.namespaceURI, "g");
  g.setAttribute("transform", `translate(${x},${y})`);

  const body = document.createElementNS(svg.namespaceURI, "rect");
  body.setAttribute("width", 80);
  body.setAttribute("height", 40);
  body.setAttribute("class", "gate");

  const input = document.createElementNS(svg.namespaceURI, "circle");
  input.setAttribute("cx", 0);
  input.setAttribute("cy", 20);
  input.setAttribute("r", 6);
  input.setAttribute("class", "port input off");

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

  return { g, input, output };
}
