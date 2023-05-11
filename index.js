// in nodejs
// require()

// in front-end javascript you can't use require
// import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

//below, we make this async because otherwise it opens metamask every time page is refreshed
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        // console.log("I see a metamask!")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        // console.log("Connected!")
        connectButton.innerHTML = "Connected!"
    } else {
        console.log("No metamask!")
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //above, Web3Provider is an object in ethers that basically lets us wrap around stuff like metamask
        // signer / wallet / someone with some gas
        const signer = provider.getSigner()
        //above, this returns whatever wallet is connected to the provider (metamask is our provider)
        console.log(signer)
        //contract that we are interacting with
        const contract = new ethers.Contract(contractAddress, abi, signer)
        // above, we need to know the ABI & Address. Typically, since once the contract is deployed, the address will change,
        //      usually you'll need some type of constants file (constants.js)
        //now that we have all our contract objects, we can start making transactions as we have before. Below...
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //to add some indication to the user of what's going on,
            //listen for the tx to be mined
            // or listen for an event
            // basically saying "hey, waitfor this tx to finish"
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // below, promise takes a function itself as an input parameter. That function has 2 input parameters
    //below, resolve says if this promise works correctly, call this resolve function
    // below, reject rejects if there's some type of timeout parameter
    // below, Promise only returns once a resolve or reject is called
    return new Promise((resolve, reject) => {
        // the reason we return a promise above is because we need to create a listener for the blockchain
        // listen for this transaction to finish (listener (below))
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            // once the provider.once sees a transaction hash, it's going to give, as an input parameter, a transaction receipt
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            // above, this will show how many block confirmations it has
            resolve()
            // above, this is saying only finish this function once the transactionResponse.hash is found
            // above, this is because the resolve() is inside the provider.once
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        //above, this returns whatever wallet is connected to the provider (metamask is our provider)
        // below, is the contract we are interacting with
        const contract = new ethers.Contract(contractAddress, abi, signer)
        // above, we need to know the ABI & Address. Typically, since once the contract is deployed, the address will change,
        //      usually you'll need some type of constants file (constants.js)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
