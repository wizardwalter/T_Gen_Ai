export type GraphNode = {
  id: string;
  label: string;
  type: string; // e.g., aws_instance, aws_lb
  service: string; // normalized service family, e.g., ec2, elb, vpc
  metadata?: Record<string, unknown>;
};

export type GraphEdge = {
  from: string;
  to: string;
  relation: string;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
