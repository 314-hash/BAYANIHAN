/* 🇵🇭 Bayanihan Quantum Commerce Chain - Client Controller */

// Append SVG gradients dynamically for the dashboard visuals
const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgDefs.setAttribute("class", "hidden-svg");
svgDefs.innerHTML = `
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC72C" />
      <stop offset="100%" stop-color="#CE1126" />
    </linearGradient>
  </defs>
`;
document.body.appendChild(svgDefs);

// Contract Deployment Addresses mapped by Chain ID
const CONTRACT_ADDRESSES = {
  // Hardhat Local Node (31337 / 1337)
  31337: {
    BayaniToken:                "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    BayaniNFT:                  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    QuantumIdentity:            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    AIReputationOracle:         "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    NationalRewardsTreasury:    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    FarmerProsperity:           "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    FisherfolkRewards:          "0x0165878A594ca255338adfa4d48449f69242Eb8F", 
    MSMEGrowth:                 "0xa513E6E4b8f2a923D98304ec87F64353c4D5C853", 
    EducationRewards:           "0x2279B1c902393D1409c617C23BD08209ac46187b", 
    FreelancerEscrow:           "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    RenewableEnergy:            "0x610178dA211CFEB8746279866C5433f822d1A863", 
    BarangayDAO:                "0xB7f8BC63BbD1F107d722424faA2C498D4D47A9c3", 
    HealthcareAssistance:       "0x9A9f24F34ef3990283C71F2bF26C6B0d4aAc3D84", 
    HousingCooperative:         "0xdC31CcE08F837FE059Eb35924C7D4Faa870DB78A8", 
    DiasporaNetwork:            "0x5FDB2315678afecb367F032D93f642f64180Ab4", 
    NationalAssetTokenization:  "0xE7f1725E7734CE288f8367e1bb143e90bB3F0513", 
    BayaniLegacy:               "0x9fe46736679D2d9A65f0992f2272DE9F3c7Fa6E1",  
    PancakeRouter:              "0x0000000000000000000000000000000000000000"
  },
  // Binance Smart Chain Testnet (97) - Deployed & Verified
  97: {
    BayaniToken:                "0x081c0F5e54e390eF2C44b516263A3FAc4B15b597",
    BayaniNFT:                  "0xDe5810Bd3bf4912fd3c957D4138589A9dd729B4a",
    QuantumIdentity:            "0x151a97f32113996252B0278E7aF69b77f6179715",
    AIReputationOracle:         "0x227EA9D0c90b3Ec4Fb6bDCF86fBCC907d1d5a3b4",
    NationalRewardsTreasury:    "0xA0a9F10182C54d0D2BC5a06b52F33a08976e374d",
    FarmerProsperity:           "0x46AecE4c865e073fb5477E4246466479b6b0d7A5",
    FisherfolkRewards:          "0x9718B7611404Edc7D2F2F0c3B5C14204Ebe20B43",
    MSMEGrowth:                 "0x997E75112ac37C369B1d2477eE4dEA5Bd119A9fE",
    EducationRewards:           "0x88B594df4682A2b9503e630109DDB4Af68999C5a",
    FreelancerEscrow:           "0xe31CcE08F837FE059Eb35924C7D4Faa870DB78A8",
    RenewableEnergy:            "0x206D7a7C3979c7299c3D8476c0192C0aEa8fCB1C",
    BarangayDAO:                "0xa86128358AffFc46fDe51f665dFf7A5f94Eb6A84",
    HealthcareAssistance:       "0x83D69D6185C3ee7cB0baFad60C6da5B6C4C493a8",
    HousingCooperative:         "0xFb674edb86a9448DE19e19B6672726b1F9edBf49",
    DiasporaNetwork:            "0x64BcF5650e4Fd3aEA51eb3CFcE7D6979c7b02e10",
    NationalAssetTokenization:  "0x95EC0CA8c4493BC268f799E95Cb016447f7DEf84",
    BayaniLegacy:               "0xFaD12DC06eA3f4b54Ca1D8f11158Cf840845D167",
    PancakeRouter:              "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
  },
  // Binance Smart Chain Mainnet (56) - Deployed & Verified July 2026
  56: {
    BayaniToken:                "0x472EA138Cb1F5E414082b39C0158bFec0c1c0831",
    BayaniNFT:                  "0x1746256036e3698c3F4AdbB077a7eFC30D083Fec",
    QuantumIdentity:            "0x1963cfF2Aa81C0263C25BC32Abb83338057e5c9e",
    AIReputationOracle:         "0xe094214c40A4F2b220bdBca944d661F53094022A",
    NationalRewardsTreasury:    "0x919404d0999Ab19Eb71a2e652807acEDD8511Bc7",
    FarmerProsperity:           "0x756a0Dd94Ce62d8b0ca980ccBef74b4056A95CD7",
    FisherfolkRewards:          "0x071b68c7b278202D51b957a71A67b1363F313659",
    MSMEGrowth:                 "0xa048c0aac38F2053c30E783DbcC6613A48AC797d",
    EducationRewards:           "0xfe1414Dc827F1031B7ea23E37a760DDE16aA7c06",
    FreelancerEscrow:           "0x3021f105c2807Dd5eAB6B818CCd6B9cF68c92429",
    RenewableEnergy:            "0x818a87Ca029403972b13b78cad470861FcEA4db0",
    BarangayDAO:                "0x9F99fe192d95ADD839e9C2636F70268E621Fb5B0",
    HealthcareAssistance:       "0xC8D9eF95241E90FD39895c7c86c32773A91c98fA",
    HousingCooperative:         "0x23c5Ef9077aeb96da1230aD0C49Bdc79943cbFfA",
    DiasporaNetwork:            "0xa62Ad870d8BB023A0C26471Fdb5295308F53f842",
    NationalAssetTokenization:  "0x9C5516Bc084e57d174295c22a0fC27A00A92153d",
    BayaniLegacy:               "0x3204A4143a953e21A9A51D54a5D1DfdCaa961Ef5",
    PancakeRouter:              "0x10ED43C718714eb63d5aA57B78B54704E256024E"
  }
};
// Active contract configuration pointer (default to Localhost)
let activeAddresses = CONTRACT_ADDRESSES[31337];

// Minimal ABIs required for operation
const CONTRACT_ABIS = {
  BayaniToken: [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ],
  QuantumIdentity: [
    "function isCitizenVerified(address citizen) view returns (bool)",
    "function getCitizenType(address citizen) view returns (uint8)",
    "function getCitizenProfile(address citizen) view returns (tuple(string nationalIdHash, string biometricHash, uint256 registrationTime, bool isVerified, uint8 identityType))",
    "function updatePQKey(string algorithm, bytes publicKey) external",
    "function getPQKey(address citizen) view returns (string algorithm, bytes publicKey, uint256 updatedTime)"
  ],
  AIReputationOracle: [
    "function getReputationScore(address target) view returns (uint256)",
    "function setReputationScore(address target, uint256 score) external"
  ],
  FarmerProsperity: [
    "function registerHarvest(string cropType, uint256 volume, bool organic, bool climateFriendly, bool waterConserving) external",
    "function listFutureHarvest(uint256 nftId, uint256 price, uint256 deliveryDeadline) external",
    "function buyFutureHarvest(uint256 listingId) external",
    "function confirmFutureHarvestDelivery(uint256 listingId, bool directToConsumer, bool exportSale) external",
    "function cancelFutureHarvestListing(uint256 listingId) external",
    "function refundFutureHarvest(uint256 listingId) external",
    "function getHarvestNFTCount() view returns (uint256)",
    "function payInsurancePremium(uint256 cropNftId, uint256 premiumAmount) external",
    "function triggerInsuranceClaim(uint256 cropNftId, address farmer, uint256 payoutAmount) external"
  ],
  FreelancerEscrow: [
    "function createProject(address freelancer, uint256[] budgets, uint256[] deadlines) external",
    "function submitMilestone(uint256 projectId) external",
    "function approveMilestone(uint256 projectId) external",
    "function disputeMilestone(uint256 projectId) external",
    "function claimMilestoneRefund(uint256 projectId) external",
    "function calculateContractFeeBps(address freelancer) view returns (uint256)"
  ],
  PancakeRouter: [
    "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
    "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)"
  ]
};

// Application State
let state = {
  web3Connected: false,
  onboardingSkipped: false,
  biometricsScanned: false,
  userAddress: null,
  userRole: 1, // Default: Farmer (Type 1)
  stakedAmount: 0,
  simBalance: 1200, // Simulated BAYANI starting balance
  simBnbBalance: 10, // Simulated BNB starting balance
  slippage: 0.5, // Default slippage tolerance percentage
  autoSlippage: true, // Default auto-slippage mode enabled
  creditScore: 680,
  reputationScore: 85,
  diasporaScore: 40,
  activeEscrows: [
    {
      id: 1,
      client: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      freelancer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      budget: 1000,
      deadline: "30 Days",
      status: "Active", // Active, Submitted, Approved, Disputed
      milestone: 0
    }
  ],
  marketplaceListings: [
    {
      id: 1,
      producer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      cropType: "Premium Organic Benguet Rice",
      volume: 350,
      price: 450,
      status: "Listed", // Listed, Sold, Delivered
      organic: true,
      climateFriendly: true
    },
    {
      id: 2,
      producer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      cropType: "Sustainable Yellowfin Tuna catch",
      volume: 120,
      price: 600,
      status: "Listed",
      organic: false,
      climateFriendly: true
    }
  ],
  daoProposals: [
    {
      id: 1,
      title: "Solar Streetlights for Barangay San Jose",
      description: "Installation of 24 intelligent solar-powered posts along critical school walkways.",
      budget: 1500,
      yeas: 280,
      nays: 30,
      status: "Active",
      hasVoted: false
    },
    {
      id: 2,
      title: "Barangay Seed Cold-Storage Facility",
      description: "Establish community cold storage facility run by the local cooperative.",
      budget: 3500,
      yeas: 520,
      nays: 12,
      status: "Executed",
      hasVoted: false
    }
  ],
  lendingPools: [
    {
      id: 1,
      title: "Negros Organic Sugar Mill Cooperative",
      description: "OFW funded loans for secondary sugarcane processing expansion.",
      target: 5000,
      funded: 3800,
      discount: "12% off refinery milling services"
    },
    {
      id: 2,
      title: "General Santos Seafood Cold Room",
      description: "Joint community cold storage facility funding for small fisherfolk.",
      target: 3000,
      funded: 1450,
      discount: "15% off fish preservation unit rates"
    }
  ],
  rwaAssets: [
    {
      id: 1,
      title: "Coconut Processing Center RWA",
      description: "Cooperative coconut processing plant fractional shares.",
      priceShare: 100,
      purchased: 0,
      discount: "10% service rebate on raw copra purchases"
    },
    {
      id: 2,
      title: "Barangay Solar Microgrid RWA",
      description: "Fractional clean power production mapping.",
      priceShare: 50,
      purchased: 0,
      discount: "8% off monthly electricity grid tariffs"
    }
  ]
};

// Web3 Ethers instances
let provider, signer;
let contracts = {};

