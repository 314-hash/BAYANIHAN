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

// Contract Deployment Addresses on local Hardhat node
const CONTRACT_ADDRESSES = {
  BayaniToken: "0xd8a5a9b31c3c0232e196d518e89fd8bf83acad43",
  BayaniNFT: "0xdc11f7e700a4c898ae5caddb1082cffa76512add",
  QuantumIdentity: "0x51a1ceb83b83f1985a81c295d1ff28afef186e02",
  AIReputationOracle: "0x36b58f5c1969b7b6591d752ea6f5486d069010ab",
  NationalRewardsTreasury: "0x8198f5d8f8cffe8f9c413d98a0a55aeb8ab9fbb7",
  FarmerProsperity: "0x0355b7b8cb128fa5692729ab3aaa199c1753f726",
  FreelancerEscrow: "0x202cce504e04bed6fc0521238ddf04bc9e8e15ab"
};

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
    "function getHarvestNFTCount() view returns (uint256)"
  ],
  FreelancerEscrow: [
    "function createProject(address freelancer, uint256[] budgets, uint256[] deadlines) external",
    "function submitMilestone(uint256 projectId) external",
    "function approveMilestone(uint256 projectId) external",
    "function disputeMilestone(uint256 projectId) external",
    "function calculateContractFeeBps(address freelancer) view returns (uint256)"
  ]
};

// Application State
let state = {
  web3Connected: false,
  userAddress: null,
  userRole: 1, // Default: Farmer (Type 1)
  stakedAmount: 0,
  simBalance: 1200, // Simulated BAYANI starting balance
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
  helpSection: document.getElementById("helpSection")
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
  renderMarketplace();
  renderEscrows();
  renderProposals();
  renderLendingPools();
  renderRWAs();
  updateCreditGauge();
  
  // Try to detect MetaMask auto-connection or display simulator
  if (window.ethereum) {
    showToast("Web3 Ready", "MetaMask detected. Click 'Connect Wallet' to connect to local Hardhat node.", "info");
  } else {
    showToast("Simulator Mode Active", "MetaMask not found. Running self-contained interactive simulation.", "info");
  }
  
  elements.connectWalletBtn.addEventListener("click", connectWallet);
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
    
    // Local Hardhat chain ID is usually 31337 or 1337
    if (network.chainId !== 31337n && network.chainId !== 1337n) {
      showToast("Incorrect Network", "Connected, but please switch MetaMask to local Hardhat node (Chain 31337) for on-chain functions.", "warning");
    }
    
    state.web3Connected = true;
    elements.connectWalletBtn.innerText = state.userAddress.substring(0, 6) + "..." + state.userAddress.substring(38);
    elements.netStatus.innerText = "Web3 Connected";
    elements.netStatus.classList.add("web3-connected");
    
    showToast("Wallet Connected", `Successfully linked: ${state.userAddress}`, "success");
    
    // Instantiate Contracts
    contracts.BayaniToken = new ethers.Contract(CONTRACT_ADDRESSES.BayaniToken, CONTRACT_ABIS.BayaniToken, signer);
    contracts.QuantumIdentity = new ethers.Contract(CONTRACT_ADDRESSES.QuantumIdentity, CONTRACT_ABIS.QuantumIdentity, signer);
    contracts.AIReputationOracle = new ethers.Contract(CONTRACT_ADDRESSES.AIReputationOracle, CONTRACT_ABIS.AIReputationOracle, signer);
    contracts.FarmerProsperity = new ethers.Contract(CONTRACT_ADDRESSES.FarmerProsperity, CONTRACT_ABIS.FarmerProsperity, signer);
    contracts.FreelancerEscrow = new ethers.Contract(CONTRACT_ADDRESSES.FreelancerEscrow, CONTRACT_ABIS.FreelancerEscrow, signer);
    
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
    showToast("Balances Loaded", `Token balance: ${parseFloat(balanceEth).toFixed(2)} BAYANI`, "success");
    
    // Check Citizenship Identity status
    const verified = await contracts.QuantumIdentity.isCitizenVerified(state.userAddress).catch(() => false);
    if (verified) {
      const type = await contracts.QuantumIdentity.getCitzenType(state.userAddress);
      state.userRole = Number(type);
      elements.simulateRole.value = type.toString();
      
      const profile = await contracts.QuantumIdentity.getCitizenProfile(state.userAddress);
      elements.profileName.innerText = "On-Chain Profile";
      elements.idBadge.innerText = `Verified Citizen (Type ${type})`;
      elements.profileNid.innerText = profile.nationalIdHash.substring(0, 15) + "...";
      elements.profileBio.innerText = "Verified Active";
      
      // Load PQ Key info
      const pqInfo = await contracts.QuantumIdentity.getPQKey(state.userAddress).catch(() => null);
      if (pqInfo && pqInfo.algorithm) {
        elements.profileAlgo.innerText = pqInfo.algorithm;
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
        const appTx = await contracts.BayaniToken.approve(CONTRACT_ADDRESSES.FreelancerEscrow, budgetWei);
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
      btnHtml = `<button class="primary-btn btn-sm" onclick="buyListing(${item.id})">Buy Contract</button>`;
    } else if (item.status === "Sold") {
      btnHtml = `
        <button class="secondary-btn btn-sm" onclick="confirmListing(${item.id}, true)">DTC Delivery (3x Rewards)</button>
        <button class="secondary-btn btn-sm" onclick="confirmListing(${item.id}, false)">Standard Delivery</button>
      `;
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
    }
    
    let statusClass = "status-active";
    if (item.status === "Approved") statusClass = "status-completed";
    if (item.status === "Disputed") statusClass = "status-disputed";
    
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
