#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_updater::Builder::new().build())
		.plugin(tauri_plugin_store::Builder::new().build())
		.setup(|app| {
			#[cfg(target_os = "linux")]
			allow_microphone(app);
			if cfg!(debug_assertions) {
				app.handle().plugin(
					tauri_plugin_log::Builder::default()
						.level(log::LevelFilter::Info)
						.build(),
				)?;
			}
			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while building tauri application");
}

/// WebKitGTK ships with media streams off and wry denies or ignores the
/// microphone request: turn them on and allow audio, never the camera.
#[cfg(target_os = "linux")]
fn allow_microphone(app: &tauri::App) {
	use tauri::Manager;
	use webkit2gtk::glib::prelude::Cast;
	use webkit2gtk::{
		PermissionRequestExt, SettingsExt, UserMediaPermissionRequest,
		UserMediaPermissionRequestExt, WebViewExt,
	};

	let Some(window) = app.get_webview_window("main") else {
		return;
	};
	let result = window.with_webview(|platform_webview| {
		let webview = platform_webview.inner();
		if let Some(settings) = WebViewExt::settings(&webview) {
			settings.set_enable_media_stream(true);
		}
		webview.connect_permission_request(|_, request| {
			let Some(media) =
				request.downcast_ref::<UserMediaPermissionRequest>()
			else {
				return false;
			};
			if media.is_for_audio_device() && !media.is_for_video_device() {
				request.allow();
			} else {
				request.deny();
			}
			true
		});
	});
	if let Err(error) = result {
		log::warn!("microphone setup failed: {error}");
	}
}
