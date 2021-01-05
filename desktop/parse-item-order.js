const BufferReader = require('buffer-reader');
const fs = require('fs');

const XOR8 = 0x73;
const XOR16 = 0x7373;
const XOR32 = 0x73737373;

class UnexpectedSizeError extends Error {
  constructor(expected, real) {
    super(`Incorrect Size - Expected ${expected} but got ${real}`);
  }
}

class UnexpectedIdentifierError extends Error {
  constructor(expected, real) {
    super(`Unexpected Identifier - Expected 0x${expected.toString(16).padStart(2, '0')} but got 0x${real.toString(16).padStart(2, '0')}`);
  }
}

const readSlot = function readSlot(reader) {
  let s = reader.nextUInt8() ^ XOR8;
  if (s !== 4) throw new UnexpectedSizeError(4, s);
  return { slotIndex: reader.nextUInt16LE() ^ XOR16, containerIndex: reader.nextUInt16LE() ^ XOR16 };
};

const readInventory = function readInventory(reader) {
  let s = reader.nextUInt8() ^ XOR8;
  if (s !== 4) throw new UnexpectedSizeError(4, s);
  let slotCount = reader.nextUInt32LE() ^ XOR32;

  let inventory = [];
  for (let i = 0; i < slotCount; i++) {
    let x = reader.nextUInt8() ^ XOR8;
    if (x !== 0x69) throw new UnexpectedIdentifierError(0x69, x);
    let slot = readSlot(reader);
    inventory.push(slot);
  }

  return inventory;
};

const readRetainers = function readRetainers(reader) {
  let s = reader.nextUInt8() ^ XOR8;
  if (s !== 4) throw new UnexpectedSizeError(4, s);
  let retainerCount = reader.nextUInt32LE() ^ XOR32;
  let retainers = [];
  for (let i = 0; i < retainerCount; i++) {
    let x = reader.nextUInt8() ^ XOR8;
    if (x !== 0x52) throw new UnexpectedIdentifierError(0x52, x);
    let retainer = readRetainer(reader);
    retainers.push(retainer);
  }
  return retainers;
};

const readRetainer = function readRetainer(reader) {
  let s = reader.nextUInt8() ^ XOR8;
  if (s !== 8) throw new UnexpectedSizeError(8, s);

  let retainer = {
    id: reader.nextBuffer(8).map(b => b ^ XOR8).reverse().toString('hex')
  };

  let x = reader.nextUInt8() ^ XOR8;
  if (x !== 0x6E) throw new UnexpectedIdentifierError(0x6E, x);
  retainer.inventory = readInventory(reader);
  return retainer;
};

const inventoryNames = [
  'PlayerInventory',
  'ArmouryMainHand',
  'ArmouryHead',
  'ArmouryBody',
  'ArmouryHands',
  'ArmouryWaist',
  'ArmouryLegs',
  'ArmouryFeet',
  'ArmouryOffHand',
  'ArmouryEars',
  'ArmouryNeck',
  'ArmouryWrists',
  'ArmouryRings',
  'ArmourySoulCrystal',
  'SaddleBagLeft',
  'SaddleBagRight'
];


const parseItemOrder = function parseItemOrder(fileBuffer) {
  let reader = new BufferReader(fileBuffer);

  // Skip header
  reader.nextBuffer(16);
  const data = {};

  reader.move(1); // Unknown Byte, Appears to be the main inventory size, but that is
  let inventoryIndex = 0;
  try {
    while (true) {
      let identifier = reader.nextUInt8() ^ XOR8;
      switch (identifier) {
        case 0x56: {
          // Unknown
          reader.move(reader.nextUInt8() ^ XOR8);
          break;
        }
        case 0x6E: {
          // Start of an inventory
          let inventory = readInventory(reader);

          let inventoryName = inventoryNames[inventoryIndex++];
          data[inventoryName] = inventory;

          break;
        }

        case 0x4E: {
          data.Retainers = readRetainers(reader);
          break;
        }

        case 0x73: {
          return data;
        }
        default: {
          throw new Error('Unexpected Identifier: ' + identifier);
        }

      }
    }
  } catch (err) {
    console.error(err);
  }

  return data;
};

if (require.main === module) {
  let result = parseItemOrder(fs.readFileSync(process.argv[2]));
  console.log(result);
  fs.writeFileSync('./itemodr.json', JSON.stringify(result, null, 2), 'utf8');
} else {
  module.exports = parseItemOrder;
}
