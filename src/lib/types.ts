export type NodeStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'DEMONSTRATED'
  | 'RUSTY'
  | 'DETOUR';

export type IntakeType = 'GOAL_FIRST' | 'DECONSTRUCTION_LAB';

export type AssessmentType =
  | 'RESOURCE_PROOF'
  | 'PERTURBATION'
  | 'SABOTAGE'
  | 'EXPLAIN_IT_BACK';

export interface SkillNodeDTO {
  id: string;
  goalId: string;
  title: string;
  description: string;
  domainCategory: string;
  status: NodeStatus;
  isDetour: boolean;
  parentNodeId?: string | null;
  stability: number;
  retrievability: number;
  x?: number;
  y?: number;
}

export interface NodeEdgeDTO {
  id: string;
  prerequisiteId: string;
  dependentId: string;
}

export interface DAGTopologyDTO {
  goalId: string;
  goalTitle: string;
  nodes: SkillNodeDTO[];
  edges: NodeEdgeDTO[];
}

export interface UserStatsDTO {
  userId: string;
  username: string;
  level: number;
  xp: number;
  overallRetrievability: number;
  activeSabotageAlert: boolean;
}
