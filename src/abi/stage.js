module.exports = {
  'abi': [
    {
      'constant': true,
      'inputs': [],
      'name': 'rootHash',
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
      'name': 'setCompleted',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'stageHash',
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
      'constant': true,
      'inputs': [],
      'name': 'getObjectionableTxHashes',
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
      'constant': false,
      'inputs': [
        {
          'name': '_txHash',
          'type': 'bytes32'
        }
      ],
      'name': 'resolveObjections',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': '_txHash',
          'type': 'bytes32'
        },
        {
          'name': '_customer',
          'type': 'address'
        }
      ],
      'name': 'addObjectionableTxHash',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'isSettle',
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
          'name': 'objectionSuccess',
          'type': 'bool'
        },
        {
          'name': 'getCompensation',
          'type': 'bool'
        }
      ],
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
      'inputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'name': 'objectionableTxHashes',
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
      'name': 'objectionTime',
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
      'constant': false,
      'inputs': [
        {
          'name': '_txHash',
          'type': 'bytes32'
        }
      ],
      'name': 'resolveCompensation',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'finalizedTime',
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
      'inputs': [
        {
          'name': '_stageHash',
          'type': 'bytes32'
        },
        {
          'name': '_rootHash',
          'type': 'bytes32'
        },
        {
          'name': '_lib',
          'type': 'address'
        },
        {
          'name': '_objectionTimePeriod',
          'type': 'uint256'
        },
        {
          'name': '_finalizedTimePeriod',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'type': 'constructor'
    }
  ]
};
