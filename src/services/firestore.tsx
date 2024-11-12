import { db } from "@/services/firebase";
import { IComment } from "@/Types/IComment";
import { ISessionVote } from "@/Types/ISessionVote";
import { addDoc, collection, query, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc, arrayUnion } from "firebase/firestore"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const addCommentFromDatabase = async(kanbanId:string,comment:IComment,id?:string) => {
    if(id){
        const docRef = doc(db, `kanban/${kanbanId}/comments`, id);
        await setDoc(docRef, comment);
    }else{
        const veri = await addDoc(collection(db, `kanban/${kanbanId}/comments`), comment);
    }
}
export const addStepFromDatabase = async(kanbanId:string,step:{}) => {
    const veri = await setDoc(doc(db, `kanban/${kanbanId}/steps`,"step"), step);
}
export const addOrUpdateSessionVote = async (kanbanId: string, sessionVote: ISessionVote) => {
    const sessionVotesRef = doc(db, `kanban/${kanbanId}/sessionsVotes`, "sessionVote");
    try {
        const docSnap = await getDoc(sessionVotesRef);
        const data = docSnap.exists() ? docSnap.data() : { sessionsVotes: [] };
        const existingSessionIndex = data.sessionsVotes.findIndex(
            (vote: ISessionVote) => vote.sessionId === sessionVote.sessionId
        );
        if (existingSessionIndex !== -1) {
            data.sessionsVotes[existingSessionIndex].totalVote = sessionVote.totalVote;
        } else {
            data.sessionsVotes.push(sessionVote);
        }
        await setDoc(sessionVotesRef, { sessionsVotes: data.sessionsVotes }, { merge: true });
    } catch (error:any) {
        toast(error.message);
    }
};
export const fetchSessionsVotesFromDatabase = async(kanbanId:string)=>{
    const veri =  await getDocs(query(collection(db, `kanban/${kanbanId}/sessionsVotes`)));
    const sessionVoteData = veri.docs.map((doc) => ({ ...doc.data() }))[0];
    return sessionVoteData ? sessionVoteData.sessionsVotes || [] : [];
}
export const fetchStepFromDatabase = async(kanbanId:string)=>{
    const veri =  await getDocs(query(collection(db, `kanban/${kanbanId}/steps`)));
    const stepData = veri.docs.map((doc) => ({ ...doc.data() }))[0];
    return stepData ? stepData.step : 1;
}
export const deleteCommentFromDatabase = async(kanbanId:string,id:string) => {
    const veri = await deleteDoc(doc(db, `kanban/${kanbanId}/comments`, id));
}

export const updateCommentFromDatabase = async(kanbanId:string,id:string,{...data}) => {
    const veri = await updateDoc(doc(db, `kanban/${kanbanId}/comments/${id}`),{...data});
}

export const fetchCommentFromDatabase = async (kanbanId:string):Promise<(IComment & { id: string })[]> => {
    const q = query(collection(db, `kanban/${kanbanId}/comments`));
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map((doc) => {
        const data = doc.data() as IComment; 
        return { id: doc.id, ...data };
    });
    return comments
}