// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // match OZ compiler requirements

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITruthHub {
    function getProof(uint256 _proofId) external view returns (
        string memory claim,
        bool isVerified,
        uint8 confidenceScore,
        uint256 timestamp,
        string memory dataSource,
        address verifier,
        string memory ftsoData,
        string memory fdcData
    );
}

contract KnowledgeNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    ITruthHub public truthHub;

    struct NFTMetadata {
        uint256 proofId;
        string topic;
        uint256 mintedAt;
        address creator;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(address => uint256) public userTruthScore;
    mapping(address => uint256) public userMintCount;

    uint256 public constant MINT_FEE = 0.01 ether;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 proofId,
        string topic
    );

    constructor(address _truthHub)
        ERC721("TruthMint Knowledge", "TRUTH")
        Ownable(msg.sender) // required for OZ v5
    {
        truthHub = ITruthHub(_truthHub);
    }

    function mintKnowledgeNFT(
        uint256 _proofId,
        string memory _topic,
        string memory _tokenURI
    ) external payable returns (uint256) {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");

        (
            string memory claim,
            bool isVerified,
            uint8 confidenceScore,
            , , , ,
        ) = truthHub.getProof(_proofId);

        require(bytes(claim).length > 0, "Proof does not exist");
        require(isVerified, "Claim is not verified");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        nftMetadata[tokenId] = NFTMetadata(
            _proofId,
            _topic,
            block.timestamp,
            msg.sender
        );

        userNFTs[msg.sender].push(tokenId);
        userTruthScore[msg.sender] += confidenceScore;
        userMintCount[msg.sender]++;

        emit NFTMinted(tokenId, msg.sender, _proofId, _topic);

        return tokenId;
    }

    function getUserTruthReputation(address _user)
        external 
        view 
        returns (uint256)
    {
        if (userMintCount[_user] == 0) return 0;
        return userTruthScore[_user] / userMintCount[_user];
    }

    function getUserNFTs(address _user)
        external 
        view 
        returns (uint256[] memory)
    {
        return userNFTs[_user];
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Required override for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
