import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'


export default function MyListedItems({ marketplace, account }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);


  const loadListedItems = async () => {

    let itemCount = await marketplace.viewmylistednfts();
    console.log(itemCount);
    console.log("mjmm");
    let items = [];
    for (let i = 0; i < itemCount.length; i++) {
      const item = await itemCount[i];
      console.log("hii");
      const totalPrice = await item.price;
      console.log(totalPrice);

      const uri = await marketplace.viewTokenUri(item.tokenId);
      console.log("uri ");
      // use uri to fetch the nft metadata stored on ipfs
      const response = await fetch(`https://ipfs.io/ipfs/${uri}`);
      console.log("res");
      const metadata = await response.json();
      console.log("md");
        items.push({
          totalPrice,
          itemId: item.tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
        console.log("pushed");
      }
    
    setLoading(false);
    setItems(items);

    }
  

 

  useEffect(() => {
    loadListedItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}