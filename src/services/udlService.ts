/**
 * CRESCO Production — UDL Service (Universal Design for Learning)
 * Persists and validates student interactions, calculations, simulations, and assessments.
 *
 * Real Firestore collection: `udl_submissions` and `udl_activities`.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UDL_SUBNET_PROBLEM_A,
  UDL_SUBNET_PROBLEM_B,
  UDL_TCP_VS_UDP_SCENARIOS,
  UDL_TCP_STATES,
  UDL_EDUCATIONAL_PACKET_TRACE
} from '../data/udlCurriculum';

export interface UdlSubmissionRecord {
  id: string;
  activityId: string;
  moduleId: 'module_a_ipv4' | 'module_b_tcp_udp';
  modality: 'calculation' | 'interactive_sim' | 'written_explanation' | 'table_entry' | 'packet_analysis' | 'role_play';
  studentId: string;
  studentName: string;
  studentRegNo: string;
  studentEmail: string;
  answers: Record<string, any>;
  autoScore: number;
  maxScore: number;
  isEvaluated: boolean;
  facultyFeedback?: string;
  facultyRubricScores?: {
    representation?: number;
    engagement?: number;
    expression?: number;
  };
  submittedAt: string;
  updatedAt: string;
}

export interface UdlActivityConfig {
  id: string;
  title: string;
  moduleId: 'module_a_ipv4' | 'module_b_tcp_udp';
  description: string;
  learningObjectives: string[];
  assignedSection: string;
  dueDate: string;
  maxPoints: number;
  published: boolean;
  createdAt: string;
}

/**
 * Validates a single subnet block calculation against the authoritative ground truth
 */
export function validateSubnetEntry(
  problemId: string,
  subnetIndex: number,
  entry: {
    networkId: string;
    firstUsableHost: string;
    lastUsableHost: string;
    broadcastAddress: string;
  }
) {
  const problem = problemId === UDL_SUBNET_PROBLEM_B.id ? UDL_SUBNET_PROBLEM_B : UDL_SUBNET_PROBLEM_A;
  const targetSubnet = problem.subnets.find(s => s.subnetIndex === subnetIndex);

  if (!targetSubnet) {
    return {
      isCorrect: false,
      message: `Invalid subnet index ${subnetIndex}.`,
      fieldMatches: { networkId: false, firstUsableHost: false, lastUsableHost: false, broadcastAddress: false }
    };
  }

  const clean = (s: string) => (s || '').trim().toLowerCase();

  const networkMatch = clean(entry.networkId) === clean(targetSubnet.networkId);
  const firstMatch = clean(entry.firstUsableHost) === clean(targetSubnet.firstUsableHost);
  const lastMatch = clean(entry.lastUsableHost) === clean(targetSubnet.lastUsableHost);
  const broadcastMatch = clean(entry.broadcastAddress) === clean(targetSubnet.broadcastAddress);

  const isCorrect = networkMatch && firstMatch && lastMatch && broadcastMatch;

  return {
    isCorrect,
    target: targetSubnet,
    fieldMatches: {
      networkId: networkMatch,
      firstUsableHost: firstMatch,
      lastUsableHost: lastMatch,
      broadcastAddress: broadcastMatch
    },
    message: isCorrect
      ? `Correct! Subnet ${subnetIndex} calculated accurately.`
      : `Discrepancy detected in Subnet ${subnetIndex}. Verify network boundaries, host ranges, and broadcast values.`
  };
}

/**
 * Validates TCP Header Puzzle placement
 */
