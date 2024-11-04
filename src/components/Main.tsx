"use client"
import "@/styles/main.scss"
import { Button, Col, Flex, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import Column from './Column'
import { IColumn } from '@/Types/IColumn'
import { CheckSquareOutlined, FormOutlined, PlusCircleOutlined, SolutionOutlined, UpSquareOutlined } from '@ant-design/icons'
import logo from "@/../public/asset/logo.jpg"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { addComment, deleteComment, nextStep, setBtnDisabled, setKanbanId, setSessionId, setSessionsVotes, setStep, setTotalVote } from "@/redux/slices/commentSlice"
import { RootState, store } from "@/redux/store"
import { addStepFromDatabase, fetchCommentFromDatabase, fetchSessionsVotesFromDatabase, fetchStepFromDatabase, updateCommentFromDatabase } from "@/services/firestore"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { socket } from "@/api/socket"
import { ISessionVote } from "@/Types/ISessionVote"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Main = ({kanbanId}:{kanbanId:string}) => {

  const [columns,setColumns] = useState<Array<IColumn>>([
    {icon:<UpSquareOutlined className='column-icon' />,input:"Geliştirilmesi Şart",columnStep:1,label:"improve"},
    {icon:<PlusCircleOutlined className='column-icon'/>,input:"Eklenmesi Gerekli",columnStep:1,label:"necessaries"},
    {icon:<SolutionOutlined className='column-icon'/>,input:"Çözümler",columnStep:1,label:"solutions"},
    {icon:<CheckSquareOutlined className='column-icon'/>,input:"Sonuç",columnStep:4,label:"actions"},
  ])
  const {comments,step} = useSelector((state:RootState) => state.comment);
  const dispatch = useDispatch();
  
  let sessionId =typeof window !== "undefined"? window.localStorage.getItem("sessionId"):"";
  

  useEffect(() => {
    dispatch(setKanbanId(kanbanId));
    if(!sessionId) {
      sessionId = `${Date.now()}-${Math.random()}`;
      window.localStorage.setItem("sessionId",sessionId);
    }
    dispatch(setSessionId(sessionId));
    initialize();
    document.body.style.backgroundImage = "url(/asset/2.png)";

    socket.on("commentAdded", async(data) => {
      console.log(data)
      await initialize();
    });

    socket.on("commentDeleted", async(data) => {
      dispatch(deleteComment(data));
    });

    socket.on("commentVoted", async(data) => {
      await initialize();
    });

    socket.on("commentStepOver", async(data) => {
      console.log(data)      
      await initialize();
    });

    socket.on("btnDisabled", async(data) => {
      console.log(data)
      dispatch(setBtnDisabled(data));
    });

    return () => {
      socket.off("commentAdded");
      socket.off("commentDeleted");
      socket.off("commentVoted");
      socket.off("commentStepOver");
      socket.off("btnDisabled");
    }
  }, [kanbanId, dispatch])
  
  const initialize = async() => {
    const commentsDb = await fetchCommentFromDatabase(kanbanId);
    const stepsDb = await fetchStepFromDatabase(kanbanId);
    const sessionsVotesDb = await fetchSessionsVotesFromDatabase(kanbanId);
    commentsDb.map((comment) => dispatch(addComment(comment)));
    const totalVote = (sessionsVotesDb.find((sessionVote:ISessionVote) => sessionVote.sessionId == sessionId))?.totalVote
    dispatch(setStep(stepsDb));
    dispatch(setTotalVote(totalVote));
    dispatch(setSessionsVotes(sessionsVotesDb));
  }
  
  const handleDropEnd = async(event:DragEndEvent) => {
    const { active, over } = event; 
    if (!active || !over) return;

    const comment = comments.find((comment) => comment.id == active.id);
    if (!comment) return;
    const updatedComment = { ...comment, column: String(over.id) };
    dispatch(addComment(updatedComment));
    await updateCommentFromDatabase(kanbanId, updatedComment.id, { column:updatedComment.column});
  }

  const handleStep = async() => {
    dispatch(nextStep());
    const updatedStep = store.getState().comment.step;
    await addStepFromDatabase(kanbanId,{step:updatedStep});
    socket.emit("commentStep",updatedStep)
  }

  const handleExport = () => {
      const doc = new jsPDF();

      const columnBackgroundColors:{[key:string]:string} = {
          improve: '#FFDDC1',
          necessaries: '#C1E1FF',
          solutions: '#C1FFC1',
          actions: '#FFB2B2',
      };

      const rows = columns.map(column => {
          const columnComments = comments.filter(comment => comment.column === column.label);

          if (column.label === 'actions') {
              return columnComments.map((comment, index) => [
                  index + 1,
                  comment.text,
              ]);
          } else {
              return columnComments.map((comment, index) => [
                  index + 1,
                  comment.text,
                  comment.vote,
              ]);
          }
      });

      columns.forEach((column, index) => {
          const columnData = rows[index];

          const headers = column.label === 'actions'
              ? [[column.label.toUpperCase(), 'COMMENT']]
              : [[column.label.toUpperCase(), 'COMMENT', 'VOTES']];

          autoTable(doc, {
              head: headers,
              body: columnData,
              columnStyles: {
                  0: { cellWidth: 35 },
                  1: { cellWidth: 'auto' },
                  ...(column.label !== 'actions' ? { 2: { cellWidth: 22 } } : {}),
              },
              didParseCell: (data) => {
                  data.cell.styles.fillColor = columnBackgroundColors[column.label];
                  data.cell.styles.lineWidth = 0.5;
                  data.cell.styles.lineColor = [0, 0, 0];
              },
              margin: { top: 10, bottom: 10 },
              styles: {
                  cellPadding: 5,
                  fontSize: 10,
                  lineColor: [0, 0, 0],
                  lineWidth: 0.5,
              },
              headStyles: {
                  fillColor: [240, 240, 240],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold',
                  lineColor: [0, 0, 0],
                  lineWidth: 0.5,
              },
          });
      });

      doc.save('comments_report.pdf');
  };
  return (
    <>
      <DndContext onDragEnd={handleDropEnd}>
        <header className="main-header">
          <Flex align="center" justify="space-between">
            <Image className="logo" src={logo} alt="kanban" priority></Image>
            <Flex gap={5}>
              <Button onClick={handleExport} color="default" variant="solid"><FormOutlined />EXPORT</Button>
              <Button onClick={handleStep} color="danger" variant="solid">NEXT STEP</Button>
            </Flex>
          </Flex>
        </header>
        <Row gutter={[16,16]} className="columns">
            {columns?.map((column:IColumn,index:number) => {
              return <Col key={index} sm={24} md={12} xxl={6}>
                  <Column key={index} column={column} initialize={initialize}/>
              </Col>
            })}
        </Row>
      </DndContext>
    </>
  )
}

export default Main