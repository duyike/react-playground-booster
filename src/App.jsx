import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./App.css";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [response, setResponse] = useState("");
  const { register, handleSubmit } = useForm();
  const login = () => {
    console.login("login");
  };
  const send = (data) => {
    console.log(data);
    setResponse(JSON.stringify(data));
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">🚀 Playground Booster 🚀 </div>

        {currentAccount ? (
          <div className="text"> {currentAccount} </div>
        ) : (
          <button className="button" onClick={login}>
            Login
          </button>
        )}

        <form onSubmit={handleSubmit(send)}>
          <label> Method </label>
          <input {...register("method")} />
          <label> Request </label>
          <input {...register("request")} />
          <label> Body </label>
          <textarea {...register("body")} />
          <input type="submit" className="button" />
        </form>

        <label> Response </label>
        {response ? <div className="text"> {response} </div> : null}
      </div>
    </div>
  );
}

export default App;
