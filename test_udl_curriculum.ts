/**
 * CRESCO Production — UDL Curriculum & Verification Test Suite
 */

import {
  UDL_SUBNET_PROBLEM_A,
  UDL_SUBNET_PROBLEM_B,
  UDL_TCP_VS_UDP_SCENARIOS,
  UDL_TCP_TROUBLESHOOTING_SCENARIOS,
  UDL_EDUCATIONAL_PACKET_TRACE,
  UDL_TCP_STATES
} from './src/data/udlCurriculum';

import {
  validateSubnetEntry,
  validateTcpHeaderPuzzle,
  validateTcpCloseSequence
} from './src/services/udlService';

console.log('====================================================');
console.log('🧪 CRESCO UDL END-TO-END VERIFICATION TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(desc: string, cond: boolean) {
  if (cond) {
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    failed++;
  }
}

// 1. Subnet Problem A (192.168.10.0/24 -> 4 subnets)
console.log('--- 1. Module A: Subnetting Mathematics & Validation ---');
const sub1Valid = validateSubnetEntry(UDL_SUBNET_PROBLEM_A.id, 1, {
  networkId: '192.168.10.0',
  firstUsableHost: '192.168.10.1',
  lastUsableHost: '192.168.10.62',
  broadcastAddress: '192.168.10.63'
});
assert('Problem A Subnet 1 ground truth calculation passes validation', sub1Valid.isCorrect);

const sub1WrongNet = validateSubnetEntry(UDL_SUBNET_PROBLEM_A.id, 1, {
  networkId: '192.168.10.1',
  firstUsableHost: '192.168.10.1',
  lastUsableHost: '192.168.10.62',
  broadcastAddress: '192.168.10.63'
});
assert('Problem A Subnet 1 with incorrect network ID fails validation', !sub1WrongNet.isCorrect);

const sub4Valid = validateSubnetEntry(UDL_SUBNET_PROBLEM_A.id, 4, {
  networkId: '192.168.10.192',
  firstUsableHost: '192.168.10.193',
  lastUsableHost: '192.168.10.254',
  broadcastAddress: '192.168.10.255'
});
assert('Problem A Subnet 4 ground truth calculation passes validation', sub4Valid.isCorrect);

// 2. Subnet Problem B (172.16.0.0/20 -> 8 subnets)
console.log('\n--- 2. Module A: Advanced Practice Supernetting (/20 -> /23) ---');
assert('Problem B has exactly 8 subnets', UDL_SUBNET_PROBLEM_B.subnets.length === 8);
assert('Problem B block size is 2 in 3rd octet', UDL_SUBNET_PROBLEM_B.blockSize === 2);
assert('Problem B usable hosts per subnet is 510', UDL_SUBNET_PROBLEM_B.usableHostsPerSubnet === 510);

const subBSubnet8 = validateSubnetEntry(UDL_SUBNET_PROBLEM_B.id, 8, {
  networkId: '172.16.14.0',
  firstUsableHost: '172.16.14.1',
  lastUsableHost: '172.16.15.254',
  broadcastAddress: '172.16.15.255'
});
assert('Problem B Subnet 8 ground truth calculation passes validation', subBSubnet8.isCorrect);

// 3. TCP State Machine
console.log('\n--- 3. Module B: TCP State Machine RFC 793 ---');
assert('TCP state registry contains all 11 canonical states', UDL_TCP_STATES.length === 11);
const activeCloseCorrect = validateTcpCloseSequence(['ESTABLISHED', 'FIN_WAIT_1', 'FIN_WAIT_2', 'TIME_WAIT', 'CLOSED']);
assert('RFC 793 active close progression passes', activeCloseCorrect.isCorrect);

const activeCloseWrong = validateTcpCloseSequence(['ESTABLISHED', 'TIME_WAIT', 'CLOSED']);
assert('Incomplete active close sequence is rejected', !activeCloseWrong.isCorrect);

// 4. TCP Header Puzzle
console.log('\n--- 4. Module B: 32-Bit TCP Header Puzzle ---');
const perfectHeader = {
  'pos_0_15': 'Source Port (16 bits)',
  'pos_16_31': 'Destination Port (16 bits)',
  'pos_32_63': 'Sequence Number (32 bits)',
  'pos_64_95': 'Acknowledgement Number (32 bits)',
  'pos_96_99': 'Data Offset / Header Length (4 bits)',
  'pos_100_105': 'Reserved (6 bits)',
  'pos_106_111': 'Flags: URG, ACK, PSH, RST, SYN, FIN (6 bits)',
  'pos_112_127': 'Window Size (16 bits)',
  'pos_128_143': 'Checksum (16 bits)',
  'pos_144_159': 'Urgent Pointer (16 bits)'
};
const headerScore = validateTcpHeaderPuzzle(perfectHeader);
assert('All 10 TCP header slots placed correctly scores 100%', headerScore.scorePercentage === 100);

const partialHeader = validateTcpHeaderPuzzle({ 'pos_0_15': 'Source Port (16 bits)' });
assert('1 correct field placed yields partial score (10%)', partialHeader.scorePercentage === 10);

// 5. TCP vs UDP Scenario Completeness
console.log('\n--- 5. Module B: TCP vs UDP Scenario Matrix ---');
assert('Scenario classifier contains exactly 6 real-world cases', UDL_TCP_VS_UDP_SCENARIOS.length === 6);
const dnsScen = UDL_TCP_VS_UDP_SCENARIOS.find(s => s.id === 'scen_dns');
assert('DNS query correctly maps to UDP with rationale', dnsScen?.correctProtocol === 'UDP');
const sftpScen = UDL_TCP_VS_UDP_SCENARIOS.find(s => s.id === 'scen_sftp');
assert('SFTP banking transfer correctly maps to TCP with rationale', sftpScen?.correctProtocol === 'TCP');

// 6. Packet Analysis & Troubleshooting
console.log('\n--- 6. Module B: Packet Capture & Diagnostics ---');
assert('Educational packet capture trace contains 8 sequential frames', UDL_EDUCATIONAL_PACKET_TRACE.length === 8);
assert('Frame 1 is SYN, Frame 2 is SYN-ACK, Frame 3 is ACK',
  UDL_EDUCATIONAL_PACKET_TRACE[0].flags.includes('SYN') &&
  UDL_EDUCATIONAL_PACKET_TRACE[1].flags.includes('SYN') &&
  UDL_EDUCATIONAL_PACKET_TRACE[1].flags.includes('ACK') &&
  UDL_EDUCATIONAL_PACKET_TRACE[2].flags.includes('ACK')
);
assert('Troubleshooting bank contains 5 real-world scenarios', UDL_TCP_TROUBLESHOOTING_SCENARIOS.length === 5);

console.log('\n====================================================');
console.log(`📊 UDL TEST SUMMARY: ${passed} / ${passed + failed} TESTS PASSED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
