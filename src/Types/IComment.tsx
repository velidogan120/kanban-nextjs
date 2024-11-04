export interface IComment {
  text: string;
  vote: number;
  column: string;
  sessionId: string | null;
  hasVoted: string[];
}
