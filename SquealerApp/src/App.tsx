import { Suspense, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { motion } from "framer-motion";

const Loading = () => {
  return <div className="loading">Loading...</div>;
};

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("App mounted");
    fetch("/api/account")
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ rotate: 360 * 3, scale: 2 }}
        transition={{
          type: "easeIn",
          duration: 0.7,
        }}
      >
        Hello there!
      </motion.div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
