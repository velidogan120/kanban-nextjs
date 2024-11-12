import { IComment } from '@/Types/IComment'
import { useDroppable } from '@dnd-kit/core';
import { Card } from 'antd'
import React from 'react'
import Comment from './Comment';

const CommentSubList = ({commentSubList,column}:{column:string,commentSubList:(IComment & { id: string })[]}) => {
    const {isOver,setNodeRef} = useDroppable({ id: column,});
    const style = {
        "backgroundColor": isOver ? 'crimson' : undefined,
        "minHeight":"30px",
        "padding":"20px",
      };
    return (
        <div ref={setNodeRef}  style={style}>
            {
                commentSubList.length > 0 && commentSubList.map((subComment) => <Comment key={subComment.id} column={subComment.column} id={subComment.id} comment={subComment} subCommentBoolean={true}/>)
            }
        </div>
    )
}

export default CommentSubList