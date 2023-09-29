import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";

const Home = ({ marketplace }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    let itemCount = await marketplace.getNFTCount();
    console.log(itemCount);
    console.log("mjmm");
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = await marketplace.nfts(i);
      console.log("hii");
      if (item.isListed) {
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

  const buyMarketItem = async (item) => {
    console.log("it", item);
    const a = ethers.utils.parseUnits(item.totalPrice.toString(), "wei");
    console.log(a);

    await (
      await marketplace.purchaseNFT(item.itemId, {
        value: a,
      })
    ).wait();
    loadMarketplaceItems();
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div
                      className="d-grid"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        onClick={() => buyMarketItem(item)}
                        variant="primary"
                        size="lg"
                        style={{ whiteSpace: "normal", width: "auto" }}
                      >
                        {/* Buy for {ethers.utils.formatEther(item.totalPrice)} ETH */}
                        <span style={{ fontSize: "14px" }}>
                          Buy for {ethers.utils.formatEther(item.totalPrice)}{" "}
                          ETH
                        </span>
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
};
export default Home;
