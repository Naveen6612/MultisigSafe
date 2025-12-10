export const FACTORY_ABI_EVENTS = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "owners",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "numConfirmationsRequired",
        type: "uint256",
      },
    ],
    name: "WalletCreated",
    type: "event",
  },

  {
    inputs: [
      { internalType: "address payable", name: "wallet", type: "address" },
    ],
    name: "adminClearTransactions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address payable", name: "wallet", type: "address" },
    ],
    name: "adminGetTransactions",
    outputs: [
      {
        components: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "bytes", name: "data", type: "bytes" },
          { internalType: "bool", name: "executed", type: "bool" },
          {
            internalType: "uint256",
            name: "numConfirmations",
            type: "uint256",
          },
        ],
        internalType: "struct MultiSigWallet.Transaction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address payable", name: "wallet", type: "address" },
      { internalType: "uint256", name: "txIndex", type: "uint256" },
    ],
    name: "adminRemoveTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "allWallets",
    outputs: [
      { internalType: "address", name: "wallet", type: "address" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "deleted", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address[]", name: "_owners", type: "address[]" },
      {
        internalType: "uint256",
        name: "_numConfirmationsRequired",
        type: "uint256",
      },
    ],
    name: "createWallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "deleteAllMyWallets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "deleteMyWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "getAllWallets",
    outputs: [
      {
        components: [
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "deleted", type: "bool" },
        ],
        internalType: "struct MultiSigFactoryV2.WalletMeta[]",
        name: "result",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getWalletsOf",
    outputs: [
      {
        components: [
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "deleted", type: "bool" },
        ],
        internalType: "struct MultiSigFactoryV2.WalletMeta[]",
        name: "result",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "walletIdsByCreator",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
