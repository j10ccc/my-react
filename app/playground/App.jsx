import React from "my-react";

function Counter({ num, color }) {
  return (
    <>
      <div style={`color: ${color}`}>Counter: {num}</div>
      <button onClick={() => console.log("add")}>add</button>
    </>
  )
}

function App() {
  return (
    <div id="app">
      my-react
      <Counter num={10} color="red" />
      <Counter num={20} color="blue" />
    </div>
  );
}

export default App;
