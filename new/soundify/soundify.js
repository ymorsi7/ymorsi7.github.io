(function () {
	'use strict';

	const API_URL = (window.SOUNDIFY_API_URL || '').replace(/\/$/, '');
	const MAX_FILE_SIZE = 50 * 1024 * 1024;
	const VALID_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];
	const POLL_INTERVAL_MS = 2000;

	const STATUS_LABELS = {
		queued: 'Queued…',
		separating: 'Separating vocals…',
		transcribing: 'Transcribing lyrics…',
		filtering: 'Filtering haram content…',
		muting: 'Muting flagged segments…',
		done: 'Ready',
		failed: 'Failed'
	};

	const STATUS_PROGRESS = {
		queued: 5,
		separating: 25,
		transcribing: 50,
		filtering: 75,
		muting: 90,
		done: 100
	};

	let selectedFile = null;
	let pollTimer = null;
	let currentJobId = null;

	document.addEventListener('DOMContentLoaded', function () {
		initializeDropZone();
		initializeFileInput();
		document.getElementById('processBtn').addEventListener('click', startProcessing);
		document.getElementById('downloadBtn').addEventListener('click', downloadResult);
	});

	function initializeDropZone() {
		const dropZone = document.getElementById('dropZone');

		['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
			dropZone.addEventListener(eventName, preventDefaults, false);
			document.body.addEventListener(eventName, preventDefaults, false);
		});

		['dragenter', 'dragover'].forEach(function (eventName) {
			dropZone.addEventListener(eventName, function () {
				dropZone.classList.add('drag-over');
			}, false);
		});

		['dragleave', 'drop'].forEach(function (eventName) {
			dropZone.addEventListener(eventName, function () {
				dropZone.classList.remove('drag-over');
			}, false);
		});

		dropZone.addEventListener('drop', function (e) {
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFile(files[0]);
			}
		}, false);
	}

	function initializeFileInput() {
		document.getElementById('fileInput').addEventListener('change', function (e) {
			if (e.target.files.length > 0) {
				handleFile(e.target.files[0]);
			}
		});
	}

	function preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function handleFile(file) {
		const fileName = file.name.toLowerCase();
		const hasValidExtension = VALID_EXTENSIONS.some(function (ext) {
			return fileName.endsWith(ext);
		});

		if (!hasValidExtension && !file.type.startsWith('audio/')) {
			showAlert('error', 'Unsupported format. Please upload MP3, WAV, M4A, FLAC, or OGG.');
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			showAlert('error', 'File is too large. Maximum size is 50MB.');
			return;
		}

		selectedFile = file;
		resetResults();
		updateFilePreview(file);
		showAlert('success', 'Loaded "' + file.name + '"');
	}

	function updateFilePreview(file) {
		const audioCard = document.getElementById('audioCard');
		document.getElementById('fileName').textContent = file.name;
		document.getElementById('fileSize').textContent = formatFileSize(file.size);

		const audioPlayer = document.getElementById('audioPlayer');
		audioPlayer.src = URL.createObjectURL(file);
		audioCard.classList.add('show');
		hideProgress();
	}

	function formatFileSize(bytes) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}

	async function startProcessing() {
		if (!selectedFile) {
			showAlert('error', 'Please select an audio file first.');
			return;
		}

		if (!API_URL) {
			showAlert('error', 'API is not configured. Set SOUNDIFY_API_URL in soundify-config.js.');
			return;
		}

		const processBtn = document.getElementById('processBtn');
		const originalText = processBtn.innerHTML;
		processBtn.disabled = true;
		processBtn.innerHTML = '<span class="spinner"></span> Starting…';

		resetResults();
		showProgress();
		updateProgress(2, 'Uploading…');

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);

			const response = await fetch(API_URL + '/jobs', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const err = await safeJson(response);
				throw new Error(err.detail || err.error || 'Upload failed (' + response.status + ')');
			}

			const data = await response.json();
			currentJobId = data.job_id;
			trackEvent('soundify_upload', { job_id: currentJobId });

			await pollJob(currentJobId);
		} catch (error) {
			console.error('Processing error:', error);
			showAlert('error', error.message || 'Processing failed.');
			hideProgress();
		} finally {
			processBtn.disabled = false;
			processBtn.innerHTML = originalText;
		}
	}

	function pollJob(jobId) {
		return new Promise(function (resolve, reject) {
			if (pollTimer) {
				clearInterval(pollTimer);
			}

			async function check() {
				try {
					const response = await fetch(API_URL + '/jobs/' + jobId);
					if (!response.ok) {
						throw new Error('Failed to check job status');
					}

					const job = await response.json();
					const label = STATUS_LABELS[job.status] || job.status;
					const progress = job.progress != null ? job.progress : (STATUS_PROGRESS[job.status] || 0);
					updateProgress(progress, label);

					if (job.status === 'done') {
						clearInterval(pollTimer);
						pollTimer = null;
						showResults(job);
						trackEvent('soundify_complete', { job_id: jobId, muted_count: (job.result && job.result.muted_segments) ? job.result.muted_segments.length : 0 });
						resolve(job);
					} else if (job.status === 'failed') {
						clearInterval(pollTimer);
						pollTimer = null;
						throw new Error(job.error || 'Processing failed');
					}
				} catch (error) {
					clearInterval(pollTimer);
					pollTimer = null;
					reject(error);
				}
			}

			check();
			pollTimer = setInterval(check, POLL_INTERVAL_MS);
		});
	}

	function showResults(job) {
		const result = job.result || {};
		const resultCard = document.getElementById('resultCard');
		const processedPlayer = document.getElementById('processedPlayer');

		resultCard.classList.add('show');
		hideProgress();
		updateProgress(100, 'Ready');

		const downloadUrl = API_URL + '/jobs/' + job.job_id + '/download';
		processedPlayer.src = downloadUrl;
		document.getElementById('processedFileName').textContent = getCleanFileName(selectedFile.name);
		document.getElementById('downloadBtn').dataset.downloadUrl = downloadUrl;
		document.getElementById('downloadBtn').dataset.fileName = getCleanFileName(selectedFile.name);

		renderTranscript(result.transcript || '', result.muted_segments || []);
		showAlert('success', 'Processing complete. ' + (result.muted_segments || []).length + ' segment(s) muted.');
	}

	function getCleanFileName(originalName) {
		const base = originalName.replace(/\.[^.]+$/, '');
		return base + '_soundify_vocals.mp3';
	}

	function renderTranscript(transcript, mutedSegments) {
		const container = document.getElementById('transcriptContent');
		const panel = document.getElementById('transcriptPanel');

		if (!transcript && mutedSegments.length === 0) {
			panel.classList.remove('show');
			container.innerHTML = '';
			return;
		}

		panel.classList.add('show');

		if (mutedSegments.length === 0) {
			container.innerHTML = '<p class="transcript-full">' + escapeHtml(transcript || 'No lyrics detected.') + '</p>';
			return;
		}

		const items = mutedSegments.map(function (seg) {
			const reasonLabel = formatReason(seg.reason);
			return (
				'<div class="muted-segment">' +
					'<span class="muted-time">' + formatTime(seg.start) + ' – ' + formatTime(seg.end) + '</span>' +
					'<span class="muted-text">' + escapeHtml(seg.text) + '</span>' +
					'<span class="muted-reason" title="' + escapeHtml(seg.tier || 'rule') + '">' + escapeHtml(reasonLabel) + '</span>' +
				'</div>'
			);
		}).join('');

		container.innerHTML =
			'<p class="transcript-summary">' + mutedSegments.length + ' segment(s) muted from vocals.</p>' +
			'<div class="muted-segments-list">' + items + '</div>' +
			(detailsBlock(transcript));
	}

	function detailsBlock(transcript) {
		if (!transcript) return '';
		return (
			'<details class="transcript-details">' +
				'<summary>Full transcript</summary>' +
				'<p class="transcript-full">' + escapeHtml(transcript) + '</p>' +
			'</details>'
		);
	}

	function formatReason(reason) {
		const labels = {
			profanity: 'Profanity',
			romance_love: 'Romance / love',
			kufr_disbelief: 'Kufr / disbelief',
			negative_allah_god: 'Negative God references',
			alcohol_intoxicants: 'Alcohol / intoxicants',
			other_haram_themes: 'Other haram themes'
		};
		return labels[reason] || reason || 'Flagged';
	}

	function formatTime(seconds) {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return m + ':' + String(s).padStart(2, '0');
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function downloadResult() {
		const btn = document.getElementById('downloadBtn');
		const url = btn.dataset.downloadUrl;
		const fileName = btn.dataset.fileName;

		if (!url) {
			showAlert('error', 'No processed audio available.');
			return;
		}

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName || 'soundify_vocals.mp3';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		showAlert('success', 'Downloading cleaned vocals…');
	}

	function resetResults() {
		document.getElementById('resultCard').classList.remove('show');
		document.getElementById('transcriptPanel').classList.remove('show');
		document.getElementById('transcriptContent').innerHTML = '';
		document.getElementById('processedPlayer').removeAttribute('src');
		currentJobId = null;
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	function showProgress() {
		document.getElementById('progressContainer').classList.add('show');
	}

	function hideProgress() {
		document.getElementById('progressContainer').classList.remove('show');
	}

	function updateProgress(percentage, label) {
		document.getElementById('progressFill').style.width = percentage + '%';
		if (label) {
			document.getElementById('progressLabel').textContent = label;
		}
	}

	function showAlert(type, message) {
		const alertContainer = document.getElementById('alert-container');
		alertContainer.innerHTML = '';

		const alert = document.createElement('div');
		alert.className = 'alert alert-' + type + ' show';
		const title = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info';
		alert.innerHTML = '<strong>' + title + ':</strong> ' + escapeHtml(message);
		alertContainer.appendChild(alert);

		setTimeout(function () {
			alert.classList.remove('show');
			setTimeout(function () {
				alert.remove();
			}, 300);
		}, 6000);
	}

	async function safeJson(response) {
		try {
			return await response.json();
		} catch (e) {
			return {};
		}
	}

	function trackEvent(name, props) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent(name, props);
		}
	}
})();
