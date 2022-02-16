import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./App.css";
import { EthereumAuthProvider, SelfID } from "@self.id/web";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import jsonpatch from "fast-json-patch";
import { toString } from "uint8arrays";
import axios from "axios";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [self, setSelf] = useState(null);
  const [response, setResponse] = useState("");
  const { register, handleSubmit } = useForm();

  const login = async () => {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(addresses[0]);

    const tempSelf = await SelfID.authenticate({
      authProvider: new EthereumAuthProvider(window.ethereum, addresses[0]),
      ceramic: "local",
      connectNetwork: "testnet-clay",
    });
    await setSelf(tempSelf);
    console.log(self);
  };

  const send = async (data) => {
    console.log(data);
    const result = await uploadStreamData(data);
    setResponse(JSON.stringify(result));
    console.log(result);
  };

  const uploadStreamData = async (data) => {
    const streamID =
      "k2t6wyfsu4pg1chaym71vn9p3rc5bqey9zntves0jj9ife93edlc8f34qi9yp1";
    const ceramic = new CeramicClient("http://localhost:7007");
    const streamOg = await TileDocument.load(ceramic, streamID);
    const patch = jsonpatch.compare(streamOg.content, JSON.parse(data.body));
    const header = {
      controllers: [self.id],
      family: "test",
    };
    const commit = {
      id: streamOg.state.log[0].cid,
      data: patch,
      prev: streamOg.tip,
      header,
    };
    const updateCommit = await self.did.createDagJWS(commit);
    const linkBlockString = toString(updateCommit.linkedBlock, "base64");
    const result = {
      streamId: streamID,
      commit: {
        jws: {
          payload: updateCommit.jws.payload,
          signatures: updateCommit.jws.signatures,
          link: updateCommit.jws.link?.toString(),
        },
        linkedBlock: linkBlockString,
      },
      opts: {
        throwOnInvalidCommit: true,
      },
    };
    axios
      .post(data.request, result)
      .then(function (response) {
        console.log("ceramic response:", response);
      })
      .catch(function (error) {
        console.log("ceramic error:", error);
      });
    return result;
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
