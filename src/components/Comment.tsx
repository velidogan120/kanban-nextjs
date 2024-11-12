"use client"
import React from 'react'
import "@/styles/comment.scss"
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Card, Skeleton } from 'antd';
import { addOrUpdateSessionVote, deleteCommentFromDatabase, fetchCommentFromDatabase, updateCommentFromDatabase } from '@/services/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '@/redux/store';
import { addComment, deleteComment, setBtnDisabled, voteComment } from "@/redux/slices/commentSlice"
import { useDraggable } from '@dnd-kit/core';
import { IComment } from '@/Types/IComment';
import { IColumn } from '@/Types/IColumn';
import { socket } from '@/socket';
import CommentSubList from './CommentSubList';

const Comment = ({column,comment,id,subCommentBoolean}:{column:string,comment:IComment,id:string,subCommentBoolean?:boolean}) => {
  const kanbanId = useSelector((state:RootState)=> state.comment.kanbanId);
  const dispatch = useDispatch();
  const {comments,totalVote,sessionId,step,btnDisabled} = useSelector((state:RootState) => state.comment);
  const steps = sessionId == comment.sessionId || step > 1;
  const { attributes, listeners, setNodeRef, transform , isDragging } = useDraggable({
    id: id, 
    data: { ...comment }
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: "1000",opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const deleteCard = async(id:string) => {
    await deleteCommentFromDatabase(kanbanId,id);
    dispatch(deleteComment(id));
    socket.emit("commentDelete",id)
  }
  const vote = async(id:string) => {
    dispatch(setBtnDisabled(true));
    socket.emit("btnDisable",true);
    try{
      const comment = comments.find((comment) => comment.id === id);
      if (!comment) return;
      const hasVoted = comment.hasVoted.includes(sessionId);  
      if (comment && totalVote < 5 && !hasVoted) {
        const updatedVote = comment.vote + 1;
        const updatedHasVoted = [...comment.hasVoted, sessionId];
        await updateCommentFromDatabase(kanbanId, id, { hasVoted: [...updatedHasVoted], vote: updatedVote });
        await dispatch(voteComment(id));
        const updatedTotalVotes = store.getState().comment.totalVote;
        await addOrUpdateSessionVote(kanbanId,{sessionId:sessionId,totalVote:updatedTotalVotes });
        const commentsDb = await fetchCommentFromDatabase(kanbanId);
        commentsDb.map((comment) => dispatch(addComment(comment)));
        socket.emit("commentVote",id)
      }
    }finally{
      dispatch(setBtnDisabled(false));
      socket.emit("btnDisable",false);
    }
  }

  if(!steps) return <Skeleton></Skeleton>
  return (
    <>
      <div ref={setNodeRef}  style={style} >
        <Card.Grid className='card' key={id} >
          <div className='comment'>
            <div className='comment_global_bg'>
              <div className='comment-item_bg'{...listeners} {...attributes}></div>    
              <p className='comment_title'>{comment.text}</p>
              {<CommentSubList column={id} commentSubList={comment.commentSubList}/>}
              {step == 2 && !subCommentBoolean? <button role='button' className='comment-item_btn_box' onClick={() => vote(id)} disabled={btnDisabled}>{comment.vote}<CheckCircleFilled className='comment-item_btn' /></button>:""}
              {(column == "actions" || step == 1) && !subCommentBoolean ? <div className='comment-item_btn_box deleteBtn' onClick={() => deleteCard(id)}><CloseCircleFilled className='comment-item_btn' /></div> :""}     
            </div>
          </div>          
        </Card.Grid>
      </div>
    </>
  )
}

export default Comment