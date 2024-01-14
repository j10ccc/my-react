export default {
  createTextNode,
  createElement
}

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

