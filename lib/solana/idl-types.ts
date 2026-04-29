/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prax_auction.json`.
 */
export type PraxAuction = {
  "address": "NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH",
  "metadata": {
    "name": "praxAuction",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Prax Dutch auction program for inference credit tokens"
  },
  "instructions": [
    {
      "name": "closeAuction",
      "discriminator": [
        225,
        129,
        91,
        48,
        215,
        73,
        203,
        172
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "auction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "auction.seller",
                "account": "auction"
              },
              {
                "kind": "account",
                "path": "auction.seed",
                "account": "auction"
              }
            ]
          }
        },
        {
          "name": "creditMint"
        },
        {
          "name": "creditVaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction"
              }
            ]
          }
        },
        {
          "name": "creditVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creditVaultAuthority"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "sellerCreditAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creditTokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createAuction",
      "discriminator": [
        234,
        6,
        201,
        246,
        47,
        219,
        176,
        107
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "auction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "arg",
                "path": "auctionSeed"
              }
            ]
          }
        },
        {
          "name": "creditMint"
        },
        {
          "name": "quoteMint"
        },
        {
          "name": "sellerCreditAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creditVaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction"
              }
            ]
          }
        },
        {
          "name": "creditVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creditVaultAuthority"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creditTokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "auctionSeed",
          "type": "u64"
        },
        {
          "name": "creditAmount",
          "type": "u64"
        },
        {
          "name": "startPrice",
          "type": "u64"
        },
        {
          "name": "floorPrice",
          "type": "u64"
        },
        {
          "name": "durationSecs",
          "type": "i64"
        }
      ]
    },
    {
      "name": "placeBid",
      "discriminator": [
        238,
        77,
        148,
        91,
        200,
        151,
        92,
        146
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "auction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "auction.seller",
                "account": "auction"
              },
              {
                "kind": "account",
                "path": "auction.seed",
                "account": "auction"
              }
            ]
          }
        },
        {
          "name": "creditMint"
        },
        {
          "name": "quoteMint"
        },
        {
          "name": "creditVaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "auction"
              }
            ]
          }
        },
        {
          "name": "creditVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creditVaultAuthority"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyerCreditAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "creditTokenProgram"
              },
              {
                "kind": "account",
                "path": "creditMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyerQuoteAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "quoteTokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "sellerQuoteAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "account",
                "path": "quoteTokenProgram"
              },
              {
                "kind": "account",
                "path": "quoteMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "seller"
        },
        {
          "name": "creditTokenProgram"
        },
        {
          "name": "quoteTokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "auction",
      "discriminator": [
        218,
        94,
        247,
        242,
        126,
        233,
        131,
        81
      ]
    }
  ],
  "events": [
    {
      "name": "auctionClosed",
      "discriminator": [
        104,
        72,
        168,
        177,
        241,
        79,
        231,
        167
      ]
    },
    {
      "name": "auctionCreated",
      "discriminator": [
        133,
        190,
        194,
        65,
        172,
        0,
        70,
        178
      ]
    },
    {
      "name": "auctionFilled",
      "discriminator": [
        179,
        194,
        228,
        99,
        108,
        245,
        165,
        110
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "zeroAmount",
      "msg": "amount must be > 0"
    },
    {
      "code": 6001,
      "name": "badPriceCurve",
      "msg": "start_price must be > floor_price > 0"
    },
    {
      "code": 6002,
      "name": "badDuration",
      "msg": "duration must be within (0, 7 days]"
    },
    {
      "code": 6003,
      "name": "alreadyFilled",
      "msg": "auction already filled"
    },
    {
      "code": 6004,
      "name": "notYetExpired",
      "msg": "auction not yet expired"
    },
    {
      "code": 6005,
      "name": "mathOverflow",
      "msg": "math overflow"
    }
  ],
  "types": [
    {
      "name": "auction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seed",
            "type": "u64"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "creditMint",
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "type": "pubkey"
          },
          {
            "name": "creditAmount",
            "type": "u64"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "floorPrice",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "durationSecs",
            "type": "i64"
          },
          {
            "name": "filled",
            "type": "bool"
          },
          {
            "name": "fillTs",
            "type": "i64"
          },
          {
            "name": "fillPrice",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "auctionClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "ts",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "auctionCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "creditMint",
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "type": "pubkey"
          },
          {
            "name": "creditAmount",
            "type": "u64"
          },
          {
            "name": "startPrice",
            "type": "u64"
          },
          {
            "name": "floorPrice",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "durationSecs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "auctionFilled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auction",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "fillTs",
            "type": "i64"
          },
          {
            "name": "fillPrice",
            "type": "u64"
          },
          {
            "name": "totalQuote",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
