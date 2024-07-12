'use client'
import { invoke } from '@tauri-apps/api'
import { type UnlistenFn, listen } from "@tauri-apps/api/event"
import { isWindows } from "@tauri-apps/api/helpers/os-check";
import { useEffect, useRef, useState } from "react";

interface Event {
  payload: string
}
const CopyHistory: React.FC = () => {
  const [currentClipboard, setCurrentClipboard] = useState<string[]>([])

  async function clipboardList() {
    try {
      if (window.__TAURI__) {
        await invoke('listen_clipboard', { delayMilis: 100 });

      }
    } catch (error) {
      console.error('Error initializing clipboard listener:', error);
    }
  }

  useEffect(() => {
    clipboardList()
  }, [])
  async function list() {

    await listen('clipboard-update', (event: Event) => {
      if (!currentClipboard.includes(event.payload)) {
        if (!currentClipboard[currentClipboard.length - 1]) {
          console.log(event.payload)
          setCurrentClipboard(prevValue => [...prevValue, `${event.payload}`])
        }
      }
    })
  }
  useEffect(() => {
    list()
  }, [listen('clipboard-update')])
  return (
    <div>{currentClipboard.map((cliped, index) => {
      return (
        <div className="text-lg" key={index}>{cliped} {currentClipboard.length}</div>
      )
    })}</div>
  )
}

export default CopyHistory
