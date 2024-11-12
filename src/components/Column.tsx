"use client"
import { Button, Card, Form, Input, Space } from 'antd'
import React from 'react'
import {IColumn} from "@/Types/IColumn"
import "@/styles/column.scss"
import "@/styles/comment.scss"
import { SendOutlined } from '@ant-design/icons'
import Comment from './Comment'
import { addCommentFromDatabase } from '@/services/firestore'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useFormik } from 'formik'
import { inputSchemas } from "@/schemas"
import { useDroppable } from '@dnd-kit/core'
import { socket } from "@/socket"
import { FormikHelpers } from "formik"


const Column = ({column,initialize}: {column:IColumn,initialize:() => Promise<void>}) => {
  const {icon,input,columnStep,label}:IColumn = column;
  const {kanbanId,sessionId,comments,step}= useSelector((state: RootState) => state.comment);
  const {isOver,setNodeRef} = useDroppable({ id: label,});
  const style = {
    "backgroundColor": isOver ? 'crimson' : undefined,
  };
  const dispatch = useDispatch();
  const onSubmit =async (values: FormValues, actions: FormikHelpers<FormValues>) => {
    await addCommentFromDatabase(kanbanId,{text:values.input,column:label,sessionId:sessionId,vote:0,hasVoted:[],commentSubList:[]});
    initialize();
    socket.emit("commentAdd","Added");
    actions.resetForm();
  }


  const {values, errors, handleChange, handleSubmit } = useFormik({
    initialValues: {
      input: "",
    },
    validationSchema: inputSchemas,
    onSubmit,
  });


  return (
    <Card hoverable className='column-card' ref={setNodeRef} style={style}>
      <Form layout='inline' size="large" className='column-form' onFinish={handleSubmit}>
          {errors.input && <p className="error">{errors.input}</p>}
          <Form.Item label={icon} labelCol={{flex:"15%"}} className='column'>
            <Space.Compact className='column'>
              <Input placeholder={input} id='input' value={values.input} onChange={handleChange} disabled={!(column.columnStep == step)}/>
              <Button htmlType='submit' type="primary" className='btnSubmit'><SendOutlined /></Button>
            </Space.Compact>
          </Form.Item>      
      </Form>
      <div className='column-cards'>
        {
          comments.length > 0 && comments.map((comment) => comment.column == label ? 
            <div className='card' key={comment.id}>
              <Comment column={label} id={comment.id} comment={comment}/>
            </div>: "")
        }
      </div>
    </Card>   
     
  )
}

export default Column