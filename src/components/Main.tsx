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
import { addComment, addSubComment, deleteComment, nextStep, setBtnDisabled, setKanbanId, setSessionId, setSessionsVotes, setStep, setTotalVote } from "@/redux/slices/commentSlice"
import { RootState, store } from "@/redux/store"
import { addCommentFromDatabase, addStepFromDatabase, deleteCommentFromDatabase, fetchCommentFromDatabase, fetchSessionsVotesFromDatabase, fetchStepFromDatabase, updateCommentFromDatabase } from "@/services/firestore"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { socket } from "@/socket"
import { ISessionVote } from "@/Types/ISessionVote"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify"
import { AutoTablejsPDF } from "@/Types/IAutoTablejsPDF"

const Main = ({kanbanId}:{kanbanId:string}) => {

  const [columns,setColumns] = useState<Array<IColumn>>([
    {icon:<UpSquareOutlined className='column-icon' />,input:"Geliştirilmesi Şart",columnStep:1,label:"improve"},
    {icon:<PlusCircleOutlined className='column-icon'/>,input:"Eklenmesi Gerekli",columnStep:1,label:"necessaries"},
    {icon:<SolutionOutlined className='column-icon'/>,input:"Çözümler",columnStep:1,label:"solutions"},
    {icon:<CheckSquareOutlined className='column-icon'/>,input:"Sonuç",columnStep:4,label:"actions"},
  ])
  const dispatch = useDispatch();
  const {comments,step} = useSelector((state:RootState) => state.comment);
  
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
      await initialize();
    });

    socket.on("commentDeleted", async(data) => {
      dispatch(deleteComment(data));
    });

    socket.on("commentVoted", async(data) => {
      await initialize();
    });

    socket.on("commentStepOver", async(data) => {  
      await initialize();
    });

    socket.on("btnDisabled", async(data) => {
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
    if (active.id == over.id) return;
    const supComment = comments.find((comment) => 
      comment.commentSubList.some((subComment) => subComment.id === active.id)
    );
    
    const subComment = store.getState().comment.comments.find((comment) => comment.commentSubList.some((subComment) => subComment.id == over.id))
    if (subComment) return;
    let movedComment;
    if (supComment) {
      movedComment = supComment.commentSubList.find((subComment) => subComment.id === active.id);
    } else {
      movedComment = comments.find((comment) => comment.id === active.id);
    }
    if (!movedComment) return;

    if(movedComment.id == over.id) return
    if(movedComment.column == over.id) return;
    const updatedComment = { ...movedComment, column: String(over.id) };

    const parentComment = comments.find((comment) => comment.id == over.id);

    const id = String(over.id);
    if(parentComment){
      await dispatch(addSubComment({updatedComment,id}));
      const updatedParentComment = store.getState().comment.comments.find((comment) => comment.id == id)
      const updatedSupComment = store.getState().comment.comments.find((comment) => comment.id == supComment?.id)
      if(updatedParentComment){
        await deleteCommentFromDatabase(kanbanId,updatedComment.id)
        await updateCommentFromDatabase(kanbanId, updatedParentComment.id, { commentSubList:updatedParentComment.commentSubList,vote:updatedParentComment.vote})
        if(updatedSupComment){await updateCommentFromDatabase(kanbanId, updatedSupComment.id, { commentSubList:updatedSupComment.commentSubList,vote:updatedSupComment.vote})}
      };
    }else{
      await dispatch(addSubComment({updatedComment,id}));
      const updatedComment1 = store.getState().comment.comments.find((comment) => comment.id == supComment?.id)
      if(updatedComment1){
        await updateCommentFromDatabase(kanbanId, updatedComment1.id, { commentSubList:updatedComment1.commentSubList,vote:updatedComment1.vote });
        await addCommentFromDatabase(kanbanId,updatedComment,updatedComment.id);
      }else{
        await updateCommentFromDatabase(kanbanId,updatedComment.id,{column:updatedComment.column});
      }      
    }
    initialize();
    socket.emit("commentAdd","Updated")
  }

  const handleStep = async() => {
    dispatch(nextStep());
    const updatedStep = store.getState().comment.step;
    await addStepFromDatabase(kanbanId,{step:updatedStep});
    socket.emit("commentStep",updatedStep)
  }
  
  const handleExport = () => {
    const doc = new jsPDF() as AutoTablejsPDF;
  
    const columnBackgroundColors: { [key: string]: string } = {
      improve: '#FFDDC1',
      necessaries: '#C1E1FF',
      solutions: '#C1FFC1',
      actions: '#FFB2B2',
    };
    let currentY = 30;
    columns.forEach((column) => {
      const columnData = comments.filter(comment => comment.column === column.label);
      
      if (columnData.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
  
        columnData.forEach((comment, index) => {
          autoTable(doc, {
            startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 10 : 30,
            head: [[column.label.toUpperCase(), 'VOTE']],
            body: [[comment.text, comment.vote]],
            styles: {
              cellPadding: 4,
              fontSize: 10,
              lineColor: [0, 0, 0],
              lineWidth: 0.2,
            },
            theme: 'grid',
            headStyles: {
              fillColor: columnBackgroundColors[column.label],
              textColor: [0, 0, 0],
            },
          });
  
          if (comment.commentSubList && comment.commentSubList.length > 0) {
            const subCommentHeaders = [['SUB COMMENT', 'VOTE']];
            const subCommentRows = comment.commentSubList.map(subComment => [
              subComment.text,
              subComment.vote,
            ]);
  
            autoTable(doc, {
              startY: doc.autoTable.previous.finalY + 5,
              head: subCommentHeaders,
              body: subCommentRows,
              styles: {
                cellPadding: 3,
                fontSize: 9,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
              },
              theme: 'striped',
              headStyles: {
                fillColor: [220, 220, 220],
                textColor: [0, 0, 0],
              },
              columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 20 },
              },
            });
          }

          currentY = doc.autoTable.previous.finalY + 10;
        });
      }
    });
  
    doc.save('kanban_comments.pdf');
  };
  
  
  const kanbanHeader = (step:number) => {
    const text = (sentence:string) => {
      const oldSentence:any = sentence.split(" ").join(" ").toUpperCase();
      const newSentence:JSX.Element[] = [];
      for (let letter in oldSentence) {
        newSentence.push(<div key={letter} className="wrapper">
                            <div id={oldSentence[letter]} className="letter">{oldSentence[letter]}</div>
                            <div className="shadow">{oldSentence[letter]}</div>
                        </div>)
      }
      return newSentence;
    }
    switch (step) {
      case 1:
        return text(`Step ${step} Yorum Ekle ve Sil`)
      case 2:
        return text(`Step ${step} Oylama`)
      case 3:
        return text(`Step ${step} Analiz`)
      case 4:
        return text(`Step ${step} Sonuç`)            
      default:
        toast("Böyle bir aşama yok")
    }
  }
  return (
    <>
      <ToastContainer></ToastContainer>
      <DndContext onDragEnd={handleDropEnd}>
        <header className="main-header">
          <Row align="middle" justify="space-between">
            <Col xs={24} xl={2} style={{textAlign:"center"}}>
              <Image className="logo" src={logo} alt="kanban" priority></Image>
            </Col>
            <Col xs={24} xl={15}>
              {
                <div>
                  <div className="overlay"></div>
                  <h1 className="text">
                    {kanbanHeader(step)}
                  </h1>
                </div>              
              }
            </Col>
            <Col xs={24} xl={5} style={{textAlign:"center"}}>
              <Flex gap={5} justify="center">
                <Button onClick={handleExport} color="default" variant="solid"><FormOutlined />EXPORT</Button>
                <Button onClick={handleStep} color="danger" variant="solid">NEXT STEP</Button>
              </Flex>
            </Col>            
          </Row>
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