# TruthMint - Verified AI Knowledge NFTs

![TruthMint Banner](https://via.placeholder.com/1200x300/667eea/ffffff?text=TruthMint+-+Truth+as+a+Currency)


video link: "https://drive.google.com/file/d/1jLzbxadoX5mRCNA7gg_V34l1Z9mir3e_/view?usp=sharing"

ppt: "https://docs.google.com/presentation/d/1u_DjkV8C2UumHH37DrDHV2eH0m6mL6Tg/edit?usp=sharing&ouid=109399514300700508541&rtpof=true&sd=true"

## 🎯 Overview

**TruthMint** transforms AI-generated factual claims into NFTs backed by verifiable truth using Flare blockchain's decentralized data infrastructure. Users can own, collect, and trade verified knowledge.

### The Problem
AI hallucinations undermine trust in AI-generated content. There's no reliable way to verify if AI claims are factually correct.

### The Solution
TruthMint forces every AI-generated claim to face reality through Flare's decentralized oracles (FTSO & FDC), creating a verifiable truth layer for AI knowledge.

## ⚡ Core Features

- 🤖 **AI Claim Generation**: Local LLM generates factual claims on any topic
- ✅ **Flare Verification**: FTSO and FDC oracles verify claims against real-world data
- ⛓️ **On-Chain Proof**: Verification results stored immutably on Flare
- 🎨 **Knowledge NFTs**: Mint verified claims as collectible NFTs
- 🏆 **Truth Reputation**: User scores based on claim accuracy
- 💎 **Marketplace**: Browse, collect, and trade verified knowledge

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend       │────▶│   Flare APIs    │
│   (HTML/JS)     │     │   (Express)      │     │  (FTSO + FDC)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         │
        │                        │                         │
        ▼                        ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web3 Wallet    │────▶│ Smart Contracts  │◀────│  Verification   │
│  (MetaMask)     │     │  TruthHub + NFT  │     │     Proofs      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- MetaMask or Web3 wallet
- Flare testnet (Coston2) tokens

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/truthmint.git
cd truthmint
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Contracts
cd ../contracts
npm install
```

3. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

4. **Deploy smart contracts**
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network coston2
```

5. **Update contract addresses**
   - Copy deployed addresses from `deployed-addresses.json`
   - Update `backend/.env`
   - Update `frontend/js/wallet.js`

6. **Start backend server**
```bash
cd backend
npm run dev
```

7. **Access the app**
   - Open `http://localhost:3000` in your browser
   - Connect your MetaMask wallet
   - Switch to Flare Coston2 testnet

### Using Cloudflare Tunnel (for demo)

```bash
# Install cloudflared
npm install -g cloudflared

# Start tunnel
npm run tunnel
```

This creates a public URL for judges to access your demo.

## 📁 Project Structure

```
truthmint/
├── frontend/
│   ├── index.html              # Landing page
│   ├── create.html             # Generate → Verify → Mint
│   ├── explore.html            # NFT marketplace
│   ├── profile.html            # User profile & collection
│   ├── css/
│   │   └── style.css           # Main styles
│   └── js/
│       ├── wallet.js           # Web3 wallet integration
│       ├── api.js              # Backend API client
│       ├── ui.js               # UI helpers
│       ├── create.js           # Create page logic
│       └── marketplace.js      # Marketplace logic
│
├── backend/
│   ├── server.js               # Express server
│   ├── routes/
│   │   ├── ai.js               # AI generation endpoints
│   │   ├── truth.js            # Verification endpoints
│   │   └── nft.js              # NFT metadata endpoints
│   ├── services/
│   │   ├── ai.js               # AI service
│   │   └── truth.js            # Flare verification service
│   └── package.json
│
├── contracts/
│   ├── TruthHub.sol            # Verification proof registry
│   ├── KnowledgeNFT.sol        # Knowledge NFT contract
│   ├── hardhat.config.js       # Hardhat configuration
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   └── package.json
│
├── .env.example                # Environment variables template
├── .gitignore
└── README.md
```

## 🔗 Flare Integration

### FTSO (Flare Time Series Oracle)
- **Usage**: Verify crypto price claims (BTC, ETH, etc.)
- **Endpoint**: `https://flare-api.flare.network/ftso/v1`
- **Example**: "Bitcoin price reached $69,000 in November 2021"

### FDC (Flare Data Connector)
- **Usage**: Verify external real-world data
- **Endpoint**: `https://fdc-verification.flare.network/verifier`
- **Example**: Weather data, election results, sports scores

### Smart Contracts

#### TruthHub.sol
Stores verification proofs on-chain:
```solidity
struct VerificationProof {
    string claim;
    bool isVerified;
    uint8 confidenceScore;
    uint256 timestamp;
    string dataSource;
    address verifier;
    string ftsoData;
    string fdcData;
}
```

#### KnowledgeNFT.sol
ERC-721 NFTs representing verified knowledge:
```solidity
function mintKnowledgeNFT(
    uint256 _proofId,
    string memory _topic,
    string memory _tokenURI
) external payable returns (uint256)
```

## 🎮 Usage Flow

### 1. Generate Claim
```javascript
// User enters topic: "Bitcoin price history"
const result = await APIClient.generateClaim(topic);
// AI returns: "Bitcoin reached $69,000 in November 2021"
```

### 2. Verify with Flare
```javascript
// Backend calls Flare oracles
const verification = await TruthService.verifyClaim(claim, category);
// Returns: { isVerified: true, confidenceScore: 95, dataSource: "FTSO" }
```

### 3. Register Proof
```javascript
// Store verification on-chain
const { proofId, txHash } = await WalletManager.registerProof(verification);
// Proof stored in TruthHub contract
```

### 4. Mint NFT
```javascript
// Create NFT with verification proof
const { tokenId } = await WalletManager.mintNFT(proofId, topic, tokenURI);
// NFT minted with embedded proof
```

## 🎨 UI Features

### Landing Page
- Hero section explaining TruthMint
- How it works (6-step visual flow)
- Flare technology showcase
- Call-to-action buttons

### Create Page
Three-step wizard:
1. **Generate**: AI creates factual claim
2. **Verify**: Flare oracles check validity
3. **Mint**: Create NFT with proof

### Explore Page
- NFT marketplace grid
- Filter by category, verification status
- Detailed NFT modal with proof data
- "Flare Verified" badges

### Profile Page
- Wallet address display
- Truth Reputation Score (%)
- Statistics: Total NFTs, Verified Claims, Avg Confidence
- Personal NFT collection

## 🔧 API Endpoints

### AI Generation
```
POST /api/ai/generate
Body: { "topic": "Bitcoin price" }
Response: { "claim": "...", "category": "CRYPTO" }
```

### Verification
```
POST /api/truth/verify
Body: { "claim": "...", "category": "CRYPTO" }
Response: { "isVerified": true, "confidenceScore": 95, ... }
```

### NFT Metadata
```
POST /api/nft/metadata
Body: { "tokenId": 1, "claim": "...", "proofId": 123, ... }
Response: { "metadata": {...}, "tokenURI": "..." }

GET /api/nft/all
Response: { "nfts": [...], "total": 10 }
```

## 🎯 Demo Script

1. **Open TruthMint** (`http://localhost:3000`)
2. **Connect wallet** (MetaMask → Flare Coston2)
3. **Navigate to Create**
4. **Enter topic**: "Bitcoin halving 2024"
5. **Click Generate** → AI creates claim
6. **Click Verify** → Flare validates (shows FTSO data, confidence score)
7. **View proof details** (data source, timestamp)
8. **Click Mint** → NFT created with embedded proof
9. **View in Explore** → Browse all NFTs with verification badges
10. **Check Profile** → See your collection + Truth Reputation Score

## 🏆 Hackathon Judging Criteria

### ✅ Flare Integration
- **FTSO**: Price data verification for crypto claims
- **FDC**: External data verification for general claims
- **Smart Contracts**: TruthHub + KnowledgeNFT deployed on Coston2
- **Visible to judges**: UI displays data source, FTSO/FDC badges

### ✅ Innovation
- Novel use case: AI + truth verification + NFTs
- Solves real problem: AI hallucinations
- Creates new market: verified knowledge as assets

### ✅ Technical Implementation
- Full-stack dApp (frontend + backend + contracts)
- Web3 wallet integration
- AI generation + blockchain verification flow
- Clean, professional UI

### ✅ User Experience
- Intuitive 3-step wizard
- Real-time feedback and loading states
- Clear visualization of verification proofs
- Responsive design

### ✅ Demo-Ready
- Cloudflare tunnel for public access
- Pre-populated test data
- Fast generation/verification
- No complex setup required

## 🔐 Security Considerations

- Private keys never exposed in frontend
- Environment variables for sensitive data
- Smart contract access controls
- Input validation on all API endpoints

## 🚧 Future Enhancements

- [ ] Multi-chain support (Songbird, Flare mainnet)
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Social features (comments, likes, sharing)
- [ ] NFT trading marketplace with FAssets
- [ ] Reputation-based rewards
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Governance token for platform decisions

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Contact

- **Website**: https://truthmint.app
- **Twitter**: @TruthMint
- **Discord**: discord.gg/truthmint
- **Email**: team@truthmint.app

## 🙏 Acknowledgments

- Flare Network for decentralized data infrastructure
- Anthropic for AI capabilities
- OpenZeppelin for smart contract libraries
- The Web3 community

---

Built with ❤️ for the Flare Hackathon 2025

**"Truth is the new currency"** 🔍✨
