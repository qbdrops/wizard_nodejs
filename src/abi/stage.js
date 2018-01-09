module.exports = {
  'abi': [
    {
      'constant': true,
      'inputs': [],
      'name': 'sideChainRootHash',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [],
      'name': 'exonerate',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'treeHeight',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'getErrorTIDs',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32[]'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'sideChainOwner',
      'outputs': [
        {
          'name': '',
          'type': 'address'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'name': 'errorTIDs',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'obj_time',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': 'idx',
          'type': 'uint256'
        }
      ],
      'name': 'getSibling',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'exr_time',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': 'tid',
          'type': 'bytes32'
        }
      ],
      'name': 'getObjectorNodeIndex',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'version',
      'outputs': [
        {
          'name': '',
          'type': 'string'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [],
      'name': 'judge',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'name': 'indexMerkleTree',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': 'tid',
          'type': 'bytes32'
        },
        {
          'name': 'scid',
          'type': 'bytes32'
        },
        {
          'name': 'content',
          'type': 'bytes32'
        },
        {
          'name': 'v',
          'type': 'uint8'
        },
        {
          'name': 'r',
          'type': 'bytes32'
        },
        {
          'name': 's',
          'type': 'bytes32'
        }
      ],
      'name': 'takeObjection',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'name': 'list',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'name': 'leafNode',
      'outputs': [
        {
          'name': 'dataLength',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'sideChainTemplate',
      'outputs': [
        {
          'name': '',
          'type': 'address'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'name': 'objections',
      'outputs': [
        {
          'name': 'customer',
          'type': 'address'
        },
        {
          'name': 'hashOfContent',
          'type': 'bytes32'
        },
        {
          'name': 'objectionSuccess',
          'type': 'bool'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': 'IMTidx',
          'type': 'uint256[]'
        },
        {
          'name': 'IMTnodeHash',
          'type': 'bytes32[]'
        },
        {
          'name': 'LFDidx',
          'type': 'uint256[]'
        },
        {
          'name': 'lfd',
          'type': 'bytes32[]'
        }
      ],
      'name': 'setting',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'completed',
      'outputs': [
        {
          'name': '',
          'type': 'bool'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'deposit',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'sideChainID',
      'outputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'payable': false,
      'type': 'function'
    },
    {
      'inputs': [
        {
          'name': '_addr',
          'type': 'address'
        },
        {
          'name': 'scid',
          'type': 'bytes32'
        },
        {
          'name': 'rh',
          'type': 'bytes32'
        },
        {
          'name': 'th',
          'type': 'uint256'
        },
        {
          'name': 'objection_time',
          'type': 'uint256'
        },
        {
          'name': 'exonerate_time',
          'type': 'uint256'
        }
      ],
      'payable': true,
      'type': 'constructor'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': '_owner',
          'type': 'address'
        },
        {
          'indexed': true,
          'name': '_scid',
          'type': 'bytes32'
        },
        {
          'indexed': false,
          'name': '_func',
          'type': 'bytes4'
        }
      ],
      'name': 'SideChainEvent',
      'type': 'event'
    }
  ]
};
