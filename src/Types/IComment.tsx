export interface IComment {
  id?: string;
  text: string;
  vote: number;
  column: string;
  sessionId: string | null;
  hasVoted: string[];
  commentSubList: (IComment & {id:string})[];
}
