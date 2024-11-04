"use client"
import { initializeState, setKanbanId } from '@/redux/slices/commentSlice'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useDispatch } from 'react-redux'
import "@/styles/start.scss"

const Start = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const startKanban = () => {
        window.localStorage.removeItem("totalVote");
        const kanbanId = `${Date.now()}-${Math.random()}`;
        dispatch(setKanbanId(kanbanId));
        dispatch(initializeState());
        router.push(`/kanban/${kanbanId}`);
    }
  return (
    <div className='container'>
        <Button className="button button--piyo" type='link' onClick={() => startKanban()}>
          <div className="button__wrapper">
              <span className="button__text">
                <span className="default-text">CREATE NEW RETRO TOOL</span>
                <span className="small-screen-text">Start</span>
              </span>
          </div>
          <div className="characterBox">
              <div className="character wakeup">
                  <div className="character__face"></div>
                  <div className="charactor__face2"></div>
                  <div className="charactor__body"></div>
              </div>
              <div className="character wakeup">
                  <div className="character__face"></div>
                  <div className="charactor__face2"></div>
                  <div className="charactor__body"></div>
              </div>
              <div className="character">
                  <div className="character__face"></div>
                  <div className="charactor__face2"></div>
                  <div className="charactor__body"></div>
              </div>
          </div>
        </Button>
    </div>
  )
}

export default Start