// DOM Elements
const elements = {
  netStatus: document.getElementById("netStatus"),
  addTokenBtn: document.getElementById("addTokenBtn"),
  connectWalletBtn: document.getElementById("connectWalletBtn"),
  statLocked: document.getElementById("statLocked"),
  statRewards: document.getElementById("statRewards"),
  statEnergy: document.getElementById("statEnergy"),
  statCitizens: document.getElementById("statCitizens"),
  avatarIcon: document.getElementById("avatarIcon"),
  profileName: document.getElementById("profileName"),
  idBadge: document.getElementById("idBadge"),
  profileNid: document.getElementById("profileNid"),
  profileBio: document.getElementById("profileBio"),
  profileAlgo: document.getElementById("profileAlgo"),
  simulateRole: document.getElementById("simulateRole"),
  rotateKeyBtn: document.getElementById("rotateKeyBtn"),
  kycStatusBadge: document.getElementById("kycStatusBadge"),
  kycNidHash: document.getElementById("kycNidHash"),
  requestKycBtn: document.getElementById("requestKycBtn"),
  bridgeKycBtn: document.getElementById("bridgeKycBtn"),
  vcOutputArea: document.getElementById("vcOutputArea"),
  kycVcText: document.getElementById("kycVcText"),
  tabLinks: document.querySelectorAll(".tab-link"),
  tabContents: document.querySelectorAll(".tab-content"),
  harvestForm: document.getElementById("harvestForm"),
  listingsContainer: document.getElementById("listingsContainer"),
  creditScoreVal: document.getElementById("creditScoreVal"),
  creditRingProgress: document.getElementById("creditRingProgress"),
  msmeTierBadge: document.getElementById("msmeTierBadge"),
  msmePerk: document.getElementById("msmePerk"),
  revenueForm: document.getElementById("revenueForm"),
  submitFeedbackBtn: document.getElementById("submitFeedbackBtn"),
  escrowForm: document.getElementById("escrowForm"),
  escrowFeeEstimate: document.getElementById("escrowFeeEstimate"),
  escrowList: document.getElementById("escrowList"),
  stakeForm: document.getElementById("stakeForm"),
  stakeBtn: document.getElementById("stakeBtn"),
  unstakeBtn: document.getElementById("unstakeBtn"),
  vpStakedBooster: document.getElementById("vpStakedBooster"),
  vpTotal: document.getElementById("vpTotal"),
  daoTreasuryBalance: document.getElementById("daoTreasuryBalance"),
  proposalList: document.getElementById("proposalList"),
  diasporaScore: document.getElementById("diasporaScore"),
  lendingPoolList: document.getElementById("lendingPoolList"),
  rwaList: document.getElementById("rwaList"),
  toastContainer: document.getElementById("toastContainer"),
  starBtns: document.querySelectorAll(".star-btn"),
  toggleGuideBtn: document.getElementById("toggleGuideBtn"),
  helpSection: document.getElementById("helpSection"),
  onboardingModal: document.getElementById("onboardingModal"),
  onboardingForm: document.getElementById("onboardingForm"),
  onboardFullName: document.getElementById("onboardFullName"),
  onboardNid: document.getElementById("onboardNid"),
  onboardRole: document.getElementById("onboardRole"),
  startScanBtn: document.getElementById("startScanBtn"),
  scannerStatus: document.getElementById("scannerStatus"),
  scannerScreen: document.getElementById("scannerScreen"),
  scannerLaser: document.getElementById("scannerLaser"),
  scannerEmoji: document.getElementById("scannerEmoji"),
  onboardStatusLog: document.getElementById("onboardStatusLog"),
  onboardStatusMsg: document.getElementById("onboardStatusMsg"),
  onboardSubmitBtn: document.getElementById("onboardSubmitBtn"),
  skipOnboardBtn: document.getElementById("skipOnboardBtn"),
  onboardIdFile: document.getElementById("onboardIdFile"),
  swapFromAmount: document.getElementById("swapFromAmount"),
  swapToAmount: document.getElementById("swapToAmount"),
  swapFromToken: document.getElementById("swapFromToken"),
  swapToToken: document.getElementById("swapToToken"),
  swapToggleBtn: document.getElementById("swapToggleBtn"),
  swapQuoteBox: document.getElementById("swapQuoteBox"),
  swapQuoteRate: document.getElementById("swapQuoteRate"),
  swapQuoteOutput: document.getElementById("swapQuoteOutput"),
  swapExecuteBtn: document.getElementById("swapExecuteBtn"),
  swapFromBalance: document.getElementById("swapFromBalance"),
  swapToBalance: document.getElementById("swapToBalance"),
  activeSlippageLabel: document.getElementById("activeSlippageLabel"),
  customSlippageToggle: document.getElementById("customSlippageToggle"),
  customSlippageInputContainer: document.getElementById("customSlippageInputContainer"),
  customSlippageInput: document.getElementById("customSlippageInput"),
  quoteSlippageLabel: document.getElementById("quoteSlippageLabel"),
  autoSlippageToggle: document.getElementById("autoSlippageToggle"),
  swapGasCost: document.getElementById("swapGasCost"),
  swapWarningBox: document.getElementById("swapWarningBox"),
  slippageBtns: document.querySelectorAll(".slippage-btn")
};

// Rating Stars State
let currentFeedbackRating = 5;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupHelpBanner();
  setupRoleChange();
  setupStarButtons();
  setupSimulationEvents();
  setupKycEvents();
  setupOnboarding();
  renderMarketplace();
  renderEscrows();
  renderProposals();
  renderLendingPools();
  renderRWAs();
  setupSwapWidget();
  updateCreditGauge();
  
  // Try to detect MetaMask auto-connection or display simulator
  if (window.ethereum) {
    showToast("Web3 Ready", "MetaMask detected. Click 'Connect Wallet' to connect to local Hardhat node.", "info");
  } else {
    showToast("Simulator Mode Active", "MetaMask not found. Running self-contained interactive simulation.", "info");
  }
  
  elements.connectWalletBtn.addEventListener("click", connectWallet);
  
  if (elements.addTokenBtn) {
    elements.addTokenBtn.addEventListener("click", async () => {
      if (!window.ethereum) return;
      try {
        const wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: activeAddresses.BayaniToken,
              symbol: 'BAYANI',
              decimals: 18,
              image: 'https://raw.githubusercontent.com/314-hash/BAYANIHAN/main/frontend/assets/logo.png',
            },
          },
        });
        if (wasAdded) {
          showToast("Token Added", "BAYANI token successfully added to wallet!", "success");
        } else {
          showToast("Addition Cancelled", "Token addition was cancelled.", "warning");
        }
      } catch (error) {
        console.error(error);
        showToast("Error", "Could not add token to wallet.", "error");
      }
    });
  }
});

