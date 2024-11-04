import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {IComment} from "@/Types/IComment"
import { ISessionVote } from '@/Types/ISessionVote'

export interface CommentState {
  comments: (IComment & { id: string })[],
  kanbanId: string,
  sessionId: string,
  sessionsVotes: ISessionVote[],
  totalVote: number,
  step:number,
  btnDisabled:boolean
}

const initialState: CommentState = {
  comments: [],
  kanbanId:"",
  sessionId:"",
  sessionsVotes: [],
  totalVote:0,
  step:1,
  btnDisabled:false
}

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    setKanbanId:(state,actions:PayloadAction<string>) => {
      state.kanbanId = actions.payload;
    },
    setSessionId: (state,actions:PayloadAction<string>) => {
      state.sessionId = actions.payload;
    },
    setSessionsVotes: (state,actions:PayloadAction<ISessionVote[]>) => {
      state.sessionsVotes = actions.payload;
    },
    setBtnDisabled:(state,actions:PayloadAction<boolean>)=>{
      state.btnDisabled = actions.payload;
    },
    setTotalVote: (state,actions:PayloadAction<number>) => {
      state.totalVote = actions.payload || 0;
    },
    initializeState: (state) => {
      if (typeof window !== "undefined") {
        state.sessionId = window.localStorage.getItem("sessionId") ?? "";
      }
    },
    addComment:(state,actions:PayloadAction<(IComment & { id: string })>) => {
      state.comments = [
        ...state.comments.filter((item) => item.id != actions.payload.id),
        actions.payload,
      ];
    },
    deleteComment:(state,actions:PayloadAction<string>) => {
      if(actions.payload){
        state.comments = [
          ...state.comments.filter((item) => item.id != actions.payload)
        ];
      }
    },
    voteComment:(state,actions:PayloadAction<string>) => {
      if(state.totalVote < 5){
        const comment = state.comments.find((comment) => comment.id == actions.payload);
        if(comment && !comment.hasVoted.includes(state.sessionId)){
          comment.vote += 1;
          state.totalVote += 1;
          comment.hasVoted.push(state.sessionId);
        }
      }
    },
    setSessionVote:(state,actions:PayloadAction<ISessionVote>) => {
      state.sessionsVotes.push(actions.payload);
    },
    setStep:(state,actions:PayloadAction<number>) => {
      state.step = actions.payload;
    },
    nextStep:(state) => {
      if(state.step < 4){
        state.step++;
      }
    }
  },
})

export const { setKanbanId , setSessionId , addComment , deleteComment , voteComment , nextStep , setStep , initializeState , setSessionsVotes , setSessionVote , setTotalVote , setBtnDisabled} = commentSlice.actions

export default commentSlice.reducer