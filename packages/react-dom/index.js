function render(el, container) {
  if (el.type === "TEXT_NODE") {
    const textNode = document.createTextNode(el.nodeValue);
    container.appendChild(textNode);
  } else {
    const dom = document.createElement(el.type);
    if (el.props) {
      Object.keys(el.props).forEach(key => {
        dom.setAttribute(key, el.props[key]);
      })
    }
    if (el.children) {
      el.children.forEach(child => {
        render(child, dom);
      })
    }
    container.appendChild(dom);
  }
}

const ReactDom = {
  createRoot: (container) => {
    return {
      render: (app) => {
        return render(app, container)
      }
    }
  }
}

export default ReactDom;