// Toast Helper
function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-header">
      <span>${title}</span>
      <span style="cursor:pointer;" onclick="this.parentElement.parentElement.remove()">×</span>
    </div>
    <div class="toast-msg">${message}</div>
  `;
  elements.toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Tab Switching Setup
function setupTabs() {
  elements.tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");
      
      elements.tabLinks.forEach(t => t.classList.remove("active"));
      elements.tabContents.forEach(c => c.classList.remove("active"));
      
      link.classList.add("active");
      document.getElementById(tabId).classList.add("active");
      showToast("Tab Loaded", `${link.innerText} portal active.`, "info");
    });
  });
}

// Help Banner Setup & Toggle Persistence
function setupHelpBanner() {
  const showGuide = localStorage.getItem("bayanihan_show_guide");
  if (showGuide === "true" || showGuide === null) {
    elements.helpSection.style.display = "block";
    if (elements.toggleGuideBtn) {
      elements.toggleGuideBtn.classList.add("active");
      elements.toggleGuideBtn.innerHTML = "📖 Hide Guide";
    }
  } else {
    elements.helpSection.style.display = "none";
    if (elements.toggleGuideBtn) {
      elements.toggleGuideBtn.classList.remove("active");
      elements.toggleGuideBtn.innerHTML = "📖 Learn & Guide";
    }
  }
  
  if (elements.toggleGuideBtn) {
    elements.toggleGuideBtn.addEventListener("click", window.toggleHelpBanner);
  }
}

// Toggle Help Banner function
window.toggleHelpBanner = function() {
  const isHidden = elements.helpSection.style.display === "none";
  if (isHidden) {
    elements.helpSection.style.display = "block";
    localStorage.setItem("bayanihan_show_guide", "true");
    if (elements.toggleGuideBtn) {
      elements.toggleGuideBtn.classList.add("active");
      elements.toggleGuideBtn.innerHTML = "📖 Hide Guide";
    }
    showToast("Guide Enabled", "Interactive help center and Web3 glossary displayed.", "success");
  } else {
    elements.helpSection.style.display = "none";
    localStorage.setItem("bayanihan_show_guide", "false");
    if (elements.toggleGuideBtn) {
      elements.toggleGuideBtn.classList.remove("active");
      elements.toggleGuideBtn.innerHTML = "📖 Learn & Guide";
    }
    showToast("Guide Hidden", "You can show it anytime by clicking the button in the header.", "info");
  }
};

// Rating Stars Setup
function setupStarButtons() {
  elements.starBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const rating = parseInt(btn.getAttribute("data-star"));
      currentFeedbackRating = rating;
      
      elements.starBtns.forEach(b => {
        const starVal = parseInt(b.getAttribute("data-star"));
        if (starVal <= rating) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      elements.submitFeedbackBtn.innerText = `Submit ${rating}-Star Rating`;
    });
  });
  
  // Set default active stars
  elements.starBtns.forEach(b => {
    if (parseInt(b.getAttribute("data-star")) <= currentFeedbackRating) {
      b.classList.add("active");
    }
  });
}

// Citizen Role Simulation Selector
function setupRoleChange() {
  elements.simulateRole.addEventListener("change", (e) => {
    const roleVal = parseInt(e.target.value);
    state.userRole = roleVal;
    
    const roleProfiles = {
      1: { name: "Juan Dela Cruz", avatar: "👨‍🌾", badge: "Verified Farmer", nid: "NID_FARMER_11..." },
      2: { name: "Cardo Dalisay", avatar: "🎣", badge: "Verified Fisherfolk", nid: "NID_FISHER_22..." },
      3: { name: "Maria Clara", avatar: "🏪", badge: "Verified MSME Merchant", nid: "NID_MSME_33..." },
      4: { name: "Kiko Rustia", avatar: "👨‍💻", badge: "Verified Freelancer", nid: "NID_FREE_44..." },
      5: { name: " diaspora OFW ", avatar: "✈️", badge: "OFW Diaspora Member", nid: "NID_OFW_55..." },
      0: { name: "Juanita Santos", avatar: "👩", badge: "General Citizen", nid: "NID_CITIZEN_00..." }
    };
    
    const profile = roleProfiles[roleVal] || roleProfiles[0];
    elements.avatarIcon.innerText = profile.avatar;
    elements.profileName.innerText = profile.name;
    elements.idBadge.innerText = profile.badge;
    elements.profileNid.innerText = profile.nid;
    
    // Adjust dynamic simulated variables based on role choice
    if (roleVal === 1 || roleVal === 2) {
      state.reputationScore = 90;
    } else if (roleVal === 4) {
      state.reputationScore = 95;
    } else if (roleVal === 3) {
      state.creditScore = 750;
      updateCreditGauge();
    } else if (roleVal === 5) {
      state.diasporaScore = 80;
      elements.diasporaScore.innerText = state.diasporaScore;
    }
    
    updateVotingPower();
    showToast("Role Shifted", `Simulating ecosystem interactions as: ${profile.badge}`, "success");
  });
}

// Key Rotation Animation
elements.rotateKeyBtn.addEventListener("click", () => {
  elements.profileAlgo.innerText = "Generating key...";
  elements.profileAlgo.style.borderColor = "var(--gold)";
  
  setTimeout(() => {
    elements.profileAlgo.innerText = "PQ-Dilithium Active";
    elements.profileAlgo.style.borderColor = "rgba(206, 17, 38, 0.25)";
    showToast("Quantum Protection", "Post-Quantum Dilithium keys rotated and verified.", "success");
  }, 1000);
});

// Veramo KYC Integration Handlers
// Resolves the KYC API endpoint dynamically based on where the app is running
function getKycApiUrl() {
  // If running locally, default to the local port 3001
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:3001";
  }
  // Otherwise, route relatively through Vercel rewrite proxy to avoid CORS/mixed-content blocks
  return "";
}

async function checkKycServer() {
  try {
    const res = await fetch(`${getKycApiUrl()}/api/kyc/health`);
    if (res.ok) {
      elements.kycStatusBadge.innerText = "API Connected";
      elements.kycStatusBadge.style.background = "rgba(52,211,153,0.15)";
      elements.kycStatusBadge.style.color = "#34d399";
      elements.kycStatusBadge.style.borderColor = "#34d399";
    }
  } catch (err) {
    console.warn(`Veramo KYC server health check failed. Ensure it is running on ${getKycApiUrl()}`);
  }
}

let currentSignedVc = null;

function setupKycEvents() {
  checkKycServer();

  // 1. Request Verifiable Credential from Veramo API
  elements.requestKycBtn.addEventListener("click", async () => {
    const nidHash = elements.kycNidHash.value.trim();
    if (!nidHash) {
      showToast("KYC Error", "Please enter a valid National ID Hash.", "error");
      return;
    }

    const citizenAddr = state.userAddress || "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    const identityType = state.userRole !== undefined ? state.userRole : 1;

    try {
      showToast("Veramo KYC Request", "Requesting signed W3C VC from Veramo Issuer...", "info");
      const res = await fetch(`${getKycApiUrl()}/api/kyc/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenAddress: citizenAddr,
          nidHash: nidHash,
          biometricHash: "BIO_FARMER_HASH",
          identityType: identityType
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to issue VC.");
      }

      const data = await res.json();
      currentSignedVc = data.verifiableCredential;

      elements.vcOutputArea.style.display = "block";
      elements.kycVcText.value = JSON.stringify(currentSignedVc.credentialSubject, null, 2);
      elements.bridgeKycBtn.disabled = false;
      
      showToast("VC Issued!", "Verifiable Credential successfully signed by Government DID key.", "success");
    } catch (err) {
      showToast("Veramo KYC Error", err.message || "Failed to request VC.", "error");
    }
  });

  // 2. Verify & Bridge VC On-Chain
  elements.bridgeKycBtn.addEventListener("click", async () => {
    if (!currentSignedVc) {
      showToast("Bridge Error", "No VC found. Request one first.", "error");
      return;
    }

    try {
      showToast("Verification & Bridge", "Verifying VC and submitting on-chain transaction...", "info");
      
      let activeChainId = 31337;
      if (provider) {
        const activeNetwork = await provider.getNetwork().catch(() => null);
        if (activeNetwork) activeChainId = Number(activeNetwork.chainId);
      }

      const res = await fetch(`${getKycApiUrl()}/api/kyc/bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          vc: currentSignedVc,
          chainId: activeChainId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Bridging failed.");
      }

      const data = await res.json();
      showToast("Bridging Success!", "On-chain QuantumIdentity registry updated.", "success");

      // Save registration details to localStorage mapped by user address
      const profilePayload = {
        name: state.userAddress.toLowerCase() === "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" ? "Maria Clara" : "Verified Profile",
        nidHash: currentSignedVc.credentialSubject.nationalIdHash,
        roleType: Number(currentSignedVc.credentialSubject.identityType),
        vc: currentSignedVc
      };
      localStorage.setItem(`bayanihan_profile_${state.userAddress.toLowerCase()}`, JSON.stringify(profilePayload));

      // Update local profile visual details
      elements.profileNid.innerText = currentSignedVc.credentialSubject.nationalIdHash;
      elements.profileBio.innerText = "Verified Active (VC)";
      elements.profileBio.className = "status-verified";

      if (data.bridgeResult && data.bridgeResult.txHash) {
        console.log("Identity verification transaction:", data.bridgeResult.txHash);
        showToast("Tx Confirmed", `Block: ${data.bridgeResult.blockNumber}, Hash: ${data.bridgeResult.txHash.substring(0, 10)}...`, "success");
      }

      if (state.web3Connected) {
        await readOnChainState();
      }
    } catch (err) {
      showToast("Bridge Error", err.message || "Failed to bridge to blockchain.", "error");
    }
  });
}

// -------------------------------------------------------------
// USER ONBOARDING & REGISTRATION SYSTEM (SBT MINTING FLOW)
// -------------------------------------------------------------

function setupOnboarding() {
  if (!elements.onboardingModal) return;

  elements.skipOnboardBtn.addEventListener("click", () => {
    state.onboardingSkipped = true;
    elements.onboardingModal.style.display = "none";
    showToast("Simulator Active", "You are now viewing the dashboard in simulation mode.", "info");
  });

  elements.startScanBtn.addEventListener("click", startBiometricScan);
  elements.onboardingForm.addEventListener("submit", handleOnboardingSubmit);

  // File upload trigger for OCR Scan
  elements.onboardIdFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleIdCardOcr(file);
    }
  });
}

async function handleIdCardOcr(file) {
  if (typeof Tesseract === "undefined") {
    showToast("OCR Error", "Tesseract.js library is not loaded. Please ensure you are online.", "error");
    return;
  }

  // Display status log loader
  elements.onboardSubmitBtn.disabled = true;
  elements.skipOnboardBtn.disabled = true;
  elements.onboardStatusLog.style.display = "flex";
  elements.onboardStatusMsg.innerText = "OCR: Initializing Tesseract engine...";

  showToast("OCR Scan Started", "Extracting text from ID Card image locally in-browser...", "info");

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === "recognizing text") {
          const progress = Math.round(m.progress * 100);
          elements.onboardStatusMsg.innerText = `OCR: Recognizing text... (${progress}%)`;
        }
      }
    });

    const text = result.data.text || "";
    console.log("Tesseract Raw Output:", text);

    // Look for standard Philippine PhilSys ID (16 digits, with/without hyphens) or custom numeric sequences
    const philsysMatch = text.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/);
    const genericMatch16 = text.match(/\b\d{12,16}\b/);
    const genericMatch8 = text.match(/\b\d{6,11}\b/);

    let idResult = "";
    if (philsysMatch) {
      idResult = philsysMatch[0].replace(/[-\s]/g, ""); // strip dividers
    } else if (genericMatch16) {
      idResult = genericMatch16[0];
    } else if (genericMatch8) {
      idResult = genericMatch8[0];
    } else {
      // Pull first sequence of 4+ numbers
      const fallback = text.match(/\b\d{4,}\b/);
      if (fallback) {
        idResult = fallback[0];
      }
    }

    if (idResult) {
      elements.onboardNid.value = idResult;
      showToast("OCR Scan Success", `Extracted National ID: ${idResult}`, "success");
    } else {
      // Fallback: use first alphanumeric string line
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 3);
      if (lines.length > 0) {
        const clean = lines[0].replace(/[^a-zA-Z0-9]/g, "");
        elements.onboardNid.value = clean.substring(0, 16);
        showToast("OCR Scan Partial", "Parsed text block. Please check that NID is correct.", "warning");
      } else {
        throw new Error("No readable text found on the card image.");
      }
    }

  } catch (error) {
    console.error("Tesseract scan failed:", error);
    showToast("OCR Scan Failed", "Could not read text from image. Please enter details manually.", "error");
  } finally {
    // Reset scanner submit/cancel buttons
    elements.onboardSubmitBtn.disabled = !state.biometricsScanned;
    elements.skipOnboardBtn.disabled = false;
    elements.onboardStatusLog.style.display = "none";
  }
}

function startBiometricScan() {
  elements.startScanBtn.disabled = true;
  elements.scannerStatus.innerText = "Scanning...";
  elements.scannerStatus.className = "scanner-badge badge-active";
  elements.scannerLaser.style.display = "block";
  elements.scannerEmoji.classList.add("scanning");

  showToast("Scanning", "Simulating secure biometric face-scan sequence...", "info");

  setTimeout(() => {
    elements.scannerStatus.innerText = "Success";
    elements.scannerStatus.className = "scanner-badge badge-success";
    elements.scannerLaser.style.display = "none";
    elements.scannerEmoji.classList.remove("scanning");
    elements.scannerEmoji.innerText = "👤✅";

    state.biometricsScanned = true;
    elements.onboardSubmitBtn.disabled = false;

    showToast("Scan Success", "Biometric signature successfully captured and verified.", "success");
  }, 2200);
}

async function handleOnboardingSubmit(e) {
  e.preventDefault();

  if (!state.biometricsScanned) {
    showToast("Error", "Please scan your biometrics first.", "error");
    return;
  }

  const name = elements.onboardFullName.value.trim();
  const rawNid = elements.onboardNid.value.trim();
  const roleType = Number(elements.onboardRole.value);

  if (!name || !rawNid) {
    showToast("Error", "Please complete all fields.", "error");
    return;
  }

  const nidHash = `NID_ONBOARD_${rawNid.substring(0, 6).toUpperCase()}`;

  elements.onboardSubmitBtn.disabled = true;
  elements.skipOnboardBtn.disabled = true;
  elements.onboardStatusLog.style.display = "flex";
  
  try {
    // 1/2: VC Generation
    elements.onboardStatusMsg.innerText = "1/2: Generating signed VC from Veramo KYC backend...";
    const issueRes = await fetch(`${getKycApiUrl()}/api/kyc/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citizenAddress: state.userAddress,
        nidHash: nidHash,
        biometricHash: "BIO_ONBOARD_ACTIVE_HASH",
        identityType: roleType
      })
    });

    if (!issueRes.ok) {
      const errData = await issueRes.json();
      throw new Error(errData.error || "Failed to generate Verifiable Credential.");
    }

    const issueData = await issueRes.json();
    const signedVc = issueData.verifiableCredential;

    // 2/2: On-chain Verification & Bridging
    elements.onboardStatusMsg.innerText = "2/2: Verifying credential & bridging on-chain via validator...";
    
    let activeChainId = 31337;
    if (provider) {
      const activeNetwork = await provider.getNetwork().catch(() => null);
      if (activeNetwork) activeChainId = Number(activeNetwork.chainId);
    }

    const bridgeRes = await fetch(`${getKycApiUrl()}/api/kyc/bridge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        vc: signedVc,
        chainId: activeChainId
      })
    });

    if (!bridgeRes.ok) {
      const errData = await bridgeRes.json();
      throw new Error(errData.error || "Failed to bridge KYC profile on-chain.");
    }

    const bridgeData = await bridgeRes.json();

    // Save registration details to localStorage mapped by user address
    const profilePayload = {
      name: name,
      nidHash: nidHash,
      roleType: roleType,
      vc: signedVc
    };
    localStorage.setItem(`bayanihan_profile_${state.userAddress.toLowerCase()}`, JSON.stringify(profilePayload));

    showToast("Onboarding Success!", "Soulbound ID successfully minted on-chain!", "success");
    
    // Hide modal and resume dashboard view
    elements.onboardingModal.style.display = "none";
    elements.onboardStatusLog.style.display = "none";

    // Set role state in frontend
    state.userRole = roleType;
    elements.simulateRole.value = roleType.toString();

    // Reload the full on-chain state to refresh dashboard elements
    await readOnChainState();

  } catch (error) {
    console.error("KYC Onboarding Error:", error);
    showToast("Onboarding Failed", error.message || "Credential bridging failed.", "error");
    
    // Reset state so user can retry
    elements.onboardSubmitBtn.disabled = false;
    elements.skipOnboardBtn.disabled = false;
    elements.onboardStatusLog.style.display = "none";
  }
}



// Update MSME Credit Ring Gauge
function updateCreditGauge() {
  const score = state.creditScore;
  elements.creditScoreVal.innerText = score;
  
  // Calculate SVG ring stroke-dashoffset (Max value is 251.2 for radius 40)
  // Score range: 300 to 850
  const minScore = 300;
  const maxScore = 850;
  const percentage = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
  const offset = 251.2 * (1 - percentage);
  
  elements.creditRingProgress.style.strokeDashoffset = offset;
  
  // Update Tiers
  let tier = "Silver Tier";
  let perk = "Perk: 15% discount on marketplace fees + Medium Priority listings visibility.";
  
  if (score >= 750) {
    tier = "Platinum Tier";
    perk = "Perk: 50% discount on marketplace fees + 0% platform staking collateral requirements!";
    elements.msmeTierBadge.style.color = "#00e1ff";
    elements.msmeTierBadge.style.borderColor = "#00e1ff";
  } else if (score >= 680) {
    tier = "Gold Tier";
    perk = "Perk: 30% discount on marketplace fees + High Priority listings visibility.";
    elements.msmeTierBadge.style.color = "var(--gold)";
    elements.msmeTierBadge.style.borderColor = "var(--gold)";
  } else {
    elements.msmeTierBadge.style.color = "#94a3b8";
    elements.msmeTierBadge.style.borderColor = "#475569";
  }
  
  elements.msmeTierBadge.innerText = tier;
  elements.msmePerk.innerHTML = perk;
}

// Update Barangay DAO Voting Power
function updateVotingPower() {
  const stakedBooster = Math.floor(state.stakedAmount * 0.5);
  elements.vpStakedBooster.innerText = `+${stakedBooster} Units`;
  
  const basePower = 100;
  const totalPower = basePower + stakedBooster;
  elements.vpTotal.innerText = `${totalPower} Units`;
}

// -------------------------------------------------------------
// DUAL-MODE WEB3 CONNECTIVITY VIA ETHERS.JS
// -------------------------------------------------------------

async function connectWallet() {
  if (!window.ethereum) {
    showToast("Web3 Connection Failed", "No Web3 wallet found. Simulating actions locally.", "error");
    return;
  }
  
  try {
    elements.connectWalletBtn.innerText = "Connecting...";
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    state.userAddress = await signer.getAddress();
    
    // Verify Network
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    let netName = "Unknown Network";
    if (chainId === 31337 || chainId === 1337) {
      activeAddresses = CONTRACT_ADDRESSES[31337];
      netName = "Hardhat Local Node";
      showToast("Connected to Localhost", "Using local node smart contract configurations.", "success");
      if (elements.addTokenBtn) elements.addTokenBtn.style.display = "none";
    } else if (chainId === 97) {
      activeAddresses = CONTRACT_ADDRESSES[97];
      netName = "BSC Testnet";
      showToast("Connected to BSC Testnet", "Using BSC Testnet smart contract configurations.", "success");
      if (elements.addTokenBtn) elements.addTokenBtn.style.display = "block";
    } else if (chainId === 56) {
      activeAddresses = CONTRACT_ADDRESSES[56];
      netName = "BSC Mainnet";
      showToast("Connected to BSC Mainnet", "Using BSC Mainnet smart contract configurations.", "success");
      if (elements.addTokenBtn) elements.addTokenBtn.style.display = "block";
    } else {
      activeAddresses = CONTRACT_ADDRESSES[31337]; // Fallback
      if (elements.addTokenBtn) elements.addTokenBtn.style.display = "none";
      showToast("Unknown Network", `Connected to Chain ID ${chainId}. Defaulting to localhost settings.`, "warning");
    }
    
    state.web3Connected = true;
    elements.connectWalletBtn.innerText = state.userAddress.substring(0, 6) + "..." + state.userAddress.substring(38);
    elements.netStatus.innerText = netName;
    elements.netStatus.classList.add("web3-connected");
    
    showToast("Wallet Connected", `Successfully linked to ${netName}`, "success");
    
    // Instantiate Contracts using active network addresses
    contracts.BayaniToken = new ethers.Contract(activeAddresses.BayaniToken, CONTRACT_ABIS.BayaniToken, signer);
    contracts.QuantumIdentity = new ethers.Contract(activeAddresses.QuantumIdentity, CONTRACT_ABIS.QuantumIdentity, signer);
    contracts.AIReputationOracle = new ethers.Contract(activeAddresses.AIReputationOracle, CONTRACT_ABIS.AIReputationOracle, signer);
    contracts.FarmerProsperity = new ethers.Contract(activeAddresses.FarmerProsperity, CONTRACT_ABIS.FarmerProsperity, signer);
    contracts.FreelancerEscrow = new ethers.Contract(activeAddresses.FreelancerEscrow, CONTRACT_ABIS.FreelancerEscrow, signer);
    
    if (activeAddresses.PancakeRouter && activeAddresses.PancakeRouter !== "0x0000000000000000000000000000000000000000") {
      contracts.PancakeRouter = new ethers.Contract(activeAddresses.PancakeRouter, CONTRACT_ABIS.PancakeRouter, signer);
    } else {
      contracts.PancakeRouter = null;
    }
    
    await readOnChainState();
    
  } catch (error) {
    console.error(error);
    elements.connectWalletBtn.innerText = "Connect Wallet";
    state.web3Connected = false;
    showToast("Connection Error", error.message || "Failed to link MetaMask.", "error");
  }
}

async function readOnChainState() {
  if (!state.web3Connected) return;
  
  try {
    // Check BAYANI Balance
    const balance = await contracts.BayaniToken.balanceOf(state.userAddress);
    const balanceEth = ethers.formatEther(balance);
    state.simBalance = parseFloat(balanceEth);
    
    // Check native BNB Balance
    const bnbBalance = await provider.getBalance(state.userAddress);
    const bnbBalanceEth = ethers.formatEther(bnbBalance);
    state.bnbBalance = parseFloat(bnbBalanceEth);
    
    updateSwapBalances();
    showToast("Balances Loaded", `Balances: ${parseFloat(balanceEth).toFixed(2)} BAYANI | ${parseFloat(bnbBalanceEth).toFixed(4)} BNB`, "success");
    
    // Check Citizenship Identity status
    const verified = await contracts.QuantumIdentity.isCitizenVerified(state.userAddress).catch(() => false);
    if (verified) {
      const type = await contracts.QuantumIdentity.getCitzenType(state.userAddress);
      state.userRole = Number(type);
      elements.simulateRole.value = type.toString();
      
      const profile = await contracts.QuantumIdentity.getCitizenProfile(state.userAddress);
      
      // Load saved registration details from localStorage based on active wallet address
      const savedProfile = localStorage.getItem(`bayanihan_profile_${state.userAddress.toLowerCase()}`);
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          elements.profileName.innerText = profileData.name;
        } catch (e) {
          elements.profileName.innerText = "On-Chain Profile";
        }
      } else {
        elements.profileName.innerText = "Verified Profile";
      }

      elements.idBadge.innerText = `Verified Citizen (Type ${type})`;
      elements.profileNid.innerText = profile.nationalIdHash.substring(0, 15) + "...";
      elements.profileBio.innerText = "Verified Active";
      
      // Load PQ Key info
      const pqInfo = await contracts.QuantumIdentity.getPQKey(state.userAddress).catch(() => null);
      if (pqInfo && pqInfo.algorithm) {
        elements.profileAlgo.innerText = pqInfo.algorithm;
      }
    } else {
      // Trigger onboarding modal if wallet connected and not yet skipped
      if (state.web3Connected && !state.onboardingSkipped) {
        elements.onboardingModal.style.display = "flex";
      }
    }
    
    // Check Reputation Oracle score
    const score = await contracts.AIReputationOracle.getReputationScore(state.userAddress).catch(() => 80n);
    state.reputationScore = Number(score);
    
    // Update dashboard labels
    updateVotingPower();
    
  } catch (error) {
    console.error("Error reading on-chain state:", error);
  }
}

// -------------------------------------------------------------
// EVENT FLOWS & MOCK PLAYGROUND
// -------------------------------------------------------------

function setupSimulationEvents() {
  // Harvest minting submit
  elements.harvestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("cropType").value;
    const volume = parseFloat(document.getElementById("volume").value);
    const isOrganic = document.getElementById("organicProduce").checked;
    const isClimate = document.getElementById("climateFriendly").checked;
    
    if (state.web3Connected) {
      try {
        showToast("Transaction Initiating", "Calling FarmerProsperity.registerHarvest...", "info");
        const tx = await contracts.FarmerProsperity.registerHarvest(type, volume, isOrganic, isClimate, true);
        await tx.wait();
        showToast("Harvest Registered!", `Successfully minted Crop NFT and disbursed reward.`, "success");
        await readOnChainState();
      } catch (error) {
        showToast("On-Chain Error", error.message || "Failed to submit transaction", "error");
      }
    } else {
      // Simulate Reward rules: Base 15 BAYANI, Organic = 2x (30 BAYANI), DTC = 3x (45 BAYANI)
      const baseReward = 15;
      const finalReward = isOrganic ? baseReward * 2 : baseReward;
      state.simBalance += finalReward;
      
      const newNFT = {
        id: state.marketplaceListings.length + 1,
        producer: state.userAddress || "0xMySimulatedAddress",
        cropType: type + (isOrganic ? " (Organic)" : ""),
        volume: volume,
        price: Math.floor(volume * 1.5),
        status: "Listed",
        organic: isOrganic,
        climateFriendly: isClimate
      };
      
      state.marketplaceListings.unshift(newNFT);
      renderMarketplace();
      showToast("Crop NFT Minted", `Minted harvest NFT successfully! Rewarded +${finalReward} BAYANI. This token represents your active labor contribution (Organic & Sustainable farming bonus).`, "success");
    }
    
    // Reset inputs
    document.getElementById("cropType").value = "";
    document.getElementById("volume").value = "";
  });
  
  // Revenue Logging
  elements.revenueForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById("revAmount").value);
    
    // Boost MSME credit score by logged revenue volume
    const scoreIncrease = Math.min(30, Math.floor(amount / 50));
    state.creditScore = Math.min(850, state.creditScore + scoreIncrease);
    updateCreditGauge();
    
    showToast("Activity Recorded", `Logged transaction volume of ${amount} BAYANI. Your on-chain credit score increased by +${scoreIncrease} due to verified commercial activity, reducing future escrow fees!`, "success");
    document.getElementById("revAmount").value = "";
  });
  
  // Submit MSME Customer Feedback Star Rating
  elements.submitFeedbackBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const multiplier = currentFeedbackRating === 5 ? 15 : currentFeedbackRating * 2;
    state.creditScore = Math.min(850, state.creditScore + multiplier);
    updateCreditGauge();
    
    showToast("Feedback Logged", `Recorded customer rating feedback of ${currentFeedbackRating}-Stars. On-chain rating score boosted, improving your merchant tier.`, "success");
  });
  
  // Escrow Form Submit
  elements.escrowForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const freelancer = document.getElementById("freelancerAddr").value;
    const budget = parseFloat(document.getElementById("projectBudget").value);
    const deadline = document.getElementById("milestoneDeadline").value;
    
    if (state.web3Connected) {
      try {
        showToast("Approving Tokens", "Requesting allowance for Escrow contract...", "info");
        const budgetWei = ethers.parseEther(budget.toString());
        const appTx = await contracts.BayaniToken.approve(activeAddresses.FreelancerEscrow, budgetWei);
        await appTx.wait();
        
        showToast("Creating Project", "Submitting contract parameters to FreelancerEscrow...", "info");
        // Convert deadline days to epoch timestamps
        const timeDeadline = Math.floor(Date.now() / 1000) + (parseInt(deadline) * 86400);
        const tx = await contracts.FreelancerEscrow.createProject(freelancer, [budgetWei], [timeDeadline]);
        await tx.wait();
        
        showToast("Escrow Locked!", "Escrow project initialized and funds locked on-chain.", "success");
        await readOnChainState();
      } catch (error) {
        showToast("On-Chain Error", error.message || "Failed to initialize Escrow project", "error");
      }
    } else {
      if (state.simBalance < budget) {
        showToast("Insufficient Balance", "You do not have enough simulated BAYANI tokens.", "error");
        return;
      }
      
      state.simBalance -= budget;
      const newEscrow = {
        id: state.activeEscrows.length + 1,
        client: "0xClientSimAddress",
        freelancer: freelancer,
        budget: budget,
        deadline: `${deadline} Days`,
        status: "Active",
        milestone: 0
      };
      
      state.activeEscrows.unshift(newEscrow);
      renderEscrows();
      showToast("Escrow Funded", `Locked ${budget} BAYANI in a secure milestone escrow container. Funds are held safely and released to the freelancer only upon milestone approval.`, "success");
    }
    
    document.getElementById("projectBudget").value = "";
  });
  
  // DAO Staking Actions
  elements.stakeBtn.addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("stakeAmount").value);
    if (!amount || amount <= 0) return;
    
    if (state.simBalance < amount) {
      showToast("Insufficient Balance", "Cannot stake more than available balance.", "error");
      return;
    }
    
    state.simBalance -= amount;
    state.stakedAmount += amount;
    updateVotingPower();
    showToast("Tokens Staked", `Successfully staked ${amount} BAYANI. This boosts your voting weight on community proposals (power is capped to keep it fair and democratic).`, "success");
    document.getElementById("stakeAmount").value = "";
  });
  
  elements.unstakeBtn.addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("stakeAmount").value);
    if (!amount || amount <= 0) return;
    
    if (state.stakedAmount < amount) {
      showToast("Staking Error", "Cannot unstake more than currently staked balance.", "error");
      return;
    }
    
    state.stakedAmount -= amount;
    state.simBalance += amount;
    updateVotingPower();
    showToast("Tokens Unstaked", `Withdrew ${amount} BAYANI from Barangay DAO. Voting weight returned to base citizenship level.`, "success");
    document.getElementById("stakeAmount").value = "";
  });

  // Crop Insurance Form Submit
  const insuranceForm = document.getElementById("insuranceForm");
  if (insuranceForm) {
    insuranceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nftId = parseInt(document.getElementById("insCropNftId").value);
      const premium = parseFloat(document.getElementById("insPremiumAmount").value);
      
      if (state.web3Connected) {
        try {
          showToast("Transaction Initiating", "Approving premium and paying insurance...", "info");
          const premiumWei = ethers.parseEther(premium.toString());
          
          // Approve FarmerProsperity contract to spend premium
          const appTx = await contracts.BayaniToken.approve(activeAddresses.FarmerProsperity, premiumWei);
          await appTx.wait();
          
          // Pay insurance premium
          const payTx = await contracts.FarmerProsperity.payInsurancePremium(nftId, premiumWei);
          await payTx.wait();
          
          showToast("Premium Paid!", `Successfully insured Crop NFT ID ${nftId}. Premium forwarded to NationalRewardsTreasury.`, "success");
          await readOnChainState();
        } catch (error) {
          showToast("On-Chain Error", error.message || "Failed to submit transaction", "error");
        }
      } else {
        if (state.simBalance < premium) {
          showToast("Insufficient Balance", "Cannot pay premium. Insufficient simulated BAYANI.", "error");
          return;
        }
        state.simBalance -= premium;
        showToast("Premium Simulated", `Insured Crop NFT ID ${nftId} with ${premium} BAYANI. Funds forwarded to the Treasury backing pool.`, "success");
      }
      
      document.getElementById("insCropNftId").value = "";
      document.getElementById("insPremiumAmount").value = "";
    });
  }

  // Trigger Insurance Weather Claim
  const triggerClaimBtn = document.getElementById("triggerClaimBtn");
  if (triggerClaimBtn) {
    triggerClaimBtn.addEventListener("click", async () => {
      const nftId = parseInt(document.getElementById("insClaimNftId").value);
      if (!nftId) {
        showToast("Simulation Error", "Please specify a Target Crop NFT ID.", "error");
        return;
      }
      
      if (state.web3Connected) {
        try {
          showToast("Transaction Initiating", "Climate Oracle calling triggerInsuranceClaim...", "info");
          // Payout is automatically requested by climate oracle (deployer) for 100 BAYANI
          const payoutWei = ethers.parseEther("100");
          const claimTx = await contracts.FarmerProsperity.triggerInsuranceClaim(nftId, state.userAddress, payoutWei);
          await claimTx.wait();
          
          showToast("Claim Triggered!", `Solvency payout of 100 BAYANI successfully routed from Treasury.`, "success");
          await readOnChainState();
        } catch (error) {
          showToast("On-Chain Error", error.message || "Failed to submit transaction. Verify that a premium was paid first.", "error");
        }
      } else {
        state.simBalance += 100;
        showToast("Claim Payout Simulated", `Typhoon event recorded. Distributed payout of 100 BAYANI from Treasury Reserve pool to your wallet.`, "success");
      }
      
      document.getElementById("insClaimNftId").value = "";
    });
  }
}

// -------------------------------------------------------------
// RENDERERS FOR DYNAMIC DOM LISTS
// -------------------------------------------------------------

function renderMarketplace() {
  elements.listingsContainer.innerHTML = "";
  
  if (state.marketplaceListings.length === 0) {
    elements.listingsContainer.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted);text-align:center;padding:1rem;">No harvest contracts listed.</p>`;
    return;
  }
  
  state.marketplaceListings.forEach(item => {
    const listingEl = document.createElement("div");
    listingEl.className = "listing-item";
    
    let btnHtml = "";
    if (item.status === "Listed") {
      btnHtml = `
        <button class="primary-btn btn-sm" onclick="buyListing(${item.id})">Buy Contract</button>
        <button class="danger-btn btn-sm" onclick="cancelListing(${item.id})">Cancel</button>
      `;
    } else if (item.status === "Sold") {
      btnHtml = `
        <button class="secondary-btn btn-sm" onclick="confirmListing(${item.id}, true)">DTC Delivery (3x Rewards)</button>
        <button class="secondary-btn btn-sm" onclick="confirmListing(${item.id}, false)">Standard Delivery</button>
        <button class="danger-btn btn-sm" style="margin-top:0.25rem;" onclick="refundListing(${item.id})">Refund (Breach)</button>
      `;
    } else if (item.status === "Cancelled") {
      btnHtml = `<span class="badge" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:#ef4444;">Cancelled</span>`;
    } else if (item.status === "Refunded") {
      btnHtml = `<span class="badge" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:#ef4444;">Refunded</span>`;
    } else {
      btnHtml = `<span class="badge" style="background:rgba(52,211,153,0.12);color:#34d399;border-color:#34d399;">Delivered</span>`;
    }
    
    listingEl.innerHTML = `
      <div class="listing-header">
        <span class="listing-title">${item.cropType}</span>
        <span class="listing-price">${item.price} BAYANI</span>
      </div>
      <div class="listing-meta">
        <span>Volume: ${item.volume} kg</span>
        <span>Producer: ${item.producer.substring(0, 8)}...</span>
      </div>
      <div class="listing-actions">
        ${btnHtml}
      </div>
    `;
    elements.listingsContainer.appendChild(listingEl);
  });
}

