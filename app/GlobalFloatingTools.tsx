'use client';

import dynamic from 'next/dynamic';
import {useCallback,useEffect,useState} from 'react';
import type {FloatingNotesMode} from './FloatingNotes';
const FloatingCalculator=dynamic(()=>import('./FloatingCalculator'),{ssr:false});
const FloatingNotes=dynamic(()=>import('./FloatingNotes'),{ssr:false});

export default function GlobalFloatingTools(){
  const[calculatorOpen,setCalculatorOpen]=useState(false);
  const[notesMode,setNotesMode]=useState<FloatingNotesMode>(null);
  const closeNotes=useCallback(()=>setNotesMode(null),[]);

  useEffect(()=>{
    const openCalculator=()=>setCalculatorOpen(true);
    const openNotes=()=>setNotesMode('editor');
    const openNotesLibrary=()=>setNotesMode('library');
    window.addEventListener('zyvo:open-calculator',openCalculator);
    window.addEventListener('zyvo:open-notes',openNotes);
    window.addEventListener('zyvo:open-notes-library',openNotesLibrary);
    return()=>{
      window.removeEventListener('zyvo:open-calculator',openCalculator);
      window.removeEventListener('zyvo:open-notes',openNotes);
      window.removeEventListener('zyvo:open-notes-library',openNotesLibrary);
    };
  },[]);

  return <>
    {calculatorOpen&&<FloatingCalculator open onClose={()=>setCalculatorOpen(false)}/>}
    {notesMode&&<FloatingNotes mode={notesMode} onClose={closeNotes}/>}
  </>;
}
