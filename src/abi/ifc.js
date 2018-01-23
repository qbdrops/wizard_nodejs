module.exports = {
  'abi': [
    {
      'constant': false,
      'inputs': [
        {
          'name': 'agentResponse',
          'type': 'bytes32[]'
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
      'constant': false,
      'inputs': [
        {
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'name': '_txHash',
          'type': 'bytes32'
        },
        {
          'name': '_idx',
          'type': 'uint256'
        },
        {
          'name': 'slice',
          'type': 'bytes32[]'
        },
        {
          'name': 'leaf',
          'type': 'bytes32[]'
        }
      ],
      'name': 'exonerate',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'name': 'paymentHashes',
          'type': 'bytes32[]'
        }
      ],
      'name': 'payPenalty',
      'outputs': [],
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
      'name': 'stageAddress',
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
      'name': 'stages',
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
      'name': 'owner',
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
      'constant': false,
      'inputs': [
        {
          'name': '_stageHash',
          'type': 'bytes32'
        }
      ],
      'name': 'finalize',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'lib',
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
          'name': '_stageHash',
          'type': 'bytes32'
        }
      ],
      'name': 'getStageAddress',
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
      'constant': false,
      'inputs': [
        {
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'name': '_rootHash',
          'type': 'bytes32'
        }
      ],
      'name': 'addNewStage',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'stageHeight',
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
      'inputs': [],
      'payable': true,
      'type': 'constructor'
    },
    {
      'payable': true,
      'type': 'fallback'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'indexed': false,
          'name': '_stageAddress',
          'type': 'address'
        }
      ],
      'name': 'AddNewStage',
      'type': 'event'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'indexed': false,
          'name': '_txHash',
          'type': 'bytes32'
        }
      ],
      'name': 'TakeObjection',
      'type': 'event'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'indexed': false,
          'name': '_txHash',
          'type': 'bytes32'
        }
      ],
      'name': 'Exonerate',
      'type': 'event'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': '_stageHash',
          'type': 'bytes32'
        }
      ],
      'name': 'Finalize',
      'type': 'event'
    }
  ]
};