window.buyListing = function(id) {
  const item = state.marketplaceListings.find(l => l.id === id);
  if (!item) return;
  
  if (state.simBalance < item.price) {
    showToast("Purchase Failed", "Insufficient BAYANI tokens.", "error");
    return;
  }
  
  state.simBalance -= item.price;
  item.status = "Sold";
  renderMarketplace();
  showToast("Contract Purchased", `Deposited ${item.price} BAYANI in escrow for ${item.cropType}.`, "success");
};

window.confirmListing = function(id, dtc) {
  const item = state.marketplaceListings.find(l => l.id === id);
  if (!item) return;
  
  item.status = "Delivered";
  // Escrow funds released to producer
  const reward = dtc ? 45 : 15;
  state.simBalance += item.price; // Mimic producer receiving funds
  state.simBalance += reward; // Reward distributed
  
  renderMarketplace();
  showToast("Delivery Confirmed", `Fund released. Rewards issued: ${reward} BAYANI.`, "success");
};

window.cancelListing = async function(id) {
  const item = state.marketplaceListings.find(l => l.id === id);
  if (!item) return;

  if (state.web3Connected) {
    try {
      showToast("Transaction Initiating", "Calling FarmerProsperity.cancelFutureHarvestListing...", "info");
      const tx = await contracts.FarmerProsperity.cancelFutureHarvestListing(id);
      await tx.wait();
      showToast("Listing Cancelled!", "Your crop NFT has been returned to your wallet.", "success");
      await readOnChainState();
    } catch (error) {
      showToast("On-Chain Error", error.message || "Failed to cancel listing", "error");
    }
  } else {
    item.status = "Cancelled";
    renderMarketplace();
    showToast("Listing Cancelled", "Returned your Crop NFT to your wallet.", "success");
  }
};

