// Hand-written to match supabase/migrations/0001_init.sql exactly (verified
// against the live schema — Docker isn't available locally to run
// `supabase gen types` / the MCP generator, so this is maintained by hand
// until one of those becomes available). Extend this file in the same
// migration-by-migration order as supabase/migrations/*.sql.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DiscoveryStatus =
  | "draft"
  | "researching"
  | "completed"
  | "failed"
  | "insufficient_evidence";

export type AgentRunAgentType = "research" | "market" | "product" | "red_team";
export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed";

export type EvidenceStatusEnum =
  | "VERIFIED"
  | "SUPPORTED"
  | "INFERRED"
  | "HYPOTHESIS"
  | "PREDICTION"
  | "UNKNOWN";

export type EvidenceTypeEnum =
  | "market_data"
  | "competitor"
  | "academic"
  | "news"
  | "community"
  | "patent"
  | "other";

export type ResearchJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "partial"
  | "insufficient_evidence";

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      discoveries: {
        Row: {
          id: string;
          org_id: string;
          created_by: string;
          title: string;
          problem_statement: string;
          status: DiscoveryStatus;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          created_by: string;
          title: string;
          problem_statement: string;
          status?: DiscoveryStatus;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          created_by?: string;
          title?: string;
          problem_statement?: string;
          status?: DiscoveryStatus;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discoveries_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_runs: {
        Row: {
          id: number;
          discovery_id: string;
          org_id: string;
          job_id: string | null;
          agent_type: AgentRunAgentType;
          status: AgentRunStatus;
          model: string | null;
          summary: string | null;
          tokens_input: number | null;
          tokens_output: number | null;
          error: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          discovery_id: string;
          org_id: string;
          job_id?: string | null;
          agent_type: AgentRunAgentType;
          status?: AgentRunStatus;
          model?: string | null;
          summary?: string | null;
          tokens_input?: number | null;
          tokens_output?: number | null;
          error?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          discovery_id?: string;
          org_id?: string;
          job_id?: string | null;
          agent_type?: AgentRunAgentType;
          status?: AgentRunStatus;
          model?: string | null;
          summary?: string | null;
          tokens_input?: number | null;
          tokens_output?: number | null;
          error?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_discovery_id_fkey";
            columns: ["discovery_id"];
            isOneToOne: false;
            referencedRelation: "discoveries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_runs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "research_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      research_jobs: {
        Row: {
          id: string;
          discovery_id: string;
          org_id: string;
          status: ResearchJobStatus;
          requested_agents: string[];
          error: string | null;
          retry_count: number;
          started_at: string | null;
          finished_at: string | null;
          created_by: string;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discovery_id: string;
          org_id: string;
          status?: ResearchJobStatus;
          requested_agents?: string[];
          error?: string | null;
          retry_count?: number;
          started_at?: string | null;
          finished_at?: string | null;
          created_by: string;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discovery_id?: string;
          org_id?: string;
          status?: ResearchJobStatus;
          requested_agents?: string[];
          error?: string | null;
          retry_count?: number;
          started_at?: string | null;
          finished_at?: string | null;
          created_by?: string;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "research_jobs_discovery_id_fkey";
            columns: ["discovery_id"];
            isOneToOne: false;
            referencedRelation: "discoveries";
            referencedColumns: ["id"];
          },
        ];
      };
      evidence: {
        Row: {
          id: number;
          discovery_id: string;
          org_id: string;
          agent_run_id: number;
          source_name: string;
          source_url: string;
          published_date: string | null;
          retrieved_at: string;
          evidence_type: EvidenceTypeEnum;
          quality_score: number;
          confidence_score: number;
          status: EvidenceStatusEnum;
          summary: string;
          raw_excerpt: string | null;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          discovery_id: string;
          org_id: string;
          agent_run_id: number;
          source_name: string;
          source_url: string;
          published_date?: string | null;
          retrieved_at?: string;
          evidence_type?: EvidenceTypeEnum;
          quality_score: number;
          confidence_score: number;
          status: EvidenceStatusEnum;
          summary: string;
          raw_excerpt?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          discovery_id?: string;
          org_id?: string;
          agent_run_id?: number;
          source_name?: string;
          source_url?: string;
          published_date?: string | null;
          retrieved_at?: string;
          evidence_type?: EvidenceTypeEnum;
          quality_score?: number;
          confidence_score?: number;
          status?: EvidenceStatusEnum;
          summary?: string;
          raw_excerpt?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_agent_run_id_fkey";
            columns: ["agent_run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidence_discovery_id_fkey";
            columns: ["discovery_id"];
            isOneToOne: false;
            referencedRelation: "discoveries";
            referencedColumns: ["id"];
          },
        ];
      };
      gaps: {
        Row: {
          id: string;
          discovery_id: string;
          org_id: string;
          job_id: string | null;
          title: string;
          description: string;
          status: EvidenceStatusEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          discovery_id: string;
          org_id: string;
          job_id?: string | null;
          title: string;
          description: string;
          status: EvidenceStatusEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          discovery_id?: string;
          org_id?: string;
          job_id?: string | null;
          title?: string;
          description?: string;
          status?: EvidenceStatusEnum;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gaps_discovery_id_fkey";
            columns: ["discovery_id"];
            isOneToOne: false;
            referencedRelation: "discoveries";
            referencedColumns: ["id"];
          },
        ];
      };
      gap_evidence: {
        Row: { gap_id: string; evidence_id: number };
        Insert: { gap_id: string; evidence_id: number };
        Update: { gap_id?: string; evidence_id?: number };
        Relationships: [
          {
            foreignKeyName: "gap_evidence_gap_id_fkey";
            columns: ["gap_id"];
            isOneToOne: false;
            referencedRelation: "gaps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gap_evidence_evidence_id_fkey";
            columns: ["evidence_id"];
            isOneToOne: false;
            referencedRelation: "evidence";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          id: string;
          discovery_id: string;
          org_id: string;
          gap_id: string | null;
          title: string;
          description: string;
          opportunity_score: number;
          confidence_score: number;
          scoring_breakdown: Json;
          status: "candidate" | "saved" | "archived";
          is_saved: boolean;
          is_demo: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          discovery_id: string;
          org_id: string;
          gap_id?: string | null;
          title: string;
          description: string;
          opportunity_score: number;
          confidence_score: number;
          scoring_breakdown: Json;
          status?: "candidate" | "saved" | "archived";
          is_saved?: boolean;
          is_demo?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          discovery_id?: string;
          org_id?: string;
          gap_id?: string | null;
          title?: string;
          description?: string;
          opportunity_score?: number;
          confidence_score?: number;
          scoring_breakdown?: Json;
          status?: "candidate" | "saved" | "archived";
          is_saved?: boolean;
          is_demo?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_discovery_id_fkey";
            columns: ["discovery_id"];
            isOneToOne: false;
            referencedRelation: "discoveries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_gap_id_fkey";
            columns: ["gap_id"];
            isOneToOne: false;
            referencedRelation: "gaps";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunity_evidence: {
        Row: { opportunity_id: string; evidence_id: number; relevance_weight: number };
        Insert: {
          opportunity_id: string;
          evidence_id: number;
          relevance_weight?: number;
        };
        Update: {
          opportunity_id?: string;
          evidence_id?: number;
          relevance_weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "opportunity_evidence_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_evidence_evidence_id_fkey";
            columns: ["evidence_id"];
            isOneToOne: false;
            referencedRelation: "evidence";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
