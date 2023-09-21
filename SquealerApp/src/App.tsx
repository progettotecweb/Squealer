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
		<h1>Homepage!</h1>
		<p>This is just a test to see if i correctly understand branches</p>
	</>
  );
}

export default App;