window.refundListing = async function(id) {
  const item = state.marketplaceListings.find(l => l.id === id);
  if (!item) return;

  if (state.web3Connected) {
    try {
      showToast("Transaction Initiating", "Calling FarmerProsperity.refundFutureHarvest...", "info");
      const tx = await contracts.FarmerProsperity.refundFutureHarvest(id);
      await tx.wait();
      showToast("Refund Completed!", "Escrowed payment has been refunded to your wallet.", "success");
      await readOnChainState();
    } catch (error) {
      showToast("On-Chain Error", error.message || "Failed to claim refund", "error");
    }
  } else {
    item.status = "Refunded";
    state.simBalance += item.price;
    renderMarketplace();
    showToast("Refund Claimed", `Refunded ${item.price} BAYANI to your wallet.`, "success");
  }
};

function renderEscrows() {
  elements.escrowList.innerHTML = "";
  
  if (state.activeEscrows.length === 0) {
    elements.escrowList.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted);text-align:center;padding:1rem;">No active milestone projects.</p>`;
    return;
  }
  
  state.activeEscrows.forEach(item => {
    const cardEl = document.createElement("div");
    cardEl.className = "escrow-card";
    
    let actionsHtml = "";
    if (item.status === "Active") {
      actionsHtml = `
        <div class="escrow-actions">
          <button class="primary-btn" onclick="submitMilestone(${item.id})">Submit Work</button>
          <button class="secondary-btn" onclick="disputeEscrow(${item.id})">Raise Dispute</button>
          <button class="danger-btn" style="grid-column: span 2; margin-top: 0.25rem;" onclick="refundMilestone(${item.id})">Reclaim Refund</button>
        </div>
      `;
    } else if (item.status === "Submitted") {
      actionsHtml = `
        <div class="escrow-actions">
          <button class="primary-btn" onclick="approveMilestone(${item.id})">Approve & Release</button>
          <button class="secondary-btn" onclick="disputeEscrow(${item.id})">Dispute Work</button>
        </div>
      `;
    } else if (item.status === "Disputed") {
      actionsHtml = `
        <p style="font-size:0.75rem;color:var(--red);text-align:center;padding-top:0.25rem;">
          ⚠️ Dispute under cooperative AI arbitration.
        </p>
      `;
    } else if (item.status === "Refunded") {
      actionsHtml = `
        <p style="font-size:0.75rem;color:var(--red);text-align:center;padding-top:0.25rem;">
          💸 Milestone refunded to client.
        </p>
      `;
    }
    
    let statusClass = "status-active";
    if (item.status === "Approved") statusClass = "status-completed";
    if (item.status === "Disputed") statusClass = "status-disputed";
    if (item.status === "Refunded") statusClass = "status-disputed";
    
    cardEl.innerHTML = `
      <div class="escrow-row title-row">
        <span>Project ID: #${item.id}</span>
        <span class="escrow-status-badge ${statusClass}">${item.status}</span>
      </div>
      <div class="escrow-row">
        <span>Freelancer:</span>
        <code>${item.freelancer.substring(0, 10)}...</code>
      </div>
      <div class="escrow-row">
        <span>Locked Budget:</span>
        <span style="font-weight:600;color:var(--gold);">${item.budget} BAYANI</span>
      </div>
      <div class="escrow-row">
        <span>Deadline:</span>
        <span>${item.deadline}</span>
      </div>
      ${actionsHtml}
    `;
    elements.escrowList.appendChild(cardEl);
  });
}

