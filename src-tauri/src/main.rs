#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use copypasta_ext::prelude::*;
use copypasta_ext::wayland_bin::ClipboardContext;
use std::sync::{Arc, Mutex};
use tauri::Window;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![listen_clipboard])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn listen_clipboard(window: Window, delay_milis: u64) {
    let clipboard = Arc::new(Mutex::new(ClipboardContext::new().unwrap()));
    let initial_content = clipboard.lock().unwrap().get_contents().unwrap_or_default();
    let content = Arc::new(Mutex::new(initial_content));
    let clipboard = Arc::clone(&clipboard);
    let content = Arc::clone(&content);

    std::thread::spawn(move || loop {
        {
            let mut cb = clipboard.lock().unwrap();
            if let Ok(cur_text) = cb.get_contents() {
                let mut pre_text = content.lock().unwrap();
                if cur_text != *pre_text {
                    *pre_text = cur_text.clone();
                    println!("{}", pre_text);
                    window.emit("clipboard-update", pre_text.clone()).unwrap();
                }
            }
        }
        std::thread::sleep(std::time::Duration::from_millis(delay_milis));
    });
}
