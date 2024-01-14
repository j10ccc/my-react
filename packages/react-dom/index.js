function render(el, container) {
  const dom = el.type === "TEXT_NODE"
    ? document.createTextNode("")
    : document.createElement(el.type);

  if (el.props) {
    Object.keys(el.props).forEach(key => {
      if (key !== "children")
        dom[key] = el.props[key];
    })
  }

  const children = el.props.children;
  if (children) {
    children.forEach(child => {
      render(child, dom);
    })
  }
  container.appendChild(dom);
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
