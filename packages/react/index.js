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

function createDOM(type) {
  const dom = type === "TEXT_NODE"
    ? document.createTextNode("")
    : document.createElement(type);

  return dom;
}

function updateProps(props, dom) {
  if (props) {
    Object.keys(props).forEach(key => {
      if (key !== "children")
        dom[key] = props[key];
    })
  }
}

function maintainFiberLinkedList(fiber) {
  const children = fiber.props.children;
  let prevFiber = null;
  children?.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      sibling: null,
      child: null,
      dom: null
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      if (prevFiber) prevFiber.sibling = newFiber;
    }
    prevFiber = newFiber;
  });
}

function render(el, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el]
    }
  }
}

function performUnitOfWork(fiber) {
  // Create DOM
  if (!fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;
    fiber.parent.dom.appendChild(dom);

    updateProps(fiber.props, dom);
  }

  // Maintain linked list
  maintainFiberLinkedList(fiber);

  if (fiber.child) return fiber.child;
  else if (fiber.sibling) return fiber.sibling;
  else return fiber.parent.sibling;
}

let nextUnitOfWork = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }
}

requestIdleCallback(workLoop)

const React = {
  createElement,
  render
}

export default React;
