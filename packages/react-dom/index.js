import React from "my-react";

const ReactDOM = {
  createRoot: (container) => {
    return {
      render: (app) => {
        return React.render(app, container)
      }
    }
  }
}

export default ReactDOM;
