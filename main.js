let provider;
let signer;
let contract;

const contractAddress = "0xa8d2d63da3fb95bd74b2c09750bf00e756f25763";
const abi = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

let connected = false; // track status

document.getElementById('connectButton').onclick = async () => {
  if (!connected) {
    // connect wallet
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const shortAddress = address.substring(0, 6) + "..." + address.substring(address.length - 4);
        document.getElementById('account').innerHTML = `
          <img src="https://seeklogo.com/images/M/metamask-logo-09EDE53DBD-seeklogo.com.png" alt="Metamask" class="w-5 h-5">
          <span>✅ Connected: ${shortAddress}</span>
        `;
        document.getElementById('status').innerText = ""; // clear status
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        await signer.getAddress();
        contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Signer ready:", signer);

        connected = true;
        document.getElementById('connectButton').innerText = "Disconnect Wallet";
      } catch (err) {
        console.error(err);
        document.getElementById('account').innerText = "❌ Error connecting: " + err.message;
      }
    } else {
      alert('Please install Metamask!');
    }
  } else {
    // disconnect wallet (reset UI)
    connected = false;
    document.getElementById('account').innerText = "Wallet not connected";
    document.getElementById('connectButton').innerText = "Connect Wallet";
    // clear contract & signer
    provider = null;
    signer = null;
    contract = null;
    console.log("Wallet disconnected");
  }
};


document.getElementById('sendForm').onsubmit = async (e) => {
  e.preventDefault();
    if (!contract) {
    document.getElementById('status').innerText = "⚠️ Please connect your wallet first!";
    // Kosongkan input
document.getElementById('recipient').value = '';
document.getElementById('amount').value = '';

    return;
  }
  const to = document.getElementById('recipient').value;
  const amount = document.getElementById('amount').value;
  console.log("To:", to, "Amount:", amount);

  try {
    document.getElementById('status').innerText = "⏳ Sending transaction...";
    const decimals = 18;
    const parsedAmount = ethers.utils.parseUnits(amount, decimals);

    const tx = await contract.transfer(to, parsedAmount);
    console.log("Transaction sent:", tx.hash);
    const shortTx = tx.hash.substring(0, 6) + "..." + tx.hash.substring(tx.hash.length - 4);
const etherscanLink = `https://sepolia.etherscan.io/tx/${tx.hash}`;
document.getElementById('status').innerHTML = `🚀 Transaction sent: <a href="${etherscanLink}" target="_blank" class="text-blue-400 underline">${shortTx}</a>`;

    await tx.wait();
    console.log("Transaction confirmed:", tx.hash);
    document.getElementById('status').innerHTML = `✅ Success! Tx hash: <a href="${etherscanLink}" target="_blank" class="text-blue-400 underline">${shortTx}</a>`;
    document.getElementById('recipient').value = '';
    document.getElementById('amount').value = '';

  } catch (err) {
    console.error(err);
    document.getElementById('status').innerText = "❌ Error: " + err.message;
  }
  
};

document.getElementById('copyAddress').onclick = () => {
  const address = "0xa8d2d63da3fb95bd74b2c09750bf00e756f25763";
  navigator.clipboard.writeText(address)
    .then(() => {
      document.getElementById('copyStatus').innerText = "✅ Copied to clipboard!";
      setTimeout(() => {
        document.getElementById('copyStatus').innerText = "";
      }, 2000);
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};
