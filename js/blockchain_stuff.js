const NETWORK_ID = 4
const TOKEN_CONTRACT_ADDRESS = "0x3C0f4BAd53f58cD70C5d7Eb7b4DBA356C1eC6B8C"
const MARKETPLACE_CONTRACT_ADDRESS = "0x73851989a3e3e50BB7BfbB35BAAFfB95B7aF90B0"
const TOKEN_CONTRACT_JSON_PATH = "js/NFTContract.json"
const MARKETPLACE_CONTRACT_JSON_PATH = "js/MarketplaceContract.json"
var token_contract
var marketplace_contract
var accounts
var web3
var balance

function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent = "Accounts changed, refreshing...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent = "Network changed, refreshing...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if (document.readyState == "complete") {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent = "Error: Please connect to Metamask";
      }
    } else {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent = "Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3, contract_json_path, contract_address) => {
  const response = await fetch(contract_json_path);
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    contract_address
  );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent = "Cargando..."
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          token_contract = await getContract(web3, TOKEN_CONTRACT_JSON_PATH, TOKEN_CONTRACT_ADDRESS)
          marketplace_contract = await getContract(web3, MARKETPLACE_CONTRACT_JSON_PATH, MARKETPLACE_CONTRACT_ADDRESS)
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          tokenMinted = 0

          //Approve Button
          let approve_btn = document.createElement("button")
          approve_btn.innerHTML = "Approve"
          document.getElementById("my_nfts").appendChild(approve_btn)
          approve_btn.onclick = function () {
            approve(MARKETPLACE_CONTRACT_ADDRESS)
          }

          for (i = 1; i < 10; i++) {
            balance = await token_contract.methods.balanceOf(accounts[0], i).call()
            if (balance > 0) {
              for (j = 0; j < balance; j++)
                insertMyTokenHTML(i, j)
              tokenMinted++;
            }
          }

          my_listings_count = await marketplace_contract.methods.getListingsByOwnerCount(accounts[0]).call()
          for (i = 0; i < my_listings_count; i++) {
            listing_id = await marketplace_contract.methods.getListingsByOwner(accounts[0], i).call()
            insertMyListingHTML(listing_id)
          }

          active_listing_count = await marketplace_contract.methods.getActiveListingsCount().call()
          for (i = 0; i < active_listing_count; i++) {
            listing_id = await marketplace_contract.methods.getActiveListings(i).call()
            insertActiveListingHTML(listing_id)
          }

          if (tokenMinted == 1)
            document.getElementById("web3_message").textContent = "You have 1 token type"
          else
            document.getElementById("web3_message").textContent = "You have " + tokenMinted + " token types"
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent = "Please connect to Rinkeby";
      }
    });
  };
  awaitWeb3();
}

function insertMyTokenHTML(nft_id, nft_sub_id) {
  //Token number text
  var token_element = document.createElement("p")
  var token_imagen = document.createElement("img")
  token_imagen.classList.add("imagen")
  if (nft_id == 1) {
    token_imagen.src = "img/NFT_Jessica_EXCLUSIVO_mini.png"
  } else if (nft_id == 2) {
    token_imagen.src = "img/NFT_Jessica2D_Marco_COMUN_mini.png"
  } else if (nft_id == 3) {
    token_imagen.src = "img/NFT_JessicaPistola_Marco_POCOCOMUN_mini.png"
  } else if (nft_id == 4) {
    token_imagen.src = "img/NFT_JessicaVR_Marco_SUPER_mini.png"
  } else if (nft_id == 5) {
    token_imagen.src = "img/NFT_JessicaArcade_Marco_RARO_mini.png"
  } else if (nft_id == 6) {
    token_imagen.src = "img/NFT_JessicaBuggie_Marco_EPICO_mini.png"
  } else if (nft_id == 7) {
    token_imagen.src = "img/NFT_JessicaTanque_Marco_LEGENDARIO_mini.png"
  } else if (nft_id == 8) {
    token_imagen.src = "img/NFT_JessicaLiberator_Marco_BARBARO_mini.png"
  } else if (nft_id == 9) {
    token_imagen.src = "img/NFT_JessicaBattleCruiser_Marco_DESTRUCTOR_mini.png"
  }

  token_element.innerHTML = "Token #" + nft_id
  document.getElementById("my_nfts").appendChild(token_element)
  document.getElementById("my_nfts").appendChild(token_imagen)
  //Price
  var input = document.createElement("input")
  input.type = "text"
  input.value = "Price"
  input.id = "price" + nft_id + "_" + nft_sub_id
  document.getElementById("my_nfts").appendChild(input)

  //Sell Button
  let mint_btn = document.createElement("button")
  mint_btn.innerHTML = "Sell"
  document.getElementById("my_nfts").appendChild(mint_btn)
  mint_btn.onclick = function () {
    price = document.getElementById("price" + nft_id + "_" + nft_sub_id).value;
    addListing(nft_id, web3.utils.toWei(price), 1)
  }
}

