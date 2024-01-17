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
        const isTextNode = typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child
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
      if (key !== "children") {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();
          dom.addEventListener(eventType, props[key]);
        } else {
          dom[key] = props[key];
        }
      }
    })
  }
}

function reconcileChildren(workInProgress, children) {
  let prevFiber = null;
  children?.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: workInProgress,
      sibling: null,
      child: null,
      dom: null
    }
    if (index === 0) {
      workInProgress.child = newFiber;
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
  root = nextUnitOfWork;
}

function updateFunctionComponent(fiber) {
  reconcileChildren(fiber, [fiber.type(fiber.props)]);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;

    updateProps(fiber.props, dom);
  }

  reconcileChildren(fiber, fiber.props?.children);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  // Create DOM
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // Return next unit of work
  if (fiber.child) return fiber.child;
  else {
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) return nextFiber.sibling;
      nextFiber = nextFiber.parent;
    }
  }
}

let nextUnitOfWork = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    if (!nextUnitOfWork && root) {
      commitRoot(root);
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
}

let root = null;
function commitRoot(root) {
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

requestIdleCallback(workLoop)

const React = {
  createElement,
  render
}

export default React;