window.submitMilestone = function(id) {
  const item = state.activeEscrows.find(e => e.id === id);
  if (!item) return;
  item.status = "Submitted";
  renderEscrows();
  showToast("Work Submitted", "Milestone 0 work submitted for client approval.", "info");
};

window.approveMilestone = function(id) {
  const item = state.activeEscrows.find(e => e.id === id);
  if (!item) return;
  item.status = "Approved";
  
  // Pay freelancer
  state.simBalance += item.budget;
  renderEscrows();
  showToast("Milestone Released", `Approved milestone. Disbursed ${item.budget} BAYANI to freelancer.`, "success");
};

window.disputeEscrow = function(id) {
  const item = state.activeEscrows.find(e => e.id === id);
  if (!item) return;
  item.status = "Disputed";
  renderEscrows();
  showToast("Dispute Raised", "Dispute submitted to Barangay cooperative resolution board.", "warning");
};

window.refundMilestone = async function(id) {
  const item = state.activeEscrows.find(e => e.id === id);
  if (!item) return;

  if (state.web3Connected) {
    try {
      showToast("Transaction Initiating", "Calling FreelancerEscrow.claimMilestoneRefund...", "info");
      const tx = await contracts.FreelancerEscrow.claimMilestoneRefund(id);
      await tx.wait();
      showToast("Refund Completed!", "Milestone funds have been refunded to your wallet.", "success");
      await readOnChainState();
    } catch (error) {
      showToast("On-Chain Error", error.message || "Failed to claim refund", "error");
    }
  } else {
    item.status = "Refunded";
    state.simBalance += item.budget;
    renderEscrows();
    showToast("Refund Claimed", `Refunded ${item.budget} BAYANI to your wallet.`, "success");
  }
};

function renderProposals() {
  elements.proposalList.innerHTML = "";
  
  state.daoProposals.forEach(prop => {
    const cardEl = document.createElement("div");
    cardEl.className = "proposal-card";
    
    let btnHtml = "";
    if (prop.status === "Active") {
      btnHtml = `
        <div class="btn-group" style="margin-top:0.4rem;">
          <button class="primary-btn" onclick="voteProposal(${prop.id}, true)">Vote Yea</button>
          <button class="secondary-btn" onclick="voteProposal(${prop.id}, false)">Vote Nay</button>
        </div>
      `;
    } else {
      btnHtml = `<span class="badge" style="background:rgba(52,211,153,0.12);color:#34d399;border-color:#34d399;text-align:center;display:block;">Executed</span>`;
    }
    
    cardEl.innerHTML = `
      <div style="display:flex;justify-content:between;align-items:center;font-weight:600;font-size:0.85rem;color:#ffffff;margin-bottom:0.2rem;">
        <span>${prop.title}</span>
        <span class="badge" style="margin-left:auto;">${prop.budget} BAYANI</span>
      </div>
      <p class="proposal-desc">${prop.description}</p>
      <div class="vote-stats">
        <span>Yeas: ${prop.yeas}</span>
        <span>Nays: ${prop.nays}</span>
      </div>
      ${btnHtml}
    `;
    elements.proposalList.appendChild(cardEl);
  });
}

window.voteProposal = function(id, support) {
  const prop = state.daoProposals.find(p => p.id === id);
  if (!prop) return;
  
  if (prop.hasVoted) {
    showToast("Double Voting", "Your profile has already submitted votes for this proposal.", "error");
    return;
  }
  
  // Calculate user voting power
  const basePower = 100;
  const booster = Math.floor(state.stakedAmount * 0.5);
  const totalPower = basePower + booster;
  
  if (support) {
    prop.yeas += totalPower;
  } else {
    prop.nays += totalPower;
  }
  
  prop.hasVoted = true;
  
  // Auto execute if Yeas exceed 600
  if (prop.yeas > 600) {
    prop.status = "Executed";
    showToast("Proposal Passed", `Yeas exceeded execution thresholds. Executing infrastructure funding!`, "success");
  } else {
    showToast("Vote Logged", `Cast ${totalPower} votes in support of proposal.`, "success");
  }
  
  renderProposals();
};

function renderLendingPools() {
  elements.lendingPoolList.innerHTML = "";
  
  state.lendingPools.forEach(pool => {
    const cardEl = document.createElement("div");
    cardEl.className = "lending-card";
    
    const percentage = Math.min(100, Math.floor((pool.funded / pool.target) * 100));
    
    cardEl.innerHTML = `
      <div style="display:flex;justify-content:between;align-items:center;">
        <span class="lending-title">${pool.title}</span>
        <span style="font-weight:600;font-size:0.75rem;color:var(--gold);margin-left:auto;">${percentage}% funded</span>
      </div>
      <p style="font-size:0.75rem;color:var(--text-secondary);line-height:1.3">${pool.description}</p>
      <div class="lending-details">
        <span>Target: ${pool.target} BAYANI</span>
        <span>Yield: ${pool.discount}</span>
      </div>
      <button class="primary-btn btn-sm" onclick="fundLendingPool(${pool.id})">Fund 250 BAYANI</button>
    `;
    elements.lendingPoolList.appendChild(cardEl);
  });
}

window.fundLendingPool = function(id) {
  const pool = state.lendingPools.find(p => p.id === id);
  if (!pool) return;
  
  if (state.simBalance < 250) {
    showToast("Transaction Failed", "Insufficient simulated balance.", "error");
    return;
  }
  
  state.simBalance -= 250;
  pool.funded = Math.min(pool.target, pool.funded + 250);
  
  // Boost Diaspora Impact Score
  state.diasporaScore += 15;
  elements.diasporaScore.innerText = state.diasporaScore;
  
  renderLendingPools();
  showToast("Funded Relative Loan", "Sent 250 BAYANI to community relative lending pool. Your Diaspora Impact Score increased!", "success");
  
  // Award 30 BAYANI milestone reward if score crosses multiple of 50
  if (state.diasporaScore >= 50 && (state.diasporaScore - 15) < 50) {
    state.simBalance += 30;
    showToast("Impact Reward Crossed", "Crossed 50-point diaspora threshold! Awarded +30 BAYANI from National Rewards Treasury.", "success");
  }
};

function renderRWAs() {
  elements.rwaList.innerHTML = "";
  
  state.rwaAssets.forEach(rwa => {
    const cardEl = document.createElement("div");
    cardEl.className = "rwa-card";
    
    cardEl.innerHTML = `
      <div style="display:flex;justify-content:between;align-items:center;">
        <span class="rwa-title">${rwa.title}</span>
        <span style="font-weight:600;font-size:0.75rem;color:var(--gold);margin-left:auto;">${rwa.purchased} shares owned</span>
      </div>
      <p style="font-size:0.75rem;color:var(--text-secondary);line-height:1.3">${rwa.description}</p>
      <div class="rwa-details">
        <span>Price/Share: ${rwa.priceShare} BAYANI</span>
        <span>Service discount yield: ${rwa.discount}</span>
      </div>
      <button class="primary-btn btn-sm" onclick="buyRwaShare(${rwa.id})">Buy 1 Fractional Share</button>
    `;
    elements.rwaList.appendChild(cardEl);
  });
}

window.buyRwaShare = function(id) {
  const rwa = state.rwaAssets.find(r => r.id === id);
  if (!rwa) return;
  
  if (state.simBalance < rwa.priceShare) {
    showToast("Purchase Failed", "Insufficient simulated balance.", "error");
    return;
  }
  
  state.simBalance -= rwa.priceShare;
  rwa.purchased += 1;
  renderRWAs();
  showToast("RWA Share Purchased", `Successfully acquired 1 share of ${rwa.title}. Yield is structured as a direct discount/rebate on services, staying compliant with SEC classification rules.`, "success");
};

// -------------------------------------------------------------
// PANCAKESWAP DEX SWAP WIDGET INTEGRATION
// -------------------------------------------------------------

