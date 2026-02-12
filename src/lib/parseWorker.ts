/**
 * Web Worker: parses .dat buffer off the main thread.
 * Receives { buffer: ArrayBuffer }, posts { ok: true, result } or { ok: false, error }.
 */
import type { DatFileResult } from './datParser';
import { parseDatFileAuto } from './datParser';

self.onmessage = (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
	const { buffer } = e.data;
	try {
		const result = parseDatFileAuto(buffer) as DatFileResult;
		self.postMessage({ ok: true, result });
	} catch (err) {
		self.postMessage({
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		});
	}
};
