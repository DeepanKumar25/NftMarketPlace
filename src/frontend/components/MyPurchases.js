import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Spinner from "react-bootstrap/Spinner";
import { Row, Col, Card, Form, Button } from "react-bootstrap";

export default function MyPurchases({ marketplace, account }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [price, setPrice] = useState(1); // State to store the input box value
  const [listloading, setlistloading] = useState(false);

  const loadPurchasedItems = async () => {
    let itemCount = await marketplace.getNFTCount();
    console.log(itemCount);
    console.log("mjmm");
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = await marketplace.nfts(i);
      console.log("hii");
      console.log(account);
      console.log(item.owner);
      if (item.owner.toLowerCase() == account.toLowerCase()) {
        console.log("hiiiiiii");
        // get uri url from nft contract
        const uri = await marketplace.viewTokenUri(item.tokenId);
        console.log("uri ");
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(`https://ipfs.io/ipfs/${uri}`);
        console.log("res");
        const metadata = await response.json();
        console.log("md");
        // get total price of item (item price + fee)
        const totalPrice = await item.price;
        console.log(totalPrice);

        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
        console.log("pushed");
      }
    }
    setLoading(false);
    setItems(items);
  };
  useEffect(() => {
    loadPurchasedItems();
  }, []);


  useEffect(()=>{
    console.log("List loading changed")
  },[listloading])
  
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );



  const listNFT = async (item, price) => {
    console.log("Listing NFT with item ID:", item.itemId);
    console.log("Price:", price);
    try {
      setlistloading(true);
      const a = await marketplace.listNFTForSale(item.itemId, price);
      a.wait();
      setLoading(false);
    } catch (e) {
      console.log(e);
      alert("Unable to list nft, try again.");
      setlistloading(false);
    }
  };

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                    <Form>
                      <Form.Group controlId={`quantity-${idx}`}>
                        <Form.Label>Quantity:</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Price in Wei"
                          min="1"
                          step="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        style={{ marginTop: "10px" }}
                        onClick={() => listNFT(item, price)}
                      >{!listloading?
                        "List NFT ": <Spinner animation="border"/>}
                      </Button>
                    </Form>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No purchases</h2>
        </main>
      )}
    </div>
  );
}
