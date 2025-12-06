// frontend/js/app.js

// --- 1. CONFIGURATION ---
const NETWORK_CONFIG = {
    CHAIN_ID: '0x72', // 114 (Flare Coston2 Testnet)
    RPC_URL: 'https://coston2-api.flare.network/ext/bc/C/rpc',
    NETWORK_NAME: 'Flare Coston2 Testnet'
};

const CONTRACT_ADDRESSES = {
    KNOWLEDGE_NFT: '0x57A49314c17933fa4560bFb5caA969CE8c36F6B4', 
    TRUTH_HUB: '0xA843ACA38B52b5826Da9B9Bc182228211Fafb29A'
};

const KNOWLEDGE_NFT_ABI = [
    "function mintKnowledgeNFT(uint256 _proofId, string memory _topic, string memory _tokenURI) external payable",
    "function getUserNFTs(address _user) view returns (uint256[])",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function totalSupply() view returns (uint256)"
];

const MINT_VALUE_FLR = '0.01'; 
const GAS_LIMIT = 3000000; 

// Global State
window.userWalletAddress = null;

// --- 2. UI UPDATER ---
const updateWalletUI = (address) => {
    const btn = document.getElementById('wallet-connect-btn');
    const statusText = document.getElementById('wallet-status-text');
    
    window.userWalletAddress = address; // Update Global Variable

    if (btn && statusText) {
        if (address) {
            btn.classList.add('connected');
            statusText.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        } else {
            btn.classList.remove('connected');
            statusText.textContent = '🔌 Connect Wallet';
        }
    }
};

// --- 3. CONNECTION LOGIC ---
const switchNetwork = async () => {
    if (!window.ethereum) return false;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.CHAIN_ID }],
        });
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: NETWORK_CONFIG.CHAIN_ID,
                        chainName: NETWORK_CONFIG.NETWORK_NAME,
                        nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
                        rpcUrls: [NETWORK_CONFIG.RPC_URL],
                        blockExplorerUrls: ['https://coston2-explorer.flare.network']
                    }]
                });
                return true;
            } catch (addError) {
                console.error("Failed to add network:", addError);
            }
        }
        return false;
    }
};

const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed!');
        return null;
    }
    await switchNetwork();
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        updateWalletUI(accounts[0]);
        return accounts[0];
    } catch (error) {
        console.error("Connection denied:", error);
        return null;
    }
};

const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId === NETWORK_CONFIG.CHAIN_ID) {
                    updateWalletUI(accounts[0]);
                }
            }
        } catch (err) {
            console.error("Auto-connect failed:", err);
        }
    }
};

// --- 4. BLOCKCHAIN ACTIONS (THE FIX) ---
const mintKnowledgeNFT = async (proofId, topic, tokenURI) => {
    // 1. Force a Fresh Provider Check
    if (typeof window.ethereum === 'undefined') throw new Error("No Wallet Found");
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // 2. Ensure we can get the address (Proof we are connected)
    try {
        const address = await signer.getAddress();
        console.log("📝 Minting as:", address);
    } catch (e) {
        // If getting address fails, trigger connect
        await connectWallet();
    }

    try {
        const nftContract = new ethers.Contract(CONTRACT_ADDRESSES.KNOWLEDGE_NFT, KNOWLEDGE_NFT_ABI, signer);
        const mintValue = ethers.utils.parseEther(MINT_VALUE_FLR);
        
        console.log("🚀 Sending Transaction...");
        const tx = await nftContract.mintKnowledgeNFT(
            proofId, topic, tokenURI, 
            { value: mintValue, gasLimit: GAS_LIMIT }
        );

        console.log("✅ Mint Tx Sent:", tx.hash);
        await tx.wait(); 
        return tx.hash;
    } catch (error) {
        console.error("Mint Error:", error);
        // Throw specific error message
        if (error.code === 4001) throw new Error("Transaction rejected by user.");
        throw error;
    }
};

// --- 5. EXPOSURE ---
window.connectWallet = connectWallet;
window.mintKnowledgeNFT = mintKnowledgeNFT;

document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('wallet-connect-btn');
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    checkConnection();
});

if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) updateWalletUI(accounts[0]);
        else updateWalletUI(null);
    });
    window.ethereum.on('chainChanged', () => window.location.reload());
}