async function insertMyListingHTML(listing_id) {
  listing = await marketplace_contract.methods.listings(listing_id).call()
  //Token number text
  var token_element = document.createElement("p")
  var token_imagen = document.createElement("img")
  token_imagen.classList.add("imagen")
  if (listing.token_id == 1) {
    token_imagen.src = "img/NFT_Jessica_EXCLUSIVO_mini.png"
  } else if (listing.token_id == 2) {
    token_imagen.src = "img/NFT_Jessica2D_Marco_COMUN_mini.png"
  } else if (listing.token_id == 3) {
    token_imagen.src = "img/NFT_JessicaPistola_Marco_POCOCOMUN_mini.png"
  } else if (listing.token_id == 4) {
    token_imagen.src = "img/NFT_JessicaVR_Marco_SUPER_mini.png"
  } else if (listing.token_id == 5) {
    token_imagen.src = "img/NFT_JessicaArcade_Marco_RARO_mini.png"
  } else if (listing.token_id == 6) {
    token_imagen.src = "img/NFT_JessicaBuggie_Marco_EPICO_mini.png"
  } else if (listing.token_id == 7) {
    token_imagen.src = "img/NFT_JessicaTanque_Marco_LEGENDARIO_mini.png"
  } else if (listing.token_id == 8) {
    token_imagen.src = "img/NFT_JessicaLiberator_Marco_BARBARO_mini.png"
  } else if (listing.token_id == 9) {
    token_imagen.src = "img/NFT_JessicaBattleCruiser_Marco_DESTRUCTOR_mini.png"
  }
  token_element.innerHTML = "Token #" + listing.token_id + " (price: " + web3.utils.fromWei(listing.price) + ")"
  document.getElementById("my_listings").appendChild(token_element)
  document.getElementById("my_listings").appendChild(token_imagen)
  //Delist Button
  let delist_btn = document.createElement("button")
  delist_btn.innerHTML = "Delist"
  document.getElementById("my_listings").appendChild(delist_btn)
  delist_btn.onclick = function () {
    removeListing(listing_id)
  }
}

