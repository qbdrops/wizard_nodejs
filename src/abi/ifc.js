module.exports = {
  'abi': [
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
      'inputs': [
        {
          'name': '',
          'type': 'bytes32'
        }
      ],
      'name': 'BlockAddress',
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
          'name': 'addr',
          'type': 'address'
        }
      ],
      'name': 'addBlockAddress',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': 'blkID',
          'type': 'bytes32'
        }
      ],
      'name': 'getBlockAddress',
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
      'name': 'blockID',
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
      'name': 'reset',
      'outputs': [],
      'payable': false,
      'type': 'function'
    },
    {
      'inputs': [],
      'payable': false,
      'type': 'constructor'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': false,
          'name': '_blkID',
          'type': 'bytes32'
        },
        {
          'indexed': false,
          'name': '_addr',
          'type': 'address'
        }
      ],
      'name': 'SideChainAddEvent',
      'type': 'event'
    }
  ]
};
