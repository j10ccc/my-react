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

function updateProps(dom, nextProps, prevProps) {
  if (!nextProps) return;

  Object.keys(prevProps).forEach(key => {
    if (key !== "children") {
      if (!(key in nextProps)) dom.removeAttribute(key);
    }
  });

  Object.keys(nextProps).forEach(key => {
    if (key !== "children") {
      if (prevProps[key] !== nextProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();

          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  })
}

function reconcileChildren(workInProgress, children) {
  let oldFiber = workInProgress.alternate?.child;
  let prevFiber = null;
  children?.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    let newFiber = null;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: workInProgress,
        sibling: null,
        child: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "update"
      }
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: workInProgress,
        sibling: null,
        child: null,
        dom: null,
        effectTag: "placement"
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
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
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextUnitOfWork = wipRoot;
}

function updateFunctionComponent(fiber) {
  reconcileChildren(fiber, [fiber.type(fiber.props)]);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;

    updateProps(dom, fiber.props, {});
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

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

let wipRoot = null;
let currentRoot = null;
function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

requestIdleCallback(workLoop);

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot;
}

const React = {
  createElement,
  render,
  update
}

export default React;
