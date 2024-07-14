'use client'
import { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
  listenToMonitorStatusUpdate,
  onClipboardUpdate,
  onFilesUpdate,
  onImageUpdate,
  onSomethingUpdate,
  onTextUpdate,
  startListening,
} from "tauri-plugin-clipboard-api";
import { invoke } from "@tauri-apps/api/tauri";

const CopyHistory: React.FC = () => {
  const [copiedText, setCopiedText] = useState("");
  let unlistenTextUpdate: UnlistenFn;
  let unlistenImageUpdate: UnlistenFn;
  let unlistenClipboard: () => Promise<void>;
  let unlistenFiles: UnlistenFn;
  let monitorRunning = false;
  useEffect(() => {
    console.log("on mount");
    const unlistenFunctions = async () => {
      unlistenTextUpdate = await onTextUpdate((newText) => {
        console.log(newText);
        setCopiedText(newText);
      });
      unlistenImageUpdate = await onImageUpdate((_) => {
        console.log("Image updated");
      });
      unlistenFiles = await onFilesUpdate((_) => {
        console.log("Files updated");
      });
      unlistenClipboard = await startListening();

      onClipboardUpdate(() => {
        console.log(
          "plugin:clipboard://clipboard-monitor/update event received"
        );
      });

      await listen("plugin:clipboard://something-changed", (e) => { console.log(e) })
    };

    listenToMonitorStatusUpdate((running) => {
      monitorRunning = running;
    });
    unlistenFunctions().catch(console.error);

    return () => {
      if (unlistenTextUpdate) {
        unlistenTextUpdate();
      }
      if (unlistenImageUpdate) {
        unlistenImageUpdate();
      }
      if (unlistenClipboard) {
        unlistenClipboard();
      }
      if (unlistenFiles) {
        unlistenFiles();
      }
      console.log(monitorRunning);
    };
  }, []);
  return (
    <div>
      <h1>Try and copy this sentence</h1>
      <h1>{copiedText}</h1>
    </div>
  )
}

export default CopyHistory
