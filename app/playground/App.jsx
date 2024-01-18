import React from "my-react";

let count = 10;
function Counter({ num, color }) {
  function handleClick() {
    count++;
    React.update();
  }

  return (
    <>
      <div style={`color: ${color}`}>Counter: {count}</div>
      <button onClick={handleClick}>add</button>
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
