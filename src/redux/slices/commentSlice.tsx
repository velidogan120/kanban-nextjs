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
      const comment  = state.comments.map((comment) => comment.id == actions.payload.id);
      if(comment){
        state.comments = [
          ...state.comments.filter((item) => item.id != actions.payload.id),
          actions.payload,
        ];
      }
    },
    addSubComment:(state,actions:PayloadAction<{updatedComment:(IComment & { id: string }),id:string}>) => {
      const parentComment = state.comments.find((comment) => comment.id == actions.payload.id);
      const updatedComment = state.comments.find((comment) => comment.commentSubList.some((subComment)=> subComment.id == actions.payload.updatedComment.id))
      let updatedVote:number = actions.payload.updatedComment.vote;
      if(!updatedComment && parentComment){
        parentComment.vote = parentComment.vote + actions.payload.updatedComment.vote;
        const comment = state.comments.find((comment)=> comment.id == actions.payload.updatedComment.id);
        if(comment){
          comment.commentSubList.map((subComment)=> comment.vote = comment.vote - subComment.vote);
          updatedVote = comment.vote;
        }
      }
      if(updatedComment && parentComment){
        const subComment = updatedComment.commentSubList.find((subComment) => subComment.id == actions.payload.updatedComment.id);
        if(subComment){
          updatedComment.vote -= subComment.vote;
          parentComment.vote += subComment.vote
        }
      }
      state.comments = [...state.comments.filter((item) => item.id != actions.payload.updatedComment.id)];
      state.comments.map((comment) => comment.commentSubList = [...comment.commentSubList.filter((subComment)=> subComment.id != actions.payload.updatedComment.id)])
      if(parentComment){
        const newUpdatedComment = {...actions.payload.updatedComment,vote:updatedVote,commentSubList:[]}
        parentComment.commentSubList = [...parentComment.commentSubList,...actions.payload.updatedComment.commentSubList,newUpdatedComment]
      }else{
        if(updatedComment)updatedComment.vote -= actions.payload.updatedComment.vote;
        state.comments.push(actions.payload.updatedComment)
      }
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

export const { setKanbanId , setSessionId , addComment , deleteComment , voteComment , nextStep , setStep , initializeState , setSessionsVotes , setSessionVote , setTotalVote , setBtnDisabled , addSubComment } = commentSlice.actions

export default commentSlice.reducer