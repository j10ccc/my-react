function createTextNode(text) {
  return {
    type: "TEXT_NODE",
    props: {
      nodeValue: text
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === "string"
          ? createTextNode(child)
          : child
      })
    },
  }
}

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

const React = {
  createElement,
  render
}

export default React;
