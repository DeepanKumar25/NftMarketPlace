import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import FormData from "form-data";
import Spinner from "react-bootstrap/Spinner";
// import { fs } from "fs";
// import * as fs from "fs";
const fs = require("fs");

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YjY4ZTRiNS05MDdjLTQyYTAtYjdlMi0xNjE3MGU5YTM4ZjQiLCJlbWFpbCI6ImRlZXBhbnJ2ZHZlbnVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImU5YzhiMDlkMDdiZDNjODQ1NDIxIiwic2NvcGVkS2V5U2VjcmV0IjoiZTZjNGQ2ZGNkMzk5MTc5OTVmMTVlYjFlODg2ZjNlNWNkNjg4Y2E2Mjg2YjQ5ZTEwNTE1NTcxYTExZTgzZDA2MyIsImlhdCI6MTY5NTg1MDg4OX0.itz8hMCY7XHmhAAEgbAXKgtxbtqmA84jrKaOXaBWjxo";
const Create = ({ marketplace }) => {
  console.log(marketplace);
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hash, setHash] = useState("");
  const [finalhash, setFinalHash] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [loading, setIsLoading] = useState(false);

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    console.log("first");
    const src = event.target.files[0];
    setImage(src);
    if (typeof src !== "undefined") {
      try {
        console.log("second");
        const formData = new FormData();

        // const file = fs.createReadStream(src);
        formData.append("file", src);

        console.log(formData);
        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: "Infinity",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
              pinata_api_key: "e9c8b09d07bd3c845421",
              pinata_secret_api_key:
                "e6c4d6dcd39917995f15eb1e886f3e5cd688ca6286b49e10515571a11e83d063",
              // Authorization: JWT,
            },
          }
        );
        console.log("hi");
        console.log(res.data.IpfsHash);
        setHash(res.data.IpfsHash);
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const createNFT = async () => {
    const polygonTestnetChainId = "0x13881";

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log("network id", chainId);

    if (chainId === polygonTestnetChainId) {
      console.log("Tokenid", tokenId);
      if (!image || !price || !name || !description) return;
      try {
        const data = JSON.stringify({
          pinataContent: {
            name: name,
            description: description,
            image: `https://ipfs.io/ipfs/${hash}`,
          },
          pinataMetadata: {
            name: "metadata.json",
          },
        });

        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          data,
          {
            headers: {
              "Content-Type": `application/json`,
              pinata_api_key: "e9c8b09d07bd3c845421",
              pinata_secret_api_key:
                "e6c4d6dcd39917995f15eb1e886f3e5cd688ca6286b49e10515571a11e83d063",
            },
          }
        );
        console.log(res.data.IpfsHash);
        setFinalHash(res.data.IpfsHash);
        mintThenList(res.data.IpfsHash);
      } catch (error) {
        console.log("ipfs uri upload error: ", error);
      }
    } else {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch {
        console.log("rejected");
      }
    }
  };
  const mintThenList = async (hash) => {
    // const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // // mint nft
    try {
      setIsLoading(true);

      const mint = await marketplace.mintNFT(name, hash, price);
      await mint.wait();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      alert("Your Transaction Has Failed.");
    }
    // // get tokenId of new nft
    // const id = await nft.tokenCount();
    // // approve marketplace to spend nft
    // await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // // add nft to marketplace
    // const listingPrice = ethers.utils.parseEther(price.toString());
    // await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };

  useEffect(() => {
    console.log("loading changed", loading);
  }, [loading, tokenId]);

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in Wei"
              />
              <div className="d-grid px-0">
                {!loading ? (
                  <Button onClick={createNFT} variant="primary" size="lg">
                    Create & List NFT!
                  </Button>
                ) : (
                  <Button variant="primary" size="lg">
                    Wait for a moment <Spinner animation="border" size="sm" />
                  </Button>
                )}
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
