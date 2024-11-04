import Main from '@/components/Main'
import React from 'react'

type Params = {
  kanbanId:string
}
const Kanban = ({params}:{params:Params}) => {
  const kanbanId = params.kanbanId;
  return (
    <div>
        <Main kanbanId={kanbanId}></Main>
    </div>
  )
}

export default Kanban