export function validateTcpHeaderPuzzle(placements: Record<string, string>) {
  // Ground truth positions (bit offset -> field name)
  const expected: Record<string, string> = {
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

  let correctCount = 0;
  const total = Object.keys(expected).length;
  const details: Record<string, boolean> = {};

  for (const [key, fieldName] of Object.entries(expected)) {
    const isMatch = placements[key] === fieldName;
    details[key] = isMatch;
    if (isMatch) correctCount++;
  }

  return {
    correctCount,
    total,
    scorePercentage: Math.round((correctCount / total) * 100),
    details
  };
}

/**
 * Validates TCP State Machine Sequence (Active Close)
 */
export function validateTcpCloseSequence(states: string[]): { isCorrect: boolean; feedback: string } {
  // Expected Active Close path from ESTABLISHED:
  // ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED
  const targetPath = ['ESTABLISHED', 'FIN_WAIT_1', 'FIN_WAIT_2', 'TIME_WAIT', 'CLOSED'];
  if (states.length !== targetPath.length) {
    return {
      isCorrect: false,
      feedback: `Path length mismatch. Expected 5 states for active close sequence (ESTABLISHED through CLOSED).`
    };
  }

  for (let i = 0; i < targetPath.length; i++) {
    if (states[i] !== targetPath[i]) {
      return {
        isCorrect: false,
        feedback: `Mismatch at position ${i + 1}: Received "${states[i] || 'empty'}", expected "${targetPath[i]}".`
      };
    }
  }

  return {
    isCorrect: true,
    feedback: 'Correct! You successfully reconstructed the RFC 793 active close state progression.'
  };
}

/**
 * Persist student UDL activity submission to Firestore `udl_submissions`
 */
export async function persistUdlSubmission(
  submission: Omit<UdlSubmissionRecord, 'id' | 'submittedAt' | 'updatedAt'>
): Promise<UdlSubmissionRecord> {
  const user = auth.currentUser;
  const studentId = submission.studentId || user?.uid || 'guest_student';
  const now = new Date().toISOString();
  const submissionId = `udl_sub_${submission.activityId}_${studentId}_${Date.now()}`;

  const fullRecord: UdlSubmissionRecord = {
    ...submission,
    id: submissionId,
    studentId,
    submittedAt: now,
    updatedAt: now
  };

  try {
    const docRef = doc(db, 'udl_submissions', submissionId);
    await setDoc(docRef, {
      ...fullRecord,
      createdAtServer: serverTimestamp()
    });
    console.info(`[UDL Service] Persisted submission ${submissionId} to Firestore.`);
    return fullRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `udl_submissions/${submissionId}`);
    // If offline or permission denied, preserve locally in localStorage
    try {
      const localKey = `cresco_udl_submissions_${studentId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.unshift(fullRecord);
      localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn('[UDL Service] Local fallback storage warning:', e);
    }
    return fullRecord;
  }
}

/**
 * Fetch all UDL submissions for a given student
 */
export async function fetchStudentUdlSubmissions(studentId: string): Promise<UdlSubmissionRecord[]> {
  if (!studentId) return [];

  try {
    const q = query(
      collection(db, 'udl_submissions'),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    const records: UdlSubmissionRecord[] = [];
    snap.forEach(d => {
      records.push(d.data() as UdlSubmissionRecord);
    });

    records.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'udl_submissions');
    // Fallback to local storage if network offline
    try {
      const localKey = `cresco_udl_submissions_${studentId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      return existing;
    } catch {
      return [];
    }
  }
}

/**
 * Fetch authoritative UDL activities published by faculty
 */
export async function fetchPublishedUdlActivities(): Promise<UdlActivityConfig[]> {
  try {
    const q = query(
      collection(db, 'udl_activities'),
      where('published', '==', true)
    );
    const snap = await getDocs(q);
    const list: UdlActivityConfig[] = [];
    snap.forEach(d => {
      list.push(d.data() as UdlActivityConfig);
    });

    if (list.length > 0) return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'udl_activities');
  }

  // Authoritative default published activities if faculty has not customized yet
  return [
    {
      id: 'udl_mod_a_subnet',
      title: 'Module A: IPv4 Addressing, Binary Octets & Subnetting',
      moduleId: 'module_a_ipv4',
      description: 'Master IPv4 address decomposition, CIDR prefix mathematics, and subnet boundary engineering across multiple modalities.',
      learningObjectives: [
        'Analyze 32-bit IPv4 structure into Network and Host portions',
        'Divide Class C (192.168.10.0/24) into 4 subnets with zero waste',
        'Calculate block sizes and valid host ranges for /20 -> /23 supernets'
      ],
      assignedSection: 'All Sections (CS-4200)',
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      maxPoints: 50,
      published: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'udl_mod_b_tcp_udp',
      title: 'Module B: TCP & UDP Transport Layer Deep Dive',
      moduleId: 'module_b_tcp_udp',
      description: 'Explore 3-way handshake, packet loss retransmissions, sliding window flow control, congestion window (cwnd), and protocol diagnostics.',
      learningObjectives: [
        'Demonstrate 3-way handshake sequence with SYN, SYN-ACK, ACK',
        'Analyze lost packet retransmissions and Fast Retransmit',
        'Model TCP Sliding Window dynamics and BDP throughput',
        'Investigate Wireshark educational packet captures and troubleshoot RST drops'
      ],
      assignedSection: 'All Sections (CS-4200)',
      dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
      maxPoints: 50,
      published: true,
      createdAt: new Date().toISOString()
    }
  ];
}