async function insertActiveListingHTML(listing_id) {
  listing = await marketplace_contract.methods.listings(listing_id).call()
  //Token number text
  var token_element = document.createElement("p")
  var token_imagen = document.createElement("img")
  token_imagen.classList.add("imagen")
  if (listing.token_id == 1) {
    token_imagen.src = "img/NFT_Jessica_EXCLUSIVO_mini.png"
  } else if (listing.token_id == 2) {
    token_imagen.src = "img/NFT_Jessica2D_Marco_COMUN_mini.png"
  } else if (listing.token_id == 3) {
    token_imagen.src = "img/NFT_JessicaPistola_Marco_POCOCOMUN_mini.png"
  } else if (listing.token_id == 4) {
    token_imagen.src = "img/NFT_JessicaVR_Marco_SUPER_mini.png"
  } else if (listing.token_id == 5) {
    token_imagen.src = "img/NFT_JessicaArcade_Marco_RARO_mini.png"
  } else if (listing.token_id == 6) {
    token_imagen.src = "img/NFT_JessicaBuggie_Marco_EPICO_mini.png"
  } else if (listing.token_id == 7) {
    token_imagen.src = "img/NFT_JessicaTanque_Marco_LEGENDARIO_mini.png"
  } else if (listing.token_id == 8) {
    token_imagen.src = "img/NFT_JessicaLiberator_Marco_BARBARO_mini.png"
  } else if (listing.token_id == 9) {
    token_imagen.src = "img/NFT_JessicaBattleCruiser_Marco_DESTRUCTOR_mini.png"
  }
  token_element.innerHTML = "Token #" + listing.token_id + " (price: " + web3.utils.fromWei(listing.price) + ")"
  document.getElementById("all_listings").appendChild(token_element)
  document.getElementById("all_listings").appendChild(token_imagen)
  //Delist Button
  let delist_btn = document.createElement("button")
  delist_btn.innerHTML = "Buy"
  document.getElementById("all_listings").appendChild(delist_btn)
  delist_btn.onclick = function () {
    buy(listing_id, listing.price)
  }
}

const mint = async () => {
  const result = await token_contract.methods.mint(1, 1)//JESSICA EXCLUSIVO 
    .send({ from: accounts[0], value: web3.utils.toWei("0.15", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}


const mint2 = async () => {
  const result = await token_contract.methods.mint(1, 2)//COMUN
    .send({ from: accounts[0], value: web3.utils.toWei("0.05", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}




const mint3 = async () => {
  const result = await token_contract.methods.mint(1, 3) //POCO COMUN
    .send({ from: accounts[0], value: web3.utils.toWei("0.15", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}



const mint4 = async () => {
  const result = await token_contract.methods.mint(1, 4)//SUPER
    .send({ from: accounts[0], value: web3.utils.toWei("0.25", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}


const mint5 = async () => {
  const result = await token_contract.methods.mint(1, 5)//RARO
    .send({ from: accounts[0], value: web3.utils.toWei("0.5", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}


const mint6 = async () => {
  const result = await token_contract.methods.mint(1, 6)//EPICO
    .send({ from: accounts[0], value: web3.utils.toWei("0.75", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}




const mint7 = async () => {
  const result = await token_contract.methods.mint(1, 7)//LEGENDARIO
    .send({ from: accounts[0], value: web3.utils.toWei("1", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}



const mint8 = async () => {
  const result = await token_contract.methods.mint(1, 8)//BARBARO
    .send({ from: accounts[0], value: web3.utils.toWei("2.5", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}



const mint9 = async () => {
  const result = await token_contract.methods.mint(1, 9)//DESTRUCTOR
    .send({ from: accounts[0], value: web3.utils.toWei("5", "ether") * 1 })//PRECIO
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Minting...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}


















const approve = async (contract_address) => {
  const result = await token_contract.methods.setApprovalForAll(contract_address, true)
    .send({ from: accounts[0], gas: 0 })
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Approving...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const addListing = async (token_id, price, amount) => {
  const result = await marketplace_contract.methods.addListing(token_id, price, amount)
    .send({ from: accounts[0], gas: 555555 })
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Adding listing...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const removeListing = async (listing_id) => {
  const result = await marketplace_contract.methods.removeListing(listing_id)
    .send({ from: accounts[0], gas: 0 })
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Removing from listings...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const buy = async (listing_id, price) => {
  const result = await marketplace_contract.methods.buy(listing_id)
    .send({ from: accounts[0], gas: 0, value: price })
    .on('transactionHash', function (hash) {
      document.getElementById("web3_message").textContent = "Buying...";
    })
    .on('receipt', function (receipt) {
      document.getElementById("web3_message").textContent = "Success!";
    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}


loadDapp()