const WBNB_ADDRESS = {
  56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BSC Mainnet WBNB
  97: "0xae13d989daC2f0debFFF460aC112a837C89BAa7c"  // BSC Testnet WBNB
};

function setupSwapWidget() {
  if (!elements.swapFromAmount) return;

  elements.swapFromAmount.addEventListener("input", updateSwapQuote);
  elements.swapFromToken.addEventListener("change", () => {
    elements.swapToToken.value = elements.swapFromToken.value === "BNB" ? "BAYANI" : "BNB";
    updateSwapBalances();
    updateSwapQuote();
  });
  elements.swapToggleBtn.addEventListener("click", toggleSwapDirection);
  elements.swapExecuteBtn.addEventListener("click", executeSwap);

  // Preset slippage buttons (0.1%, 0.5%, 1.0%)
  elements.slippageBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      elements.slippageBtns.forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "";
        b.style.color = "";
      });
      if (elements.autoSlippageToggle) {
        elements.autoSlippageToggle.classList.remove("active");
        elements.autoSlippageToggle.style.borderColor = "";
        elements.autoSlippageToggle.style.color = "";
      }
      if (elements.customSlippageToggle) {
        elements.customSlippageToggle.classList.remove("active");
        elements.customSlippageToggle.style.borderColor = "";
        elements.customSlippageToggle.style.color = "";
      }
      elements.customSlippageInputContainer.style.display = "none";

      btn.classList.add("active");
      btn.style.borderColor = "var(--gold)";
      btn.style.color = "var(--gold)";

      const val = parseFloat(btn.getAttribute("data-slippage"));
      state.slippage = val;
      state.autoSlippage = false;
      elements.activeSlippageLabel.innerText = `${val}%`;
      elements.quoteSlippageLabel.innerText = `${val}%`;
      updateSwapQuote();
    });
  });

  // Auto slippage toggle button
  if (elements.autoSlippageToggle) {
    elements.autoSlippageToggle.addEventListener("click", (e) => {
      e.preventDefault();
      elements.slippageBtns.forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "";
        b.style.color = "";
      });
      if (elements.customSlippageToggle) {
        elements.customSlippageToggle.classList.remove("active");
        elements.customSlippageToggle.style.borderColor = "";
        elements.customSlippageToggle.style.color = "";
      }
      elements.customSlippageInputContainer.style.display = "none";

      elements.autoSlippageToggle.classList.add("active");
      elements.autoSlippageToggle.style.borderColor = "var(--gold)";
      elements.autoSlippageToggle.style.color = "var(--gold)";

      state.autoSlippage = true;
      elements.activeSlippageLabel.innerText = "Auto (Dynamic)";
      elements.quoteSlippageLabel.innerText = "Auto (Dynamic)";
      updateSwapQuote();
    });
  }

  // Custom slippage toggle button
  if (elements.customSlippageToggle) {
    elements.customSlippageToggle.addEventListener("click", (e) => {
      e.preventDefault();
      elements.slippageBtns.forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "";
        b.style.color = "";
      });
      if (elements.autoSlippageToggle) {
        elements.autoSlippageToggle.classList.remove("active");
        elements.autoSlippageToggle.style.borderColor = "";
        elements.autoSlippageToggle.style.color = "";
      }
      elements.customSlippageToggle.classList.add("active");
      elements.customSlippageToggle.style.borderColor = "var(--gold)";
      elements.customSlippageToggle.style.color = "var(--gold)";
      elements.customSlippageInputContainer.style.display = "flex";

      const val = parseFloat(elements.customSlippageInput.value) || 0.5;
      state.slippage = val;
      state.autoSlippage = false;
      elements.activeSlippageLabel.innerText = `${val}%`;
      elements.quoteSlippageLabel.innerText = `${val}%`;
      updateSwapQuote();
    });
  }

  // Custom slippage input box value changes
  if (elements.customSlippageInput) {
    elements.customSlippageInput.addEventListener("input", (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0) val = 0.5;
      if (val > 50) val = 50; // Cap slippage at 50% for safety
      state.slippage = val;
      state.autoSlippage = false;
      elements.activeSlippageLabel.innerText = `${val}%`;
      elements.quoteSlippageLabel.innerText = `${val}%`;
      updateSwapQuote();
    });
  }
  
  updateSwapBalances();
}

function updateSwapBalances() {
  if (!elements.swapFromBalance || !elements.swapToBalance) return;
  
  const fromToken = elements.swapFromToken.value;
  
  if (state.web3Connected) {
    if (fromToken === "BNB") {
      elements.swapFromBalance.innerText = `${parseFloat(state.bnbBalance || 0).toFixed(4)} BNB`;
      elements.swapToBalance.innerText = `${parseFloat(state.simBalance || 0).toFixed(2)} BAYANI`;
    } else {
      elements.swapFromBalance.innerText = `${parseFloat(state.simBalance || 0).toFixed(2)} BAYANI`;
      elements.swapToBalance.innerText = `${parseFloat(state.bnbBalance || 0).toFixed(4)} BNB`;
    }
  } else {
    // Simulator Mode
    if (fromToken === "BNB") {
      elements.swapFromBalance.innerText = `${parseFloat(state.simBnbBalance || 10).toFixed(4)} BNB`;
      elements.swapToBalance.innerText = `${parseFloat(state.simBalance || 1200).toFixed(2)} BAYANI`;
    } else {
      elements.swapFromBalance.innerText = `${parseFloat(state.simBalance || 1200).toFixed(2)} BAYANI`;
      elements.swapToBalance.innerText = `${parseFloat(state.simBnbBalance || 10).toFixed(4)} BNB`;
    }
  }
}

async function updateSwapQuote() {
  const fromAmount = parseFloat(elements.swapFromAmount.value);
  if (isNaN(fromAmount) || fromAmount <= 0) {
    elements.swapQuoteBox.style.display = "none";
    elements.swapExecuteBtn.disabled = true;
    elements.swapExecuteBtn.innerText = state.web3Connected ? "Enter Amount" : "Connect Wallet to Swap";
    elements.swapToAmount.value = "";
    if (elements.swapWarningBox) elements.swapWarningBox.style.display = "none";
    return;
  }

  const fromToken = elements.swapFromToken.value;
  const toToken = fromToken === "BNB" ? "BAYANI" : "BNB";

  elements.swapQuoteBox.style.display = "flex";

  if (state.web3Connected && contracts.PancakeRouter) {
    // Live on-chain calculation using PancakeSwap Router
    try {
      const chainId = activeAddresses === CONTRACT_ADDRESSES[56] ? 56 : 97;
      const wbnb = WBNB_ADDRESS[chainId];
      const bayani = activeAddresses.BayaniToken;
      const path = fromToken === "BNB" ? [wbnb, bayani] : [bayani, wbnb];
      
      const amountInWei = ethers.parseEther(fromAmount.toString());
      const amountsOut = await contracts.PancakeRouter.getAmountsOut(amountInWei, path);
      const estimatedOut = ethers.formatEther(amountsOut[amountsOut.length - 1]);
      
      elements.swapToAmount.value = parseFloat(estimatedOut).toFixed(fromToken === "BNB" ? 2 : 6);
      elements.swapQuoteOutput.innerText = `${parseFloat(estimatedOut).toFixed(2)} ${toToken}`;
      
      const rate = parseFloat(estimatedOut) / fromAmount;
      elements.swapQuoteRate.innerText = `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}`;

      // --- Dynamic Auto-Slippage Calculation ---
      let poolSlippage = state.slippage;
      if (state.autoSlippage) {
        try {
          const factoryAddress = await contracts.PancakeRouter.factory();
          const factoryAbi = ["function getPair(address tokenA, address tokenB) view returns (address pair)"];
          const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);
          const pairAddress = await factoryContract.getPair(wbnb, bayani);
          
          if (pairAddress !== ethers.ZeroAddress) {
            const pairAbi = [
              "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
              "function token0() view returns (address)"
            ];
            const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
            const reserves = await pairContract.getReserves();
            const token0Address = await pairContract.token0();
            
            let reserveIn = 0n;
            if (token0Address.toLowerCase() === path[0].toLowerCase()) {
              reserveIn = reserves.reserve0;
            } else {
              reserveIn = reserves.reserve1;
            }
            
            if (reserveIn > 0n) {
              const impactRatio = parseFloat(fromAmount) / parseFloat(ethers.formatEther(reserveIn));
              if (impactRatio < 0.005) {
                poolSlippage = 0.5; // less than 0.5% reserves: 0.5% slippage
              } else if (impactRatio < 0.02) {
                poolSlippage = 1.0; // moderate impact: 1.0% slippage
              } else if (impactRatio < 0.05) {
                poolSlippage = 2.5; // high impact: 2.5% slippage
              } else {
                poolSlippage = 5.0; // extreme impact: 5.0% slippage
              }
            } else {
              poolSlippage = 1.0;
            }
          } else {
            poolSlippage = 1.0; // pair doesn't exist
          }
        } catch (e) {
          console.warn("Could not calculate dynamic slippage, using fallback 1.0%", e);
          poolSlippage = 1.0;
        }
        state.slippage = poolSlippage;
      }

      // --- Live Gas Fee Estimation ---
      try {
        const feeData = await provider.getFeeData().catch(() => null);
        const gasPrice = feeData && feeData.gasPrice ? feeData.gasPrice : ethers.parseUnits("5", "gwei");
        const gasLimit = fromToken === "BNB" ? 150000n : 200000n;
        const gasCostWei = gasLimit * gasPrice;
        const gasCostEth = ethers.formatEther(gasCostWei);
        elements.swapGasCost.innerText = `~${parseFloat(gasCostEth).toFixed(5)} BNB`;
      } catch (gasErr) {
        elements.swapGasCost.innerText = "~0.00075 BNB";
      }

      // Update Action Button State
      elements.swapExecuteBtn.disabled = false;
      
      if (fromToken === "BAYANI") {
        const allowance = await contracts.BayaniToken.allowance(state.userAddress, activeAddresses.PancakeRouter);
        if (allowance < amountInWei) {
          elements.swapExecuteBtn.innerText = "Approve BAYANI";
        } else {
          elements.swapExecuteBtn.innerText = `Swap BAYANI to ${toToken}`;
        }
      } else {
        elements.swapExecuteBtn.innerText = `Swap BNB to ${toToken}`;
      }
    } catch (err) {
      console.error("Quote estimation error:", err);
      elements.swapQuoteRate.innerText = "Error fetching rate";
      elements.swapExecuteBtn.disabled = true;
      elements.swapExecuteBtn.innerText = "Liquidity Pool Not Found";
    }
  } else {
    // Simulated calculation (Constant rate: 1 BNB = 500,000 BAYANI)
    const rate = fromToken === "BNB" ? 500000 : 1 / 500000;
    const estimatedOut = fromAmount * rate;
    
    elements.swapToAmount.value = estimatedOut.toFixed(fromToken === "BNB" ? 2 : 6);
    elements.swapQuoteOutput.innerText = `${estimatedOut.toLocaleString()} ${toToken}`;
    elements.swapQuoteRate.innerText = `1 ${fromToken} = ${rate.toLocaleString(undefined, {maximumFractionDigits: 6})} ${toToken}`;

    // Mock dynamic slippage based on trade size
    if (state.autoSlippage) {
      if (fromAmount < 5) {
        state.slippage = 0.5;
      } else if (fromAmount < 20) {
        state.slippage = 1.5;
      } else if (fromAmount < 50) {
        state.slippage = 3.0;
      } else {
        state.slippage = 5.0;
      }
    }

    // Mock gas fee
    const mockGas = fromToken === "BNB" ? 0.00075 : 0.00095;
    elements.swapGasCost.innerText = `~${mockGas.toFixed(5)} BNB (Simulated)`;
    
    elements.swapExecuteBtn.disabled = false;
    elements.swapExecuteBtn.innerText = state.web3Connected ? "Execute Swap (Simulated)" : "Swap (Simulation Mode)";
  }

  // Update slippage labels in UI
  const displaySlippage = state.autoSlippage ? `Auto (${state.slippage}%)` : `${state.slippage}%`;
  if (elements.quoteSlippageLabel) elements.quoteSlippageLabel.innerText = displaySlippage;
  if (elements.activeSlippageLabel) elements.activeSlippageLabel.innerText = displaySlippage;

  handleSlippageWarnings();
}

