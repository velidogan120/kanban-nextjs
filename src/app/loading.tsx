"use client"
import React, { CSSProperties } from 'react'
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

const Loading = () => {
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' ,backgroundImage:"linear-gradient(to right, #DECBA4, #3E5151)"}}>
      <ClimbingBoxLoader loading={true} speedMultiplier={2} color="#e9e4f0" cssOverride={override} size={40} />
    </div>
  )
}

export default Loading