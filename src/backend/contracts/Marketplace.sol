// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721Enumerable, Ownable {

    struct NFT {
        string name;
        string tokenURI;
        address owner;
        uint256 price;
        uint256 tokenId;
        bool isListed;

    }

    NFT[] public nfts;

    mapping(uint256 => uint256) public nftIndexToTokenId;
    mapping(uint256 => address) public nftIndexToOwner;
    mapping(string => bool) public usedTokenURIs;

    constructor() ERC721("NFT Marketplace", "NFTM") {}


    function mintNFT(string memory _name, string memory _tokenURI,uint price) external returns(uint) {
        require(!usedTokenURIs[_tokenURI], "Token URI already used"); // Check if URI is unique

        uint256 tokenId = nfts.length;
        _mint(msg.sender, tokenId);
        nfts.push(NFT(_name, _tokenURI, msg.sender, 0, tokenId,false));
        nftIndexToTokenId[tokenId] = tokenId;
        nftIndexToOwner[tokenId] = msg.sender;
        usedTokenURIs[_tokenURI] = true; // Mark URI as used
        listNFTForSale(tokenId,price);
        return tokenId;

    }

    
     function listNFTForSale(uint256 _tokenId, uint256 _price) public {
        require(exists(_tokenId), "NFT does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Only the owner can list");
        nfts[_tokenId].price = _price;
        nfts[_tokenId].isListed = true;
    }

    function exists(uint256 tokenId) internal view returns (bool) {
    return tokenId < nfts.length;
}

   

    function purchaseNFT(uint256 _tokenId) external payable {
        require(exists(_tokenId), "NFT does not exist");
        require(nfts[_tokenId].isListed, "NFT is not listed for sale");
        require(msg.value >= nfts[_tokenId].price, "Insufficient funds");

        address seller = ownerOf(_tokenId);
        nfts[_tokenId].isListed = false;
        nfts[_tokenId].owner = msg.sender;

        payable(seller).transfer(msg.value);

        _transfer(seller, msg.sender, _tokenId);
    }

    function viewAllNFTsForSale() external view returns (NFT[] memory) {
        uint256 totalListed = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i].isListed) {
                totalListed++;
            }
        }

        NFT[] memory listedNFTs = new NFT[](totalListed);
        uint256 index = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i].isListed) {
                listedNFTs[index] = nfts[i];
                index++;
            }
        }

        return listedNFTs;
    }

    function viewmylistednfts()public view returns(NFT[] memory){
        NFT[] memory a = viewOwnedNFTs(msg.sender);
        NFT[] memory b = new NFT[](a.length);
        uint index=0;
        for(uint i=0;i<a.length;i++){
                if(nfts[i].isListed && nfts[i].owner == msg.sender){
                    b[index] = a[i];
                    index++;
                }
        }
        return b;
    }

    function viewOwnedNFTs(address _owner) public view returns (NFT[] memory) {
        uint256 totalOwned = balanceOf(_owner);
        NFT[] memory ownedNFTs = new NFT[](totalOwned);
        uint256 index = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            if (ownerOf(i) == _owner) {
                ownedNFTs[index] = nfts[i];
                index++;
            }
        }
        return ownedNFTs;
    }

    function viewTokenUri(uint tokenid) public view returns(string memory){
        require(exists(tokenid), "NFT does not exist");
        return nfts[tokenid].tokenURI;
    }

     function getNFTCount() public view returns (uint) {
        return nfts.length;
    }
}


//https://ipfs.io/ipfs/QmW6Wn2PPE3roNspUBMGh5pEEqfcBYh2h7siDd5YYK3psG/1.json"
        