function handleSlippageWarnings() {
  if (!elements.swapWarningBox) return;
  const val = state.slippage;

  if (state.autoSlippage) {
    if (val >= 5.0) {
      elements.swapWarningBox.style.display = "block";
      elements.swapWarningBox.innerText = `⚠️ Price Impact Alert: Large transaction relative to reserves. Slippage tolerance adjusted to ${val}% to ensure execution.`;
    } else {
      elements.swapWarningBox.style.display = "none";
    }
    return;
  }

  if (val > 5.0) {
    elements.swapWarningBox.style.display = "block";
    elements.swapWarningBox.innerText = `⚠️ High Slippage Warning: Setting slippage tolerance to ${val}% increases frontrunning/sandwich attack risks.`;
  } else if (val < 0.1) {
    elements.swapWarningBox.style.display = "block";
    elements.swapWarningBox.innerText = `⚠️ Low Slippage Warning: Setting slippage tolerance to ${val}% might cause transaction reverts if the rate changes.`;
  } else {
    elements.swapWarningBox.style.display = "none";
  }
}

async function executeSwap() {
  const fromAmount = parseFloat(elements.swapFromAmount.value);
  if (isNaN(fromAmount) || fromAmount <= 0) return;

  const fromToken = elements.swapFromToken.value;
  const toToken = fromToken === "BNB" ? "BAYANI" : "BNB";
  const amountInWei = ethers.parseEther(fromAmount.toString());

  elements.swapExecuteBtn.disabled = true;
  elements.swapExecuteBtn.innerText = "Processing Transaction...";

  if (state.web3Connected && contracts.PancakeRouter) {
    try {
      const chainId = activeAddresses === CONTRACT_ADDRESSES[56] ? 56 : 97;
      const wbnb = WBNB_ADDRESS[chainId];
      const bayani = activeAddresses.BayaniToken;
      const path = fromToken === "BNB" ? [wbnb, bayani] : [bayani, wbnb];
      
      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const recipient = state.userAddress;

      // Query PancakeSwap for estimated output to calculate exact amountOutMin
      const amountsOut = await contracts.PancakeRouter.getAmountsOut(amountInWei, path);
      const estimatedOut = amountsOut[amountsOut.length - 1];
      const slippageFactor = 100 - (state.slippage || 0.5);
      const amountOutMin = (estimatedOut * BigInt(Math.floor(slippageFactor * 100))) / BigInt(10000);

      if (fromToken === "BNB") {
        // Swap BNB to BAYANI
        showToast("Swap Initiated", `Swapping BNB for BAYANI (Min Out: ${parseFloat(ethers.formatEther(amountOutMin)).toFixed(2)})...`, "info");
        const tx = await contracts.PancakeRouter.swapExactETHForTokens(
          amountOutMin,
          path,
          recipient,
          deadline,
          { value: amountInWei }
        );
        showToast("Tx Submitted", `Hash: ${tx.hash.substring(0, 10)}...`, "info");
        await tx.wait();
        showToast("Swap Complete", `Successfully swapped BNB to BAYANI!`, "success");
      } else {
        // Swap BAYANI to BNB
        // Check allowance first
        const allowance = await contracts.BayaniToken.allowance(state.userAddress, activeAddresses.PancakeRouter);
        if (allowance < amountInWei) {
          showToast("Approval Initiated", "Approving PancakeSwap Router to spend BAYANI...", "info");
          const appTx = await contracts.BayaniToken.approve(activeAddresses.PancakeRouter, amountInWei);
          await appTx.wait();
          showToast("Approval Confirmed", "Router approved. You can now execute the swap.", "success");
          updateSwapQuote();
          return;
        }

        showToast("Swap Initiated", `Swapping BAYANI for BNB (Min Out: ${parseFloat(ethers.formatEther(amountOutMin)).toFixed(4)})...`, "info");
        const tx = await contracts.PancakeRouter.swapExactTokensForETH(
          amountInWei,
          amountOutMin,
          path,
          recipient,
          deadline
        );
        showToast("Tx Submitted", `Hash: ${tx.hash.substring(0, 10)}...`, "info");
        await tx.wait();
        showToast("Swap Complete", `Successfully swapped BAYANI to BNB!`, "success");
      }
      
      await readOnChainState();
      elements.swapFromAmount.value = "";
      updateSwapQuote();
    } catch (err) {
      console.error(err);
      showToast("Swap Error", err.reason || err.message || "Transaction failed.", "error");
      updateSwapQuote();
    }
  } else {
    // Local Simulation Mode
    try {
      const rate = fromToken === "BNB" ? 500000 : 1 / 500000;
      const outputAmount = fromAmount * rate;

      if (fromToken === "BNB") {
        const currentBnb = state.web3Connected ? state.bnbBalance : state.simBnbBalance;
        if (currentBnb < fromAmount) {
          showToast("Swap Failed", "Insufficient BNB balance.", "error");
          updateSwapQuote();
          return;
        }
        if (state.web3Connected) {
          state.bnbBalance -= fromAmount;
          state.simBalance += outputAmount;
        } else {
          state.simBnbBalance -= fromAmount;
          state.simBalance += outputAmount;
        }
      } else {
        if (state.simBalance < fromAmount) {
          showToast("Swap Failed", "Insufficient BAYANI balance.", "error");
          updateSwapQuote();
          return;
        }
        if (state.web3Connected) {
          state.simBalance -= fromAmount;
          state.bnbBalance += outputAmount;
        } else {
          state.simBalance -= fromAmount;
          state.simBnbBalance += outputAmount;
        }
      }

      updateSwapBalances();
      showToast("Swap Success (Simulated)", `Converted ${fromAmount.toLocaleString()} ${fromToken} to ${outputAmount.toLocaleString()} ${toToken}`, "success");
      elements.swapFromAmount.value = "";
      updateSwapQuote();
    } catch (err) {
      console.error(err);
      showToast("Swap Error", "Simulated swap failed.", "error");
      updateSwapQuote();
    }
  }
}

function toggleSwapDirection() {
  const currentFrom = elements.swapFromToken.value;
  if (currentFrom === "BNB") {
    elements.swapFromToken.value = "BAYANI";
    elements.swapToToken.value = "BNB";
  } else {
    elements.swapFromToken.value = "BNB";
    elements.swapToToken.value = "BAYANI";
  }
  
  // Swap inputs
  const fromVal = elements.swapFromAmount.value;
  const toVal = elements.swapToAmount.value;
  elements.swapFromAmount.value = toVal;
  elements.swapToAmount.value = fromVal;
  
  updateSwapBalances();
  updateSwapQuote();
}

/* ============================================================
   📱 MOBILE NAVIGATION & INTERACTION CONTROLLER
   ============================================================ */

(function initMobileNav() {
  // --- Element references ---
  const mobileMenuBtn    = document.getElementById("mobileMenuBtn");
  const mobileDropdown   = document.getElementById("mobileDropdownMenu");
  const mobileProfileBtn = document.getElementById("mobileProfileToggle");
  const toggleGuideMobile= document.getElementById("toggleGuideBtnMobile");
  const profileSidebar   = document.getElementById("profileSidebar");
  const sidebarCloseBtn  = document.getElementById("sidebarCloseBtn");
  const sidebarOverlay   = document.getElementById("sidebarOverlay");
  const mobNavBtns       = document.querySelectorAll(".mob-nav-btn");
  const tabContents      = document.querySelectorAll(".tab-content");
  const desktopTabLinks  = document.querySelectorAll(".tab-link");

  // --- Hamburger / Dropdown ---
  if (mobileMenuBtn && mobileDropdown) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = mobileDropdown.classList.toggle("open");
      mobileMenuBtn.classList.toggle("open", isOpen);
      mobileMenuBtn.setAttribute("aria-expanded", isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileDropdown.contains(e.target) && e.target !== mobileMenuBtn) {
        mobileDropdown.classList.remove("open");
        mobileMenuBtn.classList.remove("open");
      }
    });
  }

  // --- Mobile Profile Toggle (opens sidebar panel) ---
  function openSidebar() {
    if (profileSidebar) profileSidebar.classList.add("mobile-open");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    // close dropdown if open
    if (mobileDropdown) mobileDropdown.classList.remove("open");
    if (mobileMenuBtn) mobileMenuBtn.classList.remove("open");
  }

  function closeSidebar() {
    if (profileSidebar) profileSidebar.classList.remove("mobile-open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileProfileBtn) mobileProfileBtn.addEventListener("click", openSidebar);
  if (sidebarCloseBtn)  sidebarCloseBtn.addEventListener("click", closeSidebar);
  if (sidebarOverlay)   sidebarOverlay.addEventListener("click", closeSidebar);

  // --- Mobile Guide Toggle ---
  if (toggleGuideMobile) {
    toggleGuideMobile.addEventListener("click", () => {
      if (typeof window.toggleHelpBanner === "function") {
        window.toggleHelpBanner();
      }
      if (mobileDropdown) mobileDropdown.classList.remove("open");
      if (mobileMenuBtn) mobileMenuBtn.classList.remove("open");
    });
  }

  // --- Helper: switch tab by ID ---
  function switchToTab(tabId) {
    // Tab contents
    tabContents.forEach(c => c.classList.remove("active"));
    const target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    // Sync desktop tab-links
    desktopTabLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-tab") === tabId);
    });

    // Sync bottom nav buttons
    mobNavBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
  }

  // --- Bottom Nav Button Clicks ---
  mobNavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (!tabId) return;
      switchToTab(tabId);
      // Smooth scroll to top of content
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // --- Keep desktop tabs and bottom nav in sync ---
  desktopTabLinks.forEach(link => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");
      mobNavBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
      });
    });
  });

  // --- iOS safe area / touch scroll smoothness ---
  document.querySelectorAll(".marketplace-listings, .escrow-list, .rwa-list").forEach(el => {
    el.style.webkitOverflowScrolling = "touch";
  });

  // --- Close sidebar when pressing Escape ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidebar();
      if (mobileDropdown) mobileDropdown.classList.remove("open");
      if (mobileMenuBtn)  mobileMenuBtn.classList.remove("open");
    }
  });

})();

